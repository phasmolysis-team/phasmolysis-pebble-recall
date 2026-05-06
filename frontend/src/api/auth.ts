import type {
	LoginPayload,
	RegisterPayload,
	UserWithoutPassword,
} from "@/types/auth";
import { toFormData } from "../utils/form-data";
import { apiRequest } from "./client";

export const authApi = {
	login(payload: LoginPayload) {
		return apiRequest<string>("/auth/login", {
			method: "POST",
			body: toFormData(payload),
		});
	},
	logout() {
		return apiRequest<string>("/auth/logout");
	},
	decryptCookie() {
		return apiRequest<unknown>("/auth/decrypt_cookie");
	},
	register(payload: RegisterPayload) {
		return apiRequest<UserWithoutPassword>("/auth/register", {
			method: "POST",
			body: toFormData(payload),
		});
	},
};
