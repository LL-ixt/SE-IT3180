import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Check, User, Clock, X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import transactionApi from '../../api/transactionApi';
import AddTransactionModal from './AddTransactionModal';

const TransactionList = ({ session }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        if (session) {
            fetchTransactions();
        }
    }, [session]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const sessionId = session._id || session.id;
            if (!sessionId) return;
            
            // Gọi API lấy danh sách giao dịch theo đợt thu
            const response = await transactionApi.getTransactionsBySession(sessionId);
            setTransactions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Lỗi tải giao dịch:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'checked' ? 'unchecked' : 'checked';
            await transactionApi.update(id, { status: newStatus });
            
            // Cập nhật state local (Optimistic update)
            setTransactions(transactions.map(t => 
                t._id === id ? { ...t, status: newStatus } : t
            ));
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            alert("Không thể cập nhật trạng thái");
        }
    };

    const renderTransactionCard = (t) => (
        <div key={t._id} className="bg-white border border-gray-100 rounded-xl shadow-sm mb-3 overflow-hidden hover:shadow-md transition-all">
            <div className="flex">
                {/* Thanh trạng thái màu sắc */}
                <div className={`w-14 flex items-center justify-center shrink-0 transition-colors duration-300 ${t.status === 'checked' ? 'bg-green-500' : 'bg-gray-400'}`}>
                    <span className="text-white font-black text-sm">
                        {t.household?.apartmentNumber}
                    </span>
                </div>

                <div className="p-2 flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-lg font-black text-gray-800">
                                {t.amount.toLocaleString('vi-VN')} VND
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                                {t.invoice?.fee?.name || 'Khoản thu khác'}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5 font-medium">
                                {t.note}
                            </p>
                        </div>
                        
                        <div className="flex gap-1">
                            <button 
                                onClick={() => handleToggleStatus(t._id, t.status)}
                                className={`p-2 rounded-lg transition-colors ${t.status === 'unchecked' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400'}`}
                                title={t.status === 'unchecked' ? "Duyệt giao dịch" : "Hủy duyệt"}
                            >
                                {t.status === 'unchecked' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                            </button>
                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                            <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-[11px] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1 text-blue-600">
                            <User size={12} /> {t.payerName}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <Clock size={12} /> {new Date(t.date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                            {t.method}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const filteredTransactions = transactions.filter(t => 
        t.household?.apartmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 h-full flex flex-col max-w-xl ml-auto">
            <div className="flex justify-between items-center ">
                <h2 className="text-2xl font-bold text-gray-800">Danh sách giao dịch</h2>
                <Button onClick={() => setAddModalOpen(true)} className="bg-linear-to-r from-blue-500 to-cyan-500">
                    Thêm giao dịch
                </Button>
            </div>

            <div className="">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Tìm kiếm giao dịch theo căn hộ" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                {loading && <p className="text-center text-gray-500">Đang tải...</p>}
                
                {/* Nhóm Chưa duyệt */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Chưa duyệt</h3>
                    </div>
                    {filteredTransactions.filter(t => t.status === 'unchecked').map(renderTransactionCard)}
                    {filteredTransactions.filter(t => t.status === 'unchecked').length === 0 && <p className="text-xs text-gray-400 italic px-2">Không có giao dịch</p>}
                </section>

                {/* Nhóm Đã duyệt */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase">Đã duyệt</h3>
                    </div>
                    {filteredTransactions.filter(t => t.status === 'checked').map(renderTransactionCard)}
                </section>
            </div>

            <AddTransactionModal 
                isOpen={isAddModalOpen} 
                onClose={() => setAddModalOpen(false)}
                session={session}
                onSuccess={fetchTransactions}
            />
        </div>
    );
};

export default TransactionList;