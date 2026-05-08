-- EduQuiz Database Schema
CREATE DATABASE IF NOT EXISTS eduquiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eduquiz;

-- 1. Subjects
CREATE TABLE IF NOT EXISTS Subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    total_chapter INT DEFAULT 0,
    description TEXT
);

-- 2. Chapters
CREATE TABLE IF NOT EXISTS Chapters (
    chapter_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    chapter_name VARCHAR(255) NOT NULL,
    order_index INT,
    CONSTRAINT fk_chapters_subject FOREIGN KEY (subject_id)
        REFERENCES Subjects(subject_id) ON DELETE CASCADE
);

-- 3. Difficulty Levels
CREATE TABLE IF NOT EXISTS Difficulty_levels (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL
);

-- 4. Question Types
CREATE TABLE IF NOT EXISTS Question_type (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

-- 5. Questions
CREATE TABLE IF NOT EXISTS Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    chapter_id INT,
    level_id INT,
    type_id INT,
    content TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    explanation TEXT,
    CONSTRAINT fk_q_subject FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id),
    CONSTRAINT fk_q_chapter FOREIGN KEY (chapter_id) REFERENCES Chapters(chapter_id),
    CONSTRAINT fk_q_level FOREIGN KEY (level_id) REFERENCES Difficulty_levels(level_id),
    CONSTRAINT fk_q_type FOREIGN KEY (type_id) REFERENCES Question_type(type_id)
);

-- 6. Users
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Practice Sessions
CREATE TABLE IF NOT EXISTS Practice_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    subject_id INT,
    mode VARCHAR(50),
    total_questions INT,
    duration INT,
    start_time DATETIME,
    submit_time DATETIME,
    score DECIMAL(5,2),
    correct_count INT,
    CONSTRAINT fk_ps_user FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT fk_ps_subject FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id)
);

-- 8. Session Answers
CREATE TABLE IF NOT EXISTS Session_answers (
    session_id INT,
    question_id INT,
    user_ans CHAR(1),
    is_correct BOOLEAN,
    PRIMARY KEY (session_id, question_id),
    CONSTRAINT fk_sa_session FOREIGN KEY (session_id) REFERENCES Practice_sessions(session_id),
    CONSTRAINT fk_sa_question FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

-- 9. User Question Status
CREATE TABLE IF NOT EXISTS User_question_status (
    user_id INT,
    question_id INT,
    is_latest_correct BOOLEAN,
    last_practiced DATETIME,
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    PRIMARY KEY (user_id, question_id),
    CONSTRAINT fk_uqs_user FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT fk_uqs_question FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

-- 10. User Stats
CREATE TABLE IF NOT EXISTS User_stats (
    user_id INT,
    subject_id INT,
    total_sessions INT DEFAULT 0,
    overall_score DECIMAL(5,2) DEFAULT 0,
    chapter_accuracy JSON,
    difficulty_accuracy JSON,
    type_accuracy JSON,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, subject_id),
    CONSTRAINT fk_ustats_user FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT fk_ustats_subject FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id)
);

-- ===================== SEED DATA =====================

INSERT INTO Difficulty_levels (level_name) VALUES ('Dễ'), ('Trung bình'), ('Khó');
INSERT INTO Question_type (type_name) VALUES ('Lý thuyết'), ('Bài tập');

INSERT INTO Subjects (subject_name, total_chapter, description) VALUES
('Triết học Mác-Lênin', 4, 'Chủ nghĩa duy vật biện chứng. Chủ nghĩa duy vật lịch sử'),
('Cấu trúc dữ liệu và giải thuật', 5, 'Các cấu trúc dữ liệu cơ bản và thuật toán xử lý'),
('Kiến trúc máy tính', 4, 'Tổ chức và kiến trúc hệ thống máy tính'),
('Kinh tế chính trị Mác-Lênin', 4, 'Các quy luật kinh tế cơ bản của chủ nghĩa tư bản'),
('Cơ sở an toàn thông tin', 4, 'Bảo mật và an ninh hệ thống thông tin'),
('Cơ sở dữ liệu', 4, 'Thiết kế và quản trị cơ sở dữ liệu quan hệ');

INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES
(1, 'Triết học và vai trò của triết học', 1),
(1, 'Chủ nghĩa duy vật biện chứng', 2),
(1, 'Chủ nghĩa duy vật lịch sử', 3),
(1, 'Lý luận nhận thức', 4),
(2, 'Mảng và danh sách liên kết', 1),
(2, 'Stack và Queue', 2),
(2, 'Cây và đồ thị', 3),
(2, 'Thuật toán sắp xếp', 4),
(2, 'Thuật toán tìm kiếm', 5),
(3, 'Biểu diễn thông tin', 1),
(3, 'CPU và bộ nhớ', 2),
(3, 'Kiến trúc Von Neumann', 3),
(3, 'Hệ thống I/O', 4),
(4, 'Hàng hóa và tiền tệ', 1),
(4, 'Giá trị thặng dư', 2),
(4, 'Tích lũy tư bản', 3),
(4, 'Cạnh tranh và độc quyền', 4),
(5, 'Mật mã học', 1),
(5, 'Xác thực và ủy quyền', 2),
(5, 'Bảo mật mạng', 3),
(5, 'An toàn ứng dụng', 4),
(6, 'Mô hình dữ liệu quan hệ', 1),
(6, 'SQL cơ bản', 2),
(6, 'Thiết kế CSDL', 3),
(6, 'Tối ưu hóa truy vấn', 4);

-- Admin user (password: admin123)
INSERT INTO Users (user_name, email, password_hash, full_name, role) VALUES
('admin', 'admin@eduquiz.vn', '$2b$10$rQZ9uAVBB2Ety3m.6PsVdOA8DzBnK5rUn9HlgFNgJn0fajGHMO/1i', 'Quản trị viên', 'admin');

-- Sample student (password: student123)
INSERT INTO Users (user_name, email, password_hash, full_name, role) VALUES
('sinhvien01', 'sinhvien01@example.com', '$2b$10$xTZH5OPbUv0K1j4AswQgW.CmqF7YJqUgJvXPmULs29F5EEPlStqlu', 'Nguyễn Văn An', 'student');

