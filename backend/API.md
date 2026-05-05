# API Documentation

**Base URL:** `/api`  
**Version:** `0.1.0`
**Reference**: [openapi.json](./openapi.json)

---

## 🔐 Authentication
Handle user sessions and identity verification.

| Method | Endpoint | Summary | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register New User | Creates a new account using `email`, `password`, and `contact_number`. |
| `POST` | `/auth/login` | Login User | Authenticates user via form-data. Requires `username`, `password`, and `role`. |
| `GET` | `/auth/decrypt_cookie` | Decrypt Cookie | Retrieves and decrypts the current session cookie. |
| `GET` | `/auth/logout` | Logout User | Ends the current user session. |

---

## 👤 User Management
Manage profile details and account status.

| Method | Endpoint | Summary | Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Get Current User | Returns the profile of the currently authenticated user. |
| `PATCH` | `/users/{id}` | Update User | Updates user fields. **Note**: Email/Username changes trigger logout. |
| `DELETE` | `/users/{id}` | Delete User | Permanently removes the user record by ID. |

---

## 🧠 Mood Tracking
Endpoints for logging and retrieving emotional state data.

*   **GET `/moods`**: Retrieve all mood logs.
*   **POST `/moods`**: Add a new mood log entry.
    *   **Payload**: `valence` (number), `arousal` (number).
*   **GET `/moods/latest`**: Fetch the most recent mood entry.

---

## 💊 Medications
Manage medication lists and daily adherence logs.

### Medication List
*   **GET `/medications`**: List all saved medications.
*   **POST `/medications`**: Add a new medication.
    *   **Units**: Supports `mg`, `g`, `ml`, `tablet`, `capsule`, `puff`, etc.
    *   **Frequency**: Supports `hourly`, `daily`, `before_meal`, `as_needed`, etc.

### Medication Logs
*   **GET `/medications/logs`**: Retrieve history of medication intake.
*   **POST `/medications/logs`**: Log a medication dose taken.
*   **GET `/medications/logs/latest`**: Get the most recent log entry.
*   **GET `/medications/logs/{date}`**: Get logs for a specific timestamp (ISO 8601).

---

## 📄 Export & Documents
*   **GET `/export`**: Generates and provides a PDF export.

---

## 🛠️ Key Schemas

### User Object (`Users`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `email` | string (email) | Primary identifier. |
| `role` | array[string] | `patient` or `professional`. |
| `disabled` | boolean | Account status. |

### Medication Params (`TMedicationParams`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Name of the medication. |
| `frequency` | integer | Number of times per unit. |
| `recommended_dosage` | number | Amount per dose. |

---

> [!WARNING]
> **Validation Errors (422)**  
> Most write operations will return a `422 Unprocessable Entity` if the request body does not strictly adhere to the defined schemas.
