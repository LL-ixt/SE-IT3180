import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, User } from 'lucide-react';
//import ContentWrapper from '../../components/layout/ContentWrapper';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';

const initialResidents = [
    { id: 1, name: 'Nguyễn Văn A', idCard: '001234567890', birthDate: '15/05/1980', gender: 'Nam', phone: '0901234567', apartment: 'A101', relationship: 'Chủ hộ', moveInDate: '01/01/2020' },
    { id: 2, name: 'Nguyễn Thị B', idCard: '001234567891', birthDate: '20/08/1985', gender: 'Nữ', phone: '0901234568', apartment: 'A101', relationship: 'Vợ/Chồng', moveInDate: '01/01/2020' },
    { id: 3, name: 'Nguyễn Văn C', idCard: '001234567892', birthDate: '10/03/2010', gender: 'Nam', phone: '', apartment: 'A101', relationship: 'Con', moveInDate: '01/01/2020' },
    { id: 4, name: 'Trần Thị D', idCard: '001234567893', birthDate: '25/11/1978', gender: 'Nữ', phone: '0901234569', apartment: 'A202', relationship: 'Chủ hộ', moveInDate: '15/06/2021' },
];

const ResidentListPage = () => {
    const [residents, setResidents] = useState(initialResidents);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState(null);

    const [formData, setFormData] = useState({ name: '', idCard: '', birthDate: '', gender: 'Nam', phone: '', apartment: '', relationship: 'Chủ hộ', moveInDate: '' });

    const filteredResidents = residents.filter(resident =>
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.idCard.includes(searchTerm) ||
        resident.apartment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableHeaders = [
        { label: 'Họ và tên', className: 'text-left' },
        { label: 'CMND/CCCD', className: 'text-left' },
        { label: 'Ngày sinh', className: 'text-left' },
        { label: 'Giới tính', className: 'text-left' },
        { label: 'Số ĐT', className: 'text-left' },
        { label: 'Căn hộ', className: 'text-left' },
        { label: 'Quan hệ', className: 'text-left' },
        { label: 'Thao tác', className: 'text-left' }
    ];

    const renderResidentRow = (resident) => (
        <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6 font-semibold text-gray-900">{resident.name}</td>
            <td className="py-4 px-6 text-gray-600">{resident.idCard}</td>
            <td className="py-4 px-6 text-gray-600">{resident.birthDate}</td>
            <td className="py-4 px-6 text-gray-600">{resident.gender}</td>
            <td className="py-4 px-6 text-gray-600">{resident.phone || '-'}</td>
            <td className="py-4 px-6">
                <span className="inline-block text-center w-16 px-3 py-1 bg-blue-500 text-white rounded-lg font-medium text-sm">
                    {resident.apartment}
                </span>
            </td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${resident.relationship === 'Chủ hộ' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {resident.relationship}
                </span>
            </td>
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(resident)} className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(resident.id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
    const handleOpenModal = (resident = null) => {
        if (resident) {
            setEditingResident(resident);
            setFormData({ ...resident });
        } else {
            setEditingResident(null);
            setFormData({ name: '', idCard: '', birthDate: '', gender: 'Nam', phone: '', apartment: '', relationship: 'Chủ hộ', moveInDate: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingResident) {
            setResidents(residents.map(resident => resident.id === editingResident.id ? { ...formData, id: editingResident.id } : resident));
        } else {
            const newResident = { ...formData, id: Math.max(...residents.map(r => r.id), 0) + 1 };
            setResidents([...residents, newResident]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
            setResidents(residents.filter(resident => resident.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý nhân khẩu</h2>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-linear-to-r from-blue-500 to-cyan-500"
                >
                    <Plus className="w-5 h-5" />
                    Thêm nhân khẩu
                </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng số cư dân</p>
                        <p className="text-gray-900 font-bold">{initialResidents.length}</p>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        {editingResident ? 'Chỉnh sửa nhân khẩu' : 'Thêm nhân khẩu mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Content giữ nguyên như code cũ, tôi chỉ rút gọn để hiển thị logic wrap */}
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">CMND</label><input value={formData.idCard} onChange={(e) => setFormData({ ...formData, idCard: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label><input value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Căn hộ</label><input value={formData.apartment} onChange={(e) => setFormData({ ...formData, apartment: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quan hệ</label>
                                <select value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="Chủ hộ">Chủ hộ</option><option value="Vợ/Chồng">Vợ/Chồng</option><option value="Con">Con</option><option value="Bố/Mẹ">Bố/Mẹ</option>
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào</label><input value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                        </div>

                        {/* <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Hủy</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Lưu</button>
                        </div> */}
                        <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                            <Button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 bg-gray-300 font-bold hover:bg-gray-500 transition-all"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all"
                            >
                                {editingResident ? 'Cập nhật' : 'Thêm'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
        // // 1. ĐÃ SỬA: Bọc bằng ContentWrapper
        // <ContentWrapper title="Quản lý Nhân Khẩu">

        //     {/* Header Actions */}
        //     <div className="flex justify-end mb-6">
        //         <button
        //             onClick={() => handleOpenModal()}
        //             className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 font-medium"
        //         >
        //             <Plus size={20} />
        //             Thêm nhân khẩu
        //         </button>
        //     </div>

        //     {/* Main Content Card - Đã sửa style Glass */}
        //     <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">

        //         {/* Search Bar */}
        //         <div className="p-5 border-b border-white/10 flex gap-4">
        //             <div className="relative flex-1 max-w-md">
        //                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        //                 <input
        //                     placeholder="Tìm kiếm theo tên, CMND hoặc căn hộ..."
        //                     value={searchTerm}
        //                     onChange={(e) => setSearchTerm(e.target.value)}
        //                     className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        //                 />
        //             </div>
        //         </div>

        //         {/* Table */}
        //         <div className="overflow-x-auto">
        //             <table className="w-full text-white">
        //                 <thead className="bg-black/20 text-gray-300 uppercase text-xs font-semibold">
        //                     <tr>
        //                         <th className="text-left py-4 px-6">Họ và tên</th>
        //                         <th className="text-left py-4 px-6">CMND/CCCD</th>
        //                         <th className="text-left py-4 px-6">Ngày sinh</th>
        //                         <th className="text-left py-4 px-6">Giới tính</th>
        //                         <th className="text-left py-4 px-6">Số ĐT</th>
        //                         <th className="text-left py-4 px-6">Căn hộ</th>
        //                         <th className="text-left py-4 px-6">Quan hệ</th>
        //                         <th className="text-left py-4 px-6">Thao tác</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody className="divide-y divide-white/5">
        //                     {filteredResidents.map((resident) => (
        //                         <tr key={resident.id} className="hover:bg-white/5 transition-colors">
        //                             <td className="py-4 px-6 font-medium">{resident.name}</td>
        //                             <td className="py-4 px-6 text-gray-300">{resident.idCard}</td>
        //                             <td className="py-4 px-6 text-gray-300">{resident.birthDate}</td>
        //                             <td className="py-4 px-6 text-gray-300">{resident.gender}</td>
        //                             <td className="py-4 px-6 text-gray-300">{resident.phone || '-'}</td>
        //                             <td className="py-4 px-6">
        //                                 <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-sm font-medium">
        //                                     {resident.apartment}
        //                                 </span>
        //                             </td>
        //                             <td className="py-4 px-6 text-gray-300">{resident.relationship}</td>
        //                             <td className="py-4 px-6">
        //                                 <div className="flex gap-3">
        //                                     <button onClick={() => handleOpenModal(resident)} className="text-blue-400 hover:text-blue-300 transition-colors">
        //                                         <Edit size={18} />
        //                                     </button>
        //                                     <button onClick={() => handleDelete(resident.id)} className="text-red-400 hover:text-red-300 transition-colors">
        //                                         <Trash2 size={18} />
        //                                     </button>
        //                                 </div>
        //                             </td>
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>
        //         </div>

        //         <div className="p-4 border-t border-white/10 text-sm text-gray-400 bg-black/20">
        //             Tổng số: <span className="font-medium text-white">{filteredResidents.length}</span> nhân khẩu
        //         </div>
        //     </div>

        //     {/* Modal Form */}

        // </ContentWrapper>
    );
};

export default ResidentListPage;