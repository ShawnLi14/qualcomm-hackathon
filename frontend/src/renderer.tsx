import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}


import './index.css';

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack',
);
