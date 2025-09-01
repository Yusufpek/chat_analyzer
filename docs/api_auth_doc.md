# Authentication API Documentation

## 1. Register

**Endpoint:** `/api/auth/register/`  
**Description:** Registers a new user, returns user information, and sets JWT access and refresh tokens in cookies.

### Request Body

```json
{
  "username": "your_username",
  "password": "your_password",
  "email": "your_email@gmail.com",
  "first_name": "YourFirstName",
  "last_name": "YourLastName"
}
```

### Response Body

```json
{
  "status": "SUCCESS",
  "content": {
    "pk": 18,
    "username": "your_username",
    "email": "your_mail@gmail.com",
    "first_name": "YourFirstName",
    "last_name": "YourLastName",
    "profile_image": null
  },
  "duration": "492.834 ms"
}
```

### Error Response (400)

```json
{
  "username": ["A user with that username already exists."]
}
```

---

## 2. Login

**Endpoint:** `/api/auth/login/`  
**Description:** Authenticates a user, returns username, and sets JWT access and refresh tokens in cookies.

### Request Body

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### Response Body

```json
{
  "status": "SUCCESS",
  "content": {
    "username": "admin"
  },
  "duration": "701.416 ms"
}
```

### Error Response

```json
{
  "error": "No active account found with the given credentials"
}
```

---

## 3. Token Refresh

**Endpoint:** `/api/auth/refresh/`  
**Authentication:** Required (Login with tokens in cookies) <br>
**Description:** Generates new access and refresh tokens using the refresh token stored in cookies. The new tokens are saved to cookies automatically.

### Response Body

```json
{
  "status": "SUCCESS",
  "content": {
    "message": "Tokens refreshed successfully."
  },
  "duration": "46.343 ms"
}
```

### Error Response (401)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 4. Logout

**Endpoint:** `/api/auth/logout/`  
**Method:** `POST`  
**Authentication:** Required (Login with tokens in cookies) <br>
**Description:** Logs out the user by invalidating the refresh token.

### Response Body

```json
{
  "status": "SUCCESS",
  "content": {
    "detail": "Successfully logged out."
  },
  "duration": "120.26 ms"
}
```

### Error Response (401)

```json
{
  "detail": "Authentication credentials were not provided."
}
```
