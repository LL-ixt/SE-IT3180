import React, { useState, useEffect } from 'react';
import { Plus, Eye, FileSpreadsheet, CheckCircle, ArrowRight, DollarSign, Calendar, CalendarIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddFeeModal from './AddFeeModal';
import paymentSessionApi from '../../api/paymentSessionApi';
import feeApi from '../../api/feeApi';
const existingFeeTypes = [
    { id: 1, name: 'Phí quản lý chung cư', price: 7000 },
    { id: 2, name: 'Phí vệ sinh', price: 30000 },
    { id: 3, name: 'Phí gửi xe máy', price: 80000 },
];

const apartments = [
    { id: 'A101', owner: 'Nguyễn Văn A' },
    { id: 'A102', owner: 'Trần Thị B' },
    { id: 'B201', owner: 'Lê Văn C' },
];

const PaymentCollectionPage = () => {
    // State quản lý danh sách đợt thu
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // View state: LIST | DETAIL | INPUT_MONEY
    const [view, setView] = useState('LIST');
    const [currentSession, setCurrentSession] = useState(null);
    
    // Modal states
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
    const [isNewFeeModalOpen, setIsNewFeeModalOpen] = useState(false);
    
    // Logic thêm khoản thu
    const [addFeeStep, setAddFeeStep] = useState('CHOICE');
    const [newFeeForm, setNewFeeForm] = useState({ name: '', price: '' });
    
    // Logic nhập tiền
    const [selectedFeeForInput, setSelectedFeeForInput] = useState(null);
    const [inputData, setInputData] = useState({});

    // State cho Form tạo đợt thu mới (Tránh xung đột)
    const [sessionFormData, setSessionFormData] = useState({
        title: '',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        description: ''
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await paymentSessionApi.getAll();
            setSessions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Lỗi tải danh sách đợt thu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: sessionFormData.title,
                description: sessionFormData.description,
                startDate: sessionFormData.startDate,
                endDate: sessionFormData.endDate,
                fees: [],
                isActive: true
            };
            const response = await paymentSessionApi.create(payload);
            setSessions([response.data, ...sessions]);
            setCurrentSession(response.data);
            setCreateModalOpen(false);
            setView('DETAIL');
            setSessionFormData({ title: '', startDate: new Date(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), description: '' });
        } catch (error) {
            console.error('Lỗi tạo đợt thu:', error);
            alert('Tạo đợt thu thất bại');
        }
    };

    const handleAddNewFeeType = async (data) => {
        try {
            // Create fee first using feeApi
            const feePayload = {
                name: data.name,
                description: data.description,
                type: data.type,
                unit: data.unit,
                unitPrice: data.unitPrice
            };
            const feeResponse = await feeApi.create(feePayload);
            
            // Add fee to session
            const updatedSession = { 
                ...currentSession, 
                fees: [...(currentSession.fees || []), { fee: feeResponse.data._id, unitPrice: data.unitPrice }] 
            };
            const sessionResponse = await paymentSessionApi.update(currentSession._id || currentSession.id, updatedSession);
            setCurrentSession(sessionResponse.data);
            setSessions(sessions.map(s => (s._id || s.id) === (currentSession._id || currentSession.id) ? sessionResponse.data : s));
            
            setIsNewFeeModalOpen(false);
        } catch (error) {
            console.error('Lỗi thêm khoản thu:', error);
            alert('Thêm khoản thu thất bại');
        }
    };
    
    const handleAddFeeToSession = async (fee) => {
        try {
            const updatedSession = { 
                ...currentSession, 
                fees: [...(currentSession.fees || []), { fee: fee._id || fee.id }] 
            };
            const response = await paymentSessionApi.update(currentSession._id || currentSession.id, updatedSession);
            setCurrentSession(response.data);
            setSessions(sessions.map(s => (s._id || s.id) === (currentSession._id || currentSession.id) ? response.data : s));
            setIsAddFeeModalOpen(false);
            setAddFeeStep('CHOICE');
        } catch (error) {
            console.error('Lỗi thêm khoản thu vào đợt:', error);
            alert('Thêm khoản thu thất bại');
        }
    };

    const handleSaveMoney = () => {
        let total = 0;
        Object.values(inputData).forEach(val => total += Number(val));
        const updatedSession = { ...currentSession, totalCollected: currentSession.totalCollected + total };
        setCurrentSession(updatedSession);
        setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
        alert(`Đã lưu! Tổng tiền ghi nhận thêm: ${total.toLocaleString()} đ`);
        setView('DETAIL');
        setInputData({});
    };

    const renderSessionList = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đợt thu</h2>
                </div>
                <Button onClick={() => setCreateModalOpen(true)} className="bg-linear-to-r from-blue-600 to-cyan-500">
                    <Plus className="w-5 h-5 mr-1" /> Tạo đợt thu
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center gap-3">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shadow-purple-100">
                    <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-gray-600 text-sm">Tổng số đợt thu</p>
                    <p className="text-gray-900 font-bold">{sessions.length}</p>
                </div>
            </div>

            <Table
                headers={[{ label: 'Tên đợt thu' }, { label: 'Trạng thái' }, { label: 'Ngày bắt đầu' }, { label: 'Hành động', className: 'text-right' }]}
                data={sessions}
                renderRow={(s) => (
                    <tr key={s._id || s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-bold text-blue-600">{s.title || s.name}</td>
                        <td className="py-4 px-6">
                            <span className={`${s.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'} border px-3 py-1 rounded-full text-xs font-bold`}>
                                {s.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
                            </span>
                        </td>
                        <td className="py-4 px-6">{new Date(s.startDate).toLocaleDateString('vi-VN')}</td>
                        <td className="py-4 px-6 text-right">
                            <button onClick={() => { setCurrentSession(s); setView('DETAIL'); }} className="text-blue-500 hover:text-blue-700 font-bold text-sm transition-colors flex items-center justify-end ml-auto">
                                <Eye size={16} className="mr-1" /> Chi tiết
                            </button>
                        </td>
                    </tr>
                )}
                footerText={<>Tổng cộng: <span className="font-bold">{sessions.length}</span> đợt thu phí</>}
            />
        </div>
    );

    const renderSessionDetail = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-5">
                <div>
                    <button onClick={() => setView('LIST')} className="text-gray-400 text-sm hover:text-blue-600 mb-2 transition-colors flex items-center">
                        ← Quay lại danh sách
                    </button>
                    <h2 className="text-2xl font-black text-gray-900">{currentSession.title || currentSession.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">{currentSession.description}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => alert('Đang xuất...')} className="bg-emerald-500">
                        <FileSpreadsheet size={18} className="mr-2" /> Xuất Excel
                    </Button>
                    <Button onClick={() => { setView('INPUT_MONEY'); setSelectedFeeForInput(null); }} className="bg-orange-500 shadow-lg shadow-orange-100">
                        <DollarSign size={18} className="mr-2" /> Nhập tiền thu
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Danh sách khoản thu:</h3>
                <Button onClick={() => setIsAddFeeModalOpen(true)} className="bg-linear-to-r from-blue-500 to-cyan-500">
                    Thêm khoản thu
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(currentSession.fees || []).map((fee, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-blue-200 transition-all">
                        <div>
                            <p className="font-bold text-gray-800">{fee.name}</p>
                            <p className="text-blue-600 font-mono text-sm font-bold">{Number(fee.price).toLocaleString()} đ</p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderInputMoney = () => (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Ghi nhận số tiền thu</h2>
                    <button onClick={() => setView('DETAIL')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all text-2xl font-light">×</button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">1. Chọn loại phí</label>
                        <div className="flex gap-3 flex-wrap">
                            {currentSession.fees.map(fee => (
                                <button
                                    key={fee.id}
                                    onClick={() => setSelectedFeeForInput(fee)}
                                    className={`px-6 py-3 rounded-2xl border-2 font-bold transition-all ${selectedFeeForInput?.id === fee.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 -translate-y-1'
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                                    }`}
                                >
                                    {fee.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedFeeForInput && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">2. Nhập tiền cư dân đóng: <span className="text-blue-600 ml-2">{selectedFeeForInput.name}</span></label>
                            <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                <Table 
                                    headers={[{label: 'Căn hộ'}, {label: 'Chủ hộ'}, {label: 'Số tiền đóng (VNĐ)'}]}
                                    data={apartments}
                                    renderRow={(apt) => (
                                        <tr key={apt.id}>
                                            <td className="py-4 px-6 font-black text-blue-600">{apt.id}</td>
                                            <td className="py-4 px-6 font-bold text-gray-700">{apt.owner}</td>
                                            <td className="py-4 px-6">
                                                <div className="relative max-w-50">
                                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        placeholder={selectedFeeForInput.price}
                                                        className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                        onChange={(e) => setInputData({ ...inputData, [apt.id]: e.target.value })}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
                    <Button onClick={() => setView('DETAIL')} className="bg-gray-200 text-gray-600 py-3 px-8">Hủy</Button>
                    <Button onClick={handleSaveMoney} className="bg-blue-600 py-3 px-10 shadow-xl shadow-blue-200">Xác nhận Lưu</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {loading && (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            )}
            {!loading && view === 'LIST' && renderSessionList()}
            {!loading && view === 'DETAIL' && renderSessionDetail()}
            {!loading && view === 'INPUT_MONEY' && renderInputMoney()}

            {/* Modal Tạo đợt thu mới */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Tạo đợt thu mới
                    </h3>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đợt thu *</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="VD: Thu phí tháng 12/2025"
                                value={sessionFormData.title}
                                onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                <DatePicker
                                    selected={sessionFormData.startDate}
                                    onChange={(date) => setSessionFormData({ ...sessionFormData, startDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                <DatePicker
                                    selected={sessionFormData.endDate}
                                    onChange={(date) => setSessionFormData({ ...sessionFormData, endDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    minDate={sessionFormData.startDate}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                            <textarea value={sessionFormData.description} onChange={e => setSessionFormData({ ...sessionFormData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                            <Button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 bg-gray-300 font-bold hover:bg-gray-500 transition-all">Hủy</Button>
                            <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all">Tạo đợt thu</Button>
                        </div>
                        
                    </form>
                </div>
            </Modal>

            {/* Modal Thêm khoản thu */}
            <Modal isOpen={isAddFeeModalOpen} onClose={() => { setIsAddFeeModalOpen(false); setAddFeeStep('CHOICE'); }}>
                <div className="p-4">
                    <h3 className="text-xl font-black text-gray-800 mb-8 text-center uppercase tracking-tight">Thêm khoản thu</h3>
                    {addFeeStep === 'CHOICE' && (
                        <div className="space-y-4">
                            <button onClick={() => setAddFeeStep('EXISTING')} className="w-full p-6 border-2 border-gray-100 rounded-[24px] hover:border-blue-500 hover:bg-blue-50 flex justify-between items-center group transition-all">
                                <span className="font-bold text-gray-700 group-hover:text-blue-700">Chọn khoản thu CÓ SẴN</span>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => {setIsAddFeeModalOpen(false); // Đóng modal chọn
                                    setIsNewFeeModalOpen(true);}} className="w-full p-6 border-2 border-gray-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 flex justify-between items-center group transition-all">
                                <span className="font-bold text-gray-700 group-hover:text-emerald-700">Tạo khoản thu MỚI</span>
                                <Plus size={20} className="text-gray-300 group-hover:text-emerald-500" />
                            </button>
                        </div>
                    )}
                    {addFeeStep === 'EXISTING' && (
                        <div className="space-y-4">
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                {existingFeeTypes.map(f => (
                                    <div key={f.id} onClick={() => handleAddFeeToSession(f)} className="p-4 border border-gray-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer flex justify-between items-center transition-all">
                                        <span className="font-bold text-gray-700">{f.name}</span>
                                        <span className="text-blue-600 font-mono font-bold text-sm">{f.price.toLocaleString()} đ</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setAddFeeStep('CHOICE')} className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors w-full text-center py-2">Quay lại</button>
                        </div>
                    )}
                    {/* {addFeeStep === 'NEW' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <input placeholder="Tên khoản thu" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" onChange={e => setNewFeeForm({ ...newFeeForm, name: e.target.value })} />
                            <input type="number" placeholder="Số tiền (VND)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" onChange={e => setNewFeeForm({ ...newFeeForm, price: e.target.value })} />
                            <div className="flex gap-4 pt-4">
                                <Button onClick={() => setAddFeeStep('CHOICE')} className="flex-1 bg-gray-100 text-gray-500">Hủy</Button>
                                <Button onClick={() => handleAddFeeToSession({ id: Date.now(), ...newFeeForm })} className="flex-1 bg-emerald-500">Thêm khoản thu</Button>
                            </div>
                        </div>
                    )} */}
                </div>
            </Modal>
            <AddFeeModal 
                isOpen={isNewFeeModalOpen}
                onClose={() => setIsNewFeeModalOpen(false)}
                onSubmit={handleAddNewFeeType}
            />
        </div>
    );
};

export default PaymentCollectionPage;