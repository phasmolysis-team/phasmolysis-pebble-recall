import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateMedicationLogPayload,
	CreateMedicationPayload,
	MedicationLogMatrixPayload,
} from "@/types/medication";
import { medicationsApi } from "../../../api/medications";
import { medicationQueryKeys } from "../../../lib/react-query/query-keys";

export function useMedications(enabled = true) {
	return useQuery({
		queryKey: medicationQueryKeys.list(),
		queryFn: medicationsApi.list,
		enabled,
	});
}

export function useCreateMedication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateMedicationPayload) =>
			medicationsApi.create(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: medicationQueryKeys.list(),
			});
		},
	});
}

export function useMedicationLogs(enabled = true) {
	return useQuery({
		queryKey: medicationQueryKeys.logList(),
		queryFn: medicationsApi.listLogs,
		enabled,
	});
}

export function useLatestMedicationLog(enabled = true) {
	return useQuery({
		queryKey: medicationQueryKeys.logLatest(),
		queryFn: medicationsApi.latestLog,
		enabled,
	});
}

export function useMedicationLogsByDate(date: string | null, enabled = true) {
	return useQuery({
		queryKey: medicationQueryKeys.logByDate(date ?? "unknown"),
		queryFn: () => medicationsApi.logsByDate(date ?? ""),
		enabled: enabled && Boolean(date),
	});
}

export function useCreateMedicationLog() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateMedicationLogPayload) =>
			medicationsApi.createLog(payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: medicationQueryKeys.logList(),
				}),
				queryClient.invalidateQueries({
					queryKey: medicationQueryKeys.logLatest(),
				}),
			]);
		},
	});
}

export function useCreateSideEffectsMatrixLog() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: MedicationLogMatrixPayload) =>
			medicationsApi.createSideEffectsMatrix(payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: medicationQueryKeys.logList(),
				}),
				queryClient.invalidateQueries({
					queryKey: medicationQueryKeys.logLatest(),
				}),
			]);
		},
	});
}

export function useRetrieveSideEffectsMatrix() {
	return useMutation({
		mutationFn: (payload: MedicationLogMatrixPayload) =>
			medicationsApi.retrieveSideEffectsMatrix(payload),
	});
}
