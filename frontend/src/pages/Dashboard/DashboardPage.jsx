import React from 'react';
import { useAuth } from '../../context/AuthContext';
import bgImage from '../../assets/images/background.jpg';
import { Button } from '../../components/common/Button.jsx';
const Dashboard = () => {
    const { user } = useAuth(); // Lấy thông tin user (fullname, role) từ context
    const { logout } = useAuth();
    const handleLogout = () => {
        // 1. Gọi hàm logout trong Context để xóa localStorage.removeItem('token')
        logout(); 
        
        // 2. Chuyển hướng người dùng về trang Login ngay lập tức
        navigate('/login'); 
    };
    return (
        <div className="relative w-full h-full min-h-[calc(100vh-80px)] grid grid-cols-[270px_1fr] gap-8">
            {/* 1. Thanh chức năng */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold mb-4">Các chức năng</h2>
                {/* List menu của bạn đặt ở đây */}
                <ul className="space-y-2">
                    <li className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">Quản lý thu phí</li>
                    <li className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">Quản lý cư dân</li>
                    <li className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">Quản lý người dùng</li>
                </ul>
                <div className="mt-auto flex justify-center w-full"> 
                    {/* mt-auto: Đẩy toàn bộ div này xuống đáy của flex container */}
                    <Button 
                        onClick={handleLogout}
                        className="bg-linear-to-r from-red-500 to-orange-500 font-bold py-3 shadow-lg shadow-red-200"
                    >
                        Đăng xuất
                    </Button>
                </div>
            </div>
            {/* 2. OVERLAY NỘI DUNG */}
            <div className="relative z-10 shadow-2xl rounded-3xl flex flex-col items-start justify-center h-full p-12 text-white" style={{backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="bg-black/30 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-2xl">
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">
                        Xin chào, <span className="font-extrabold text-blue-300">{user?.fullName || 'Người dùng'}</span>
                    </h1>
                    
                    <div className="space-y-2">
                        <p className="text-2xl font-medium text-gray-200">
                            Vai trò: <span className="px-3 py-1 bg-blue-400 border-3 border-gray-100/50 rounded-lg text-white text-xl">
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Quản lý'}
                            </span>
                        </p>
                        <p className="text-gray-300 mt-6 max-w-md italic">
                            Chào mừng bạn quay trở lại với hệ thống quản lý chung cư BlueMoon. 
                            Hãy chọn các chức năng ở thanh menu bên trái để bắt đầu làm việc.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                            <p className="text-sm text-gray-300">Ngày hôm nay</p>
                            <p className="text-xl font-bold">{new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                            <p className="text-sm text-gray-300">Trạng thái hệ thống</p>
                            <p className="text-xl font-bold text-green-400">Ổn định</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;