export type MoodLog = {
	id: string;
	user_id: number;
	valence: number;
	arousal: number;
	timestamp: string;
};

export type CreateMoodLogPayload = {
	valence: number;
	arousal: number;
};