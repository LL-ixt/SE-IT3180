import axiosClient from './axiosClient';

const residentsApi = {
    getAll() {
        return axiosClient.get('/residents');
    },
    getById(id) {
        return axiosClient.get(`/residents/${id}`);
    },
    create(data) {
        return axiosClient.post('/residents', data);
    },
    update(id, data) {
        return axiosClient.put(`/residents/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/residents/${id}`);
    },
};

export default residentsApi;
