# Conversation API Documentation

## Endpoints

---

### 1. List Conversations

**Endpoint:** `/api/chat/conversations/`  
**Method:** `GET`  
**Authentication:** Required (JWT Bearer Token)

**Description:**  
Returns a list of conversations belonging to the authenticated user.

**Request Example:**

```bash
curl -X GET http://localhost:8808/api/chat/conversations/ \
  -H "Authorization: Bearer <access_token>"
```

**Response Example:**

```json
[
  {
    "id": "abc123",
    "created_at": "2025-08-18T10:00:00Z",
    "assistant_avatar_url": "https://example.com/avatar.png",
    "source": "JotForm",
    "chat_type": "support",
    "status": "active",
    "agent_id": "agent42",
    "last_message": {
      "id": "msg789",
      "content": "Hello!",
      "created_at": "2025-08-18T10:05:00Z",
      "sender_type": "user",
      "conversation": "abc123"
    }
  }
]
```

### 2. Conversation Details

**Endpoint:** `/api/chat/conversation/<conversation_id>/`
**Method:** `GET`
**Authentication:** Required (JWT Bearer Token)

**Description:**
Returns details of a specific conversation, including its last message.

**Request Example:**

```bash
curl -X GET http://localhost:8808/api/chat/conversation/abc123/ \
  -H "Authorization: Bearer <access_token>"
```

```json
{
  "id": "abc123",
  "created_at": "2025-08-18T10:00:00Z",
  "assistant_avatar_url": "https://example.com/avatar.png",
  "source": "JotForm",
  "chat_type": "support",
  "status": "active",
  "agent_id": "agent42",
  "last_message": {
    "id": "msg789",
    "content": "Hello!",
    "created_at": "2025-08-18T10:05:00Z",
    "sender_type": "user",
    "conversation": "abc123"
  }
}
```

### 3. Conversation Messages

**Endpoint:** `/api/chat/conversation/<conversation_id>/messages/`
**Method:** `GET`
**Authentication:** Required (JWT Bearer Token)

**Request Example:**

```bash
curl -X GET http://localhost:8808/api/chat/conversation/abc123/messages/ \
  -H "Authorization: Bearer <access_token>"
```

**Response Example:**

```json
[
  {
    "id": "msg789",
    "content": "Hello!",
    "created_at": "2025-08-18T10:05:00Z",
    "sender_type": "user",
    "conversation": "abc123"
  },
  {
    "id": "msg790",
    "content": "Hi, how can I help you?",
    "created_at": "2025-08-18T10:06:00Z",
    "sender_type": "assistant",
    "conversation": "abc123"
  }
]
```
