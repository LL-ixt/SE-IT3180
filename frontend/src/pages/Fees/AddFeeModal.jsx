import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

const AddFeeModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        unitPrice: '',
        unit: '',
        type: 'Bắt buộc',
        description: ''
    });

    // Cập nhật form khi initialData thay đổi (dùng cho trường hợp Edit)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', unitPrice: '', unit: '', type: 'Bắt buộc', description: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Chuyển đổi unitPrice sang số trước khi gửi đi
        onSubmit({ ...formData, unitPrice: Number(formData.unitPrice) });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    {initialData ? 'Chỉnh sửa khoản thu' : 'Thêm khoản thu mới'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoản thu</label>
                        <input 
                            value={formData.name} 
                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá (VND)</label>
                            <input 
                                type="number" 
                                value={formData.unitPrice} 
                                onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                            <input 
                                value={formData.unit} 
                                onChange={e => setFormData({ ...formData, unit: e.target.value })} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                required 
                                placeholder="VD: m2, hộ" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
                        <select 
                            value={formData.type} 
                            onChange={e => setFormData({ ...formData, type: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Bắt buộc">Bắt buộc</option>
                            <option value="Tự nguyện">Tự nguyện</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({ ...formData, description: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                        <Button type="button" onClick={onClose} className="flex-1 bg-gray-400">Hủy</Button>
                        <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all">Lưu</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddFeeModal;