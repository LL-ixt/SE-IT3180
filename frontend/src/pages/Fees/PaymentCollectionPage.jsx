import React, { useState } from 'react';
import { Plus, Eye, FileSpreadsheet, CheckCircle, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { Button } from '../../components/common/Button';


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
    const [sessions, setSessions] = useState([{ id: 1, name: 'Thu phí Tháng 12/2025', status: 'Đang thu', fees: [], totalCollected: 0 }]);
    const [view, setView] = useState('LIST');
    const [currentSession, setCurrentSession] = useState(null);
    const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
    const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
    const [addFeeStep, setAddFeeStep] = useState('CHOICE');
    const [selectedFeeForInput, setSelectedFeeForInput] = useState(null);
    const [inputData, setInputData] = useState({});
    const [newFeeForm, setNewFeeForm] = useState({ name: '', price: '' });

    const handleCreateSession = (name) => {
        const newSession = { id: Date.now(), name, status: 'Mới tạo', fees: [], totalCollected: 0 };
        setSessions([newSession, ...sessions]);
        setCurrentSession(newSession);
        setIsCreateSessionOpen(false);
        setView('DETAIL');
    };

    const handleAddFeeToSession = (fee) => {
        const updatedSession = { ...currentSession, fees: [...currentSession.fees, fee] };
        setCurrentSession(updatedSession);
        setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
        setIsAddFeeModalOpen(false);
        setAddFeeStep('CHOICE');
    };

    const handleSaveMoney = () => {
        let total = 0;
        Object.values(inputData).forEach(val => total += Number(val));
        const updatedSession = { ...currentSession, totalCollected: currentSession.totalCollected + total };
        setCurrentSession(updatedSession);
        setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
        alert(`Đã lưu! Tổng tiền tăng thêm: ${total.toLocaleString()} đ`);
        setView('DETAIL');
        setInputData({});
        setSelectedFeeForInput(null);
    };

    const renderSessionList = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Đợt thu</h2>
                <Button
                    onClick={() => setIsCreateSessionOpen(true)}
                    className="bg-green-600"
                >
                    <Plus className="w-5 h-5 mr-1" /> Tạo đợt mới
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center gap-3">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-gray-600 text-sm">Đợt thu đang hoạt động</p>
                    <p className="text-gray-900 font-bold">{sessions.length} đợt</p>
                </div>
            </div>

            <Table
                headers={[{ label: 'Tên đợt thu' }, { label: 'Trạng thái' }, { label: 'Tổng thu' }, { label: 'Hành động' }]}
                data={sessions}
                renderRow={(s, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <td className="p-4 font-bold text-blue-600">{s.name}</td>
                        <td className="p-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{s.status}</span></td>
                        <td className="p-4 font-mono font-bold text-gray-700">{s.totalCollected.toLocaleString()} đ</td>
                        <td className="p-4">
                            <button onClick={() => { setCurrentSession(s); setView('DETAIL'); }} className="flex items-center text-blue-500 hover:text-blue-700 font-medium">
                                <Eye size={18} className="mr-1" /> Chi tiết
                            </button>
                        </td>
                    </tr>
                )}
            />
        </div>
    );

    const renderSessionDetail = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <button onClick={() => setView('LIST')} className="text-gray-500 text-sm hover:text-blue-600 mb-1 font-medium">← Quay lại danh sách</button>
                    <h2 className="text-2xl font-bold text-gray-900">{currentSession.name}</h2>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => alert('Xuất Excel')} className="bg-emerald-600">
                        <FileSpreadsheet size={18} className="mr-2" /> Xuất Excel
                    </Button>
                    <Button onClick={() => { setView('INPUT_MONEY'); setSelectedFeeForInput(null); }} className="bg-orange-500">
                        <DollarSign size={18} className="mr-2" /> Nhập tiền
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Các khoản thu trong đợt:</h3>
                {/* Button này ko dùng module Button vì nó nằm trên nền trắng, cần border */}
                <button
                    onClick={() => setIsAddFeeModalOpen(true)}
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                    + Thêm khoản thu
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSession.fees.map((fee, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <p className="font-bold text-gray-800 text-lg">{fee.name}</p>
                            <p className="text-gray-500 text-sm">Đơn giá: <span className="font-mono text-blue-600">{Number(fee.price).toLocaleString()} đ</span></p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                ))}
                {currentSession.fees.length === 0 && (
                    <div className="col-span-3 py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <p className="text-gray-500 mb-2">Chưa có khoản thu nào trong đợt này.</p>
                        <button onClick={() => setIsAddFeeModalOpen(true)} className="text-blue-600 font-bold hover:underline">Thêm ngay</button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderInputMoney = () => (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-100 p-4 border-b flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">Nhập số tiền thu</h2>
                    <button onClick={() => setView('DETAIL')} className="text-gray-500 hover:text-red-600 font-bold px-3 py-1 hover:bg-red-50 rounded">Đóng</button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">1. Chọn khoản thu cần nhập:</label>
                        <div className="flex gap-3 flex-wrap">
                            {currentSession.fees.map(fee => (
                                <button
                                    key={fee.id}
                                    onClick={() => setSelectedFeeForInput(fee)}
                                    className={`px-5 py-3 rounded-xl border font-medium transition-all ${selectedFeeForInput?.id === fee.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                >
                                    {fee.name}
                                </button>
                            ))}
                        </div>
                        {currentSession.fees.length === 0 && <p className="text-red-500 text-sm mt-2 italic">Chưa có khoản thu nào!</p>}
                    </div>

                    {selectedFeeForInput && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                2. Nhập tiền cho: <span className="text-blue-600 text-lg ml-1">{selectedFeeForInput.name}</span>
                            </label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                        <tr><th className="p-4">Căn hộ</th><th className="p-4">Chủ hộ</th><th className="p-4">Số tiền thu (VND)</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {apartments.map(apt => (
                                            <tr key={apt.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="p-4 font-bold text-blue-600">{apt.id}</td>
                                                <td className="p-4 text-gray-700 font-medium">{apt.owner}</td>
                                                <td className="p-4">
                                                    <div className="relative max-w-xs">
                                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            placeholder={selectedFeeForInput.price}
                                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                            onChange={(e) => setInputData({ ...inputData, [apt.id]: e.target.value })}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <Button onClick={() => setView('DETAIL')} className="bg-gray-400">Hủy bỏ</Button>
                    <Button onClick={handleSaveMoney} className="bg-blue-600">Lưu & Tính tổng</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {view === 'LIST' && renderSessionList()}
            {view === 'DETAIL' && renderSessionDetail()}
            {view === 'INPUT_MONEY' && renderInputMoney()}

            <Modal isOpen={isCreateSessionOpen} onClose={() => setIsCreateSessionOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Tạo đợt thu mới</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateSession(e.target.name.value); }}>
                        <input name="name" className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:ring-2 focus:ring-green-500 outline-none" placeholder="VD: Thu phí tháng 1/2026" required autoFocus />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCreateSessionOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                            <Button type="submit" className="bg-green-600">Tạo ngay</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal isOpen={isAddFeeModalOpen} onClose={() => { setIsAddFeeModalOpen(false); setAddFeeStep('CHOICE'); }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Thêm khoản thu vào đợt này</h3>
                    <button
                        onClick={() => {
                            setIsAddFeeModalOpen(false);
                            setAddFeeStep('CHOICE');
                        }}
                        className="text-gray-400 hover:text-red-500 font-bold text-xl"
                    >
                        &times;
                    </button>
                    {addFeeStep === 'CHOICE' && (
                        <div className="space-y-4">
                            <button onClick={() => setAddFeeStep('EXISTING')} className="w-full p-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 flex justify-between items-center group transition-all">
                                <span className="font-bold text-gray-700 group-hover:text-blue-700">Chọn khoản thu CÓ SẴN</span>
                                <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600" />
                            </button>
                            <button onClick={() => setAddFeeStep('NEW')} className="w-full p-5 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 flex justify-between items-center group transition-all">
                                <span className="font-bold text-gray-700 group-hover:text-green-700">Tạo khoản thu MỚI</span>
                                <Plus size={20} className="text-gray-400 group-hover:text-green-600" />
                            </button>
                        </div>
                    )}
                    {addFeeStep === 'EXISTING' && (
                        <div className="space-y-3">
                            <p className="font-bold text-gray-700 mb-2">Chọn từ danh sách:</p>
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                {existingFeeTypes.map(f => (
                                    <div key={f.id} onClick={() => handleAddFeeToSession(f)} className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer flex justify-between transition-colors">
                                        <span className="font-medium text-gray-800">{f.name}</span>
                                        <span className="text-gray-500 font-mono">{f.price} đ</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setAddFeeStep('CHOICE')} className="text-sm text-gray-500 hover:text-blue-600 underline mt-4 block text-center w-full">Quay lại bước chọn</button>
                        </div>
                    )}
                    {addFeeStep === 'NEW' && (
                        <div className="space-y-4">
                            <input placeholder="Tên khoản thu (VD: Quỹ ủng hộ)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setNewFeeForm({ ...newFeeForm, name: e.target.value })} />
                            <input type="number" placeholder="Số tiền mặc định (VND)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setNewFeeForm({ ...newFeeForm, price: e.target.value })} />
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setAddFeeStep('CHOICE')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Quay lại</button>
                                <Button onClick={() => handleAddFeeToSession({ id: Date.now(), ...newFeeForm })} className="bg-green-600">Thêm ngay</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default PaymentCollectionPage;