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
import { useForm } from "react-hook-form";
import type { UpdateUserPayload, User } from "@/types/auth";

type ProfilePanelProps = {
	user: User;
	onUpdate: (payload: UpdateUserPayload) => Promise<unknown>;
	onDelete: () => Promise<unknown>;
	isUpdating: boolean;
	isDeleting: boolean;
	updateError: Error | null;
	deleteError: Error | null;
};

type ProfileFormValues = {
	username: string;
	email: string;
	contact_number: string;
	professional_license_id: string;
	password: string;
};

export function ProfilePanel({
	user,
	onUpdate,
	onDelete,
	isUpdating,
	isDeleting,
	updateError,
	deleteError,
}: ProfilePanelProps) {
	const { handleSubmit, register } = useForm<ProfileFormValues>({
		defaultValues: {
			username: user.username ?? "",
			email: user.email,
			contact_number: user.contact_number,
			professional_license_id: user.professional_license_id ?? "",
			password: "",
		},
	});

	async function submitProfile(values: ProfileFormValues) {
		await onUpdate({
			username: values.username?.trim() || undefined,
			email: values.email,
			contact_number: values.contact_number,
			professional_license_id:
				values.professional_license_id?.trim() || undefined,
			password: values.password?.trim() || undefined,
		});
	}

	return (
		<Card variant="outlined">
			<CardContent>
				<Stack
					component="form"
					onSubmit={(event) => void handleSubmit(submitProfile)(event)}
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
								Profile
							</Typography>
							<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
								Account settings
							</Typography>
						</div>
						<Chip
							color={
								user.role?.includes("professional") ? "secondary" : "primary"
							}
							label={user.role?.join(", ") ?? "user"}
							size="small"
						/>
					</Stack>

					{(updateError || deleteError) && (
						<Alert severity="error">
							{updateError?.message ?? deleteError?.message}
						</Alert>
					)}

					<TextField label="Username" {...register("username")} />
					<TextField label="Email" type="email" {...register("email")} />
					<TextField label="Contact number" {...register("contact_number")} />
					<TextField
						label="Professional license ID"
						{...register("professional_license_id")}
					/>
					<TextField
						helperText="Leave blank to keep your current password."
						label="New password"
						type="password"
						{...register("password")}
					/>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
						<Button disabled={isUpdating} type="submit" variant="contained">
							{isUpdating ? "Saving profile" : "Save profile"}
						</Button>
						<Button
							color="error"
							disabled={isDeleting}
							onClick={() => void onDelete()}
							type="button"
							variant="outlined"
						>
							{isDeleting ? "Deleting account" : "Delete account"}
						</Button>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}
