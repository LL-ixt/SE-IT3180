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
    },
    getTransactionsBySession(id) {
        return axiosClient.get(`/paymentSessions/${id}/transactions`);
    },
    getPaymentDetails(id) {
        return axiosClient.get(`/paymentSessions/${id}/details`);
    },
    updateColumnQuantity(sessionId, feeInSessionId, updates) {
        // Gửi yêu cầu PUT tới backend kèm theo mảng các thay đổi
        return axiosClient.put(`/paymentSessions/${sessionId}/columns/${feeInSessionId}`, { updates });
    },
    toggleFeePayment(detailId, payload) {
        // payload gồm { feeInSessionId, mode: 'SINGLE' | 'ALL_MANDATORY' }
        return axiosClient.put(`/paymentSessions/details/${detailId}/toggle`, payload);
    }
};

export default paymentSessionApi;
