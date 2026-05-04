# API Documentation

## Base URL
```

/api

```

## Authentication Endpoints

### POST /auth/login
**Summary:** Login User  

**Request Body (application/x-www-form-urlencoded):**
- username (string, required)
- password (string, required)
- role (string, required) — enum: `professional | patient`

**Responses:**
- 200: Returns a string (likely token/session info)
- 422: Validation error

---

### GET /auth/decrypt_cookie
**Summary:** Decrypt Cookie  

**Responses:**
- 200: Returns decrypted cookie data

---

### GET /auth/logout
**Summary:** Logout User  

**Responses:**
- 200: Successfully logs out the user

---

### POST /auth/register
**Summary:** Register New User  

**Request Body (application/x-www-form-urlencoded):**
- username (string, optional)
- email (string, required)
- contact_number (string, required)
- professional_license_id (string, optional)
- password (string, required)

**Responses:**
- 201: Returns user object (without password)
- 422: Validation error

---

## User Endpoints

### GET /users
**Summary:** Get Current User  

**Responses:**
- 200: Returns:
  - User object OR
  - null (if not authenticated)

---

### DELETE /users/{id}
**Summary:** Delete User  

**Path Parameters:**
- id (integer, required)

**Responses:**
- 200: Returns deleted user (without password)
- 422: Validation error

---

### PATCH /users/{id}
**Summary:** Update User  

**Path Parameters:**
- id (integer, required)

**Request Body (application/x-www-form-urlencoded):**
- username (string, optional)
- email (string, optional)
- contact_number (string, optional)
- password (string, optional)
- professional_license_id (string, optional)

**Responses:**
- 200: Returns updated user (without password)
- 205: Warning — updating sensitive fields (email/username) logs the user out
- 422: Validation error

---

## Documentation / Export

### GET /export
**Summary:** Give Me PDF  

**Responses:**
- 200: Returns a PDF document

---

## Data Models

### BaseUsers
- username (string, optional)
- email (string, required)
- contact_number (string, required)
- professional_license_id (string, optional)
- password (string, required)

---

### LoginData
- username (string, required)
- password (string, required)
- role (string, required: professional | patient)

---

### UpdateUser
- username (string, optional)
- email (string, optional)
- contact_number (string, optional)
- password (string, optional)
- professional_license_id (string, optional)

---

### UserWithoutPassword
- username (string, optional)
- email (string, required)
- contact_number (string, required)
- professional_license_id (string, optional)

---

### Users
- username (string, optional)
- email (string, required)
- contact_number (string, required)
- professional_license_id (string, optional)
- password (string, required)
- id (integer, optional)
- role (array of string: patient | professional)
- created_at (datetime, required)
- updated_at (datetime, required)
- disabled (boolean, required)

---

### ValidationError
- loc (array)
- msg (string)
- type (string)
- input (any, optional)
- ctx (object, optional)

---

### HTTPValidationError
- detail (array of ValidationError)

