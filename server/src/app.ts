//IMPORT CÁC THƯ VIỆN BÊN NGOÀI
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//IMPORT CÁC ROUTE, MIDDLEWARE CỦA WEB
import authRoutes from './routes/auth';
import subjectRoutes from './routes/subjects';
import questionRoutes from './routes/questions';
import practiceRoutes from './routes/practice';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();  // Kích hoạt dotenv

const app = express();
const PORT = process.env.PORT || 5000;

//cho phép Frontend chạy ở `http://localhost:5173`
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// Cho phép đọc và phân tích dữ liệu JSON gửi lên từ client
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/admin', adminRoutes);

//kiểm tra xem Server có đang hoạt động tốt hay không
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.use(errorHandler);

//KHỞI CHẠY SERVER LẮNG NGHE KẾT NỐI
app.listen(PORT, () => {
  console.log(`EduQuiz Server running on http://localhost:${PORT}`);
});

export default app;
