import React, { useState } from 'react';
import { DollarSign, Check } from 'lucide-react';

const PaymentGrid = ({ 
    details,           // Dữ liệu householdPaymentDetails
    feeHeaders,        // Danh sách các loại phí (để render cột)
    onCellClick,       // Hàm xử lý khi click vào ô thường (toggle)
    onVoluntaryChange, // Hàm xử lý khi nhập tiền tự nguyện
    className 
}) => {
    console.log("details: ", details)
    // Helper: Format tiền tệ
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

    return (
        <div className={`border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
            {/* Header Toolbar */}
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600 font-medium">Đã thanh toán</span>
                    <div className="w-3 h-3 bg-white border border-gray-300 ml-3 rounded-sm"></div>
                    <span className="text-xs text-gray-600 font-medium">Chưa thanh toán</span>
                </div>
                <span className="text-xs text-gray-400 italic">Scroll ngang để xem thêm phí</span>
            </div>

            {/* MAIN GRID AREA */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            {/* 1. CỘT STICKY: CĂN HỘ (Góc trên cùng bên trái - Z-index cao nhất) */}
                            <th className="sticky left-0 top-0 z-30 bg-gray-200 p-3 min-w-20 border-b border-r border-gray-300 font-bold text-center shadow-md">
                                Căn hộ
                            </th>

                            {/* 2. CỘT STICKY: TỔNG PHẢI NỘP (Cạnh cột căn hộ) */}
                            <th className="sticky left-20 top-0 z-30 bg-orange-100 p-3 min-w-20 border-b border-r border-orange-200 font-bold text-orange-800 text-center shadow-md">
                                Tổng phí bắt buộc
                            </th>

                            {/* 3. HEADER CÁC CỘT PHÍ (Sticky Top) */}
                            {feeHeaders.map((header) => (
                                <th key={header.feeInSessionId} className="sticky top-0 z-20 bg-gray-100 p-3 min-w-35 border-b border-gray-300 font-semibold whitespace-nowrap text-center">
                                    <div className="flex flex-col items-center">
                                        <span>{header.feeName}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    <tbody>
                        {details.map((row) => (
                            <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                                {/* 1. DÒNG STICKY: SỐ PHÒNG (Sticky Left) */}
                                <td className="sticky left-0 z-10 bg-white p-3 border-r border-b border-gray-200 font-bold text-blue-600 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    {row.household.apartmentNumber}
                                </td>

                                {/* 2. DÒNG STICKY: TỔNG TIỀN (Sticky Left) */}
                                <td 
                                    className="sticky left-20 z-10 bg-orange-50 p-3 border-r border-b border-orange-100 font-black text-center text-orange-700 cursor-pointer hover:bg-orange-100 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                                    title="Click để thanh toán toàn bộ phí bắt buộc"
                                    onClick={() => onCellClick(row, 'ALL_MANDATORY')}
                                >
                                    {formatCurrency(row.totalBill)}
                                </td>

                                {/* CÁC Ô DỮ LIỆU */}
                                {feeHeaders.map((header) => {
                                    // Tìm item tương ứng trong mảng items của căn hộ
                                    const item = row.items.find(i => i.feeInSessionId === header.feeInSessionId);
                                    if (!item) return <td key={header.feeInSessionId} className="border-b border-gray-200"></td>;

                                    const isVoluntary = item.feeType === 'voluntary'; // Là phí tự nguyện nếu không có đơn giá
                                    const isPaid = item.isPaid || (isVoluntary && item.totalAmount > 0);

                                    if (isPaid) {
                                        return (
                                            <td 
                                                key={item._id} 
                                                className="p-1 border-b border-gray-200 bg-green-500 text-white text-center cursor-pointer hover:bg-green-600 transition-all"
                                                onClick={() => {
                                                    // Nếu muốn cho phép sửa số tiền tự nguyện sau khi đã đóng, 
                                                    // ta có thể cho click để hiện lại input, hoặc click để toggle về 0
                                                    if (isVoluntary) onCellClick(row, item); // Hoặc logic khác tùy bạn
                                                }}
                                            >
                                                <span className="font-bold text-sm">{formatCurrency(item.totalAmount)}</span>
                                            </td>
                                        );
                                    }

                                    // STYLE CHO Ô TỰ NGUYỆN (INPUT)
                                    if (isVoluntary) {
                                        return (
                                            <td key={item._id} className="p-2 border-b border-gray-200 bg-white text-center">
                                                <input 
                                                    type="number" 
                                                    className="w-full text-right p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                    placeholder="Nhập..."
                                                    defaultValue={item.quantity > 0 ? item.quantity : ''}
                                                    onBlur={(e) => onVoluntaryChange(row, item, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') onVoluntaryChange(row, item, e.target.value);
                                                    }}
                                                />
                                            </td>
                                        );
                                    }

                                    // STYLE CHO Ô BẮT BUỘC CHƯA TRẢ (MÀU TRẮNG -> XANH KHI HOVER)
                                    return (
                                        <td 
                                            key={item._id} 
                                            className="p-3 border-b border-gray-200 text-center cursor-pointer hover:bg-green-100 transition-colors text-gray-400 font-medium"
                                            onClick={() => onCellClick(row, item)}
                                        >
                                            {formatCurrency(item.totalAmount)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentGrid;