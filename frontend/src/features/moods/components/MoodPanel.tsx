import {
	Alert,
	Button,
	Card,
	CardContent,
	Chip,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { CreateMoodLogPayload, MoodLog } from "@/types/mood";

type MoodPanelProps = {
	moods: MoodLog[];
	isDisabled: boolean;
	isLoading: boolean;
	error: Error | null;
	onCreateMood: (payload: CreateMoodLogPayload) => Promise<unknown>;
	isCreatePending: boolean;
	createError: Error | null;
};

const initialMood: CreateMoodLogPayload = {
	valence: 0,
	arousal: 0,
};

export function MoodPanel({
	moods,
	isDisabled,
	isLoading,
	error,
	onCreateMood,
	isCreatePending,
	createError,
}: MoodPanelProps) {
	const { handleSubmit, register, reset } = useForm<CreateMoodLogPayload>({
		defaultValues: initialMood,
	});
	const latestMood = moods.at(-1);
	const average = useMemo(() => {
		if (moods.length === 0) {
			return null;
		}

		const total = moods.reduce(
			(accumulator, mood) => ({
				valence: accumulator.valence + mood.valence,
				arousal: accumulator.arousal + mood.arousal,
			}),
			{ valence: 0, arousal: 0 },
		);

		return {
			valence: total.valence / moods.length,
			arousal: total.arousal / moods.length,
		};
	}, [moods]);

	async function submitMood(payload: CreateMoodLogPayload) {
		await onCreateMood({
			valence: Number(payload.valence),
			arousal: Number(payload.arousal),
		});
		reset(initialMood);
	}

	return (
		<Card variant="outlined">
			<CardContent>
				<Stack
					component="form"
					onSubmit={(event) => void handleSubmit(submitMood)(event)}
					spacing={3}
				>
					<Stack
						direction="row"
						spacing={2}
						sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
					>
						<div>
							<Typography
								color="text.secondary"
								sx={{
									fontSize: 12,
									fontWeight: 700,
									textTransform: "uppercase",
								}}
							>
								Mood Logs
							</Typography>
							<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
								{moods.length} entries
							</Typography>
						</div>
						<Chip
							color={isDisabled ? "default" : error ? "error" : "success"}
							label={
								isDisabled ? "Login needed" : isLoading ? "Loading" : "Ready"
							}
							size="small"
						/>
					</Stack>

					<Stack
						sx={{
							display: "grid",
							gap: 1.5,
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, minmax(0, 1fr))",
							},
						}}
					>
						<Metric label="Latest valence" value={latestMood?.valence} />
						<Metric label="Latest arousal" value={latestMood?.arousal} />
						<Metric label="Avg valence" value={average?.valence} />
						<Metric label="Avg arousal" value={average?.arousal} />
					</Stack>

					{(error || createError) && (
						<Alert severity="error">
							{createError?.message ?? error?.message}
						</Alert>
					)}

					<TextField
						disabled={isDisabled}
						label="Valence"
						slotProps={{ htmlInput: { step: 0.1 } }}
						type="number"
						{...register("valence", { valueAsNumber: true })}
					/>
					<TextField
						disabled={isDisabled}
						label="Arousal"
						slotProps={{ htmlInput: { step: 0.1 } }}
						type="number"
						{...register("arousal", { valueAsNumber: true })}
					/>
					<Button
						disabled={isDisabled || isCreatePending}
						type="submit"
						variant="contained"
					>
						{isCreatePending ? "Saving" : "Add mood"}
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}

function Metric({
	label,
	value,
}: {
	label: string;
	value: number | undefined;
}) {
	return (
		<Stack
			spacing={0.5}
			sx={{
				bgcolor: "action.hover",
				borderRadius: 1,
				minHeight: 78,
				p: 1.5,
			}}
		>
			<Typography color="text.secondary" variant="body2">
				{label}
			</Typography>
			<Typography sx={{ fontWeight: 700 }} variant="h5">
				{value === undefined ? "N/A" : value.toFixed(2)}
			</Typography>
		</Stack>
	);
}
