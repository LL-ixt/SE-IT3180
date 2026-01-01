import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, ArrowRightLeft } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import { useAuth } from '../../context/AuthContext';
import DatePicker from "react-datepicker";
import residentsApi from '../../api/residentsApi';
import householdApi from '../../api/householdApi';
import ResidenceChangeModal from './ResidenceChangeModal';
import residenceChangeApi from '../../api/residenceChangeApi';

// const initialResidents = [
//     { id: 1, name: 'Nguyễn Văn A', idCard: '001234567890', birthDate: '15/05/1980', gender: 'Nam', phone: '0901234567', apartment: 'A101', relationship: 'Chủ hộ', moveInDate: '01/01/2020' },
//     { id: 2, name: 'Nguyễn Thị B', idCard: '001234567891', birthDate: '20/08/1985', gender: 'Nữ', phone: '0901234568', apartment: 'A101', relationship: 'Vợ/Chồng', moveInDate: '01/01/2020' },
//     { id: 3, name: 'Nguyễn Văn C', idCard: '001234567892', birthDate: '10/03/2010', gender: 'Nam', phone: '', apartment: 'A101', relationship: 'Con', moveInDate: '01/01/2020' },
//     { id: 4, name: 'Trần Thị D', idCard: '001234567893', birthDate: '25/11/1978', gender: 'Nữ', phone: '0901234569', apartment: 'A202', relationship: 'Chủ hộ', moveInDate: '15/06/2021' },
// ];

