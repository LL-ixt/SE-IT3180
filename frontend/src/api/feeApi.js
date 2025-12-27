import axiosClient from './axiosClient';

const feeApi = {
    getAll() {
        return axiosClient.get('/fees');
    },
    getById(id) {
        return axiosClient.get(`/fees/${id}`);
    },
    create(data) {
        return axiosClient.post('/fees', data);
    },
    update(id, data) {
        return axiosClient.put(`/fees/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/fees/${id}`);
    },
};

export default feeApi;
