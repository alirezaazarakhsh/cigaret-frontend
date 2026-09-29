import type { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface PosOnlineSession {
  id: string;
  user_id?: number | string;
  fullName: string;
  phone: string;
  role: string;
  roleTitleFa: string;
  status: string;
  last_login: string;
  loginTime?: string;
  avatarColor?: string;
  extendedUntil?: number;
}

const DJANGO_BASE_URL = 'https://cigar.sevinhost.ir/api/v1';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes token validity

function normalizePhoneKey(val: any): string {
  const digits = String(val || '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function formatIranTime(isoOrDate?: string | Date): string {
  try {
    const d = isoOrDate ? new Date(isoOrDate) : new Date();
    if (isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    }
    return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return 'آنلاین';
  }
}

export class PosSessionsRealtimeHub {
  private wss: WebSocketServer;
  private sessionsByPhone = new Map<string, PosOnlineSession>();
  private loggedOutPhones = new Map<string, number>(); // phoneKey -> timestamp
  private clientPhones = new Map<WebSocket, string>();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupWebSocketHandlers();
    this.syncWithDjangoBackend().catch(() => {});
    this.syncInterval = setInterval(() => {
      this.syncWithDjangoBackend().catch(() => {});
    }, 10000);
  }

  public attachToServer(httpServer: HttpServer) {
    httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
      const url = request.url || '';
      if (url.startsWith('/ws/sessions')) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      }
    });
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      // Immediately send current state on connect
      this.syncWithDjangoBackend()
        .then((list) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'SESSIONS_SYNC', sessions: list }));
          }
        })
        .catch(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'SESSIONS_SYNC', sessions: this.getActiveSessionsList() }));
          }
        });

      ws.on('message', async (raw) => {
        try {
          const msg = JSON.parse(String(raw));
          const action = msg.action || msg.type || '';
          const phone = msg.phone || msg.user?.phone || '';
          const phoneKey = normalizePhoneKey(phone);

          if (action === 'subscribe_sessions' || action === 'staff_online' || action === 'STAFF_ONLINE') {
            if (phoneKey) {
              this.clientPhones.set(ws, phoneKey);
              this.loggedOutPhones.delete(phoneKey);
              if (msg.user || msg.fullName) {
                const u = msg.user || msg;
                const nowIso = new Date().toISOString();
                this.sessionsByPhone.set(phoneKey, {
                  id: String(u.id || u.user_id || phoneKey),
                  user_id: u.user_id || u.id,
                  fullName: u.fullName || u.full_name || 'کاربر صندوق',
                  phone: u.phone || phone,
                  role: u.role || 'staff',
                  roleTitleFa: u.roleTitleFa || u.role_title || (u.role === 'super_admin' ? 'مدیر ارشد' : 'صندوق‌دار'),
                  status: 'online',
                  last_login: nowIso,
                  loginTime: formatIranTime(nowIso),
                  avatarColor: u.avatarColor || (u.role === 'super_admin' ? 'bg-indigo-600' : 'bg-emerald-600'),
                  extendedUntil: Date.now() + SESSION_TIMEOUT_MS,
                });
              }
            }
            const list = await this.syncWithDjangoBackend();
            this.broadcast({ type: 'SESSIONS_SYNC', sessions: list });
          } else if (action === 'staff_logout' || action === 'STAFF_LOGOUT' || action === 'token_expired') {
            await this.markStaffOffline(phone, msg.user_id || msg.id);
            const list = this.getActiveSessionsList();
            this.broadcast({
              type: 'STAFF_LOGOUT',
              phone,
              reason: action === 'token_expired' ? 'token_expired' : 'manual_logout',
              sessions: list,
            });
          } else if (action === 'session_extended' || action === 'SESSION_EXTENDED') {
            const minutes = Number(msg.minutes) || 30;
            this.extendStaffSession(phone, msg.user, minutes);
            const list = await this.syncWithDjangoBackend();
            this.broadcast({
              type: 'SESSION_EXTENDED',
              phone,
              sessions: list,
            });
          } else if (action === 'ping') {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
          }
        } catch {}
      });

      ws.on('close', () => {
        this.clientPhones.delete(ws);
      });
    });
  }

  public registerStaffOnline(user: any) {
    if (!user) return;
    const phone = user.phone || user.mobile || user.username || '';
    const phoneKey = normalizePhoneKey(phone);
    if (!phoneKey) return;

    this.loggedOutPhones.delete(phoneKey);
    const nowIso = new Date().toISOString();
    this.sessionsByPhone.set(phoneKey, {
      id: String(user.id || user.user_id || phoneKey),
      user_id: user.user_id || user.id,
      fullName: user.fullName || user.full_name || 'کاربر صندوق',
      phone,
      role: user.role || 'staff',
      roleTitleFa: user.roleTitleFa || user.role_title || (user.role === 'super_admin' ? 'مدیر ارشد' : 'صندوق‌دار'),
      status: 'online',
      last_login: nowIso,
      loginTime: formatIranTime(nowIso),
      avatarColor: user.avatarColor || (user.role === 'super_admin' ? 'bg-indigo-600' : 'bg-emerald-600'),
      extendedUntil: Date.now() + SESSION_TIMEOUT_MS,
    });

    this.broadcast({
      type: 'SESSIONS_SYNC',
      sessions: this.getActiveSessionsList(),
    });
  }

  public extendStaffSession(phone?: string, user?: any, minutes: number = 30) {
    const targetPhone = phone || user?.phone || '';
    const phoneKey = normalizePhoneKey(targetPhone);
    if (!phoneKey) return;

    this.loggedOutPhones.delete(phoneKey);
    const existing = this.sessionsByPhone.get(phoneKey);
    const nowIso = new Date().toISOString();
    const durationMs = Math.max(1, minutes) * 60 * 1000;

    if (existing) {
      existing.last_login = nowIso;
      existing.loginTime = formatIranTime(nowIso);
      existing.extendedUntil = Date.now() + durationMs;
      this.sessionsByPhone.set(phoneKey, existing);
    } else if (user) {
      this.sessionsByPhone.set(phoneKey, {
        id: String(user.id || user.user_id || phoneKey),
        user_id: user.user_id || user.id,
        fullName: user.fullName || user.full_name || 'کاربر صندوق',
        phone: targetPhone,
        role: user.role || 'staff',
        roleTitleFa: user.roleTitleFa || user.role_title || (user.role === 'super_admin' ? 'مدیر ارشد' : 'صندوق‌دار'),
        status: 'online',
        last_login: nowIso,
        loginTime: formatIranTime(nowIso),
        avatarColor: user.avatarColor || (user.role === 'super_admin' ? 'bg-indigo-600' : 'bg-emerald-600'),
        extendedUntil: Date.now() + durationMs,
      });
    }

    this.broadcast({
      type: 'SESSIONS_SYNC',
      sessions: this.getActiveSessionsList(),
    });
  }

  public async markStaffOffline(phone?: string, userId?: number | string) {
    const phoneKey = normalizePhoneKey(phone);
    const existing = phoneKey ? this.sessionsByPhone.get(phoneKey) : undefined;
    const resolvedId = userId || existing?.user_id || existing?.id;

    if (phoneKey) {
      this.sessionsByPhone.delete(phoneKey);
      this.loggedOutPhones.set(phoneKey, Date.now());
    }

    if (resolvedId !== undefined && resolvedId !== null) {
      for (const [k, v] of this.sessionsByPhone.entries()) {
        if (String(v.id) === String(resolvedId) || String(v.user_id) === String(resolvedId)) {
          this.sessionsByPhone.delete(k);
          this.loggedOutPhones.set(k, Date.now());
        }
      }
    }

    // Call Django backend logout endpoint to ensure PosStaff.is_online = False
    try {
      const q = new URLSearchParams();
      if (phone) q.set('phone', phone);
      if (resolvedId !== undefined && resolvedId !== null && !isNaN(Number(resolvedId))) {
        q.set('user_id', String(resolvedId));
      }
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      await fetch(`${DJANGO_BASE_URL}/posuserlogout/${queryStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone || existing?.phone || undefined,
          user_id: resolvedId !== undefined && !isNaN(Number(resolvedId)) ? Number(resolvedId) : undefined,
          id: resolvedId !== undefined && !isNaN(Number(resolvedId)) ? Number(resolvedId) : undefined,
        }),
      });
    } catch {}
  }

  public async syncWithDjangoBackend(): Promise<PosOnlineSession[]> {
    const now = Date.now();
    // Clean up old loggedOutPhones (> 90 seconds)
    for (const [k, ts] of this.loggedOutPhones.entries()) {
      if (now - ts > 90000) {
        this.loggedOutPhones.delete(k);
      }
    }

    try {
      const res = await fetch(`${DJANGO_BASE_URL}/posuseractive-sessions/?_t=${now}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json: any = await res.json();
        const remoteList: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const seenRemotePhoneKeys = new Set<string>();

        for (const item of remoteList) {
          if (!item) continue;
          const rawPhone = item.phone || item.mobile || item.username || '';
          const phoneKey = normalizePhoneKey(rawPhone);
          if (!phoneKey) continue;

          // If this user recently logged out or expired, force-logout on Django and skip
          const logoutTs = this.loggedOutPhones.get(phoneKey);
          if (logoutTs && now - logoutTs < 90000) {
            this.markStaffOffline(rawPhone, item.user_id || item.id).catch(() => {});
            continue;
          }

          // Check if token/session on backend has expired (> 30 mins since last_login without extension)
          const localSession = this.sessionsByPhone.get(phoneKey);
          const lastLoginMs = item.last_login ? new Date(item.last_login).getTime() : now;
          const effectiveExpiry = Math.max(
            !isNaN(lastLoginMs) ? lastLoginMs + SESSION_TIMEOUT_MS : now + SESSION_TIMEOUT_MS,
            localSession?.extendedUntil || 0
          );

          if (now > effectiveExpiry) {
            // Session token expired without renewal -> mark offline in Django DB
            this.markStaffOffline(rawPhone, item.user_id || item.id).catch(() => {});
            continue;
          }

          seenRemotePhoneKeys.add(phoneKey);
          this.sessionsByPhone.set(phoneKey, {
            id: String(item.id || item.user_id || localSession?.id || phoneKey),
            user_id: item.user_id || item.id || localSession?.user_id,
            fullName: item.fullName || item.full_name || localSession?.fullName || 'کاربر صندوق',
            phone: rawPhone,
            role: item.role || localSession?.role || 'staff',
            roleTitleFa:
              item.roleTitleFa ||
              item.role_title ||
              localSession?.roleTitleFa ||
              (item.role === 'super_admin' ? 'مدیر ارشد' : 'صندوق‌دار'),
            status: 'online',
            last_login: item.last_login || localSession?.last_login || new Date().toISOString(),
            loginTime: formatIranTime(item.last_login || localSession?.last_login),
            avatarColor:
              localSession?.avatarColor ||
              (item.role === 'super_admin' ? 'bg-indigo-600' : 'bg-emerald-600'),
            extendedUntil: effectiveExpiry,
          });
        }

        // Remove local sessions that are expired or no longer on remote (unless logged in/extended within last 45s)
        for (const [phoneKey, local] of this.sessionsByPhone.entries()) {
          if (local.extendedUntil && now > local.extendedUntil) {
            this.sessionsByPhone.delete(phoneKey);
            continue;
          }
          if (!seenRemotePhoneKeys.has(phoneKey)) {
            const loginAge = local.last_login ? now - new Date(local.last_login).getTime() : 999999;
            if (loginAge > 45000) {
              this.sessionsByPhone.delete(phoneKey);
            }
          }
        }
      }
    } catch {}

    return this.getActiveSessionsList();
  }

  public getActiveSessionsList(): PosOnlineSession[] {
    const now = Date.now();
    const result: PosOnlineSession[] = [];
    for (const [phoneKey, session] of this.sessionsByPhone.entries()) {
      if (this.loggedOutPhones.has(phoneKey)) continue;
      if (session.extendedUntil && now > session.extendedUntil) {
        this.sessionsByPhone.delete(phoneKey);
        continue;
      }
      result.push(session);
    }
    return result;
  }

  public broadcast(payload: Record<string, any>) {
    const message = JSON.stringify(payload);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch {}
      }
    }
  }

  public handleHttpRequest(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = req.url || '';
    if (!url.startsWith('/api/pos-sessions/')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'GET' && url.startsWith('/api/pos-sessions/active')) {
      this.syncWithDjangoBackend()
        .then((sessions) => {
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, count: sessions.length, data: sessions }));
        })
        .catch(() => {
          const sessions = this.getActiveSessionsList();
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, count: sessions.length, data: sessions }));
        });
      return;
    }

    if (req.method === 'POST' && url.startsWith('/api/pos-sessions/notify')) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          const action = data.action || '';
          if (action === 'online' || action === 'staff_online') {
            this.registerStaffOnline(data.user || data);
          } else if (action === 'logout' || action === 'staff_logout' || action === 'token_expired') {
            await this.markStaffOffline(data.phone, data.user_id || data.id);
            this.broadcast({
              type: 'STAFF_LOGOUT',
              phone: data.phone,
              reason: action === 'token_expired' ? 'token_expired' : 'manual_logout',
              sessions: this.getActiveSessionsList(),
            });
          } else if (action === 'extend' || action === 'session_extended') {
            this.extendStaffSession(data.phone, data.user, Number(data.minutes) || 30);
          } else {
            const list = await this.syncWithDjangoBackend();
            this.broadcast({ type: 'SESSIONS_SYNC', sessions: list });
          }
          const currentList = this.getActiveSessionsList();
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, count: currentList.length, data: currentList }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, message: err?.message || 'Invalid payload' }));
        }
      });
      return;
    }

    next();
  }
}

let globalHub: PosSessionsRealtimeHub | null = null;
export function getPosSessionsRealtimeHub(): PosSessionsRealtimeHub {
  if (!globalHub) {
    globalHub = new PosSessionsRealtimeHub();
  }
  return globalHub;
}
