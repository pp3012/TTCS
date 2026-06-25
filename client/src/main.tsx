import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 1. Tìm phần tử HTML có id="root" trong file index.html (Dấu ! là cú pháp TypeScript khẳng định phần tử này chắc chắn tồn tại).
// 2. Hàm createRoot() sẽ biến phần tử HTML đó thành "gốc" (Root) để React quản lý và chèn giao diện vào.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* Component chính của ứng dụng. Mọi giao diện, logic của app sẽ bắt đầu chạy từ đây */}
  </React.StrictMode>,
)
