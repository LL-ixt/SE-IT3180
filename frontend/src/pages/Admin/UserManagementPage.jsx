import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, User, Shield, Eye } from 'lucide-react';

const UserManagementPage = () => {
    const [nguoiDungs, setNguoiDungs] = useState([
        {
            id: 1,
            hoTen: 'Nguyễn Văn Admin',
            tenDangNhap: 'admin',
            email: 'admin@chungcu.vn',
            sdt: '0901234567',
            vaiTro: 'admin',
            trangThai: 'Hoạt động',
            ngayTao: '2024-01-15',
        },
        {
            id: 2,
            hoTen: 'Trần Thị Quản Lý',
            tenDangNhap: 'quanly01',
            email: 'quanly@chungcu.vn',
            sdt: '0912345678',
            vaiTro: 'quanly',
            trangThai: 'Hoạt động',
            ngayTao: '2024-02-20',
        },
        {
            id: 3,
            hoTen: 'Lê Văn Kế Toán',
            tenDangNhap: 'ketoan01',
            email: 'ketoan@chungcu.vn',
            sdt: '0923456789',
            vaiTro: 'ketoan',
            trangThai: 'Hoạt động',
            ngayTao: '2024-03-10',
        },
        {
            id: 4,
            hoTen: 'Phạm Thị Hoa',
            tenDangNhap: 'quanly02',
            email: 'hoa@chungcu.vn',
            sdt: '0934567890',
            vaiTro: 'quanly',
            trangThai: 'Hoạt động',
            ngayTao: '2024-04-05',
        },
        {
            id: 5,
            hoTen: 'Hoàng Văn Nam',
            tenDangNhap: 'ketoan02',
            email: 'nam@chungcu.vn',
            sdt: '0945678901',
            vaiTro: 'ketoan',
            trangThai: 'Tạm khóa',
            ngayTao: '2024-05-12',
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingNguoiDung, setEditingNguoiDung] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingNguoiDung, setViewingNguoiDung] = useState(null);

    // Filter checkboxes
    const [filterVaiTro, setFilterVaiTro] = useState({
        admin: false,
        quanly: false,
        ketoan: false,
    });

    const [formData, setFormData] = useState({
        hoTen: '',
        tenDangNhap: '',
        email: '',
        sdt: '',
        vaiTro: 'quanly',
        matKhau: '',
        trangThai: 'Hoạt động',
    });

    const handleAdd = () => {
        setEditingNguoiDung(null);
        setFormData({
            hoTen: '',
            tenDangNhap: '',
            email: '',
            sdt: '',
            vaiTro: 'quanly',
            matKhau: '',
            trangThai: 'Hoạt động',
        });
        setShowModal(true);
    };

    const handleEdit = (nguoiDung) => {
        setEditingNguoiDung(nguoiDung);
        setFormData({
            hoTen: nguoiDung.hoTen,
            tenDangNhap: nguoiDung.tenDangNhap,
            email: nguoiDung.email,
            sdt: nguoiDung.sdt,
            vaiTro: nguoiDung.vaiTro,
            matKhau: '',
            trangThai: nguoiDung.trangThai,
        });
        setShowModal(true);
    };

    const handleView = (nguoiDung) => {
        setViewingNguoiDung(nguoiDung);
    };

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
            setNguoiDungs(nguoiDungs.filter((n) => n.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingNguoiDung) {
            setNguoiDungs(
                nguoiDungs.map((n) =>
                    n.id === editingNguoiDung.id
                        ? { ...n, ...formData }
                        : n
                )
            );
        } else {
            const newNguoiDung = {
                id: Math.max(...nguoiDungs.map((n) => n.id), 0) + 1,
                hoTen: formData.hoTen,
                tenDangNhap: formData.tenDangNhap,
                email: formData.email,
                sdt: formData.sdt,
                vaiTro: formData.vaiTro,
                trangThai: formData.trangThai,
                ngayTao: new Date().toISOString().split('T')[0],
            };
            setNguoiDungs([...nguoiDungs, newNguoiDung]);
        }

        setShowModal(false);
    };

    // Filter logic
    const filteredNguoiDungs = nguoiDungs.filter((n) => {
        const matchesSearch =
            n.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.tenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.email.toLowerCase().includes(searchTerm.toLowerCase());

        const hasActiveFilter = filterVaiTro.admin || filterVaiTro.quanly || filterVaiTro.ketoan;

        if (!hasActiveFilter) {
            return matchesSearch;
        }

        const matchesFilter =
            (filterVaiTro.admin && n.vaiTro === 'admin') ||
            (filterVaiTro.quanly && n.vaiTro === 'quanly') ||
            (filterVaiTro.ketoan && n.vaiTro === 'ketoan');

        return matchesSearch && matchesFilter;
    });

    const getVaiTroLabel = (vaiTro) => {
        switch (vaiTro) {
            case 'admin':
                return 'Admin';
            case 'quanly':
                return 'Quản lý';
            case 'ketoan':
                return 'Kế toán';
            default:
                return vaiTro;
        }
    };

    const getVaiTroColor = (vaiTro) => {
        switch (vaiTro) {
            case 'admin':
                return 'bg-red-100 text-red-600';
            case 'quanly':
                return 'bg-blue-100 text-blue-600';
            case 'ketoan':
                return 'bg-green-100 text-green-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const stats = [
        {
            label: 'Tổng người dùng',
            value: nguoiDungs.length,
            icon: User,
            color: 'bg-indigo-500',
        },
        {
            label: 'Admin',
            value: nguoiDungs.filter((n) => n.vaiTro === 'admin').length,
            icon: Shield,
            color: 'bg-red-500',
        },
        {
            label: 'Quản lý',
            value: nguoiDungs.filter((n) => n.vaiTro === 'quanly').length,
            icon: User,
            color: 'bg-blue-500',
        },
        {
            label: 'Kế toán',
            value: nguoiDungs.filter((n) => n.vaiTro === 'ketoan').length,
            icon: User,
            color: 'bg-green-500',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý người dùng</h2>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm người dùng
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border p-4">
                            <div className="flex items-center gap-3">
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                    <p className="text-gray-900 font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, tên đăng nhập, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Filter Checkboxes */}
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filterVaiTro.admin}
                                onChange={(e) =>
                                    setFilterVaiTro({ ...filterVaiTro, admin: e.target.checked })
                                }
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-gray-700">Admin</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filterVaiTro.quanly}
                                onChange={(e) =>
                                    setFilterVaiTro({ ...filterVaiTro, quanly: e.target.checked })
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Quản lý</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filterVaiTro.ketoan}
                                onChange={(e) =>
                                    setFilterVaiTro({ ...filterVaiTro, ketoan: e.target.checked })
                                }
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-700">Kế toán</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Họ và tên</th>
                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Vai trò</th>
                                <th className="px-6 py-3 text-right text-gray-700 font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredNguoiDungs.length > 0 ? (
                                filteredNguoiDungs.map((nguoiDung) => (
                                    <tr key={nguoiDung.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-800 font-medium">{nguoiDung.hoTen}</p>
                                                    <p className="text-gray-500 text-xs">{nguoiDung.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVaiTroColor(nguoiDung.vaiTro)}`}>
                                                {getVaiTroLabel(nguoiDung.vaiTro)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleView(nguoiDung)}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                                    title="Chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(nguoiDung)}
                                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(nguoiDung.id)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Detail Modal */}
            {viewingNguoiDung && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết người dùng</h3>
                            <button
                                onClick={() => setViewingNguoiDung(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-indigo-600" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Họ và tên</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.hoTen}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Tên đăng nhập</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.tenDangNhap}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Email</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.email}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Số điện thoại</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.sdt}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Vai trò</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getVaiTroColor(viewingNguoiDung.vaiTro)}`}>
                                        {getVaiTroLabel(viewingNguoiDung.vaiTro)}
                                    </span>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Trạng thái</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${viewingNguoiDung.trangThai === 'Hoạt động'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {viewingNguoiDung.trangThai}
                                    </span>
                                </div>

                                <div className="pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Ngày tạo</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(viewingNguoiDung.ngayTao).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setViewingNguoiDung(null)}
                            className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">
                            {editingNguoiDung ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Họ và tên</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.hoTen}
                                        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.tenDangNhap}
                                        onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Nhập tên đăng nhập"
                                        disabled={!!editingNguoiDung}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.sdt}
                                        onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="0912345678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Vai trò</label>
                                    <select
                                        required
                                        value={formData.vaiTro}
                                        onChange={(e) =>
                                            setFormData({ ...formData, vaiTro: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="quanly">Quản lý</option>
                                        <option value="ketoan">Kế toán</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Trạng thái</label>
                                    <select
                                        required
                                        value={formData.trangThai}
                                        onChange={(e) =>
                                            setFormData({ ...formData, trangThai: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Hoạt động">Hoạt động</option>
                                        <option value="Tạm khóa">Tạm khóa</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        {editingNguoiDung ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingNguoiDung}
                                        value={formData.matKhau}
                                        onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={editingNguoiDung ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    {editingNguoiDung ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;