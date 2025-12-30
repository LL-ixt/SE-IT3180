import React, { useState, useEffect } from 'react';
import { Plus, Eye, FileSpreadsheet, CheckCircle, ArrowRight, DollarSign, Calendar, CalendarIcon, ListCheck, Trash2, Factory } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddFeeModal from './AddFeeModal';
import paymentSessionApi from '../../api/paymentSessionApi';
import feeApi from '../../api/feeApi';
import householdApi from '../../api/householdApi';
import TransactionList from '../PaymentSessions/TransactionList';
import PaymentGrid from './PaymentGrid';
// const existingFeeTypes = [
//     { id: 1, name: 'Phí quản lý chung cư', price: 7000 },
//     { id: 2, name: 'Phí vệ sinh', price: 30000 },
//     { id: 3, name: 'Phí gửi xe máy', price: 80000 },
// ];

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

    //Danh sách khoản phí
    const [allFees, setAllFees] = useState([]);
    const [householdDetails, setHouseholdDetails] = useState([]);

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

    const fetchPaymentDetails = async () => {
        if (!currentSession?._id) return;
        try {
            // Luôn lấy dữ liệu từ bảng chi tiết (có mảng items)
            const res = await paymentSessionApi.getPaymentDetails(currentSession._id);
            const details = Array.isArray(res.data) ? res.data : [];
            
            setHouseholdDetails(details); // Cập nhật state chung

            // Xử lý dữ liệu input nếu đang ở view nhập liệu
            if (view === 'INPUT_MONEY' && selectedFeeForInput) {
                const initialData = {};
                const targetFeeId = selectedFeeForInput._id.toString();
                details.forEach(d => {
                    const item = d.items?.find(i => i.feeInSessionId.toString() === targetFeeId);
                    if (item) initialData[d.household._id] = item.quantity;
                });
                setInputData(initialData);
            }
        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu:", error);
        }
    };

    // useEffect duy nhất quản lý việc tải dữ liệu chi tiết
    useEffect(() => {
        fetchSessions();
        if (currentSession?._id && ['DETAIL', 'INPUT_MONEY', 'APPROVE_TRANSACTION'].includes(view)) {
            fetchPaymentDetails();
        }
    }, [currentSession?._id, view, selectedFeeForInput]);

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

    const handleDeleteSession = async (id) => {
        if (window.confirm('Xác nhận xóa đợt thu?')) {
                try {
                    await paymentSessionApi.remove(id);
                    fetchSessions();
                } catch (error) {
                    alert('Lỗi khi xóa');
                }
        }
    }

    const handleDeleteFee = async (feeIdInSession) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoản phí này khỏi đợt thu?')) {
            try {
                // feeIdInSession chính là cái _id nằm ngang hàng với fee object trong mảng fees
                // Endpoint: /api/payments/sessions/:session_id/:fee_id
                await paymentSessionApi.removeFee(currentSession._id, feeIdInSession);
                
                // Cập nhật lại state tại chỗ để giao diện biến mất khoản phí đó ngay
                const updatedFees = currentSession.fees.filter(f => f._id !== feeIdInSession);
                const updatedSession = { ...currentSession, fees: updatedFees };
                
                setCurrentSession(updatedSession);
                setSessions(sessions.map(s => s._id === currentSession._id ? updatedSession : s));
                
                alert('Đã xóa khoản phí thành công');
            } catch (error) {
                console.error('Lỗi khi xóa khoản phí:', error);
                alert('Không thể xóa khoản phí');
            }
        }
    };

    const handleToggleCell = async (row, item) => {
        try {
            const payload = item === 'ALL_MANDATORY' 
                ? { mode: 'ALL_MANDATORY' } 
                : { feeInSessionId: item.feeInSessionId, mode: 'SINGLE' };

            // Gọi API cập nhật trạng thái
            await paymentSessionApi.toggleFeePayment(row._id, payload);
            
            // Load lại dữ liệu để bảng đổi sang màu xanh (isPaid: true)
            await fetchPaymentDetails();
            
            // Tùy chọn: Refresh danh sách giao dịch bên cột phải nếu cần
            // fetchTransactions(); 
        } catch (error) {
            console.error("Lỗi cập nhật thanh toán:", error);
            alert("Không thể cập nhật trạng thái");
        }
    };

    const handleVoluntaryChange = async (row, item, value) => {
        const amount = Number(value);
        if (isNaN(amount) || amount < 0) return;

        try {
            // Chuẩn bị payload tương tự như lúc nhập số liệu cột
            const updates = [{
                householdId: row.household._id,
                quantity: amount
            }];

            await paymentSessionApi.updateColumnQuantity(currentSession._id, item.feeInSessionId, updates);
            
            // Sau khi lưu xong, fetch lại để Grid hiện màu xanh
            await fetchPaymentDetails();
            
        } catch (error) {
            console.error("Lỗi cập nhật phí tự nguyện:", error);
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
                fees: [...(currentSession.fees || []), { fee: fee._id || fee.id, unitPrice: fee.unitPrice }],
            };
            
            // 1. Cập nhật Session (Backend sẽ tự gọi syncHouseholdPayments trong editPaymentSession)
            const response = await paymentSessionApi.update(currentSession._id || currentSession.id, updatedSession);
            
            setCurrentSession(response.data);
            setSessions(sessions.map(s => (s._id || s.id) === (currentSession._id || currentSession.id) ? response.data : s));

            // 2. QUAN TRỌNG: Fetch lại chi tiết bảng thu để PaymentGrid cập nhật "cột" mới
            await fetchPaymentDetails(); 

            setIsAddFeeModalOpen(false);
            setAddFeeStep('CHOICE');
        } catch (error) {
            console.error('Lỗi thêm khoản thu:', error);
            alert('Thêm khoản thu thất bại');
        }
    };

    const handleSaveMoney = async () => {
        try {
            const sessionId = currentSession._id;
            const feeInSessionId = selectedFeeForInput._id; // Đây chính là định danh của "cột"
            
            // Chuẩn bị payload: Danh sách { householdId, quantity }
            const updates = Object.keys(inputData).map(hhId => ({
                householdId: hhId,
                quantity: Number(inputData[hhId] || 0)
            }));

            await paymentSessionApi.updateColumnQuantity(sessionId, feeInSessionId, updates);
            
            alert(`Đã cập nhật số liệu cho cột "${selectedFeeForInput.fee?.name}" thành công!`);
            setInputData({}); 
            setSelectedFeeForInput(null); 
            setView('DETAIL');
            
            // Nếu bạn muốn dữ liệu ở trang Detail cũng mới luôn mà ko cần F5:
            fetchSessions();
        } catch (error) {
            console.error("Lỗi lưu số liệu cột:", error);
            alert("Lưu thất bại");
        }
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
                headers={[
                    { label: 'Tên đợt thu', className: 'text-left'  }, 
                    { label: 'Trạng thái', className: 'text-left'  }, 
                    { label: 'Ngày bắt đầu', className: 'text-left'  }, 
                    { label: 'Hành động', className: 'text-right' }]
                }
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
                        <td className="py-4 px-6">
                            <div className='flex justify-end'>
                                <button onClick={() => { setCurrentSession(s); setView('DETAIL'); }} className="text-blue-400 hover:text-blue-600">
                                    <Eye size={18} className="mr-1" />
                                </button>
                                <button onClick={() => { handleDeleteSession(s._id) }} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={18} className="mr-1" />
                                </button>
                            </div>
                            
                        </td>
                    </tr>
                )}
                footerText={<>Tổng cộng: <span className="font-bold">{sessions.length}</span> đợt thu phí</>}
            />
        </div>
    );

    const renderSessionDetail = () => {
        // Phân loại các khoản thu dựa trên schema 'type' bạn đã định nghĩa
        const mandatoryAutoFees = (currentSession.fees || []).filter(f => f.fee?.type === 'mandatory_automatic');
        const mandatoryManualFees = (currentSession.fees || []).filter(f => f.fee?.type === 'mandatory_manual');
        const voluntaryFees = (currentSession.fees || []).filter(f => f.fee?.type === 'voluntary');

        const handleUpdateAutoFees = async () => {
            try {
                // Gọi API để backend tính toán phí dựa trên diện tích/số xe của hộ dân
                await paymentSessionApi.calculateAutoFees(currentSession._id || currentSession.id);
                alert("Đã cập nhật tính toán phí tự động cho toàn bộ căn hộ!");
                fetchSessions(); // Refresh lại dữ liệu
            } catch (error) {
                console.error("Lỗi cập nhật phí tự động:", error);
            }
        };

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                {/* Header giữ nguyên như cũ */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-5">
                    <div>
                        <button onClick={() => setView('LIST')} className="text-gray-400 text-sm hover:text-blue-600 mb-2 transition-colors flex items-center">
                            ← Quay lại danh sách
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{currentSession.title}</h2>
                        <p className="text-gray-500 text-sm mt-1 italic">{currentSession.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => { setView('APPROVE_TRANSACTION'); setSelectedFeeForInput(null);}} className="bg-pink-500 shadow-lg">
                            <DollarSign size={18} className="mr-2" /> Duyệt giao dịch
                        </Button>
                        <Button onClick={() => alert('Đang xuất...')} className="bg-emerald-500 shadow-lg shadow-emerald-200">
                            <FileSpreadsheet size={18} className="mr-2" /> Xuất Excel
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ListCheck className="text-blue-600" /> Danh sách các khoản thu
                    </h3>
                    <Button onClick={() => setIsAddFeeModalOpen(true)} className="bg-linear-to-r from-blue-600 to-cyan-500 py-2">
                        <Plus className="mr-1" size={18}/> Thêm khoản thu
                    </Button>
                </div>

                {/* --- NHÓM 1: BẮT BUỘC - TỰ ĐỘNG --- */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center">
                        <span className="font-bold text-blue-700 text-sm uppercase">1. Bắt buộc - Tự động (Hệ thống tính)</span>
                        <button 
                            onClick={handleUpdateAutoFees}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-200"
                        >
                            <CheckCircle size={14} /> Cập nhật phí
                        </button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mandatoryAutoFees.map((f, idx) => (
                            <div key={idx} className="p-3 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-gray-50 transition-colors">
                                <span className="font-bold text-gray-700">{f.fee?.name}</span>
                                <span className="text-blue-600 font-bold text-xs">{Number(f.unitPrice).toLocaleString()} đ/{f.fee?.unit}</span>
                                <button 
                                    onClick={() => handleDeleteFee(f._id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Xóa khoản phí này"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {mandatoryAutoFees.length === 0 && <p className="col-span-full text-center text-gray-400 text-xs italic py-2">Chưa có khoản thu nào</p>}
                    </div>
                </div>

                {/* --- NHÓM 2: BẮT BUỘC - THỦ CÔNG --- */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                        <span className="font-bold text-orange-700 text-sm uppercase">2. Bắt buộc - Thủ công (Điện, nước...)</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mandatoryManualFees.map((f, idx) => (
                            <div key={idx} className="p-3 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-700">{f.fee?.name}</span>
                                    <span className="text-orange-600 font-bold text-xs">{Number(f.unitPrice).toLocaleString()} đ/{f.fee?.unit}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => { setSelectedFeeForInput(f); setView('INPUT_MONEY'); }}
                                        className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all"
                                        title="Nhập số liệu"
                                    >
                                        <DollarSign size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteFee(f._id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Xóa khoản phí này"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {mandatoryManualFees.length === 0 && <p className="col-span-full text-center text-gray-400 text-xs italic py-2">Chưa có khoản thu nào</p>}
                    </div>
                </div>

                {/* --- NHÓM 3: TỰ NGUYỆN --- */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
                        <span className="font-bold text-emerald-700 text-sm uppercase">3. Tự nguyện</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {voluntaryFees.map((f, idx) => (
                            <div key={idx} className="p-3 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-gray-50 transition-colors">
                                <span className="font-bold text-gray-700">{f.fee?.name}</span>
                                <span className="text-emerald-600 font-mono font-bold text-xs">{Number(f.unitPrice).toLocaleString()} đ</span>
                                <button 
                                    onClick={() => handleDeleteFee(f._id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Xóa khoản phí này"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {voluntaryFees.length === 0 && <p className="col-span-full text-center text-gray-400 text-xs italic py-2">Chưa có khoản thu nào</p>}
                    </div>
                </div>
            </div>
        );
    };

    const referenceRecord = householdDetails.find(d => d.items && d.items.length > 0);

    const typeOrder = {
        'mandatory_automatic': 1,
        'mandatory_manual': 2,
        'voluntary': 3
    };

    // 2. Tạo headers từ bản ghi mẫu đó
    const feeHeaders = referenceRecord 
        ? [...referenceRecord.items] // Tạo bản sao để tránh đột biến mảng gốc
            .sort((a, b) => {
                // Sắp xếp theo trọng số của feeType
                return (typeOrder[a.feeType] || 99) - (typeOrder[b.feeType] || 99);
            })
            .map(i => ({ 
                feeInSessionId: i.feeInSessionId, 
                feeName: i.feeName, 
                feeType: i.feeType, // Cần truyền thêm type sang Grid
                unitPrice: i.unitPrice 
            })) 
        : [];

    const renderInputMoney = () => (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Nhập số liệu cột: <span className="text-orange-600">{selectedFeeForInput?.fee?.name}</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 px-4 py-2 rounded-xl border border-orange-200">
                            <span className="text-xs text-orange-600 font-bold uppercase">Đơn giá: </span>
                            <span className="text-sm font-black text-orange-700">
                                {selectedFeeForInput?.unitPrice ? `${selectedFeeForInput.unitPrice.toLocaleString()} đ/${selectedFeeForInput.fee?.unit}` : 'Không có'}
                            </span>
                        </div>
                        <button onClick={() => setView('DETAIL')} className="text-3xl font-light">×</button>
                    </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    <Table 
                        headers={[
                            {label: 'Căn hộ'}, 
                            {label: selectedFeeForInput?.unitPrice ? `Số lượng (${selectedFeeForInput.fee?.unit})` : 'Số tiền nộp'}, 
                            {label: 'Thành tiền (Dự kiến)', className: 'text-right'}
                        ]}
                        data={householdDetails} 
                        renderRow={(item) => {
                            // Logic tính toán tức thì tại Frontend
                            const qty = Number(inputData[item.household?._id] || 0);
                            const price = selectedFeeForInput?.unitPrice || 1; // Nếu unitPrice null thì nhân 1 (giữ nguyên qty)
                            const rowTotal = qty * (selectedFeeForInput?.unitPrice ? price : 1);

                            return (
                                <tr key={item._id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="py-4 px-6 font-bold text-blue-600">{item.household?.apartmentNumber}</td>
                                    <td className="py-4 px-6">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={inputData[item.household?._id] || ''}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-right font-bold text-orange-600"
                                            onChange={(e) => setInputData({ ...inputData, [item.household?._id]: e.target.value })}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-right font-black text-gray-900">
                                        {rowTotal.toLocaleString('vi-VN')} đ
                                    </td>
                                </tr>
                            );
                        }}
                    />
                </div>

                {/* Footer hiển thị tổng cộng toàn bảng */}
                <div className="p-6 border-t bg-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500 font-medium">
                        Số căn hộ đã nhập: <span className="text-gray-900 font-bold">{Object.keys(inputData).filter(k => inputData[k] > 0).length} / {householdDetails.length}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Tổng cộng dự kiến</p>
                            <p className="text-2xl font-black text-orange-600">
                                {Object.keys(inputData).reduce((sum, hhId) => {
                                    const q = Number(inputData[hhId] || 0);
                                    const p = selectedFeeForInput?.unitPrice || 1;
                                    return sum + (q * p);
                                }, 0).toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => setView('DETAIL')} className="bg-gray-400">Hủy</Button>
                            <Button onClick={handleSaveMoney} className="bg-linear-to-r from-orange-500 to-red-500 font-bold shadow-lg shadow-orange-200">Lưu số liệu cột</Button>
                        </div>
                    </div>
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
            {!loading && view === 'APPROVE_TRANSACTION' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <button 
                            onClick={() => setView('DETAIL')} 
                            className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1"
                        >
                            ← Quay lại chi tiết
                        </button>
                    </div>
                    <div className="flex h-[calc(100vh-100px)] gap-4 animate-in fade-in duration-300">
                        {/* CỘT TRÁI: BẢNG PAYMENT GRID (Chiếm 75%) */}
                        <div className="w-3/4 h-full">
                            <PaymentGrid 
                                details={householdDetails}
                                feeHeaders={feeHeaders}
                                
                                // Xử lý khi click vào ô thường (Bật/Tắt màu xanh)
                                onCellClick={handleToggleCell}

                                // Xử lý khi nhập tiền tự nguyện
                                onVoluntaryChange={handleVoluntaryChange}
                            />
                        </div>

                        {/* CỘT PHẢI: TRANSACTION LIST (Chiếm 25%) */}
                        <TransactionList session={currentSession} />
                    </div>
                </div>
            )}

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
                    <h3 className="text-xl font-bold text-gray-800 mb-8 text-center uppercase tracking-tight">Thêm khoản thu</h3>
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
                            <div className="max-h-80 overflow-y-auto space-y-3 custom-scrollbar">
                                {allFees.map(f => (
                                    <div key={f._id} className="p-4 border border-gray-200 rounded-xl bg-white flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-800">{f.name}</span>
                                            <span className="text-xs text-gray-400 italic">Gốc: {f.unitPrice?.toLocaleString()}đ/{f.unit}</span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input 
                                                    type="number"
                                                    defaultValue={f.unitPrice}
                                                    id={`price-${f._id}`} // ID để lấy giá trị ghi đè
                                                    className="w-full text-right pr-8 pl-2 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-600"
                                                    placeholder="Nhập giá mới..."
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">VND</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    // Lấy giá trị từ input ngay phía trên
                                                    const overridePrice = document.getElementById(`price-${f._id}`).value;
                                                    handleAddFeeToSession({ ...f, unitPrice: Number(overridePrice) });
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Thêm
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {allFees.length === 0 && <p className="text-center text-gray-400 py-4 italic text-sm">Danh mục phí đang trống</p>}
                            </div>
                        </div>
                    )}
                    <div className='pt-5 flex justify-center'>
                        <Button onClick={() => setIsAddFeeModalOpen(false)} className="bg-gray-400">Quay lại</Button>
                    </div>
                    
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