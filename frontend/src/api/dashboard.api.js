import api from './client';

export const getDashboardOverview = async (params) => {
    const res = await api.get('/api/v1/dashboard/overview', { params });
    return res.data;
};

export const getDashboardFilterOptions = async () => {
    const res = await api.get('/api/v1/dashboard/filter-options');
    return res.data;
};
