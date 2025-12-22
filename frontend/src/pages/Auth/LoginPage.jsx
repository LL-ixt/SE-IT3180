import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
//npm install lucide-react
import { Building } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl border border-gray-100">
                <div className="p-8 border-b border-gray-100 text-center space-y-3">
                    {/* ICON */}
                    <div className="flex justify-center mb-2">
                        <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                            <Building className="size-8 text-white" />
                        </div>
                    </div>
                    {/* TITLE */}
                    <h1 className="text-2xl font-bold text-gray-800">Hệ thống quản lý chung cư BlueMoon</h1>
                    {/* DESCRIPTION */}
                    <p className="text-gray-500 text-sm">Đăng nhập để truy cập các chức năng</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl px-8 pt-6 pb-8 py-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Tên đăng nhập
                        </label>
                        <input className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Mật khẩu
                        </label>
                        <input className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu" />
                        {error && <div className="p-2 mb-4 text-red-500 bg-red-100 rounded-2xl">{error}</div>}
                    </div>
                    <div className="flex items-center justify-between">
                        <a className="inline-block align-baseline font-bold text-sm text-cyan-600 hover:text-blue-800" href="#">
                            Quên mật khẩu?
                        </a>
                        <Button className="bg-linear-to-r from-blue-500 to-cyan-500">
                            Đăng nhập
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;