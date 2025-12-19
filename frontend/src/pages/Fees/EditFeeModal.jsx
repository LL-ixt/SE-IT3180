import React, { useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { Circle, CircleCheck } from 'lucide-react'; // Các icon mẫu
import {Button} from '../../components/common/Button.jsx';
const EditFeeModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'mandatory', // 'mandatory' hoặc 'voluntary'
        unitPrice: '',
        unit: '', // 'm2', 'person', 'household', 'fixed'
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="px-1 py-5 border-b border-gray-100 space-y-3">
                <h2 className="text-2xl font-bold text-gray-800">Sửa khoản thu</h2>
            </div>
            <div className="p-1">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Tên khoản thu */}
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-gray-700">Tên khoản thu</label>
                        <input
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            name="name"
                            placeholder="Nhập tên khoản thu..."
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Loại khoản thu (Radio custom) */}
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-gray-700">Loại khoản thu</label>
                            <div className="grid grid-cols-2 gap-10 pt-1">
                                {/* Option: Bắt buộc */}
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="radio" name="type" value="mandatory" 
                                        checked={formData.type === 'mandatory'} 
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    {/* Nếu chọn mandatory thì hiện Circle màu đen (gray-900), ngược lại màu xám */}
                                    {formData.type === 'mandatory' ? (
                                        <CircleCheck className="size-6 text-yellow-500 transition-colors" />
                                    ) : (
                                        <Circle className="size-6 text-gray-400 transition-colors" />
                                    )}
                                    <span className={`text-lg transition-all ${
                                        formData.type === 'mandatory' ? ' text-black' : 'text-gray-500'
                                    }`}>
                                        Bắt buộc
                                    </span>
                                </label>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" name="type" value="voluntary" 
                                    checked={formData.type === 'voluntary'} 
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                {/* Logic Icon: Nếu là voluntary hiện CheckCircle2 xanh, ngược lại hiện Circle xám */}
                                {formData.type === 'voluntary' ? (
                                    <CircleCheck className="size-6 text-green-500 transition-colors" />
                                ) : (
                                    <Circle className="size-6 text-gray-400 transition-colors" />
                                )}
                                <span className={`text-lg transition-all ${
                                    formData.type === 'voluntary' ? ' text-black' : 'text-gray-500'
                                }`}>
                                    Tự nguyện
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Hàng ngang: Đơn giá và Đơn vị */}
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700">Đơn giá <span className="text-xs text-gray-400 font-normal">(VND)</span></label>
                            <input
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                                name="unitPrice"
                                placeholder="VD: 5000"
                                value={formData.unitPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700">Đơn vị</label>
                            <input 
                                value={formData.unit} 
                                onChange={handleChange}
                                placeholder="VD: kWh"
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-gray-700">Mô tả</label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            name="description"
                            placeholder="Nhập mô tả"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-10 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-auto bg-gray-300 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-auto bg-linear-to-r from-yellow-500 to-orange-500 text-black font-bold transition-colors"
                        >
                            Sửa
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const TestEditFeeModal = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleSubmit = (data) => {
        alert(`Submitted: ${JSON.stringify(data)}`);
    };

    return (
        <div className="h-screen flex
                        items-start justify-center">
            <Button
                className="bg-linear-to-r from-yellow-500 to-orange-500"
                onClick={() => setModalOpen(true)}
            >
                Sửa khoản thu
            </Button>
            <EditFeeModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default TestEditFeeModal;