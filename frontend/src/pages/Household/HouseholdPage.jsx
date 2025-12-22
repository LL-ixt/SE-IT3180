import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, User, Home as HomeIcon, X } from 'lucide-react';
//import ContentWrapper from '../../components/layout/ContentWrapper';
import Modal from '../../components/common/Modal';
import {Button} from '../../components/common/Button.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
const initialHouseholds = [
    { id: 1, apartment: 'A101', owner: 'Nguyễn Văn A', phone: '0901234567', area: 85, members: 3, moveInDate: '01/01/2020', vehicles: { motorcycles: 2, cars: 1 }, status: 'Đang ở' },
    { id: 2, apartment: 'A202', owner: 'Trần Thị B', phone: '0901234568', area: 92, members: 1, moveInDate: '15/06/2021', vehicles: { motorcycles: 1, cars: 0 }, status: 'Đang ở' },
    { id: 3, apartment: 'B103', owner: 'Lê Văn C', phone: '0901234569', area: 110, members: 4, moveInDate: '20/03/2019', vehicles: { motorcycles: 2, cars: 2 }, status: 'Đang ở' },
    { id: 4, apartment: 'C205', owner: 'Phạm Thị D', phone: '0901234570', area: 75, members: 2, moveInDate: '10/08/2022', vehicles: { motorcycles: 1, cars: 1 }, status: 'Đang ở' },
    { id: 5, apartment: 'A305', owner: 'Hoàng Văn E', phone: '0901234571', area: 88, members: 0, moveInDate: '', vehicles: { motorcycles: 0, cars: 0 }, status: 'Trống' },
];

