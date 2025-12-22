import React from 'react';
import { useAuth } from '../../context/AuthContext';
import bgImage from '../../assets/images/background.jpg';
import { DollarSign, Users, Home, TrendingUp } from 'lucide-react';
// 1. ĐÃ XÓA: import Sidebar... (Không cần nữa vì MainLayout đã lo rồi)

const Dashboard = () => {
    const { user } = useAuth();
    // (Không dùng logout ở đây thì có thể xóa hoặc để lại tùy bạn)

    const stats = [
        { label: 'Tổng thu tháng này', value: '125,500,000đ', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
        { label: 'Tổng nhân khẩu', value: '1,234', change: '+5 người', icon: Users, color: 'bg-blue-500' },
        { label: 'Tổng hộ khẩu', value: '456', change: '+2 hộ', icon: Home, color: 'bg-purple-500' },
        { label: 'Tỷ lệ đóng phí', value: '95.5%', change: '+3.2%', icon: TrendingUp, color: 'bg-orange-500' },
    ];

    return (
        // 2. ĐÃ SỬA: Xóa 'grid grid-cols-[270px_1fr] gap-8'.
        // Giờ nó chỉ là một thẻ div full chiều rộng nằm gọn trong phần nội dung của MainLayout
        <div className="relative w-full h-full min-h-[calc(100vh-80px)]">

            {/* 3. ĐÃ XÓA: <Sidebar /> ở đây */}

            {/* 4. OVERLAY NỘI DUNG GIỮ NGUYÊN */}
            <div className="relative z-10 shadow-2xl shadow-black/50 rounded-3xl flex flex-col items-start justify-center h-full p-12 text-white"
                style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

                <div className="w-auto bg-black/30 backdrop-blur-xs p-10 rounded-3xl border border-white/20 shadow-2xl">
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">
                        Xin chào, <span className="font-extrabold text-cyan-300">{user?.fullName || 'Người dùng'}</span>
                    </h1>

                    <div className="space-y-2">
                        <p className="text-2xl font-medium text-gray-200">
                            Vai trò: <span className="px-3 py-1 bg-blue-300 shadow-2xl border-white/20 border rounded-lg text-white text-xl">
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Quản lý'}
                            </span>
                        </p>
                        <p className="text-white mt-6 max-w-md italic">
                            Chào mừng bạn quay trở lại với hệ thống quản lý chung cư BlueMoon.
                            Hãy chọn các chức năng ở thanh menu bên trái để bắt đầu làm việc.
                        </p>
                    </div>
                    <div className="mt-10">
                        <div className="p-4 inline-flex bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-sm font-bold text-white">Tổng quan {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-black/30 rounded-xl backdrop-blur-xs shadow-sm border border-white/20 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`${stat.color} w-12 h-12 border border-white/20 shadow-2xl shadow-white rounded-lg flex items-center justify-center`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                                    </div>
                                    <p className="text-white text-sm mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;