import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Dùng NavLink để hightlight menu đang chọn
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button.jsx';
import {
    ReceiptText,
    Users,
    Home,
    UserCog,
    Building,
    LayoutDashboard,
    CalendarCheck
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Cấu hình menu khớp với đường dẫn trong App.jsx
    const menuConfig = [
        {
            label: 'Tổng quan',
            path: '/',
            icon: LayoutDashboard,
            // roles: ['admin', 'manager', 'accountant'] // Tạm bỏ comment để hiện hết khi test
        },
        {
            label: 'Quản lý hộ khẩu',
            path: '/ho-khau',
            icon: Home,
            // roles: ['manager', 'admin'] 
        },
        {
            label: 'Quản lý nhân khẩu',
            path: '/nhan-khau',
            icon: Users,
            // roles: ['manager', 'admin'] 
        },
        {
            label: 'Quản lý khoản thu',
            path: '/quan-ly-phi',
            icon: ReceiptText,
            // roles: ['accountant', 'admin']
        },
        {
            label: 'Quản lý đợt thu', // Thêm mục này
            path: '/dot-thu',
            icon: CalendarCheck,
            // roles: ['accountant', 'admin']
        },
        {
            label: 'Quản lý người dùng',
            path: '/nguoi-dung',
            icon: UserCog,
            // roles: ['admin']
        },
    ];

    // Tạm thời hiển thị hết menu để test giao diện
    // Sau này muốn phân quyền thì bỏ comment dòng dưới:
    // const filteredMenu = menuConfig.filter(item => item.roles.includes(user?.role));
    const filteredMenu = menuConfig;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 border border-gray-100 p-6 h-full flex flex-col">
            {/* LOGO */}
            <h2 className="px-5 text-2xl font-bold mb-8 text-gray-800 border-b border-gray-100 pb-6 flex items-center">
                <span className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-2 mr-3 text-white shadow-lg shadow-blue-200">
                    <Building size={24} />
                </span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    BlueMoon
                </span>
            </h2>

            {/* MENU LIST */}
            <ul className="space-y-2 flex-1 overflow-y-auto">
                {filteredMenu.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 p-3 rounded-xl transition-all font-medium duration-200 group ${isActive
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                {item.label}
                            </NavLink>
                        </li>
                    );
                })}
            </ul>

            {/* USER & LOGOUT */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-700 truncate">{user?.fullName || 'User'}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role || 'Staff'}</p>
                    </div>
                </div>
                <Button
                    onClick={handleLogout}
                    className="w-full border border-red-200 bg-white text-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all rounded-xl py-3 font-semibold"
                >
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;