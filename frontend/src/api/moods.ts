import type { CreateMoodLogPayload, MoodLog } from "@/types/mood";
import { apiRequest } from "./client";

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
