import { useMutation } from "@tanstack/react-query";
import { exportApi } from "../../../api/export";

export function useExportPdf() {
	return useMutation({
		mutationFn: exportApi.pdf,
	});
}
