import axiosClient from './axiosClient';

const residenceChangeApi = {
    create: (data) => {
        const url = '/residence-changes';
        return axiosClient.post(url, data);
    },
    getAll: (params) => {
        const url = '/residence-changes';
        return axiosClient.get(url, { params });
    },
    update: (id, data) => {
        const url = `/residence-changes/${id}`;
        return axiosClient.put(url, data);
    },
    remove: (id) => {
        const url = `/residence-changes/${id}`;
        return axiosClient.delete(url);
    },
};

export default residenceChangeApi;