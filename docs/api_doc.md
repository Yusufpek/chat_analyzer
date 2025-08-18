# API Documentation

## 1. Connection API

### Endpoint: `/connection/`

**Method**: `POST`  
**Description**: Creates a new connection for the authenticated user. Ensures that duplicate connections of the same type are not allowed.

#### Authentication

- **Authentication Classes**: `JWTAuthentication`
- **Header**:
  ```
  Authorization: Bearer <access_token>
  ```

#### Request Body

```json
{
  "connection_type": "JotForm",
  "sync_interval": 120,
  "api_key": "your-api-key",
  "config": {
    "key": "value"
  }
}
```

#### Success Response

```json
{
  "content": {
    "id": 1,
    "connection_type": "JotForm",
    "sync_interval": 120,
    "api_key": "your-api-key",
    "config": {
      "key": "value"
    },
    "user": 1,
    "created_at": "2025-08-15T12:00:00Z",
    "modified_at": "2025-08-15T12:00:00Z"
  }
}
```

Status: 201 Created

#### Error Response (Duplicate)

```json
{
  "errors": "Connection already exists."
}
```

Status: 409 Conflict

#### Error Response (Validation)

```json
{
  "errors": {
    "connection_type": ["This field is required."],
    "api_key": ["This field is required."]
  }
}
```

Status: 400 Bad Request

---

### Endpoint: `/connection/`

**Method**: `PUT`  
**Description**: Updates an existing connection for the authenticated user.

#### Authentication

- **Authentication Classes**: `JWTAuthentication`
- **Header**:
  ```
  Authorization: Bearer <access_token>
  ```

#### Request Body

```json
{
  "connection_type": "JotForm",
  "api_key": "your-api-key",
  "sync_interval": 180,
  "config": {
    "key": "new_value"
  }
}
```

#### Success Response

```json
{
  "id": 1,
  "connection_type": "JotForm",
  "sync_interval": 180,
  "api_key": "your-api-key",
  "config": {
    "key": "new_value"
  },
  "user": 1,
  "created_at": "2025-08-15T12:00:00Z",
  "modified_at": "2025-08-15T12:30:00Z"
}
```

Status: 202 Accepted

#### Error Response (Not Found)

```json
{
  "errors": "Connection not found."
}
```

Status: 404 Not Found

#### Error Response (Validation)

```json
{
  "errors": {
    "sync_interval": ["Ensure this value is greater than or equal to 1."]
  }
}
```

Status: 400 Bad Request

---

## 2. Ping API

### Endpoint: `/ping/`

**Method**: `GET`  
**Description**: A simple API endpoint to test the server's responsiveness.

#### Authentication

- **Authentication Classes**: `None`

#### Response

```json
{
  "message": "pong"
}
```

Status: 200 OK

---

## 3. JotForm API Check

### Endpoint: `/jotform-api-check/`

**Method**: `GET`  
**Description**: Checks the connectivity and response of the JotForm API for the authenticated user.

#### Authentication

- **Authentication Classes**: `JWTAuthentication`
- **Header**:
  ```
  Authorization: Bearer <access_token>
  ```

#### Success Response

```json
{
  "message": "JotForm API is reachable",
  "content": {
    "responseCode": 200,
    "message": "success",
    "content": {
      "username": "yusuf55ipek55",
      "name": "Yusuf İpek",
      "email": "yusuf55ipek55@gmail.com",
      "website": null,
      "time_zone": "Europe/Istanbul",
      "account_type": "https://api.jotform.com/system/plan/INTERN",
      "status": "ACTIVE",
      "created_at": "2025-04-14 13:50:05",
      "updated_at": "2025-08-11 01:46:00",
      "region": "US",
      "is_verified": "1",
      "usage": "https://api.jotform.com/user/usage",
      "paymentReusableConnections": "1",
      "new_users_campaign": "1744739405",
      "toolDefaultPrompt": "1",
      "loginToGetSubmissions": "1",
      "loginToViewUploadedFiles": "1",
      "loginToViewSubmissionRSS": "1",
      "showJotFormPowered": "1",
      "defaultTheme": "5e6b428acc8c4e222d1beb91",
      "avatarUrl": "https://lh3.googleusercontent.com/a/ACg8ocLynaCASjmmg7DEMPAJUzRZ0AB_3zsFr48CH3oSvOVpbDvoSQ=s96-c",
      "tablesIntroVideoShown": "Yes",
      "sendTabTextUpdate": "25922",
      "signAIAgentChat": "27862",
      "paddle_enable": "1",
      "noupeAgentID": "0198a7c05a017e45a9a648ec18e2545d4923",
      "isNoupeUser": "1",
      "noupeEmailSentAgentID": "01989df5271475be9088f614bbe69043fe7c",
      "aiAgentBetaUser": "1",
      "AIAgentBetaAccepted": "1",
      "is2FAEnabled": false,
      "disableViewLimits": false,
      "allowDigest": true,
      "allowPrefills": false,
      "allowSign": true,
      "allowWorkflowFeatures": true,
      "allowAutoDeleteSubmissions": true,
      "teamsBetaUser": "1",
      "paymentNewProductManagement": true,
      "allowEncryptionV2": true,
      "allowNewCondition": false,
      "allowConditionsV2": true,
      "isFormBuilderNewShare": false,
      "isInputTableBetaUserEnabled": true,
      "allowMixedListing": true,
      "allowAIAgentFormFiller": true,
      "allowPaymentReusableForEnterprise": false,
      "isNewSMTPFlowEnabled": true,
      "isLabelsAvailableToUse": true
    },
    "duration": "76.83ms",
    "info": null,
    "limit-left": 99999
  }
}
```

Status: 200 OK

#### Error Response

```json
{
  "message": "Error initializing JotForm API service",
  "error": "Some error message"
}
```

Status: 400 Bad Request

---

### Endpoint: `/jotform-api-chat-check/`

**Method**: `GET`  
**Description**: Checks the chat history from JotForm API for a specific agent and chat.

#### Authentication

- **Authentication Classes**: `JWTAuthentication`
- **Permission Classes**: `IsAuthenticated`

#### Request Parameters

- `agent_id` (required)
- `chat_id` (required)

#### Success Response

```json
{
  "message": "JotForm API is reachable",
  "content": {
    "...": "chat history data"
  }
}
```

Status: 200 OK

#### Error Response (Missing Parameters)

```json
{
  "error": "Agent ID is required."
}
```

or

```json
{
  "error": "Chat ID is required."
}
```

Status: 400 Bad Request

#### Error Response (API Error)

```json
{
  "message": "Error initializing JotForm API service",
  "error": "Some error message"
}
```

Status: 400 Bad Request
