export type UserRole = "patient" | "professional";

export type User = {
	id?: number;
	username: string | null;
	email: string;
	contact_number: string;
	professional_license_id: string | null;
	role?: UserRole[];
	created_at?: string;
	updated_at?: string;
	disabled?: boolean;
};

export type UserWithoutPassword = Pick<
	User,
	"username" | "email" | "contact_number" | "professional_license_id"
>;

export type LoginPayload = {
	username: string;
	password: string;
	role: UserRole;
};

export type RegisterPayload = {
	username?: string;
	email: string;
	contact_number: string;
	professional_license_id?: string;
	password: string;
};

export type UpdateUserPayload = Partial<RegisterPayload>;
