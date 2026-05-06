import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMoodLogPayload } from "@/types/mood";
import { moodsApi } from "../../../api/moods";
import { moodQueryKeys } from "../../../lib/react-query/query-keys";

export function useMoods(enabled: boolean) {
	const queryClient = useQueryClient();
	const moods = useMoodListQuery(enabled);
	const latestMood = useLatestMoodQuery(enabled);

	const createMood = useMutation({
		mutationFn: (payload: CreateMoodLogPayload) => moodsApi.create(payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: moodQueryKeys.list() }),
				queryClient.invalidateQueries({ queryKey: moodQueryKeys.latest() }),
			]);
		},
	});

	return {
		moods: moods.data ?? [],
		latestMood: latestMood.data ?? null,
		error: moods.error,
		isLoading: moods.isLoading,
		createMood,
	};
}

export function useMoodListQuery(enabled = true) {
	return useQuery({
		queryKey: moodQueryKeys.list(),
		queryFn: moodsApi.list,
		enabled,
	});
}

export function useLatestMoodQuery(enabled = true) {
	return useQuery({
		queryKey: moodQueryKeys.latest(),
		queryFn: moodsApi.latest,
		enabled,
	});
}
