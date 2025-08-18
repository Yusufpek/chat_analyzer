# Authentication API Documentation

## 1. Login

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

## 2. Token Refresh

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

## 3. Logout

**Endpoint:** `/api/auth/logout/`  
**Method:** `POST`  
**Description:** Logs out the user by invalidating the refresh token.

### Request Body

```json
{
  "refresh": "<refresh_token>",
  "username": "your_username"
}
```

### Response Body

```json
{
  "message": "Logout successful"
}
```

### Error Response

```json
{
  "error": "Invalid token or username"
}
```
