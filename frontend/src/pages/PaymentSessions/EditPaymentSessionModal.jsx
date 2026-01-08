import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditPaymentSession = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        startDate: null,
        endDate: null,
        description: '',
        isActive: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                startDate: initialData.startDate ? new Date(initialData.startDate) : null,
                endDate: initialData.endDate ? new Date(initialData.endDate) : null,
                description: initialData.description || '',
                isActive: initialData.isActive ?? true
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, _id: initialData._id });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Chỉnh sửa đợt thu
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tên đợt thu - Style y hệt Create Modal */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đợt thu *</label>
                        <input
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="VD: Thu phí tháng 12/2025"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Hàng ngang: Từ ngày - Đến ngày */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                            <DatePicker
                                selected={formData.startDate}
                                onChange={(date) => setFormData({ ...formData, startDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                            <DatePicker
                                selected={formData.endDate}
                                onChange={(date) => setFormData({ ...formData, endDate: date })}
                                dateFormat="dd/MM/yyyy"
                                minDate={formData.startDate}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({ ...formData, description: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                            placeholder="Nhập ghi chú thêm..."
                        />
                    </div>

                    {/* Footer Buttons - Style y hệt Create Modal */}
                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 bg-gray-300 font-bold hover:bg-gray-500 transition-all"
                        >
                            Hủy
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditPaymentSession;