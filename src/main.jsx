import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; // Tailwind 쓴다면 이 파일 중요!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);