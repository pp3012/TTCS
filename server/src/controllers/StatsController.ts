// === 1. IMPORT CÁC THƯ VIỆN VÀ SERVICE CẦN THIẾT ===
import { Request, Response } from 'express'; // Import kiểu dữ liệu Request và Response từ Express để định nghĩa tham số hàm
import { statisticsService } from '../services/StatisticsService'; // Import Service xử lý tầng logic nghiệp vụ dữ liệu/DB (độ sâu thư mục có thể tăng lên một bậc: ../../)

// === 2. ĐỊNH NGHĨA LỚP STATSCONTROLLER ===
class StatsController {

    // Hàm xử lý việc lấy số liệu thống kê của chính người dùng hiện tại
    public async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            // 1. Trích xuất user_id từ request object (do middleware authenticate đính vào sau khi verify token thành công)
            const user_id = ((req as any) as { user?: { user_id: number } }).user?.user_id;

            // 2. Nhận biến subject_id từ query string trên URL (Ví dụ: /api/practice/stats/me?subject_id=5)
            const { subject_id } = req.query;

            // 3. KIỂM TRA ĐIỀU KIỆN: Nếu không tìm thấy thông tin user_id, trả ngay mã lỗi 401 trái phép và dừng hàm
            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            // 4. XỬ LÝ NGHIỆP VỤ & ĐIỀU HƯỚNG SERVICE:
            // Trường hợp 1: Có truyền mã môn học `subject_id` lên url
            if (subject_id) {
                // Chạy xuống tầng Service để lấy số liệu thống kê cụ thể của môn học đó (ép kiểu subject_id từ chuỗi sang số)
                const stats = await statisticsService.getUserStatsBySubject(user_id, Number(subject_id));
                // Trả phản hồi thành công (200) kèm dữ liệu về cho client
                res.json({ success: true, data: stats });
            }
            // Trường hợp 2: Không truyền `subject_id` (Lấy tổng quan tất cả các môn)
            else {
                // Chạy xuống tầng Service để tính toán số liệu thống kê tổng thể
                const stats = await statisticsService.getUserStats(user_id);
                // Trả phản hồi thành công (200) kèm dữ liệu về cho client
                res.json({ success: true, data: stats });
            }
        } catch (err: unknown) {
            // 5. XỬ LÝ LỖI HỆ THỐNG: Nếu có bất kỳ lỗi phát sinh trong luồng xử lý hoặc lỗi từ database, bắt lỗi và phản hồi mã lỗi 500
            res.status(500).json({ success: false, message: (err as Error).message });
        }
    }
}

// === 3. KHỞI TẠO VÀ XUẤT ĐỐI TƯỢNG (INSTANCE) SỬ DỤNG ===
// Khởi tạo một đối tượng duy nhất (Singleton Pattern) từ class StatsController và export nó ra ngoài
export const statsController = new StatsController();