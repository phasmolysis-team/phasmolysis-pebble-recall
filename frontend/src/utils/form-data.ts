type FormValue = string | number | boolean | null | undefined;

export function toFormData(payload: Record<string, FormValue>) {
	const formData = new FormData();

	Object.entries(payload).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			formData.set(key, String(value));
		}
	});

	return formData;
}
