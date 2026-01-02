import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import { useNavigate } from 'react-router-dom';
import residenceChangeApi from '../../api/residenceChangeApi';
import residentsApi from '../../api/residentsApi';
import householdApi from '../../api/householdApi';
import ResidenceChangeModal from './ResidenceChangeModal';

const ResidenceChangePage = () => {
    const navigate = useNavigate();
    const [changes, setChanges] = useState([]);
    const [residents, setResidents] = useState([]);
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('temporary_residence');
    const [editingChange, setEditingChange] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resChanges, resResidents, resHouseholds] = await Promise.all([
                residenceChangeApi.getAll(),
                residentsApi.getAll(),
                householdApi.getAll()
            ]);
            setChanges(resChanges.data);
            setResidents(resResidents.data);
            setHouseholds(resHouseholds.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (data) => {
        try {
            if (editingChange) {
                await residenceChangeApi.update(editingChange._id, data);
            } else {
                await residenceChangeApi.create(data);
            }
            await fetchData();
            setIsModalOpen(false);
            setEditingChange(null);
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu");
        }
    };

    const headers = [
        { label: 'Họ tên', className: 'text-left' },
        { label: 'CMND/CCCD', className: 'text-left' },
        ...(activeTab === 'temporary_absence' ? [{ label: 'Căn hộ', className: 'text-left' }] : []),
        { label: 'Ngày bắt đầu', className: 'text-left' },
        { label: 'Ngày kết thúc', className: 'text-left' },
        { label: activeTab === 'temporary_residence' ? 'Căn hộ tạm trú' : 'Nơi đến', className: 'text-left' },
        { label: 'Ghi chú', className: 'text-left' },
        { label: 'Thao tác', className: 'text-left' }
    ];

    const handleEdit = (item) => {
        setEditingChange(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
            try {
                await residenceChangeApi.remove(id);
                fetchData();
            } catch (error) {
                alert("Xóa thất bại");
            }
        }
    };

    const filteredChanges = changes.filter(item => {
        const matchesTab = item.changeType === activeTab;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            (item.resident?.fullName?.toLowerCase().includes(searchLower) || '') ||
            (item.resident?.idNumber?.toLowerCase().includes(searchLower) || '') ||
            (item.resident?.household?.apartmentNumber?.toLowerCase().includes(searchLower) || '') ||
            (item.household?.apartmentNumber?.toLowerCase().includes(searchLower) || ''); // Tìm cả căn hộ tạm trú (đích)
        
        return matchesTab && matchesSearch;
    });

    const renderRow = (item) => (
        <tr key={item._id} className="hover:bg-gray-50">
            <td className="py-4 px-6 font-bold text-gray-900">{item.resident?.fullName}</td>
            <td className="py-4 px-6 text-gray-500">{item.resident?.idNumber}</td>
            {activeTab === 'temporary_absence' && (
                <td className="py-4 px-6 text-blue-600 font-medium">{item.resident?.household?.apartmentNumber || 'N/A'}</td>
            )}
            <td className="py-4 px-6">{new Date(item.startDate).toLocaleDateString('vi-VN')}</td>
            <td className="py-4 px-6">{item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '-'}</td>
            <td className="py-4 px-6">
                {item.changeType === 'temporary_residence' 
                    ? (item.household?.apartmentNumber || 'N/A')
                    : (item.destination || 'N/A')
                }
            </td>
            <td className="py-4 px-6 text-gray-500 italic">{item.note}</td>
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Danh sách biến đổi nhân khẩu</h2>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/nhan-khau')} className="bg-white border border-gray-200 shadow-sm hover:bg-linear-to-r from-blue-500 to-cyan-500 min-w-[200px]">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Trở về trang quản lý
                    </Button>
                    <Button onClick={() => { setEditingChange(null); setIsModalOpen(true); }} className="bg-linear-to-r from-blue-500 to-cyan-500  min-w-[220px]">
                        <Plus className="w-5 h-5 mr-1" /> Thêm biến đổi nhân khẩu
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                        <ArrowRightLeft className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng số biến đổi</p>
                        <p className="text-gray-900 font-bold">{filteredChanges.length}</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Tìm theo tên, CCCD, căn hộ..." />
                </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('temporary_residence')}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'temporary_residence' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tạm trú
                    {activeTab === 'temporary_residence' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('temporary_absence')}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'temporary_absence' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tạm vắng
                    {activeTab === 'temporary_absence' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <Table 
                    headers={headers} 
                    data={filteredChanges} 
                    renderRow={renderRow}
                    footerText={<>Tổng số: <span className="font-bold">{filteredChanges.length}</span> bản ghi</>}
                />
            </div>

            <ResidenceChangeModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingChange(null); }}
                residents={residents}
                households={households}
                onSubmit={handleSubmit}
                initialData={editingChange}
            />
        </div>
    );
};

export default ResidenceChangePage;