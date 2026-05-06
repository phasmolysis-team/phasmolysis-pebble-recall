import type { ApiErrorBody } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type RequestOptions = Omit<RequestInit, "body"> & {
	body?: BodyInit | Record<string, unknown>;
};

export class ApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

async function parseError(response: Response) {
	const contentType = response.headers.get("content-type") ?? "";

	if (!contentType.includes("application/json")) {
		return response.statusText || "Request failed";
	}

	const body = (await response.json()) as ApiErrorBody;

	if (typeof body.detail === "string") {
		return body.detail;
	}

	if (Array.isArray(body.detail)) {
		return body.detail.map((item) => item.msg).join(", ");
	}

	return response.statusText || "Request failed";
}

export async function apiRequest<T>(
	path: string,
	{ headers, body, ...options }: RequestOptions = {},
): Promise<T> {
	const requestHeaders = new Headers(headers);
	const isFormData = body instanceof FormData;

	let requestBody = body as BodyInit | undefined;
	if (body && !isFormData && typeof body === "object") {
		requestHeaders.set("content-type", "application/json");
		requestBody = JSON.stringify(body);
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		credentials: "include",
		headers: requestHeaders,
		body: requestBody,
		...options,
	});

	if (!response.ok) {
		throw new ApiError(await parseError(response), response.status);
	}

	if (response.status === 204 || response.status === 205) {
		return undefined as T;
	}

	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes("application/pdf")) {
		return (await response.blob()) as T;
	}

	if (contentType.includes("application/json")) {
		return (await response.json()) as T;
	}

	return (await response.text()) as T;
}
