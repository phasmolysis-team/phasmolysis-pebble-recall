import {
	Alert,
	Button,
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type {
	Medication,
	MedicationLog,
	MedicationLogMatrixPayload,
} from "@/types/medication";

type SideEffectsPanelProps = {
	medications: Medication[];
	onCreate: (payload: MedicationLogMatrixPayload) => Promise<unknown>;
	onRetrieve: (payload: MedicationLogMatrixPayload) => Promise<unknown>;
	isCreating: boolean;
	isRetrieving: boolean;
	createError: Error | null;
	retrieveError: Error | null;
	retrievedLogs: MedicationLog[] | undefined;
};

type SideEffectsFormValues = {
	medications: string;
	side_effects: string;
	custom_date: string;
};

const defaultValues: SideEffectsFormValues = {
	medications: "",
	side_effects: "",
	custom_date: "",
};

export function SideEffectsPanel({
	medications,
	onCreate,
	onRetrieve,
	isCreating,
	isRetrieving,
	createError,
	retrieveError,
	retrievedLogs,
}: SideEffectsPanelProps) {
	const { handleSubmit, register, watch } = useForm<SideEffectsFormValues>({
		defaultValues,
	});
	const medicationHint = useMemo(
		() =>
			medications
				.slice(0, 4)
				.map((item) => item.name)
				.join(", "),
		[medications],
	);
	const typedMedications = watch("medications");

	function buildPayload(
		values: SideEffectsFormValues,
	): MedicationLogMatrixPayload {
		return {
			medications: values.medications
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean),
			side_effects: values.side_effects.trim(),
			custom_date: values.custom_date || null,
		};
	}

	return (
		<Card variant="outlined">
			<CardContent>
				<Stack
					component="form"
					onSubmit={(event) => event.preventDefault()}
					spacing={2.5}
				>
					<div>
						<Typography
							color="text.secondary"
							sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
						>
							Side-effects matrix
						</Typography>
						<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
							Group medication analysis
						</Typography>
					</div>

					{(createError || retrieveError) && (
						<Alert severity="error">
							{createError?.message ?? retrieveError?.message}
						</Alert>
					)}

					<TextField
						helperText={
							medicationHint
								? `Comma-separated medication ids or names. Recent catalog: ${medicationHint}`
								: "Comma-separated medication ids or names."
						}
						label="Medications"
						placeholder="medication-id-1, medication-id-2"
						{...register("medications")}
					/>
					<TextField
						label="Observed side effects"
						multiline
						minRows={2}
						{...register("side_effects")}
					/>
					<TextField
						label="Custom date"
						slotProps={{ inputLabel: { shrink: true } }}
						type="datetime-local"
						{...register("custom_date")}
					/>
					<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
						<Button
							disabled={isCreating || !typedMedications.trim()}
							onClick={() =>
								void handleSubmit(async (values) =>
									onCreate(buildPayload(values)),
								)()
							}
							type="button"
							variant="contained"
						>
							{isCreating ? "Saving matrix" : "Save matrix log"}
						</Button>
						<Button
							disabled={isRetrieving || !typedMedications.trim()}
							onClick={() =>
								void handleSubmit(async (values) =>
									onRetrieve(buildPayload(values)),
								)()
							}
							type="button"
							variant="outlined"
						>
							{isRetrieving ? "Searching" : "Retrieve matches"}
						</Button>
					</Stack>

					{retrievedLogs && (
						<Stack spacing={1}>
							{retrievedLogs.length === 0 ? (
								<Alert severity="info">
									No matching side-effect logs found.
								</Alert>
							) : (
								retrievedLogs.slice(0, 6).map((log) => (
									<Stack
										key={log.id}
										sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}
										spacing={0.5}
									>
										<Typography sx={{ fontWeight: 700 }}>
											{log.medication_name ?? log.medication_id ?? "Medication"}
										</Typography>
										<Typography variant="body2">
											{log.user_noted_side_effects || "No noted side effects."}
										</Typography>
									</Stack>
								))
							)}
						</Stack>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}
