# Analyze API Documentation

## 1. Search API

**Endpoint**: `/api/analyze/qdrant_search/` <br>
**Method**: `POST` <br>
**Authentication:** Required (Login with tokens in cookies) <br>
**Description**: Searches for messages in Qdrant for a specific agent based on the provided query.

**Request Body**:

```json
{
  "agent_id": "agent_id_here",
  "query": "your_query_here"
}
```

**Response**:
Success (200 OK)

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "version": 0,
      "score": 0.592464,
      "payload": {
        "content": "akademik kadro ile ilgili biraz bilgi verir misin",
        "sender_type": "user"
      },
      "conversation_id": "0198e66a1628755c8ef4c6d0549c9c47ee2c"
    },
    {
      "version": 0,
      "score": 0.5401845,
      "payload": {
        "content": "kaç akademisyen var",
        "sender_type": "user"
      },
      "conversation_id": "0198e66a1628755c8ef4c6d0549c9c47ee2c"
    }
  ],
  "duration": "1130.355 ms"
}
```

Error (404)

```json
{
  "status": "error",
  "content": {
    "error": "Agent not found"
  },
  "duration": "19.789 ms"
}
```

Error (500)

```json
{
  "status": "error",
  "content": {
    "error": "An error occurred while searching in Qdrant"
  },
  "duration": "19.789 ms"
}
```

---

## 2. Grouped Messages API

**Endpoint**: `/api/analyze/qdrant_grouped/<agent_id` <br>
**Method**: `GET` <br>
**Authentication:** Required (Login with tokens in cookies) <br>
**Description**: Retrieves grouped messages for a specific agent. If grouped messages are not already cached, they are fetched from Qdrant and stored in the database.

---

Path Parameters:

- `agent_id`: The ID of the agent whose grouped messages are to be retrieved.

---

**Success (200 OK):**

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "ids": [
        "0198995fa5827f47a8cffa2e4e1dd237e037",
        "0198995f9a837f53ba65ac67a567a5ed7828",
        "0198c7edfd14746293e72864a53872114060",
        "01989951f3db7343a160ee88f686e7eb1c5d",
        "019899541a0a75db84997e343001460ea321",
        "0198995e40d17e318d6886696c73a0cd74a5",
        "0198995f3ec9772f8f65a604ce7accae80e7",
        "0198994acd5d7cb48822f423ff49ff8fdcf0",
        "0198995f2f687a7ebcab7a9ed2d7bc319d42",
        "0198c7ee0aa2729fa0449c59f64861c74bcb",
        "0198995e31287a0c9e25a9bf5875c52af184"
      ],
      "payloads": [
        "Refer a freelance software engineer",
        "Refer a freelance software engineer",
        "Learn about freelancer referrals",
        "i want refer a freelancer friend, he is working in backend",
        "freelancer@example.com",
        "Learn about freelance referrals",
        "Refer a freelance softwate engineer",
        "Refer a freelancer",
        "Refer a freelance softwate engineer",
        "Learn about freelancer referrals",
        "Learn about freelance referrals"
      ],
      "total_score": 75.47143865999999
    },
    {
      "ids": [
        "0198995fb39279c2a9aa6b9c0986e19c00c0",
        "0198995f6cc27b47ae064db7a7f31ea5bd59",
        "0198995fc17d72fdb079a3e54695a7155290",
        "0198995f7aa574e19cb6d50ae64db81fa82b",
        "01989957d9f17befad1e36e05aab996dcbd5"
      ],
      "payloads": [
        "Fill Form Manually",
        "Fill Form Manually",
        "Fill Form Manually",
        "Fill Form Manually",
        "what is this form for"
      ],
      "total_score": 16.1533092
    }
  ],
  "duration": "17.095 ms"
}
```

**Error (404):**

```json
{
  "status": "error",
  "content": {
    "error": "Agent not found"
  },
  "duration": "14.525 ms"
}
```
