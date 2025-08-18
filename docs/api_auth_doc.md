# Authentication API Documentation

## 1. Register

**Endpoint:** `/api/auth/register/`  
**Method:** `POST`  
**Description:** Registers a new user and returns JWT access and refresh tokens.

### Request Body

```json
{
  "username": "your_username",
  "password": "your_password",
  "email": "your_email@example.com",
  "first_name": "YourFirstName",
  "last_name": "YourLastName"
}
```

### Response Body

```json
{
  "content": {
    "pk": 1,
    "username": "your_username",
    "email": "your_email@example.com",
    "first_name": "YourFirstName",
    "last_name": "YourLastName",
    "profile_image": null,
    "tokens": {
      "refresh": "<refresh_token>",
      "access": "<access_token>"
    }
  }
}
```

### Error Response

```json
{
  "error": "Validation error details"
}
```

---

## 2. Login

**Endpoint:** `/api/auth/login/`  
**Method:** `POST`  
**Description:** Authenticates a user and returns JWT access and refresh tokens.

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
  "refresh": "<refresh_token>",
  "access": "<access_token>"
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
**Method:** `POST`  
**Description:** Returns a new access token by using a valid refresh token.

### Request Body

```json
{
  "refresh": "<refresh_token>"
}
```

### Response Body

```json
{
  "access": "<new_access_token>"
}
```

### Error Response

```json
{
  "error": "Token is invalid or expired"
}
```

---

## 4. Logout

**Endpoint:** `/api/auth/logout/`  
**Method:** `POST`  
**Description:** Logs out the user by invalidating the refresh token.

### Request Body

```json
{
  "refresh_token": "<refresh_token>"
}
```

### Response Body

```json
{
  "detail": "Successfully logged out."
}
```

### Error Response

```json
{
  "error": "Refresh token required."
}
```

or

```json
{
  "error": "Invalid or expired refresh token."
}
```
