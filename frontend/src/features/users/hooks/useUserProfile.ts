import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserPayload } from "@/types/auth";
import { usersApi } from "../../../api/users";
import { authQueryKeys } from "../../../lib/react-query/query-keys";

export function useUpdateUserProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
			usersApi.update(id, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: authQueryKeys.currentUser(),
			});
		},
	});
}

export function useDeleteUserProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => usersApi.delete(id),
		onSuccess: async () => {
			queryClient.setQueryData(authQueryKeys.currentUser(), null);
			await queryClient.invalidateQueries({
				queryKey: authQueryKeys.currentUser(),
			});
		},
	});
}
