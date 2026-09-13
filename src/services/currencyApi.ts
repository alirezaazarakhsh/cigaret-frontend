import { httpClient } from './apiClient';

export const currencyRatesApi = {
  async getRates(): Promise<any[]> {
    const response = await httpClient.get('/currency_rates/rates/');
    return response.success ? (response.data.results || response.data) : [];
  },
  async getHistory(): Promise<any[]> {
    const response = await httpClient.get('/currency_rates/history/');
    return response.success ? (response.data.results || response.data) : [];
  },
  async updateRate(
    code: string, 
    rate: number, 
    title: string, 
    symbol: string, 
    is_active: boolean, 
    is_base: boolean
  ): Promise<{success: boolean; message?: string}> {
    const response = await httpClient.post('/currency_rates/update-rate/', { 
        code, rate, title, symbol, is_active, is_base 
    });
    return { success: response.success, message: response.data?.message };
  },
  async convert(amount: number, from: string, to: string): Promise<number> {
    const response = await httpClient.get(`/currency_rates/convert/?amount=${amount}&from=${from}&to=${to}`);
    return response.success ? response.data.converted_amount : 0;
  }
};
