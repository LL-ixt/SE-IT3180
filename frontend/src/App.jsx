import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Auth/LoginPage';
// import DashboardPage from './pages/Dashboard/DashboardPage'; // Placeholder

// Component bảo vệ route
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route 
                        path="/" 
                        element={
                            <PrivateRoute>
                                <div className="p-10">
                                    <h1 className="text-2xl font-bold">Dashboard - Xin chào!</h1>
                                    {/* <DashboardPage /> sẽ được render ở đây */}
                                </div>
                            </PrivateRoute>
                        } 
                    />
                    {/* Thêm các route khác ở đây */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
