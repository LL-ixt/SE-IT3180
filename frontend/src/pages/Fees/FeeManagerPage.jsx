import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Modal from '../../components/common/Modal'; // Import Modal chung

const initialFees = [
    { id: 1, name: 'Phí quản lý', type: 'Cố định', amount: '15,000đ', unit: 'Theo m²/tháng', description: 'Phí quản lý chung cư hàng tháng' },
    { id: 2, name: 'Phí dịch vụ', type: 'Cố định', amount: '8,000đ', unit: 'Theo m²/tháng', description: 'Phí dịch vụ chung' },
    { id: 3, name: 'Phí gửi xe máy', type: 'Cố định', amount: '100,000đ', unit: 'Theo xe/tháng', description: 'Phí gửi xe máy trong tòa nhà' },
    { id: 4, name: 'Phí gửi xe ô tô', type: 'Cố định', amount: '1,500,000đ', unit: 'Theo xe/tháng', description: 'Phí gửi xe ô tô trong tòa nhà' },
    { id: 5, name: 'Tiền điện', type: 'Theo sử dụng', amount: '3,500đ', unit: 'Theo kWh', description: 'Tiền điện sinh hoạt' },
    { id: 6, name: 'Tiền nước', type: 'Theo sử dụng', amount: '25,000đ', unit: 'Theo m³', description: 'Tiền nước sinh hoạt' },
];

const FeeManagerPage = () => {
    const [fees, setFees] = useState(initialFees);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Cố định',
        amount: '',
        unit: '',
        description: ''
    });

    const filteredFees = fees.filter(fee =>
        fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (fee = null) => {
        if (fee) {
            setEditingFee(fee);
            setFormData({
                name: fee.name,
                type: fee.type,
                amount: fee.amount,
                unit: fee.unit,
                description: fee.description
            });
        } else {
            setEditingFee(null);
            setFormData({
                name: '',
                type: 'Cố định',
                amount: '',
                unit: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingFee) {
            setFees(fees.map(fee =>
                fee.id === editingFee.id
                    ? { ...formData, id: editingFee.id }
                    : fee
            ));
        } else {
            const newFee = {
                ...formData,
                id: Math.max(...fees.map(f => f.id), 0) + 1
            };
            setFees([...fees, newFee]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoản thu này?')) {
            setFees(fees.filter(fee => fee.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý khoản thu</h2>
                    <p className="text-gray-600">Quản lý các loại phí và khoản thu trong chung cư</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Thêm khoản thu
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            placeholder="Tìm kiếm khoản thu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 font-medium text-gray-700">Tên khoản thu</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-700">Loại</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-700">Số tiền</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-700">Đơn vị</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-700">Mô tả</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-700">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">{fee.name}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${fee.type === 'Cố định'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {fee.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{fee.amount}</td>
                                    <td className="py-4 px-6 text-gray-600">{fee.unit}</td>
                                    <td className="py-4 px-6 text-gray-500 max-w-xs truncate" title={fee.description}>
                                        {fee.description}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleOpenModal(fee)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(fee.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFees.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        Không tìm thấy khoản thu nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        {editingFee ? 'Chỉnh sửa khoản thu' : 'Thêm khoản thu mới'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoản thu</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                                placeholder="Ví dụ: Phí quản lý"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại khoản thu</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Cố định">Cố định</option>
                                <option value="Theo sử dụng">Theo sử dụng</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                                <input
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="VD: 15,000đ"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                                <input
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="VD: Theo m²/tháng"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Mô tả chi tiết về khoản thu này..."
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                {editingFee ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default FeeManagerPage;