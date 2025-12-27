import React, { useState, useEffect } from 'react';
import householdApi from '../../api/householdApi';
import { Plus, Edit, Trash2, User, Home as HomeIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import Table from '../../components/common/Table.jsx';
import { useAuth } from '../../context/AuthContext'; // Lấy user từ context

const HouseholdPage = () => {
    const { user } = useAuth(); // Lấy thông tin user đã đăng nhập
    const [households, setHouseholds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHousehold, setEditingHousehold] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form data khớp với các input trên giao diện
    const [formData, setFormData] = useState({
        apartmentNumber: '', ownerName: '', phone: '', area: '', membersCount: '0', motorbikeNumber: '0', carNumber: '0', status: 'active'
    });

    useEffect(() => {
        if (user?.token) {
            fetchHouseholds();
        }
    }, [user]);

    const fetchHouseholds = async () => {
        try {
            setLoading(true);
            const response = await householdApi.getAll();
            setHouseholds(response.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const tableHeaders = [
        { label: 'Căn hộ', className: 'text-left'},
        { label: 'Chủ hộ', className: 'text-left'},
        { label: 'Diện tích', className: 'text-left'},
        { label: 'Thành viên', className: 'text-left'},
        { label: 'Xe cộ (Máy/Ô tô)', className: 'text-left'},
        { label: 'Trạng thái', className: 'text-left' },
        { label: 'Thao tác', className: 'text-left' }
    ];

    const renderHouseholdRow = (household) => (
        <tr key={household._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6">
                <span className="inline-block text-center w-16 px-3 py-1 bg-blue-500 text-white rounded-lg font-medium text-sm">
                    {household.apartmentNumber}
                </span>
            </td>
            <td className="text-left py-4 px-6">{household.ownerName}</td>
            <td className="text-left py-4 px-6">{household.area}m²</td>
            <td className="text-left py-4 px-6">{household.members?.length || 0}</td>
            <td className="text-left py-4 px-6">
                {household.motorbikeNumber} / {household.carNumber}
            </td>
            <td className="text-left py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    household.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {household.status === 'active' ? 'Đang ở' : 'Trống'}
                </span>
            </td>
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(household)} className="text-blue-400 hover:text-blue-600">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(household._id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );

    const filteredHouseholds = households.filter(h =>
        h.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (household = null) => {
        if (household) {
            setEditingHousehold(household);
            setFormData({
                apartmentNumber: household.apartmentNumber,
                ownerName: household.ownerName,
                area: household.area.toString(),
                motorbikeNumber: household.motorbikeNumber.toString(),
                carNumber: household.carNumber.toString(),
                status: household.status
            });
        } else {
            setEditingHousehold(null);
            setFormData({ apartmentNumber: '', ownerName: '', area: '', motorbikeNumber: '0', carNumber: '0', status: 'active' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            apartmentNumber: formData.apartmentNumber,
            ownerName: formData.ownerName,
            area: Number(formData.area),
            motorbikeNumber: Number(formData.motorbikeNumber),
            carNumber: Number(formData.carNumber),
            status: formData.status
        };

        try {
            if (editingHousehold) {
                await householdApi.update(editingHousehold._id, data);
            } else {
                await householdApi.create(data);
            }
            fetchHouseholds();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xóa hộ khẩu?')) {
                try {
                    await householdApi.remove(id);
                    fetchHouseholds();
                } catch (error) {
                    alert('Lỗi khi xóa');
                }
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý hộ khẩu</h2>
                <Button onClick={() => handleOpenModal()} className="bg-linear-to-r from-blue-500 to-cyan-500">
                    <Plus className="w-5 h-5" /> Thêm hộ khẩu
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                        <HomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng số căn hộ</p>
                        <p className="text-gray-900 font-bold">{households.length}</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Tìm kiếm căn hộ, chủ hộ..." />
                </div>
            </div>

            <Table 
                headers={tableHeaders} 
                data={filteredHouseholds} 
                renderRow={renderHouseholdRow} 
                footerText={<>Kết quả: <span className="font-bold">{filteredHouseholds.length}</span> căn hộ</>}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-6">{editingHousehold ? 'Sửa hộ khẩu' : 'Thêm hộ khẩu'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số căn hộ</label>
                                <input value={formData.apartmentNumber} onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                                <input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên chủ hộ</label>
                            <input value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Xe máy</label>
                                <input type="number" value={formData.motorbikeNumber} onChange={(e) => setFormData({ ...formData, motorbikeNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ô tô</label>
                                <input type="number" value={formData.carNumber} onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="active">Đang ở</option>
                                <option value="inactive">Trống</option>
                            </select>
                        </div>
                        <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                            <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-300 text-gray-700">Hủy</Button>
                            <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all">{editingHousehold ? 'Cập nhật' : 'Thêm'}</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default HouseholdPage;