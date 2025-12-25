import React, { useState } from 'react';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import AddFeeModal from './AddFeeModal';
// Dữ liệu mẫu chỉ còn Bắt buộc/Tự nguyện
const initialFees = [
    { id: 1, name: 'Phí quản lý chung cư', unitPrice: 7000, unit: 'm²', type: 'Bắt buộc', description: 'Thu theo diện tích căn hộ' },
    { id: 2, name: 'Phí gửi xe máy', unitPrice: 80000, unit: 'xe/tháng', type: 'Tự nguyện', description: 'Cho cư dân có đăng ký xe' },
    { id: 3, name: 'Phí vệ sinh', unitPrice: 30000, unit: 'hộ/tháng', type: 'Bắt buộc', description: 'Thu theo hộ gia đình' },
    { id: 4, name: 'Phí gửi ô tô', unitPrice: 1200000, unit: 'xe/tháng', type: 'Tự nguyện', description: 'Cho cư dân có đăng ký xe' },
];

const FeeManagerPage = () => {
    const [fees, setFees] = useState(initialFees);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    //const [formData, setFormData] = useState({ name: '', unitPrice: '', unit: '', type: 'Bắt buộc', description: '' });

    const headers = [
        { label: 'Tên khoản thu', className: 'text-left' },
        { label: 'Đơn giá (VND)', className: 'text-left' },
        { label: 'Đơn vị', className: 'text-left' },
        { label: 'Loại', className: 'text-left' },
        { label: 'Mô tả', className: 'text-left' },
        { label: 'Thao tác', className: 'text-left' },
    ];

    const renderRow = (item, index) => (
        <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
            <td className="py-4 px-6 text-blue-600 font-bold">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)} đ</td>
            <td className="py-4 px-6 text-gray-600">{item.unit}</td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.type === 'Bắt buộc' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {item.type}
                </span>
            </td>
            <td className="py-4 px-6 text-gray-500 italic truncate max-w-xs">{item.description}</td>
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(item)} className="flex items-center justify-center w-7 h-7 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="flex items-center justify-center w-7 h-7 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );

    const handleOpenModal = (fee = null) => {
        setEditingFee(fee);
        //setFormData(fee || { name: '', unitPrice: '', unit: '', type: 'Bắt buộc', description: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = (data) => {
        if (editingFee) {
            setFees(fees.map(f => f.id === editingFee.id ? { ...data, id: editingFee.id } : f));
        } else {
            setFees([...fees, { ...data, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Xóa khoản thu này?')) setFees(fees.filter(f => f.id !== id));
    };

    const filteredFees = fees.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khoản thu</h2>
                </div>
                {/* Button: Chỉ để bg-gradient, không set text-color */}
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-linear-to-r from-blue-500 to-cyan-500"
                >
                    Thêm khoản thu
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng danh mục phí</p>
                        <p className="text-gray-900 font-bold">{fees.length} loại</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Tìm kiếm khoản thu..."
                    />
                </div>
            </div>

            <Table
                headers={headers}
                data={filteredFees}
                renderRow={renderRow}
                footerText={<>Tổng số: <span className="font-bold text-gray-700">{filteredFees.length}</span> loại phí</>}
            />

            {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        {editingFee ? 'Chỉnh sửa khoản thu' : 'Thêm khoản thu mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoản thu</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá (VND)</label>
                                <input type="number" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                                <input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required placeholder="VD: m2, hộ" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Bắt buộc">Bắt buộc</option>
                                <option value="Tự nguyện">Tự nguyện</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                            <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-400">Hủy</Button>
                            <Button type="submit" className="flex-1 bg-blue-600">Lưu</Button>
                        </div>
                    </form>
                </div>
            </Modal> */}

            <AddFeeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSubmit}
                initialData={editingFee}
            />
        </div>
    );
};

export default FeeManagerPage;