import React from 'react';
// Đảm bảo đường dẫn tới ảnh đúng với cấu trúc thư mục của bạn
import bgImage from '../../assets/images/background.jpg';

const ContentWrapper = ({ children, title }) => {
    return (
        // 1. Khung bao ngoài cùng, chiếm khoảng trống của MainLayout
        <div className="relative w-full h-full min-h-[calc(100vh-80px)] p-4 md:p-6">

            {/* 2. Lớp chứa hình nền Background */}
            <div
                className="relative z-10 shadow-2xl shadow-black/40 rounded-[2rem] h-full overflow-hidden"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* 3. Lớp phủ màu tối + Hiệu ứng kính mờ (Backdrop blur) */}
                <div className="w-full h-full bg-black/40 backdrop-blur-md p-6 md:p-10 overflow-y-auto flex flex-col">

                    {/* Tiêu đề trang (Nếu có truyền vào) */}
                    {title && (
                        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-white drop-shadow-sm">
                            {title}
                        </h1>
                    )}

                    {/* 4. Nơi hiển thị nội dung cụ thể của từng trang (Bảng, Form...) */}
                    {/* Thêm lớp nền nhẹ để nội dung dễ đọc hơn trên nền kính */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-inner text-white">
                        {children}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContentWrapper;