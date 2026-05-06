import type {
	UpdateUserPayload,
	User,
	UserWithoutPassword,
} from "@/types/auth";
import { toFormData } from "../utils/form-data";
import { apiRequest } from "./client";

export const usersApi = {
	current() {
		return apiRequest<User | null>("/users");
	},
	update(id: number, payload: UpdateUserPayload) {
		return apiRequest<UserWithoutPassword | undefined>(`/users/${id}`, {
			method: "PATCH",
			body: toFormData(payload),
		});
	},
	delete(id: number) {
		return apiRequest<UserWithoutPassword>(`/users/${id}`, {
			method: "DELETE",
		});
	},
};
