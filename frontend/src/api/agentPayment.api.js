import apiClient from "./client";

export const getAllAgentPayments = async (agentNameRaw = "") => {
	let url = "/api/v1/agent-payments?size=5000";
	if (agentNameRaw) {
		url += `&agentNameRaw=${encodeURIComponent(agentNameRaw)}`;
	}
	const response = await apiClient.get(url);
	return response.data; // e.g. { content: [...], totalPages: 1 }
};

export const getAgentPaymentById = async (id) => {
	const response = await apiClient.get(`/api/v1/agent-payments/${id}`);
	return response.data;
};

export const createAgentPayment = async (data) => {
	const response = await apiClient.post("/api/v1/agent-payments", data);
	return response.data;
};

export const updateAgentPayment = async (id, data) => {
	const response = await apiClient.put(`/api/v1/agent-payments/${id}`, data);
	return response.data;
};

export const deleteAgentPayment = async (id) => {
	const response = await apiClient.delete(`/api/v1/agent-payments/${id}`);
	return response.data;
};
