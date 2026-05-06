import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
	Alert,
	Button,
	Card,
	CardContent,
	Stack,
	Typography,
} from "@mui/material";

type ExportPanelProps = {
	onExport: () => Promise<void>;
	isExporting: boolean;
	error: Error | null;
};

export function ExportPanel({
	onExport,
	isExporting,
	error,
}: ExportPanelProps) {
	return (
		<Card variant="outlined">
			<CardContent>
				<Stack spacing={2.5}>
					<div>
						<Typography
							color="text.secondary"
							sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
						>
							Documents
						</Typography>
						<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
							Export PDF
						</Typography>
					</div>

					<Typography color="text.secondary">
						Download the backend-generated PDF export for the current user.
					</Typography>

					{error && <Alert severity="error">{error.message}</Alert>}

					<Button
						disabled={isExporting}
						onClick={() => void onExport()}
						startIcon={<FileDownloadOutlinedIcon />}
						type="button"
						variant="contained"
					>
						{isExporting ? "Preparing export" : "Download PDF"}
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}
