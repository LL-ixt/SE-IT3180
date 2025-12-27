import axiosClient from './axiosClient';

const householdApi = {
    getAll() {
        return axiosClient.get('/households');
    },
    create(data) {
        return axiosClient.post('/households', data);
    },
    update(id, data) {
        return axiosClient.put(`/households/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/households/${id}`);
    },
};

export default householdApi;
