/**
 * Component Button tái sử dụng với kiểu dáng Tailwind mặc định.
 * Props:
 * - children: Nội dung bên trong nút.
 * - className: Cho phép truyền thêm các lớp Tailwind tùy chỉnh.
 * - ...props: Các thuộc tính HTML gốc như onClick, type="submit", disabled.
 */

export const Button = ({ children, className = '', ...props }) => {
    const defaultStyles = "group inline-flex items-center justify-center p-1 h-10 w-40 overflow-hidden text-sm font-medium rounded-2xl hover:text-white";

    return (
        <button
            className={`${defaultStyles} ${className}`} // Kết hợp kiểu mặc định và kiểu tùy chỉnh
            {...props}
        >
            <div className = "px-3 flex h-8 w-full items-center justify-center rounded-xl bg-white group-hover:bg-transparent">
                {children}
            </div>
        </button>
    );
};