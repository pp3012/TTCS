# 📚 EduQuiz – Hệ thống luyện tập trắc nghiệm cá nhân hóa

Hệ thống web application hỗ trợ sinh viên luyện tập các môn thi trắc nghiệm với tính năng **cá nhân hóa đề luyện tập** dựa trên lịch sử làm bài.

---

## ✨ Tính năng chính

### 👨‍🎓 Người dùng
- Đăng ký / Đăng nhập tài khoản
- **Luyện tập tự do**: chọn chương, số câu (30/40/50/60), thời gian trung bình mỗi câu (30s/50s/60s/90s)
- **Luyện tập cá nhân hóa**: hệ thống tự động điều chỉnh đề dựa trên điểm mạnh/yếu của từng người
- Xem kết quả sau mỗi lần luyện tập (điểm, số câu đúng, thời gian, đáp án & giải thích)
- Xem lịch sử làm bài và thống kê cá nhân (biểu đồ tỷ lệ chính xác theo chương, tiến bộ điểm số theo thời gian)

### 🛡️ Admin
- Quản lý tài khoản người dùng (xem, sửa, xóa)
- Quản lý ngân hàng câu hỏi (thêm thủ công hoặc import từ file Excel)
- Gắn thuộc tính câu hỏi: chương, độ khó (dễ/trung bình/khó), loại (lý thuyết/bài tập), giải thích
- Xem thống kê theo từng môn (số người tham gia, tổng lần luyện tập, điểm trung bình,...)

---

## 🧠 Cơ chế cá nhân hóa

- Tăng tỷ lệ câu hỏi thuộc chương/loại có tỷ lệ chính xác thấp
- Tăng tần suất lặp lại các câu hỏi sai trong lần trước
- Tự động tăng độ khó nếu sinh viên đạt kết quả tốt ở mức cơ bản

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React / TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL |
| ORM | mysql2 |
| Dev tool | WebStorm, Nodemon, ts-node |

---

## 🚀 Hướng dẫn cài đặt & chạy

### Yêu cầu
- Node.js >= 18
- MySQL >= 8.0

### 1. Clone repo

```bash
git clone https://github.com/your-username/eduquiz.git
cd eduquiz
```

### 2. Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` trong thư mục `server/`:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eduquiz
```

### 4. Tạo database

```sql
CREATE DATABASE eduquiz;
```

### 5. Chạy ứng dụng

```bash
# Backend
cd server
npm run dev

# Frontend (terminal mới)
cd client
npm start
```

---


## 🎬 Video demo: https://youtu.be/iktB-HVFj10





---

## 📄 Giấy phép

Dự án được phát triển phục vụ mục đích học thuật – môn TTCS.