-- Sample questions for Triết học (subject_id=1)
INSERT INTO Questions (subject_id, chapter_id, level_id, type_id, content, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(1, 1, 1, 1, 'Triết học là gì?', 'Khoa học tự nhiên', 'Hệ thống lý luận chung nhất về thế giới', 'Khoa học xã hội', 'Nghệ thuật sống', 'B', 'Triết học là hệ thống lý luận chung nhất về thế giới, về con người và tư duy.'),
(1, 1, 1, 1, 'Vấn đề cơ bản của triết học là gì?', 'Mối quan hệ giữa tự nhiên và xã hội', 'Mối quan hệ giữa vật chất và ý thức', 'Mối quan hệ giữa con người và thiên nhiên', 'Mối quan hệ giữa lý luận và thực tiễn', 'B', 'Vấn đề cơ bản của triết học là mối quan hệ giữa vật chất và ý thức.'),
(1, 2, 2, 1, 'Theo chủ nghĩa duy vật biện chứng, vật chất là gì?', 'Vật thể hữu hình', 'Phạm trù triết học chỉ thực tại khách quan', 'Năng lượng vũ trụ', 'Nguyên tử và phân tử', 'B', 'Vật chất là phạm trù triết học dùng để chỉ thực tại khách quan.'),
(1, 2, 2, 1, 'Ý thức là gì theo triết học Mác-Lênin?', 'Linh hồn con người', 'Sự phản ánh thực tại khách quan vào não người', 'Tư tưởng trừu tượng', 'Tinh thần vũ trụ', 'B', 'Ý thức là sự phản ánh thực tại khách quan vào não người.'),
(1, 3, 1, 1, 'Lực lượng sản xuất bao gồm gì?', 'Tư liệu sản xuất và quan hệ sản xuất', 'Người lao động và tư liệu sản xuất', 'Công nghệ và vốn', 'Lao động và quản lý', 'B', 'Lực lượng sản xuất bao gồm người lao động và tư liệu sản xuất.'),
(1, 3, 2, 1, 'Cơ sở hạ tầng là gì?', 'Cơ sở vật chất kỹ thuật', 'Toàn bộ quan hệ sản xuất hợp thành cơ cấu kinh tế xã hội', 'Hệ thống đường sá, nhà máy', 'Nguồn vốn đầu tư', 'B', 'Cơ sở hạ tầng là toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế xã hội.'),
(1, 4, 1, 1, 'Thực tiễn là gì?', 'Hoạt động lý luận thuần túy', 'Hoạt động vật chất có mục đích của con người', 'Kinh nghiệm sống hàng ngày', 'Tri thức tích lũy', 'B', 'Thực tiễn là hoạt động vật chất có mục đích, mang tính lịch sử-xã hội của con người.'),
(1, 4, 2, 1, 'Vai trò của thực tiễn đối với nhận thức?', 'Là mục đích của nhận thức', 'Là cơ sở, động lực, mục đích và tiêu chuẩn của nhận thức', 'Là tiêu chuẩn của chân lý', 'Là nguồn gốc của tri thức', 'B', 'Thực tiễn là cơ sở, động lực, mục đích và là tiêu chuẩn của chân lý.'),
(1, 1, 3, 1, 'Phân biệt thế giới quan duy vật và duy tâm?', 'Duy vật tin vào thần linh, duy tâm không', 'Duy vật thừa nhận vật chất là tính thứ nhất, duy tâm cho ý thức là tính thứ nhất', 'Duy vật theo khoa học, duy tâm theo tôn giáo', 'Không có sự khác biệt', 'B', 'Sự khác biệt căn bản giữa duy vật và duy tâm là quan điểm về mối quan hệ giữa vật chất và ý thức.'),
(1, 2, 3, 2, 'Áp dụng quy luật lượng-chất vào học tập, điều gì đúng?', 'Học nhiều ngay lập tức sẽ giỏi', 'Tích lũy kiến thức dần dần sẽ dẫn đến bước nhảy vọt về chất', 'Chất lượng không phụ thuộc số lượng', 'Học ít nhưng hiệu quả hơn học nhiều', 'B', 'Quy luật lượng-chất: tích lũy đủ về lượng sẽ dẫn đến sự thay đổi về chất.');

-- Sample questions for CTDL (subject_id=2)
INSERT INTO Questions (subject_id, chapter_id, level_id, type_id, content, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(2, 5, 1, 1, 'Mảng (Array) là gì?', 'Cấu trúc dữ liệu động', 'Tập hợp các phần tử cùng kiểu dữ liệu, lưu trữ liên tiếp trong bộ nhớ', 'Danh sách các con trỏ', 'Cấu trúc dữ liệu phi tuyến tính', 'B', 'Mảng là tập hợp các phần tử cùng kiểu dữ liệu được lưu trữ liên tiếp trong bộ nhớ.'),
(2, 5, 1, 2, 'Độ phức tạp truy cập phần tử mảng theo chỉ số là?', 'O(n)', 'O(log n)', 'O(1)', 'O(n²)', 'C', 'Truy cập phần tử mảng theo chỉ số có độ phức tạp O(1) vì biết địa chỉ trực tiếp.'),
(2, 6, 1, 1, 'Stack hoạt động theo nguyên tắc nào?', 'FIFO (First In First Out)', 'LIFO (Last In First Out)', 'FILO (First In Last Out) và FIFO đều đúng', 'Random access', 'B', 'Stack hoạt động theo nguyên tắc LIFO - phần tử vào sau sẽ ra trước.'),
(2, 6, 2, 2, 'Ứng dụng nào sau đây sử dụng Stack?', 'Hàng đợi in ấn', 'Kiểm tra cặp ngoặc hợp lệ', 'Breadth First Search', 'Lịch sử trình duyệt (forward)', 'B', 'Stack được dùng để kiểm tra cặp ngoặc hợp lệ vì tính chất LIFO.'),
(2, 7, 2, 1, 'Cây nhị phân tìm kiếm (BST) có tính chất gì?', 'Mọi nút trái đều lớn hơn nút gốc', 'Nút trái nhỏ hơn gốc, nút phải lớn hơn gốc', 'Các nút cùng cấp có giá trị bằng nhau', 'Cây luôn cân bằng', 'B', 'Trong BST, tất cả nút con trái nhỏ hơn nút gốc và tất cả nút con phải lớn hơn nút gốc.'),
(2, 8, 2, 2, 'Thuật toán QuickSort có độ phức tạp trung bình là?', 'O(n²)', 'O(n log n)', 'O(n)', 'O(log n)', 'B', 'QuickSort có độ phức tạp trung bình O(n log n), trường hợp xấu nhất là O(n²).'),
(2, 9, 1, 2, 'Tìm kiếm nhị phân yêu cầu điều kiện gì?', 'Mảng không cần sắp xếp', 'Mảng phải được sắp xếp', 'Mảng phải có số phần tử chẵn', 'Mảng phải chứa số nguyên', 'B', 'Tìm kiếm nhị phân chỉ hoạt động trên mảng đã được sắp xếp.'),
(2, 9, 3, 2, 'Độ phức tạp của tìm kiếm nhị phân là?', 'O(n)', 'O(n²)', 'O(log n)', 'O(1)', 'C', 'Tìm kiếm nhị phân có độ phức tạp O(log n) vì mỗi bước loại bỏ một nửa không gian tìm kiếm.');
