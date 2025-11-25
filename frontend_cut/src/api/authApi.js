import axiosClient from './axiosClient';

const authApi = {
    login(data) {
        return axiosClient.post('/auth/login', data);
    },
    // Thêm các hàm khác như changePassword...
};
export default authApi;