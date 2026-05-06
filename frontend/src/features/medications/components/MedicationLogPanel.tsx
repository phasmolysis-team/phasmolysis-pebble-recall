import {
	Alert,
	Button,
	Card,
	CardContent,
	Chip,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import type {
	CreateMedicationLogPayload,
	Medication,
	MedicationLogWithTimestamp,
} from "@/types/medication";

type MedicationLogPanelProps = {
	medications: Medication[];
	logs: MedicationLogWithTimestamp[];
	latestLog: MedicationLogWithTimestamp | null;
	logsError: Error | null;
	latestError: Error | null;
	isLoading: boolean;
	onCreate: (payload: CreateMedicationLogPayload) => Promise<unknown>;
	isCreating: boolean;
	createError: Error | null;
};

const defaultValues: CreateMedicationLogPayload = {
	medication: "",
	side_effects: "",
	custom_date: null,
};

export function MedicationLogPanel({
	medications,
	logs,
	latestLog,
	logsError,
	latestError,
	isLoading,
	onCreate,
	isCreating,
	createError,
}: MedicationLogPanelProps) {
	const { control, handleSubmit, register, reset } =
		useForm<CreateMedicationLogPayload>({
			defaultValues,
		});

	async function submitLog(values: CreateMedicationLogPayload) {
		await onCreate({
			medication: values.medication,
			side_effects: values.side_effects?.trim() || "",
			custom_date: values.custom_date || null,
		});
		reset(defaultValues);
	}

	return (
		<Card variant="outlined">
			<CardContent>
				<Stack
					component="form"
					onSubmit={(event) => void handleSubmit(submitLog)(event)}
					spacing={2.5}
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
								Medication logs
							</Typography>
							<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
								Intake history
							</Typography>
						</div>
						<Chip
							color={logsError || latestError ? "error" : "default"}
							label={isLoading ? "Loading" : `${logs.length} entries`}
							size="small"
						/>
					</Stack>

					{latestLog && (
						<Alert severity="info">
							Latest log: {latestLog.medication_name ?? latestLog.medication_id}{" "}
							at {formatTimestamp(latestLog.timestamp)}
						</Alert>
					)}

					{(logsError || latestError || createError) && (
						<Alert severity="error">
							{createError?.message ??
								logsError?.message ??
								latestError?.message}
						</Alert>
					)}

					<Controller
						control={control}
						name="medication"
						render={({ field }) => (
							<FormControl>
								<InputLabel id="medication-log-select-label">
									Medication
								</InputLabel>
								<Select
									label="Medication"
									labelId="medication-log-select-label"
									{...field}
								>
									{medications.map((medication) => (
										<MenuItem key={medication.id} value={medication.id}>
											{medication.name}
										</MenuItem>
									))}
									<MenuItem value="Custom medication name">
										Custom medication name
									</MenuItem>
								</Select>
							</FormControl>
						)}
					/>
					<TextField
						helperText="Optional note captured as user_noted_side_effects in backend."
						label="Side effects or notes"
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
					<Button disabled={isCreating} type="submit" variant="contained">
						{isCreating ? "Saving log" : "Save log"}
					</Button>

					<Stack spacing={1}>
						{logs.slice(0, 6).map((log) => (
							<Stack
								key={log.id}
								sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}
								spacing={0.5}
							>
								<Typography sx={{ fontWeight: 700 }}>
									{log.medication_name ?? log.medication_id ?? "Medication"}
								</Typography>
								<Typography color="text.secondary" variant="body2">
									{formatTimestamp(log.timestamp)}
								</Typography>
								{log.user_noted_side_effects && (
									<Typography variant="body2">
										{log.user_noted_side_effects}
									</Typography>
								)}
							</Stack>
						))}
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}

function formatTimestamp(timestamp: string) {
	return new Date(timestamp).toLocaleString();
}
