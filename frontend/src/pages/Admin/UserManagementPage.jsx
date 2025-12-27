import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Shield, Eye } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import {Button} from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import userApi from '../../api/userApi';

const UserManagementPage = () => {
    const [nguoiDungs, setNguoiDungs] = useState([]);
    const [loading, setLoading] = useState(true);

    const tableHeaders = [
        { label: 'Họ và tên', className: 'text-left'},
        { label: 'Vai trò', className: 'text-left'},
        { label: 'Thao tác', className: 'text-right'}
    ];

    const renderUserRow = (nguoiDung) => (
        <tr key={nguoiDung._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0"> {/* Tránh tràn text nếu tên quá dài */}
                        <p className="text-gray-800 font-medium truncate">{nguoiDung.fullName}</p>
                        <p className="text-gray-500 text-xs truncate">{nguoiDung.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getVaiTroColor(nguoiDung.role)}`}>
                    {getVaiTroLabel(nguoiDung.role)}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                    {/* <button onClick={() => handleView(nguoiDung)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Chi tiết">
                        <Eye className="w-4 h-4" />
                    </button> */}
                    <button onClick={() => handleEdit(nguoiDung)} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors" title="Sửa">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(nguoiDung._id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
    const [showModal, setShowModal] = useState(false);
    const [editingNguoiDung, setEditingNguoiDung] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingNguoiDung, setViewingNguoiDung] = useState(null);

    // Filter checkboxes
    const [filterVaiTro, setFilterVaiTro] = useState({
        admin: false,
        manager: false,
        accountant: false,
    });

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        role: 'manager',
        password: '',
        status: 'Hoạt động',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();
            setNguoiDungs(response.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingNguoiDung(null);
        setFormData({
            fullName: '',
            username: '',
            email: '',
            phone: '',
            role: 'manager',
            password: '',
            status: 'Hoạt động',
        });
        setShowModal(true);
    };

    const handleEdit = (nguoiDung) => {
        setEditingNguoiDung(nguoiDung);
        setFormData({
            fullName: nguoiDung.fullName || '',
            username: nguoiDung.username || '',
            email: nguoiDung.email || '',
            phone: nguoiDung.phone || '',
            role: nguoiDung.role || 'manager',
            password: '',
            status: nguoiDung.status || 'Hoạt động',
        });
        setShowModal(true);
    };

    const handleView = (nguoiDung) => {
        setViewingNguoiDung(nguoiDung);
    };

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
            userApi.remove(id)
                .then(() => fetchUsers())
                .catch(error => alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingNguoiDung) {
                await userApi.update(editingNguoiDung._id, formData);
            } else {
                await userApi.create(formData);
            }
            fetchUsers();
            setShowModal(false);
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    // Filter logic
    const filteredNguoiDungs = nguoiDungs.filter((n) => {
        const matchesSearch =
            (n.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const hasActiveFilter = filterVaiTro.admin || filterVaiTro.manager || filterVaiTro.accountant;

        if (!hasActiveFilter) {
            return matchesSearch;
        }

        const matchesFilter =
            (filterVaiTro.admin && n.role === 'admin') ||
            (filterVaiTro.manager && n.role === 'manager') ||
            (filterVaiTro.accountant && n.role === 'accountant');

        return matchesSearch && matchesFilter;
    });

    const getVaiTroLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'manager':
                return 'Quản lý';
            case 'accountant':
                return 'Kế toán';
            default:
                return role;
        }
    };

    const getVaiTroColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-600';
            case 'manager':
                return 'bg-blue-100 text-blue-600';
            case 'accountant':
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
            value: nguoiDungs.filter((n) => n.role === 'admin').length,
            icon: Shield,
            color: 'bg-red-500',
        },
        {
            label: 'Quản lý',
            value: nguoiDungs.filter((n) => n.role === 'manager').length,
            icon: User,
            color: 'bg-blue-500',
        },
        {
            label: 'Kế toán',
            value: nguoiDungs.filter((n) => n.role === 'accountant').length,
            icon: User,
            color: 'bg-green-500',
        },
    ];

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý người dùng</h2>
                </div>
                <Button
                    onClick={handleAdd}
                    className="w-fit bg-linear-to-r from-blue-500 to-cyan-500"
                >
                    <Plus className="w-5 h-5" />
                    Thêm người dùng
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* <div className="flex items-center gap-3">
                    <div className={`bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <HomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng số căn hộ</p>
                        <p className="text-gray-900 font-bold">{totalApartments}</p>
                    </div>
                </div> */}
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div className="flex items-center gap-3">
                            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                                <p className="text-gray-900 font-bold">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
                <div className="flex-1 max-w-md">
                    <SearchBar 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        placeholder="Tìm kiếm theo tên, tên đăng nhập, email..."
                    />
                    <div className="flex flex-wrap px-5 gap-6">
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
                                checked={filterVaiTro.manager}
                                onChange={(e) =>
                                    setFilterVaiTro({ ...filterVaiTro, manager: e.target.checked })
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Quản lý</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                id='checkbox1'
                                checked={filterVaiTro.accountant}
                                onChange={(e) =>
                                    setFilterVaiTro({ ...filterVaiTro, accountant: e.target.checked })
                                }
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-700">Kế toán</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                <Table 
                    headers={tableHeaders} 
                    data={filteredNguoiDungs} 
                    renderRow={renderUserRow}
                    footerText={
                        <>
                            Kết quá gồm: <span className="font-bold text-gray-700">{filteredNguoiDungs.length}</span> người dùng
                        </>
                    }
                />
            </div>
            {/* View Detail Modal, TẠM BỎ*/}
            {/* {viewingNguoiDung && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết người dùng</h3>
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
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.fullName}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Tên đăng nhập</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.username}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Email</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.email}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Số điện thoại</p>
                                    <p className="text-gray-900 font-medium">{viewingNguoiDung.phone}</p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Vai trò</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getVaiTroColor(viewingNguoiDung.role || viewingNguoiDung.vaiTro)}`}>
                                        {getVaiTroLabel(viewingNguoiDung.role || viewingNguoiDung.vaiTro)}
                                    </span>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Trạng thái</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ (viewingNguoiDung.status || viewingNguoiDung.trangThai) === 'Hoạt động'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {viewingNguoiDung.status || viewingNguoiDung.trangThai}
                                    </span>
                                </div>

                                <div className="pb-3">
                                    <p className="text-gray-600 text-sm mb-1">Ngày tạo</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(viewingNguoiDung.createdAt || viewingNguoiDung.ngayTao || '').toLocaleDateString('vi-VN')}
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
            )} */}

            {/* Edit/Add Modal */}
            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
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
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="0912345678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Vai trò</label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Quản lý</option>
                                        <option value="accountant">Kế toán</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Trạng thái</label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
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
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                </Modal>
            )}
        </div>
    );
};

export default UserManagementPage;