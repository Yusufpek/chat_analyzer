# Conversation API Documentation

## Endpoints

---

### 1. List Conversations

**Endpoint:** `/api/chat/conversations/` <br>
**Method:** `GET` <br>
**Authentication:** Required (Login with tokens in cookies) <br>
**Description:**  
Returns a list of conversations belonging to the authenticated user.

**Request Example:**

```bash
curl -X GET http://localhost:8808/api/chat/conversations/
```

**Response Example:**

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "id": "0198d0b7c47b7e9391fb48c3c2bc51f80e95",
      "created_at": "2025-08-22T00:39:28Z",
      "source": "jotform",
      "chat_type": "ai2u",
      "status": "active",
      "agent_id": "01989df5271475be9088f614bbe69043fe7c",
      "last_message": "Hacettepe Kariyer Fuarı'nda yer alan bazı firmalar şunlardır: Onur Yüksek Teknoloji A.Ş., Alapala ve Anadolu Sigorta. Etkinlikte 150'den fazla firma yer almakta ve farklı sektörlerden birçok şirket katılmaktadır."
    },
    {
      "id": "0198c7edd38e709397fca383332dde0853cd",
      "created_at": "2025-08-20T07:41:59Z",
      "source": "jotform",
      "chat_type": "ai2u",
      "status": "active",
      "agent_id": "0198994961cd76d0b85cd90122f97215bd53",
      "last_message": "thanks"
    }
  ],
  "duration": "16.832 ms"
}
```

### 2. Conversation Details

**Endpoint:** `/api/chat/conversation/<conversation_id>/` <br>
**Method:** `GET` <br>
**Authentication:** Required (Login with tokens in cookies) <br>
**Description:**
Returns details of a specific conversation, including its last message.

**Request Example:**

```bash
curl -X GET http://localhost:8808/api/chat/conversation/0198d0b7c47b7e9391fb48c3c2bc51f80e95/
```

```json
{
  "status": "SUCCESS",
  "content": {
    "id": "0198d0b7c47b7e9391fb48c3c2bc51f80e95",
    "created_at": "2025-08-22T00:39:28Z",
    "source": "jotform",
    "chat_type": "ai2u",
    "status": "active",
    "agent_id": "01989df5271475be9088f614bbe69043fe7c",
    "last_message": {
      "id": "0198d0b825727c3992f0bcea73593e4e598c",
      "content": "Hacettepe Kariyer Fuarı'nda yer alan bazı firmalar şunlardır: Onur Yüksek Teknoloji A.Ş., Alapala ve Anadolu Sigorta. Etkinlikte 150'den fazla firma yer almakta ve farklı sektörlerden birçok şirket katılmaktadır.",
      "created_at": "2025-08-22T03:39:45.907200+03:00",
      "sender_type": "assistant",
      "conversation": "0198d0b7c47b7e9391fb48c3c2bc51f80e95"
    }
  },
  "duration": "19.128 ms"
}
```

### 3. Conversation Messages

**Endpoint:** `/api/chat/conversation/<conversation_id>/messages/` <br>
**Method:** `GET` <br>
**Authentication:** Required (Login with tokens in cookies) <br>
**Description:**  
Retrieves all messages within a specific conversation, including both user and assistant messages, in chronological order. Useful for displaying the full chat history for a given conversation.

**Request Example:**

```bash
curl -X GET http://localhost:8808/api/chat/conversation/0198d0b7c47b7e9391fb48c3c2bc51f80e95/messages/
```

**Response Example:**

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "id": "0198d0b7cd9470f9be8b176243a902cf5af0",
      "content": "Merhaba! 👋 Ben **Noupe**. Size yardımcı olmak için buradayım. Hacettepe Kariyer Fuarı hakkında bilgi verebilirim. Size nasıl yardımcı olabilirim?",
      "created_at": "2025-08-22T03:39:23.412400+03:00",
      "sender_type": "assistant",
      "conversation": "0198d0b7c47b7e9391fb48c3c2bc51f80e95"
    },
    {
      "id": "0198d0b7e49278dd81fa951170d7a85b7f04",
      "content": "hukf nedir",
      "created_at": "2025-08-22T03:39:29.298800+03:00",
      "sender_type": "user",
      "conversation": "0198d0b7c47b7e9391fb48c3c2bc51f80e95"
    },
    {
      "id": "0198d0b7efd9747ebfbaa79382139aba6aea",
      "content": "HUKF, Hacettepe Üniversitesi Kariyer Fuarı'nın kısaltmasıdır ve Türkiye'nin en büyük üniversite kariyer fuarıdır. Her yıl sektör lideri firmalar ve üst düzey yöneticilerle öğrencileri buluşturarak staj ve iş imkanları sunar.",
      "created_at": "2025-08-22T03:39:32.185600+03:00",
      "sender_type": "assistant",
      "conversation": "0198d0b7c47b7e9391fb48c3c2bc51f80e95"
    },
    {
      "id": "0198d0b81c957028b419bb6a0b3b5bfe61f2",
      "content": "birkaç firma sayarmısın",
      "created_at": "2025-08-22T03:39:43.637400+03:00",
      "sender_type": "user",
      "conversation": "0198d0b7c47b7e9391fb48c3c2bc51f80e95"
    },
    {
      "id": "0198d0b825727c3992f0bcea73593e4e598c",
      "content": "Hacettepe Kariyer Fuarı'nda yer alan bazı firmalar şunlardır: Onur Yüksek Teknoloji A.Ş., Alapala ve Anadolu Sigorta. Etkinlikte 150'den fazla firma yer almakta ve farklı sektörlerden birçok şirket katılmaktadır.",
      "created_at": "2025-08-22T03:39:45.907200+03:00",
      "sender_type": "assistant",
      "conversation": "0198d0b7c47b7e9391fb48c3c2bc51f80e95"
    }
  ],
  "duration": "12.478 ms"
}
```
