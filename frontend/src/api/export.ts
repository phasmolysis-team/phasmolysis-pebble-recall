import { apiRequest } from "./client";

export const exportApi = {
	pdf() {
		return apiRequest<Blob>("/export");
	},
};
