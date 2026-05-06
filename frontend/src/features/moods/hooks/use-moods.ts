import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMoodLogPayload } from "@/types/mood";
import { moodsApi } from "../../../api/endpoints";

const moodsQueryKey = ["moods"] as const;

export function useMoods(enabled: boolean) {
	const queryClient = useQueryClient();
	const moods = useQuery({
		queryKey: moodsQueryKey,
		queryFn: moodsApi.list,
		enabled,
	});

	const createMood = useMutation({
		mutationFn: (payload: CreateMoodLogPayload) => moodsApi.create(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: moodsQueryKey });
		},
	});

	return {
		moods: moods.data ?? [],
		error: moods.error,
		isLoading: moods.isLoading,
		createMood,
	};
}
