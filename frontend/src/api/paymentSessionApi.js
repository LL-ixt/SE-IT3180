import axiosClient from './axiosClient';

const paymentSessionApi = {
    getAll() {
        return axiosClient.get('/paymentSessions');
    },
    getById(id) {
        return axiosClient.get(`/paymentSessions/${id}`);
    },
    create(data) {
        return axiosClient.post('/paymentSessions', data);
    },
    update(id, data) {
        return axiosClient.put(`/paymentSessions/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/paymentSessions/${id}`);
    },
};

export default paymentSessionApi;
