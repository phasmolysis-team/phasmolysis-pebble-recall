import type {
	LoginPayload,
	RegisterPayload,
	UpdateUserPayload,
	User,
	UserWithoutPassword,
} from "@/types/auth";
import type { CreateMoodLogPayload, MoodLog } from "@/types/mood";
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

export const moodsApi = {
	list() {
		return apiRequest<MoodLog[]>("/moods");
	},
	latest() {
		return apiRequest<MoodLog | null>("/moods/latest");
	},
	create(payload: CreateMoodLogPayload) {
		return apiRequest<MoodLog>("/moods", {
			method: "POST",
			body: payload,
		});
	},
};

export const exportApi = {
	pdf() {
		return apiRequest<Blob>("/export");
	},
};
