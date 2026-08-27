import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import App from './src/App.tsx';

try {
  console.log("Starting render...");
  console.log(renderToStaticMarkup(React.createElement(App)));
  console.log("Render successful!");
} catch (e) {
  console.error("Render failed:");
  console.error(e);
}
