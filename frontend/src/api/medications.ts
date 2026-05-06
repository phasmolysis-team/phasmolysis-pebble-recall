import type {
	CreateMedicationLogPayload,
	CreateMedicationPayload,
	Medication,
	MedicationLog,
	MedicationLogMatrixPayload,
	MedicationLogWithTimestamp,
} from "@/types/medication";
import { apiRequest } from "./client";

export const medicationsApi = {
	list() {
		return apiRequest<Medication[]>("/medications");
	},
	create(payload: CreateMedicationPayload) {
		return apiRequest<Medication>("/medications", {
			method: "POST",
			body: payload,
		});
	},
	listLogs() {
		return apiRequest<MedicationLogWithTimestamp[]>("/medications/logs");
	},
	latestLog() {
		return apiRequest<MedicationLogWithTimestamp | null>(
			"/medications/logs/latest",
		);
	},
	logsByDate(date: string) {
		return apiRequest<
			MedicationLogWithTimestamp | MedicationLogWithTimestamp[] | null
		>(`/medications/logs/${date}`);
	},
	createLog(payload: CreateMedicationLogPayload) {
		return apiRequest<MedicationLog>("/medications/logs", {
			method: "POST",
			body: payload,
		});
	},
	createSideEffectsMatrix(payload: MedicationLogMatrixPayload) {
		return apiRequest<MedicationLog[]>("/side-effects/new", {
			method: "POST",
			body: payload,
		});
	},
	retrieveSideEffectsMatrix(payload: MedicationLogMatrixPayload) {
		return apiRequest<MedicationLog[]>("/side-effects/retrieve", {
			method: "POST",
			body: payload,
		});
	},
};
