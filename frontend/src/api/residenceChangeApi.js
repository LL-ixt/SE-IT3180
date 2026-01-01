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
};

export default residenceChangeApi;