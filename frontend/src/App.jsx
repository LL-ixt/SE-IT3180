import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard/DashboardPage.jsx';
const DashboardLayout = ({ children }) => {
    // Đây sẽ là nơi bạn đặt Sidebar, Header, Footer...
    // Tạm thời dùng div đơn giản để tránh import component MainLayout
    return (
        <div className="flex">
            {/* Sidebar component sẽ ở đây */}
            <div className="grow p-5 bg-gray-50 min-h-screen">
                {/* Nội dung trang (children) sẽ được render ở đây */}
                {children}
            </div>
        </div>
    );
};

// Component bảo vệ route
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* 1. ROUTE CÔNG KHAI: Trang Đăng nhập */}
                    <Route path="/login" element={<LoginPage />} />
                    {/* 2. ROUTE CẦN BẢO VỆ: Nhóm tất cả các trang dashboard */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <DashboardLayout> {/* Layout chung cho tất cả trang nội bộ */}
                                    <Routes>
                                        {/* ROUTE GỐC /: Trang chủ/Dashboard */}
                                        <Route path="/" element={<Dashboard />} />
                                        {/* Bạn có thể thêm nhiều route con khác tại đây */}
                                        {/* <Route path="/sessions" element={<PaymentSessionPage />} /> */}
                                    </Routes>
                                </DashboardLayout>
                            </PrivateRoute>
                        }
                    />
                    {/* Thêm các route khác ở đây */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;