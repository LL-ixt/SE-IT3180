import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import các trang (Đảm bảo đường dẫn file đúng với thư mục bạn đã tạo)
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard/DashboardPage';
import HouseholdPage from './pages/Household/HouseholdPage'; // Trang hộ khẩu
import ResidentListPage from './pages/Household/ResidentListPage';   // Trang nhân khẩu
import FeeManagerPage from './pages/Fees/FeeManagerPage';    // Trang khoản thu
import PaymentCollectionPage from './pages/Fees/PaymentCollectionPage'; // Trang đợt thu
import UserManagementPage from './pages/Admin/UserManagementPage'; // Trang quản lý user

// Import Sidebar (Nếu bạn chưa có file này, hãy tạo nó trong components/layout/Sidebar.jsx)
import Sidebar from './components/layout/Sidebar';

// Layout chính cho phần Dashboard (Có Sidebar)
const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar cố định bên trái */}
            <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
                <Sidebar />
            </div>

            {/* Khu vực nội dung thay đổi bên phải */}
            <div className="flex-1 overflow-auto p-8">
                <Outlet /> {/* Đây là nơi các trang con sẽ hiển thị */}
            </div>
        </div>
    );
};

// Component bảo vệ route (Chưa đăng nhập thì đá về Login)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Nếu đang tải thông tin user thì hiện màn hình loading tránh flash
    if (loading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>;

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* 1. ROUTE CÔNG KHAI */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* 2. ROUTE CẦN BẢO VỆ (Dùng Layout Route) */}
                    <Route element={
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    }>
                        {/* Định nghĩa các trang con */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/ho-khau" element={<HouseholdPage />} />
                        <Route path="/nhan-khau" element={<ResidentListPage />} />
                        <Route path="/quan-ly-phi" element={<FeeManagerPage />} />
                        <Route path="/dot-thu" element={<PaymentCollectionPage />} />
                        <Route path="/nguoi-dung" element={<UserManagementPage />} />
                    </Route>

                    {/* Route mặc định: Nếu gõ link sai thì về trang chủ */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;