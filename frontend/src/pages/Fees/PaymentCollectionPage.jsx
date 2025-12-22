import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import Modal from '../../components/common/Modal'; // Dùng Modal chung của dự án

const initialCollections = [
    {
        id: 1,
        name: 'Thu phí tháng 12/2024',
        period: 'Tháng 12/2024',
        startDate: '01/12/2024',
        endDate: '31/12/2024',
        totalAmount: '234,500,000đ',
        collected: '209,234,000đ',
        status: 'Đang thu'
    },
    {
        id: 2,
        name: 'Thu phí tháng 11/2024',
        period: 'Tháng 11/2024',
        startDate: '01/11/2024',
        endDate: '30/11/2024',
        totalAmount: '228,400,000đ',
        collected: '228,400,000đ',
        status: 'Đã hoàn thành'
    },
    {
        id: 3,
        name: 'Thu phí tháng 10/2024',
        period: 'Tháng 10/2024',
        startDate: '01/10/2024',
        endDate: '31/10/2024',
        totalAmount: '231,200,000đ',
        collected: '231,200,000đ',
        status: 'Đã hoàn thành'
    },
];

const PaymentCollectionPage = () => {
    const [collections, setCollections] = useState(initialCollections);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        period: '',
        startDate: '',
        endDate: '',
        totalAmount: '',
        collected: '0đ',
        status: 'Đang thu'
    });

    const handleOpenModal = (collection = null) => {
        if (collection) {
            setEditingCollection(collection);
            setFormData({
                name: collection.name,
                period: collection.period,
                startDate: collection.startDate,
                endDate: collection.endDate,
                totalAmount: collection.totalAmount,
                collected: collection.collected,
                status: collection.status
            });
        } else {
            setEditingCollection(null);
            setFormData({
                name: '',
                period: '',
                startDate: '',
                endDate: '',
                totalAmount: '',
                collected: '0đ',
                status: 'Đang thu'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCollection) {
            setCollections(collections.map(col =>
                col.id === editingCollection.id
                    ? { ...formData, id: editingCollection.id }
                    : col
            ));
        } else {
            const newCollection = {
                ...formData,
                id: Math.max(...collections.map(c => c.id)) + 1
            };
            setCollections([newCollection, ...collections]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đợt thu này?')) {
            setCollections(collections.filter(col => col.id !== id));
        }
    };

    const getProgressPercentage = (collected, total) => {
        const collectedNum = parseFloat(collected.replace(/[^\d]/g, ''));
        const totalNum = parseFloat(total.replace(/[^\d]/g, ''));
        return totalNum > 0 ? Math.round((collectedNum / totalNum) * 100) : 0;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý đợt thu</h2>
                    <p className="text-gray-600">Quản lý các đợt thu phí theo tháng</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Tạo đợt thu mới
                </button>
            </div>

            <div className="grid gap-6">
                {collections.map((collection) => {
                    const progress = getProgressPercentage(collection.collected, collection.totalAmount);

                    return (
                        <div key={collection.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{collection.name}</h3>
                                    <p className="text-gray-600">{collection.period}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${collection.status === 'Đang thu'
                                        ? 'bg-blue-100 text-blue-700'
                                        : collection.status === 'Đã hoàn thành'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {collection.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ngày bắt đầu</p>
                                    <p className="text-lg font-medium text-gray-900">{collection.startDate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ngày kết thúc</p>
                                    <p className="text-lg font-medium text-gray-900">{collection.endDate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tổng cần thu</p>
                                    <p className="text-lg font-bold text-gray-900">{collection.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Đã thu</p>
                                    <p className="text-lg font-bold text-green-600">{collection.collected}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Tiến độ thu</span>
                                    <span className="font-medium">{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 border-t pt-4">
                                <button className="flex items-center px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium transition-colors">
                                    <Eye size={16} className="mr-2" />
                                    Chi tiết
                                </button>
                                <button
                                    onClick={() => handleOpenModal(collection)}
                                    className="flex items-center px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 text-sm font-medium transition-colors"
                                >
                                    <Edit size={16} className="mr-2" />
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(collection.id)}
                                    className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 text-sm font-medium transition-colors"
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingCollection ? 'Chỉnh sửa đợt thu' : 'Tạo đợt thu mới'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đợt thu</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Thu phí tháng 12/2024"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ thu</label>
                            <input
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                placeholder="VD: Tháng 12/2024"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                <input
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    placeholder="01/12/2024"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                                <input
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    placeholder="31/12/2024"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số tiền cần thu</label>
                            <input
                                value={formData.totalAmount}
                                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                                placeholder="VD: 234,500,000đ"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Đang thu">Đang thu</option>
                                <option value="Đã hoàn thành">Đã hoàn thành</option>
                                <option value="Đã đóng">Đã đóng</option>
                            </select>
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {editingCollection ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

export default PaymentCollectionPage;