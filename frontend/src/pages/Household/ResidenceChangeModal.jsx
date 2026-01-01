import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Search } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ResidenceChangeModal = ({ isOpen, onClose, residents, households, onSubmit }) => {
    const [formData, setFormData] = useState({
        residentId: '',
        changeType: 'temporary_residence', // temporary_residence | temporary_absence
        startDate: new Date(),
        endDate: null,
        householdId: '',
        destination: '',
        note: ''
    });

    // Search states
    const [residentSearch, setResidentSearch] = useState('');
    const [showResidentSuggestions, setShowResidentSuggestions] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);

    const [householdSearch, setHouseholdSearch] = useState('');
    const [showHouseholdSuggestions, setShowHouseholdSuggestions] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setFormData({
                residentId: '',
                changeType: 'temporary_residence',
                startDate: new Date(),
                endDate: null,
                householdId: '',
                destination: '',
                note: ''
            });
            setResidentSearch('');
            setSelectedResident(null);
            setHouseholdSearch('');
            setSelectedHousehold(null);
        }
    }, [isOpen]);

    // Filter residents
    const suggestedResidents = residents.filter(r =>
        (r.fullName?.toLowerCase().includes(residentSearch.toLowerCase()) ||
        r.idNumber?.includes(residentSearch))
    ).slice(0, 5);

    // Filter households
    const suggestedHouseholds = households.filter(h =>
        h.apartmentNumber.toLowerCase().includes(householdSearch.toLowerCase())
    ).slice(0, 5);

    const handleResidentSelect = (resident) => {
        setSelectedResident(resident);
        setResidentSearch(resident.fullName);
        setFormData(prev => ({ ...prev, residentId: resident._id }));
        setShowResidentSuggestions(false);

        // Set default household if exists
        if (resident.household) {
            setSelectedHousehold(resident.household);
            setHouseholdSearch(resident.household.apartmentNumber);
            setFormData(prev => ({ ...prev, householdId: resident.household._id }));
        }
    };

    const handleHouseholdSelect = (household) => {
        setSelectedHousehold(household);
        setHouseholdSearch(household.apartmentNumber);
        setFormData(prev => ({ ...prev, householdId: household._id }));
        setShowHouseholdSuggestions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.residentId) {
            alert("Vui lòng chọn nhân khẩu");
            return;
        }
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Đăng ký biến đổi nhân khẩu</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Resident Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhân khẩu</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Tìm tên hoặc CCCD..."
                                value={residentSearch}
                                onChange={(e) => {
                                    setResidentSearch(e.target.value);
                                    setShowResidentSuggestions(true);
                                }}
                                onFocus={() => setShowResidentSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowResidentSuggestions(false), 200)}
                            />
                        </div>
                        {showResidentSuggestions && residentSearch && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {suggestedResidents.map(r => (
                                    <div
                                        key={r._id}
                                        onMouseDown={() => handleResidentSelect(r)}
                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none"
                                    >
                                        <p className="font-bold text-gray-800">{r.fullName}</p>
                                        <p className="text-sm text-gray-500">CMND/CCCD: {r.idNumber}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Change Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại biến đổi</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="changeType"
                                    value="temporary_residence"
                                    checked={formData.changeType === 'temporary_residence'}
                                    onChange={(e) => setFormData({ ...formData, changeType: e.target.value })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>Tạm trú</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="changeType"
                                    value="temporary_absence"
                                    checked={formData.changeType === 'temporary_absence'}
                                    onChange={(e) => setFormData({ ...formData, changeType: e.target.value })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>Tạm vắng</span>
                            </label>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                            <DatePicker
                                selected={formData.startDate}
                                onChange={(date) => setFormData({ ...formData, startDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                            <DatePicker
                                selected={formData.endDate}
                                onChange={(date) => setFormData({ ...formData, endDate: date })}
                                dateFormat="dd/MM/yyyy"
                                minDate={formData.startDate}
                                placeholderText="Chọn ngày..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {formData.changeType === 'temporary_residence' ? (
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Căn hộ tạm trú</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Tìm số phòng..."
                                    value={householdSearch}
                                    onChange={(e) => {
                                        setHouseholdSearch(e.target.value);
                                        setShowHouseholdSuggestions(true);
                                    }}
                                    onFocus={() => setShowHouseholdSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowHouseholdSuggestions(false), 200)}
                                />
                            </div>
                            {showHouseholdSuggestions && householdSearch && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {suggestedHouseholds.map(h => (
                                        <div
                                            key={h._id}
                                            onMouseDown={() => handleHouseholdSelect(h)}
                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none"
                                        >
                                            <p className="font-bold text-gray-800">{h.apartmentNumber}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nơi đến (Địa chỉ)</label>
                            <input
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập địa chỉ nơi đến..."
                            />
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Lý do</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                        <Button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700">Hủy</Button>
                        <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200">Lưu</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ResidenceChangeModal;