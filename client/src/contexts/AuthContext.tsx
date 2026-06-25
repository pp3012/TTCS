import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null; //State lưu thông tin người dùng: null nếu chưa đăng nhập, hoặc chứa object thông tin nếu đã đăng nhập).
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User | undefined>;
  register: (data: { user_name: string; email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
// Tạo component AuthProvider làm nhiệm vụ "bọc" toàn bộ ứng dụng để cung cấp tất cả các state/hàm quản lý auth cho các component con.

  const [user, setUser] = useState<User | null>(() => {
    // Khai báo state 'user' và hàm cập nhật 'setUser'. Sử dụng kỹ thuật lazy initial state (truyền vào 1 callback function):

    const stored = localStorage.getItem('user');
    // Kiểm tra xem ở bộ nhớ trình duyệt (localStorage) đã có dữ liệu người dùng được lưu từ phiên làm việc trước chưa.

    return stored ? JSON.parse(stored) : null;
    // Nếu có dữ liệu cũ, tiến hành chuyển đổi chuỗi JSON thành object và gán làm state mặc định, ngược lại trả về null.
  });
  // Kết thúc khai báo state user.

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  // Khai báo state 'token'. Tương tự, nó cũng tự động lục lọi trong localStorage xem có chuỗi token lưu sẵn hay không để làm giá trị khởi tạo.

  const [isLoading, setIsLoading] = useState(false);
  // Khai báo state 'isLoading', mặc định ban đầu là false (không bận).

  const login = useCallback(async (identifier: string, password: string) => {
    // Định nghĩa hàm xử lý đăng nhập bất đồng bộ (async). Bọc trong 'useCallback' để tránh hàm bị khởi tạo lại vô ích mỗi lần component re-render.

    setIsLoading(true);
    // Bật trạng thái loading thành true để giao diện hiển thị vòng xoay tải trang hoặc vô hiệu hóa nút bấm.

    try {
      // Mở khối try-catch để bắt các lỗi có thể xảy ra trong quá trình gọi API (sai mật khẩu, mất mạng...).

      const res = await authApi.login(identifier, password);
      // Gửi request đăng nhập lên server bằng hàm 'authApi.login' và đợi (await) kết quả phản hồi từ server trả về.

      const { user, token } = res.data.data;
      // Dùng cú pháp bóc tách dữ liệu để lấy ra chính xác 2 thông tin 'user' và 'token' từ cục data mà API của server trả về.

      setUser(user);
      // Cập nhật thông tin người dùng vào State 'user' của React để cập nhật giao diện toàn hệ thống.

      setToken(token);
      // Cập nhật chuỗi token vào State 'token' của React.

      localStorage.setItem('user', JSON.stringify(user));
      // Lưu trữ thông tin người dùng xuống localStorage dưới dạng chuỗi JSON để khi F5 trang web không bị mất trạng thái.

      localStorage.setItem('token', token);
      // Lưu trữ chuỗi token xuống localStorage để duy trì trạng thái đăng nhập.

      return user;
      // Trả về dữ liệu người dùng cho component gọi hàm này (ví dụ trang Login cần dùng dữ liệu để chuyển hướng).

    } finally {
      // Khối 'finally' luôn luôn chạy bất kể việc gọi API ở khối 'try' thành công hay thất bại.

      setIsLoading(false);
      // Tắt trạng thái loading (chuyển về false) để giao diện trở lại bình thường.
    }
  }, []);
  // Kết thúc hàm login. Mảng phụ thuộc rỗng `[]` nghĩa là hàm này chỉ được tạo ra duy nhất một lần.

  const register = useCallback(async (data: { user_name: string; email: string; password: string; full_name?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      const { user, token } = res.data.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
