export type DosageUnit =
	| "mg"
	| "g"
	| "mcg"
	| "ml"
	| "l"
	| "tbsp"
	| "tsp"
	| "tablet"
	| "capsule"
	| "caplet"
	| "softgel"
	| "patch"
	| "suppository"
	| "meq"
	| "iu"
	| "drop"
	| "spray"
	| "puff";

export type FrequencyUnit =
	| "hourly"
	| "daily"
	| "weekly"
	| "monthly"
	| "before_meal"
	| "with_meal"
	| "after_meal"
	| "on_empty_stomach"
	| "morning"
	| "afternoon"
	| "evening"
	| "bedtime"
	| "as_needed"
	| "during_episode";

export type Medication = {
	id: string;
	name: string;
	frequency: number;
	frequency_unit: FrequencyUnit | string;
	frequency_times_per_unit: number;
	recommended_dosage: number;
	recommended_dosage_unit: DosageUnit | string;
};

export type CreateMedicationPayload = Omit<Medication, "id">;

export type MedicationLog = {
	id: string;
	user_id: number;
	medication_name: string | null;
	medication_id: string | null;
	user_noted_side_effects: string;
};

export type MedicationLogWithTimestamp = MedicationLog & {
	timestamp: string;
};

export type CreateMedicationLogPayload = {
	medication: string;
	side_effects?: string;
	custom_date?: string | null;
};

export type MedicationLogMatrixPayload = {
	medications: string[];
	side_effects?: string;
	custom_date?: string | null;
};

export const DOSAGE_UNITS: DosageUnit[] = [
	"mg",
	"g",
	"mcg",
	"ml",
	"l",
	"tbsp",
	"tsp",
	"tablet",
	"capsule",
	"caplet",
	"softgel",
	"patch",
	"suppository",
	"meq",
	"iu",
	"drop",
	"spray",
	"puff",
];

export const FREQUENCY_UNITS: FrequencyUnit[] = [
	"hourly",
	"daily",
	"weekly",
	"monthly",
	"before_meal",
	"with_meal",
	"after_meal",
	"on_empty_stomach",
	"morning",
	"afternoon",
	"evening",
	"bedtime",
	"as_needed",
	"during_episode",
];
