import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import { ApiError } from "../../../api/client";
import { authApi, usersApi } from "../../../api/endpoints";

const authQueryKey = ["auth", "current-user"] as const;

export function useAuth() {
	const queryClient = useQueryClient();
	const currentUser = useQuery({
		queryKey: authQueryKey,
		queryFn: async () => {
			try {
				return await usersApi.current();
			} catch (error) {
				if (error instanceof ApiError && error.status === 401) {
					return null;
				}

				throw error;
			}
		},
		retry: false,
	});

	const login = useMutation({
		mutationFn: (payload: LoginPayload) => authApi.login(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authQueryKey });
		},
	});

	const logout = useMutation({
		mutationFn: authApi.logout,
		onSettled: async () => {
			queryClient.setQueryData(authQueryKey, null);
			await queryClient.invalidateQueries({ queryKey: authQueryKey });
		},
	});

	const register = useMutation({
		mutationFn: (payload: RegisterPayload) => authApi.register(payload),
	});

	return {
		user: currentUser.data ?? null,
		error: currentUser.error,
		isLoading: currentUser.isLoading,
		login,
		logout,
		register,
	};
}
