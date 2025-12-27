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
    removeFee(session_id, fee_id) {
        return axiosClient.delete(`/paymentSessions/${session_id}/${fee_id}/`);
    },
    getInvoices(id, params) {
        return axiosClient.get(`/paymentSessions/${id}/invoices`, { params });
    },
    updateFeeInvoices(sessionId, feeId, invoices) {
        return axiosClient.put(`/paymentSessions/${sessionId}/fees/${feeId}/invoices`, { invoices });
    }
};

export default paymentSessionApi;
