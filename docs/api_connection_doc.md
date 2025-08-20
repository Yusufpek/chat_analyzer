# API Documentation

## 1. Connection API

#### Endpoint: `/api/connection/`

**Method**: `POST`  
**Description**: Creates a new connection for the authenticated user. Ensures that duplicate connections of the same type are not allowed.

**Request Body**:

```json
{
  "connection_type": "jotform",
  "api_key": "your_api_key_here",
  "sync_interval": 30,
  "config": {}
}
```

**Response**:
Success (201 Created)

```json
{
  "status": "CREATED",
  "content": {
    "content": {
      "id": 36,
      "connection_type": "jotform",
      "sync_interval": 120,
      "api_key": "9c8ea5ed045fa003508aeb7d749f3d0a",
      "config": {},
      "created_at": "2025-08-20T06:45:24.336277-05:00",
      "modified_at": "2025-08-20T06:45:24.336297-05:00",
      "user": 1
    }
  },
  "duration": "61.06 ms"
}
```

Error (409 Conflict)

```json
{
  "status": "error",
  "content": {
    "errors": "Connection already exists."
  },
  "duration": "5.899 ms"
}
```

## 2. JotForm Agent API

### Get All Agents

#### Endpoint: `/api/jotform/agents/`

**Method**: `GET`  
**Description**: Fetches all synced and unsynced JotForm agents for the authenticated user.

**Response**:
Success (200 OK)

```json
{
  "status": "SUCCESS",
  "content": {
    "unsynced": [
      {
        "id": "0198994961cd76d0b85cd90122f97215bd53",
        "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_811.png",
        "name": "Jordan: Referral Coordinator",
        "jotform_render_url": null
      }
    ],
    "synced": [
      {
        "id": "0198a7c05a017e45a9a648ec18e2545d4923",
        "avatar_url": null,
        "name": "hu_cs",
        "jotform_render_url": null
      },
      {
        "id": "01989df5271475be9088f614bbe69043fe7c",
        "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_811.png",
        "name": "test_2",
        "jotform_render_url": null
      },
      {
        "id": "01989e1b648077d78a5f89a9a75ec75030c4",
        "avatar_url": null,
        "name": "test_1"
      },
      {
        "id": "0198a30c41187d74a833e8b4f0b413643ff9",
        "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_821.png",
        "name": "Noupe: Noupe",
        "jotform_render_url": ""
      },
      {
        "id": "01989e13c8ff7245a9e77b61bcf744fbd7f5",
        "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_267.png",
        "name": "Lina: Customer Support Agent"
      }
    ]
  },
  "duration": "669.987 ms"
}
```

### Get Synced or Unsynced JotForm Agents

#### Endpoint: `/api/jotform/agents/<option>/`

**Method**: `GET`  
**Description**: Fetches either synced or unsynced JotForm agents based on the provided option for the authenticated user.

**URL Parameters**:

- `option`: Specify `synced` or `unsynced` to filter the agents.

**Response**:
Success (200 OK)

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "id": "0198a7c05a017e45a9a648ec18e2545d4923",
      "avatar_url": null,
      "name": "hu_cs"
    },
    {
      "id": "01989df5271475be9088f614bbe69043fe7c",
      "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_811.png",
      "name": "test_2"
    },
    {
      "id": "01989e1b648077d78a5f89a9a75ec75030c4",
      "avatar_url": null,
      "name": "test_1"
    },
    {
      "id": "0198a30c41187d74a833e8b4f0b413643ff9",
      "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_821.png",
      "name": "Noupe: Noupe"
    },
    {
      "id": "01989e13c8ff7245a9e77b61bcf744fbd7f5",
      "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_267.png",
      "name": "Lina: Customer Support Agent"
    }
  ],
  "duration": "20.227999999999998 ms"
}
```

Error (400 Bad Request)

```json
{
  "status": "error",
  "content": {
    "error": "Invalid option."
  },
  "duration": "0.032 ms"
}
```

## 3. Agent API

### Create Agent

#### Endpoint: `/api/agent/`

**Method**: `POST`  
**Description**: Creates a new agent for the authenticated user.

**Request Body**:

```json
{
  "id": "01989e13c8ff7245a9e77b61bcf744fbd7f5",
  "name": "New Agent",
  "avatar_url": "https://example.com/avatar.png",
  "jotform_render_url": "https://agent.jotform.com/01989e13c8ff7245a9e77b61bcf744fbd7f5"
}
```

**Response**:
Success (201 Created)

```json
{
  "status": "SUCCESS",
  "content": {
    "id": "01989e13c8ff7245a9e77b61bcf744fbd7f5",
    "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_811.png",
    "name": "test_1",
    "jotform_render_url": "https://agent.jotform.com/01989e13c8ff7245a9e77b61bcf744fbd7f5"
  },
  "duration": "36.613 ms"
}
```

Error (400 Bad Request - Agent ID exists)

```json
{
  "status": "error",
  "content": {
    "id": ["Agent with this ID already exists."]
  },
  "duration": "13.799000000000001 ms"
}
```

### Get Agents

#### Endpoint: `/api/agent/`

**Method**: `GET`  
**Description**: Retrieves a list of agents for the authenticated user.

**Response**:
Success (200 OK)

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "id": "7e6d1bda-0504-404e-896d-599bb3116638",
      "avatar_url": "",
      "name": "file_agent"
    },
    {
      "id": "0198a7c05a017e45a9a648ec18e2545d4923",
      "avatar_url": null,
      "name": "hu_cs"
    },
    {
      "id": "0198a30c41187d74a833e8b4f0b413643ff9",
      "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_821.png",
      "name": "Noupe: Noupe"
    },
    {
      "id": "01989e13c8ff7245a9e77b61bcf744fbd7f5",
      "avatar_url": "https://cdn.jotfor.ms/assets/agent-avatars/avatar_icon_267.png",
      "name": "Lina: Customer Support Agent"
    }
  ],
  "duration": "10.354000000000001 ms"
}
```
