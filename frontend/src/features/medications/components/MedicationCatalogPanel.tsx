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
import type { CreateMedicationPayload, Medication } from "@/types/medication";
import { DOSAGE_UNITS, FREQUENCY_UNITS } from "@/types/medication";

type MedicationCatalogPanelProps = {
	medications: Medication[];
	isLoading: boolean;
	error: Error | null;
	onCreate: (payload: CreateMedicationPayload) => Promise<unknown>;
	isCreating: boolean;
	createError: Error | null;
};

const defaultValues: CreateMedicationPayload = {
	name: "",
	frequency: 1,
	frequency_unit: "daily",
	frequency_times_per_unit: 1,
	recommended_dosage: 1,
	recommended_dosage_unit: "tablet",
};

export function MedicationCatalogPanel({
	medications,
	isLoading,
	error,
	onCreate,
	isCreating,
	createError,
}: MedicationCatalogPanelProps) {
	const { control, handleSubmit, register, reset } =
		useForm<CreateMedicationPayload>({
			defaultValues,
		});

	async function submitMedication(values: CreateMedicationPayload) {
		await onCreate({
			...values,
			frequency: Number(values.frequency),
			frequency_times_per_unit: Number(values.frequency_times_per_unit),
			recommended_dosage: Number(values.recommended_dosage),
		});
		reset(defaultValues);
	}

	return (
		<Card variant="outlined">
			<CardContent>
				<Stack
					component="form"
					onSubmit={(event) => void handleSubmit(submitMedication)(event)}
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
								Medications
							</Typography>
							<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
								Catalog
							</Typography>
						</div>
						<Chip
							color={error ? "error" : "default"}
							label={isLoading ? "Loading" : `${medications.length} saved`}
							size="small"
						/>
					</Stack>

					{(error || createError) && (
						<Alert severity="error">
							{createError?.message ?? error?.message}
						</Alert>
					)}

					<TextField label="Medication name" {...register("name")} />
					<TextField
						label="Frequency interval"
						type="number"
						{...register("frequency", { valueAsNumber: true })}
					/>
					<Controller
						control={control}
						name="frequency_unit"
						render={({ field }) => (
							<FormControl>
								<InputLabel id="frequency-unit-label">
									Frequency unit
								</InputLabel>
								<Select
									label="Frequency unit"
									labelId="frequency-unit-label"
									{...field}
								>
									{FREQUENCY_UNITS.map((unit) => (
										<MenuItem key={unit} value={unit}>
											{unit}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}
					/>
					<TextField
						label="Times per unit"
						type="number"
						{...register("frequency_times_per_unit", { valueAsNumber: true })}
					/>
					<TextField
						label="Recommended dosage"
						type="number"
						{...register("recommended_dosage", { valueAsNumber: true })}
					/>
					<Controller
						control={control}
						name="recommended_dosage_unit"
						render={({ field }) => (
							<FormControl>
								<InputLabel id="dosage-unit-label">Dosage unit</InputLabel>
								<Select
									label="Dosage unit"
									labelId="dosage-unit-label"
									{...field}
								>
									{DOSAGE_UNITS.map((unit) => (
										<MenuItem key={unit} value={unit}>
											{unit}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}
					/>

					<Button disabled={isCreating} type="submit" variant="contained">
						{isCreating ? "Saving medication" : "Save medication"}
					</Button>

					<Stack spacing={1}>
						{medications.slice(0, 5).map((medication) => (
							<Stack
								key={medication.id}
								direction="row"
								sx={{
									bgcolor: "action.hover",
									borderRadius: 1,
									justifyContent: "space-between",
									p: 1.5,
								}}
							>
								<div>
									<Typography sx={{ fontWeight: 700 }}>
										{medication.name}
									</Typography>
									<Typography color="text.secondary" variant="body2">
										{medication.recommended_dosage}{" "}
										{medication.recommended_dosage_unit}
									</Typography>
								</div>
								<Typography color="text.secondary" variant="body2">
									{medication.frequency_times_per_unit}x{" "}
									{medication.frequency_unit}
								</Typography>
							</Stack>
						))}
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}