const HouseholdPage = () => {
    const [households, setHouseholds] = useState(initialHouseholds);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHousehold, setEditingHousehold] = useState(null);

    const [formData, setFormData] = useState({
        apartment: '', owner: '', phone: '', area: '', members: '', moveInDate: '', motorcycles: '0', cars: '0', status: 'Đang ở'
    });

    const filteredHouseholds = households.filter(household =>
        household.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.phone.includes(searchTerm)
    );

    const handleOpenModal = (household = null) => {
        if (household) {
            setEditingHousehold(household);
            setFormData({
                apartment: household.apartment,
                owner: household.owner,
                phone: household.phone,
                area: household.area.toString(),
                members: household.members.toString(),
                moveInDate: household.moveInDate,
                motorcycles: household.vehicles.motorcycles.toString(),
                cars: household.vehicles.cars.toString(),
                status: household.status
            });
        } else {
            setEditingHousehold(null);
            setFormData({ apartment: '', owner: '', phone: '', area: '', members: '', moveInDate: '', motorcycles: '0', cars: '0', status: 'Đang ở' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const householdData = {
            apartment: formData.apartment,
            owner: formData.owner,
            phone: formData.phone,
            area: parseFloat(formData.area),
            members: parseInt(formData.members),
            moveInDate: formData.moveInDate,
            vehicles: { motorcycles: parseInt(formData.motorcycles), cars: parseInt(formData.cars) },
            status: formData.status
        };

        if (editingHousehold) {
            setHouseholds(households.map(household => household.id === editingHousehold.id ? { ...householdData, id: editingHousehold.id } : household));
        } else {
            const newHousehold = { ...householdData, id: Math.max(...households.map(h => h.id)) + 1 };
            setHouseholds([...households, newHousehold]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hộ khẩu này?')) {
            setHouseholds(households.filter(household => household.id !== id));
        }
    };

    const totalApartments = households.length;
    const occupiedApartments = households.filter(h => h.status === 'Đang ở').length;
    const totalMembers = households.reduce((sum, h) => sum + h.members, 0);
    const totalArea = households.reduce((sum, h) => sum + h.area, 0);

    const stats = [
        { label: 'Tổng số căn hộ', value: totalApartments, icon: HomeIcon, color: 'bg-blue-500'},
        { label: 'Đang có người ở', value: occupiedApartments, icon: HomeIcon, color: 'bg-green-500'},
        { label: 'Tổng nhân khẩu', value: totalMembers, icon: User, color: 'bg-purple-500'},
        { label: 'Tổng diện tích', value: `${totalArea}m²`, icon: HomeIcon, color: 'bg-orange-500'},
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hộ khẩu</h2>
                </div>
                <Button
                    className="bg-linear-to-r from-blue-500 to-cyan-500"
                >
                    <Plus className="w-5 h-5" />
                    Thêm hộ khẩu
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                    <p className="text-gray-900 font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <SearchBar 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    placeholder="Tìm kiếm theo căn hộ, chủ hộ hoặc SĐT..."
                />
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6">Căn hộ</th>
                                <th className="text-left py-4 px-6">Chủ hộ</th>
                                <th className="text-left py-4 px-6">Số ĐT</th>
                                <th className="text-left py-4 px-6">Diện tích</th>
                                <th className="text-center py-4 px-6">Thành viên</th>
                                <th className="text-left py-4 px-6">Xe cộ (Xe máy/Ô tô)</th>
                                <th className="text-left py-4 px-6">Trạng thái</th>
                                <th className="text-left py-4 px-6">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredHouseholds.map((household) => (
                                <tr key={household.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="inline-block text-center w-15 px-3 py-1 bg-blue-500 text-white rounded-lg font-medium text-sm border border-blue-500">
                                            {household.apartment}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-medium">{household.owner}</td>
                                    <td className="py-4 px-6">{household.phone}</td>
                                    <td className="py-4 px-6">{household.area}m²</td>
                                    <td className="py-4 px-6 text-center">{household.members}</td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm">
                                            {household.vehicles.motorcycles} / {household.vehicles.cars}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${household.status === 'Đang ở'
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'bg-gray-500 text-white border-gray-300'
                                            }`}>
                                            {household.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-3">
                                            <button onClick={() => handleOpenModal(household)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(household.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>


        // </div>
        //     {/* Main Content Card - Đã sửa style */}
        //     <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        //         {/* Search Bar */}
        //         <div className="p-5 border-b border-white/10">
        //             <div className="relative max-w-md">
        //                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        //                 <input
        //                     placeholder="Tìm kiếm theo căn hộ, chủ hộ hoặc SĐT..."
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
        //                         <th className="text-left py-4 px-6">Căn hộ</th>
        //                         <th className="text-left py-4 px-6">Chủ hộ</th>
        //                         <th className="text-left py-4 px-6">Số ĐT</th>
        //                         <th className="text-left py-4 px-6">Diện tích</th>
        //                         <th className="text-center py-4 px-6">Thành viên</th>
        //                         <th className="text-left py-4 px-6">Xe cộ (Máy/Tô)</th>
        //                         <th className="text-left py-4 px-6">Trạng thái</th>
        //                         <th className="text-left py-4 px-6">Thao tác</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody className="divide-y divide-white/5">
        //                     {filteredHouseholds.map((household) => (
        //                         <tr key={household.id} className="hover:bg-white/5 transition-colors">
        //                             <td className="py-4 px-6">
        //                                 <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-medium text-sm border border-blue-500/30">
        //                                     {household.apartment}
        //                                 </span>
        //                             </td>
        //                             <td className="py-4 px-6 font-medium">{household.owner}</td>
        //                             <td className="py-4 px-6 text-gray-300">{household.phone}</td>
        //                             <td className="py-4 px-6 text-gray-300">{household.area}m²</td>
        //                             <td className="py-4 px-6 text-gray-300 text-center">{household.members}</td>
        //                             <td className="py-4 px-6">
        //                                 <div className="text-sm text-gray-300">
        //                                     {household.vehicles.motorcycles} / {household.vehicles.cars}
        //                                 </div>
        //                             </td>
        //                             <td className="py-4 px-6">
        //                                 <span className={`px-3 py-1 rounded-full text-xs font-medium border ${household.status === 'Đang ở'
        //                                         ? 'bg-green-500/20 text-green-300 border-green-500/30'
        //                                         : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        //                                     }`}>
        //                                     {household.status}
        //                                 </span>
        //                             </td>
        //                             <td className="py-4 px-6">
        //                                 <div className="flex gap-3">
        //                                     <button onClick={() => handleOpenModal(household)} className="text-blue-400 hover:text-blue-300 transition-colors">
        //                                         <Edit size={18} />
        //                                     </button>
        //                                     <button onClick={() => handleDelete(household.id)} className="text-red-400 hover:text-red-300 transition-colors">
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
        //             Tổng số: <span className="font-medium text-white">{filteredHouseholds.length}</span> hộ khẩu
        //         </div>
        //     </div>

        //     {/* Modal Form giữ nguyên (Hoặc bạn có thể chỉnh CSS modal sau nếu muốn) */}
        //     <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        //         <div className="p-6">
        //             <h3 className="text-xl font-bold text-gray-900 mb-6">
        //                 {editingHousehold ? 'Chỉnh sửa hộ khẩu' : 'Thêm hộ khẩu mới'}
        //             </h3>
        //             {/* Form content giữ nguyên như cũ vì Modal thường nền trắng */}
        //             <form onSubmit={handleSubmit} className="space-y-4">
        //                 {/* Copy lại nội dung Form từ code cũ của bạn vào đây */}
        //                 <div className="grid grid-cols-2 gap-4">
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Căn hộ</label>
        //                         <input value={formData.apartment} onChange={(e) => setFormData({ ...formData, apartment: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        //                     </div>
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
        //                         <input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        //                     </div>
        //                 </div>
        //                 {/* ... Các trường còn lại ... Giữ nguyên logic form */}
        //                 <div className="grid grid-cols-2 gap-4">
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Chủ hộ</label>
        //                         <input value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        //                     </div>
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        //                         <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        //                     </div>
        //                 </div>
        //                 <div className="grid grid-cols-2 gap-4">
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Thành viên</label>
        //                         <input type="number" value={formData.members} onChange={(e) => setFormData({ ...formData, members: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
        //                     </div>
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào</label>
        //                         <input value={formData.moveInDate} onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        //                     </div>
        //                 </div>
        //                 <div className="grid grid-cols-2 gap-4">
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Xe máy</label>
        //                         <input type="number" value={formData.motorcycles} onChange={(e) => setFormData({ ...formData, motorcycles: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        //                     </div>
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700 mb-1">Ô tô</label>
        //                         <input type="number" value={formData.cars} onChange={(e) => setFormData({ ...formData, cars: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        //                     </div>
        //                 </div>
        //                 <div>
        //                     <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        //                     <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
        //                         <option value="Đang ở">Đang ở</option>
        //                         <option value="Trống">Trống</option>
        //                     </select>
        //                 </div>

        //                 <div className="flex gap-3 justify-end pt-4 border-t mt-6">
        //                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Hủy</button>
        //                     <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Lưu</button>
        //                 </div>
        //             </form>
        //         </div>
        //     </Modal>
        // </div>
    );
};

export default HouseholdPage;