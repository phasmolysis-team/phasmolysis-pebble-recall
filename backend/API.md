# API Documentation

**Base URL:** `/api`  
**Version:** `0.1.0`

---

## 🔐 Authentication
| Method | Endpoint | Summary | Details |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register New User | Payload: `BaseUsers` (Form-data). |
| `POST` | `/auth/login` | Login User | Payload: `LoginData` (Form-data). |
| `GET` | `/auth/decrypt_cookie` | Decrypt Cookie | Returns session data from cookie. |
| `GET` | `/auth/logout` | Logout User | Invalidates session. |

---

## 👤 User Management
| Method | Endpoint | Summary | Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Get Current User | Returns profile (without password). |
| `PATCH` | `/users/{id}` | Update User | **Warning**: Sensitive changes trigger logout. |
| `DELETE` | `/users/{id}` | Delete User | Removes user record by ID. |

---

## 🧠 Mood Tracking
*   **GET `/moods`**: List all mood logs.
*   **POST `/moods`**: Create log (`valence` and `arousal` required).
*   **GET `/moods/latest`**: Fetch most recent entry.

---

## 💊 Medications & Side Effects

### Medication Management
*   **GET `/medications`**: List all saved medications.
*   **POST `/medications`**: Add new medication definition (Dosage/Frequency).

### Individual Medication Logs
*   **GET `/medications/logs`**: List historical logs.
*   **POST `/medications/logs`**: Record specific intake.
    *   **Body**: `medication` (string), `side_effects` (optional), `custom_date` (optional).
*   **GET `/medications/logs/latest`**: Get latest intake record.
*   **GET `/medications/logs/{date}`**: Filter logs by ISO timestamp.

### 🆕 Side Effects & Matrix Logs
These endpoints handle complex logging involving multiple medications and observed side effects.

*   **POST `/side-effects/new`**: Add a matrix log entry.
    *   **Body**: `medications` (array of strings), `side_effects` (string), `custom_date`.
*   **POST `/side-effects/retrieve`**: Retrieve filtered matrix logs based on medication criteria.

---

## 📄 Documents
*   **GET `/export`**: Export health data as a PDF.

---

## 🛠️ Data Models

### Medication Matrix (`MedicationLogsMatrixParams`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `medications` | array[string] | List of meds taken together. |
| `side_effects` | string | Description of symptoms/effects. |
| `custom_date` | datetime \| null | Optional override for log time. |

### Frequency Units (`FreqUnit`)
Enums: `hourly`, `daily`, `weekly`, `monthly`, `before_meal`, `with_meal`, `after_meal`, `on_empty_stomach`, `morning`, `afternoon`, `evening`, `bedtime`, `as_needed`, `during_episode`.

---

> [!TIP]
> All medication log endpoints now support an optional `side_effects` string and a `custom_date` timestamp for back-dating entries.
