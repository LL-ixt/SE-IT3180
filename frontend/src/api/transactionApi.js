import axiosClient from './axiosClient';

const transactionApi = {
    getAll() {
        return axiosClient.get('/transactions');
    },
    getById(id) {
        return axiosClient.get(`/transactions/${id}`);
    },
    create(data) {
        return axiosClient.post('/transactions', data);
    },
    update(id, data) {
        return axiosClient.put(`/transactions/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/transactions/${id}`);
    },
};

export default transactionApi;