const ResidentListPage = () => {
    const { user } = useAuth();
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState(null);
    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [households, setHouseholds] = useState([]);
    const [aptSearch, setAptSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Lọc danh sách căn hộ dựa trên số phòng người dùng nhập
    const suggestedHouseholds = households.filter(h => 
        h.apartmentNumber.toLowerCase().includes(aptSearch.toLowerCase())
    ).slice(0, 5); // Chỉ hiện 5 kết quả đầu tiên cho gọn
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        dob: '',
        gender: 'male',
        phone: '',
        household: '', // Đây là ID của hộ khẩu
        relationToOwner: 'owner' // Default value - must be one of the enum values
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resResidents, resHouseholds] = await Promise.all([
                residentsApi.getAll(),
                householdApi.getAll()
            ]);

            // Kiểm tra dữ liệu trả về có phải mảng không trước khi set
            setResidents(Array.isArray(resResidents.data) ? resResidents.data : []);
            setHouseholds(Array.isArray(resHouseholds.data) ? resHouseholds.data : []);
            
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            // Nếu lỗi, trả về mảng rỗng để giao diện không bị crash
            setResidents([]);
            setHouseholds([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. useEffect gọi dữ liệu
    useEffect(() => {
        fetchData();
    }, []);


    const filteredResidents = residents?.filter(resident =>
        (resident.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resident.idNumber || '').includes(searchTerm) ||
        (resident.household?.apartmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableHeaders = [
        { label: 'Họ và tên', className: 'text-left' },
        { label: 'CMND/CCCD', className: 'text-left' },
        { label: 'Ngày sinh', className: 'text-left' },
        { label: 'Giới tính', className: 'text-left' },
        { label: 'Số ĐT', className: 'text-left' },
        { label: 'Căn hộ', className: 'text-left' },
        { label: 'Quan hệ', className: 'text-left' },
        { label: 'Trạng thái', className: 'text-left' },
        { label: 'Thao tác', className: 'text-left' }
    ];

    const renderResidentRow = (resident) => (
        <tr key={resident._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6 font-semibold text-gray-900">{resident.fullName}</td>
            <td className="py-4 px-6 text-gray-600">{resident.idNumber}</td>
            <td className="py-4 px-6 text-gray-600">
                {resident.dob ? new Date(resident.dob).toLocaleDateString('vi-VN') : '-'}
            </td>
            <td className="py-4 px-6 text-gray-600">
                {resident.gender === 'male' ? 'Nam' : resident.gender === 'female' ? 'Nữ' : 'Khác'}
            </td>
            <td className="py-4 px-6 text-gray-600">{resident.phone || '-'}</td>
            <td className="py-4 px-6">
                <span className="inline-block text-center w-16 px-3 py-1 bg-blue-500 text-white rounded-lg font-medium text-sm">
                    {resident.household?.apartmentNumber}
                </span>
            </td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${resident.relationToOwner === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {resident.relationToOwner === 'owner' ? 'Chủ hộ' : resident.relationToOwner === 'spouse' ? 'Vợ/Chồng' : resident.relationToOwner === 'child' ? 'Con' : resident.relationToOwner === 'parent' ? 'Bố/Mẹ' : resident.relationToOwner === 'sibling' ? 'Anh/Chị/Em' : resident.relationToOwner === 'relative' ? 'Người thân' : resident.relationToOwner === 'renter' ? 'Người thuê' : 'Khác'}
                </span>
            </td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    resident.status === 'temporary_residence' ? 'bg-yellow-100 text-yellow-700' :
                    resident.status === 'temporary_absence' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {resident.status === 'temporary_residence' ? 'Tạm trú' :
                     resident.status === 'temporary_absence' ? 'Tạm vắng' : 'Thường trú'}
                </span>
            </td>
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => {
                        setAptSearch(resident.household?.apartmentNumber);
                        handleOpenModal(resident);
                    } } className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(resident._id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
    const handleOpenModal = (resident = null) => {
        if (resident) {
            setEditingResident(resident);
            // Convert date từ backend (ISO) sang format input date (YYYY-MM-DD)
            const formattedDob = resident.dob ? resident.dob.split('T')[0] : '';
            setFormData({
                fullName: resident.fullName,
                idNumber: resident.idNumber,
                dob: formattedDob,
                gender: resident.gender,
                phone: resident.phone || '',
                household: resident.household?._id || '',
                relationToOwner: resident.relationToOwner
            });
        } else {
            setEditingResident(null);
            setFormData({ fullName: '', idNumber: '', dob: '', gender: 'male', phone: '', household: '', relationToOwner: 'owner' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate that household is selected
        if (!formData.household) {
            alert('Vui lòng chọn hộ khẩu');
            return;
        }
        
        try {
            if (editingResident) {
                await residentsApi.update(editingResident._id, formData);
            } else {
                await residentsApi.create(formData);
            }
            
            // Quan trọng: Đợi lấy dữ liệu mới xong rồi mới đóng Modal
            await fetchData(); 
            
            setIsModalOpen(false);
            setEditingResident(null); // Reset trạng thái chỉnh sửa
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu");
        }
    };

    const handleResidenceChangeSubmit = async (data) => {
        try {
            await residenceChangeApi.create(data);
            await fetchData(); // Refresh list to see status changes
            setIsChangeModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu biến đổi nhân khẩu");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
            try {
                await residentsApi.remove(id);
                fetchData();
            } catch (error) {
                alert("Xóa thất bại ");
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý nhân khẩu</h2>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsChangeModalOpen(true)}
                        className="bg-white border border-gray-200 shadow-sm hover:bg-linear-to-r from-blue-500 to-cyan-500 min-w-[200px]"
                    >
                        <ArrowRightLeft className="w-5 h-5 mr-1" />
                        Biến đổi nhân khẩu
                    </Button>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-linear-to-r from-blue-500 to-cyan-500"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm nhân khẩu
                    </Button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng số cư dân</p>
                        <p className="text-gray-900 font-bold">{residents?.length}</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Tìm kiếm theo tên, CMND hoặc căn hộ..."
                    />
                </div>
            </div>
            <div>
                <Table
                    headers={tableHeaders}
                    data={filteredResidents}
                    renderRow={renderResidentRow}
                    footerText={
                        <>
                            Kết quả gồm: <span className="font-bold text-gray-700">{filteredResidents.length}</span> cư dân
                        </>
                    }
                />
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {editingResident ? 'Chỉnh sửa nhân khẩu' : 'Thêm nhân khẩu mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Content giữ nguyên như code cũ, tôi chỉ rút gọn để hiển thị logic wrap */}
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label><input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">CMND</label><input value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                <DatePicker
                                    selected={formData.dob ? new Date(formData.dob) : null}
                                    onChange={(date) => setFormData({ ...formData, dob: date })}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Chọn ngày sinh"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value='male'>Nam</option><option value='female'>Nữ</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Căn hộ</label>
                                <input
                                    type="text"
                                    placeholder="Nhập số phòng (VD: 101)..."
                                    value={aptSearch}
                                    onChange={(e) => {
                                        setAptSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                
                                {/* Danh sách gợi ý đổ xuống */}
                                {showSuggestions && aptSearch && (
                                    <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {suggestedHouseholds.length > 0 ? (
                                            suggestedHouseholds.map(h => (
                                                <div
                                                    key={h._id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, household: h._id });
                                                        setAptSearch(h.apartmentNumber);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none"
                                                >
                                                    <p className="font-bold text-gray-800">{h.apartmentNumber}</p>
                                                    <p className="text-xs text-gray-500">Diện tích: {h.area}m²</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-gray-500 text-sm">Không tìm thấy căn hộ này</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quan hệ với chủ hộ <span className="text-red-500">*</span></label>
                                <select value={formData.relationToOwner} onChange={(e) => setFormData({ ...formData, relationToOwner: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                                    <option value="owner">Chủ hộ</option>
                                    <option value="spouse">Vợ/Chồng</option>
                                    <option value="child">Con</option>
                                    <option value="parent">Bố/Mẹ</option>
                                    <option value="sibling">Anh/Chị/Em</option>
                                    <option value="relative">Người thân</option>
                                    <option value="renter">Người thuê</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            {/* <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào</label><input value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div> */}
                        </div>

                        {/* <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Hủy</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Lưu</button>
                        </div> */}
                        <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                            <Button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setAptSearch('');
                                }}
                                className="flex-1 bg-gray-300 font-bold hover:bg-gray-500 transition-all"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all"
                                onClick={() => {
                                    setAptSearch('');
                                }}
                            >
                                {editingResident ? 'Cập nhật' : 'Thêm'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ResidenceChangeModal 
                isOpen={isChangeModalOpen}
                onClose={() => setIsChangeModalOpen(false)}
                residents={residents}
                households={households}
                onSubmit={handleResidenceChangeSubmit}
            />
        </div>
    );
};

export default ResidentListPage;