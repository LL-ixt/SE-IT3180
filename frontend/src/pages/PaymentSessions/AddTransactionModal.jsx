import React, { useState, useEffect } from 'react';
import { Search, User, FileText, CheckCircle, DollarSign, CreditCard, ArrowRight } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import householdApi from '../../api/householdApi';
import paymentSessionApi from '../../api/paymentSessionApi';
import transactionApi from '../../api/transactionApi';

const AddTransactionModal = ({ isOpen, onClose, session, onSuccess }) => {
    const [households, setHouseholds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    
    const [invoices, setInvoices] = useState([]);
    const [voluntaryOptions, setVoluntaryOptions] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        payerName: '',
        method: 'cash',
        note: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadHouseholds();
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setSelectedHousehold(null);
        setSelectedInvoice(null);
        setInvoices([]);
        setVoluntaryOptions([]);
        setFormData({ amount: '', payerName: '', method: 'cash', note: '' });
        setSearchTerm('');
    };

    const loadHouseholds = async () => {
        try {
            const res = await householdApi.getAll();
            setHouseholds(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi tải danh sách hộ:", error);
        }
    };

    const handleSelectHousehold = async (hh) => {
        setSelectedHousehold(hh);
        setFormData(prev => ({ ...prev, payerName: hh.owner || '' }));
        
        if (session?._id || session?.id) {
            try {
                setLoadingInvoices(true);
                const sessionId = session._id || session.id;
                // Gọi API lấy hóa đơn (Cần đảm bảo backend đã có endpoint này)
                const res = await paymentSessionApi.getInvoices(sessionId, { householdId: hh._id });
                setInvoices(res.data || []);

                // Calculate voluntary fees that don't have invoices yet
                if (session && session.fees) {
                    const existingFeeIds = (res.data || []).map(inv => inv.fee?._id || inv.fee);
                    const available = session.fees.filter(f => {
                        const feeObj = f.fee;
                        // Only show if it's voluntary AND not already in the invoice list
                        return feeObj && feeObj.type === 'voluntary' && !existingFeeIds.includes(feeObj._id);
                    });
                    setVoluntaryOptions(available);
                }

            } catch (error) {
                console.error("Lỗi tải hóa đơn:", error);
            } finally {
                setLoadingInvoices(false);
            }
        }
    };

    const handleSelectInvoice = (inv) => {
        setSelectedInvoice(inv);
        // If it's a "virtual" invoice (voluntary option), amount is 0/undefined, so default to empty
        const isVirtual = !inv._id; 
        const remaining = isVirtual ? '' : (inv.amount - (inv.paidAmount || 0));
        
        setFormData(prev => ({ ...prev, amount: remaining > 0 ? remaining : 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHousehold || !selectedInvoice || !formData.amount) return;

        try {
            const payload = {
                household: selectedHousehold._id,
                amount: Number(formData.amount),
                payerName: formData.payerName,
                method: formData.method,
                note: formData.note
            };

            if (selectedInvoice._id) {
                payload.invoice = selectedInvoice._id;
            } else {
                // It's a voluntary fee option
                payload.fee = selectedInvoice.fee._id;
                payload.paymentSession = session._id || session.id;
            }

            await transactionApi.create(payload);
            onSuccess();
            onClose();
        } catch (error) {
            alert('Lỗi tạo giao dịch: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredHouseholds = households.filter(h => 
        h.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.owner && h.owner.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 w-full max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Tạo giao dịch mới</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                    {/* Cột trái: Chọn hộ dân */}
                    <div className="flex flex-col border-r pr-6">
                        <label className="text-sm font-bold text-gray-700 mb-2">1. Chọn căn hộ</label>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Tìm số phòng..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {filteredHouseholds.map(h => (
                                <div 
                                    key={h._id}
                                    onClick={() => handleSelectHousehold(h)}
                                    className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedHousehold?._id === h._id ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800">{h.apartmentNumber}</span>
                                        {selectedHousehold?._id === h._id && <CheckCircle size={16} className="text-blue-600" />}
                                    </div>
                                    <p className="text-xs text-gray-500">{h.owner}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột phải: Chọn hóa đơn & Nhập tiền */}
                    <div className="flex flex-col">
                        <label className="text-sm font-bold text-gray-700 mb-2">2. Chọn khoản thu & Thanh toán</label>
                        
                        {!selectedHousehold ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed rounded-xl">
                                Vui lòng chọn căn hộ trước
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto mb-4 space-y-2 custom-scrollbar max-h-40">
                                    {loadingInvoices ? <p className="text-xs text-center">Đang tải...</p> : (
                                        <>
                                            {/* Existing Invoices */}
                                            {invoices.map(inv => (
                                        <div 
                                            key={inv._id}
                                            onClick={() => handleSelectInvoice(inv)}
                                            className={`p-2 rounded-lg border cursor-pointer text-sm ${selectedInvoice?._id === inv._id ? 'bg-green-50 border-green-500' : 'border-gray-100'}`}
                                        >
                                            <div className="flex justify-between font-bold">
                                                <span>{inv.fee?.name}</span>
                                                <span className={inv.status === 'paid' ? 'text-green-600' : 'text-red-600'}>
                                                    {(inv.amount - (inv.paidAmount || 0)).toLocaleString()} đ
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                            {/* Voluntary Options */}
                                            {voluntaryOptions.map((opt, idx) => (
                                                <div 
                                                    key={`vol-${idx}`}
                                                    onClick={() => handleSelectInvoice(opt)}
                                                    className={`p-2 rounded-lg border cursor-pointer text-sm border-dashed ${selectedInvoice === opt ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-gray-600">{opt.fee?.name}</span>
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Tự nguyện</span>
                                                    </div>
                                                </div>
                                            ))}

                                            {invoices.length === 0 && voluntaryOptions.length === 0 && <p className="text-xs text-center text-gray-400">Không có khoản thu nào</p>}
                                        </>
                                    )}
                                </div>

                                {selectedInvoice && (
                                    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Số tiền nộp</label>
                                            <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 rounded border text-sm font-bold text-blue-600" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Người nộp</label>
                                            <input type="text" value={formData.payerName} onChange={e => setFormData({...formData, payerName: e.target.value})} className="w-full p-2 rounded border text-sm" />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-xs">Hủy</Button>
                                            <Button type="submit" className="flex-1 bg-blue-600 text-xs">Xác nhận</Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddTransactionModal;