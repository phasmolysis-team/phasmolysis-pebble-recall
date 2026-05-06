import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import { authApi } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import { usersApi } from "../../../api/users";
import {
	authQueryKeys,
	medicationQueryKeys,
	moodQueryKeys,
} from "../../../lib/react-query/query-keys";

export function useAuth() {
	const queryClient = useQueryClient();
	const currentUser = useQuery({
		queryKey: authQueryKeys.currentUser(),
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
			await queryClient.invalidateQueries({
				queryKey: authQueryKeys.currentUser(),
			});
		},
	});

	const logout = useMutation({
		mutationFn: authApi.logout,
		onSettled: async () => {
			queryClient.setQueryData(authQueryKeys.currentUser(), null);
			queryClient.removeQueries({ queryKey: moodQueryKeys.all });
			queryClient.removeQueries({ queryKey: medicationQueryKeys.all });
			await queryClient.invalidateQueries({
				queryKey: authQueryKeys.currentUser(),
			});
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
