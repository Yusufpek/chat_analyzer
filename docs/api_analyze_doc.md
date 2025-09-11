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
        "0198c277def771c2a91f595bddb244d69011",
        "0198c27827ca7dbe919d8df9084617378fbe",
        "0198c270e8647d95a0fae1670612fff9566b",
        "0198c2775c517c399065432f828bfb3db4aa",
        "0198c276fd797035858f57af6386051fb326",
        "0198c335683b7316a16ef5d40149f7727ee6"
      ],
      "type": "chat",
      "overview": "content inquiry",
      "payloads": [
        "Learn more about the content",
        "Learn more about the content",
        "Learn more about the content",
        "care amaçlı seçeneklerimi öğrenmek istiyorum",
        "içeriği daha iyi öğrenmek istiyorum",
        "Learn more about the content"
      ],
      "total_score": 17.294970139999997,
      "conversation_ids": [
        "0198c276431c7b0284ffb1314ef339c21716",
        "0198c2781c117e6eac64187481e69bfcfc1d",
        "0198c270b64374149ddcbd90be76c7d57e6a",
        "0198c276431c7b0284ffb1314ef339c21716",
        "0198c276431c7b0284ffb1314ef339c21716",
        "0198c3355ae07624b066c2580568e9604bea"
      ]
    },
    {
      "ids": [
        "0198c27126e5765a89300312b5c3e4aeff42",
        "0198c271c9b47dceba115fa8cc65447f093a"
      ],
      "type": "chat",
      "overview": "School decision dilemma",
      "payloads": [
        "i cant decide if i go to school or not",
        "if i go to scholl i may be broke"
      ],
      "total_score": 1.1211042,
      "conversation_ids": [
        "0198c270b64374149ddcbd90be76c7d57e6a",
        "0198c270b64374149ddcbd90be76c7d57e6a"
      ]
    },
    {
      "ids": [
        "0198c280d5107a41a0637b599af163a325cc",
        "0198c2802a8e7db2871b5f19a880866b0ae6"
      ],
      "type": "chat",
      "overview": "Hair care inquiry",
      "payloads": [
        "i wants to general hair care",
        "i have a problem with my hair"
      ],
      "total_score": 1.09950828,
      "conversation_ids": [
        "0198c27fe8527fa5b6cfb9104f1b02ad211b",
        "0198c27fe8527fa5b6cfb9104f1b02ad211b"
      ]
    }
  ],
  "duration": "19.38 ms"
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

---

## 2. Context Change API

### **List Context Changes**

**Endpoint**: `/api/analyze/context_change/`  
**Method**: `GET`  
**Authentication**: Required  
**Description**: Retrieves a list of context changes for all conversations associated with the authenticated user.

#### **Optional Query Parameters**:

- **`agent_id`**: (Optional) Filter context changes by a specific agent ID.

#### **Response**:

##### **Success (200 OK)**:

```json
{
  "status": "SUCCESS",
  "content": [
    {
      "conversation_id": "0198c15bd1107e669d3c8420cd06442b4dc3",
      "overall_context": "The conversation revolves around the user seeking information about the Computer Engineering and Artificial Intelligence programs at Hacettepe University, while expressing frustration with the assistant's responses.",
      "topics": [
        {
          "topic": "University Overview",
          "details": "The conversation begins with the assistant introducing Hacettepe University and its relevant departments for the user.",
          "end_message": "user: üniversite adını söylemeden neden bölüm söyledin salak mısın",
          "start_message": "assistant: Merhaba! 👋 Ben **Noupe**. Bu sitede Bilgisayar Mühendisliği ve Yapay Zekâ alanlarındaki akademik programlar ve kaynaklar hakkında bilgi verebilirim. Size nasıl yardımcı olabilirim?"
        },
        {
          "topic": "Information Request",
          "details": "The user requests specific information about the head of a department, reflecting a desire for more detailed information.",
          "end_message": "user: hiçbir şey bilmiyorken nasıl yardımcı olabilirsin",
          "start_message": "user: bölüm başkanı kim"
        }
      ],
      "context_changes": [
        {
          "details": "The user shifts from general inquiries about the university to a specific question about the head of the department, indicating increased frustration and disappointment with the assistant's previous responses.",
          "to_topic": "Information Request",
          "from_topic": "University Overview",
          "change_message": "user: bölüm başkanı kim"
        }
      ],
      "created_at": "2025-09-05T14:03:33.790458+03:00",
      "updated_at": "2025-09-05T14:03:33.790461+03:00"
    },
    {
      "conversation_id": "0198e13daa627326b59a917d648bad72d0d5",
      "overall_context": "The conversation revolves around inquiries made by the user regarding Hacettepe University's Computer Engineering programs, specifically focusing on the establishment, courses offered, and admission details.",
      "topics": [
        {
          "topic": "Establishment and History",
          "details": "User asks about the year Hacettepe University's Computer Engineering department was established.",
          "end_message": "Hacettepe Üniversitesi Bilgisayar Mühendisliği Bölümü, 1971 yılında Hacettepe Enformatik Enstitüsü'ne bağlı olarak kurulmuştur.",
          "start_message": "hacettepe bilgisayar mühendisliği kaç yılındı kuruldu"
        },
        {
          "topic": "Artificial Intelligence Engineering",
          "details": "User inquires about the year the Artificial Intelligence Engineering program was established.",
          "end_message": "Hacettepe Üniversitesi Yapay Zeka Mühendisliği lisans programı 2019-2020 öğretim yılında öğrenci almaya başlamıştır.",
          "start_message": "yapay zeka mühendisliği hangi yılda kurulmuştur"
        },
        {
          "topic": "Student Admission Capacity",
          "details": "User asks for the admission capacity of the Artificial Intelligence Engineering program.",
          "end_message": "Üzgünüm, şu anda yapay zeka mühendisliği bölümünün kontenjan bilgisine erişimim yok.",
          "start_message": "teşekkürler peki kontenjanı kaç kişidir"
        },
        {
          "topic": "Start Dates for Classes",
          "details": "User inquires about when classes start for the respective engineering programs.",
          "end_message": "Hacettepe Üniversitesi Bilgisayar Mühendisliği ve Yapay Zeka Mühendisliği programlarında dersler genellikle akademik takvime göre başlar...",
          "start_message": "dersler ne zaman başlıyor"
        },
        {
          "topic": "Technical Elective Courses",
          "details": "User asks for a list of technical elective courses available in the Computer Engineering program.",
          "end_message": "Bilgisayar Mühendisliği bölümünde teknik seçmeli dersler arasında 'Algı ve Dil', 'Büyük Veri ve Yapay Öğrenme'...",
          "start_message": "teknik seçmelileri listeleyebilir misin"
        }
      ],
      "context_changes": [
        {
          "details": "The user moves from asking about the history of Computer Engineering to inquiring about the establishment of the Artificial Intelligence Engineering program.",
          "to_topic": "Artificial Intelligence Engineering",
          "from_topic": "Establishment and History",
          "change_message": "yapay zeka mühendisliği hangi yılda kurulmuştur"
        },
        {
          "details": "The user shifts focus from the establishment details of the Artificial Intelligence program to querying its admission capacity.",
          "to_topic": "Student Admission Capacity",
          "from_topic": "Artificial Intelligence Engineering",
          "change_message": "teşekkürler peki kontenjanı kaç kişidir"
        },
        {
          "details": "The user transitions from questions about admissions to inquiries regarding when classes commence.",
          "to_topic": "Start Dates for Classes",
          "from_topic": "Student Admission Capacity",
          "change_message": "dersler ne zaman başlıyor"
        },
        {
          "details": "The user's focus changes from class start dates to requests for information about available technical elective courses.",
          "to_topic": "Technical Elective Courses",
          "from_topic": "Start Dates for Classes",
          "change_message": "teknik seçmelileri listeleyebilir misin"
        }
      ],
      "created_at": "2025-09-05T14:03:33.790392+03:00",
      "updated_at": "2025-09-05T14:03:33.790395+03:00"
    },
    {
      "conversation_id": "01989e07a7097d1aa561a3138cb765bab1d7",
      "overall_context": "The conversation revolves around the user's inquiries about contacting an institution, specifically regarding the Hacettepe Career Fair.",
      "topics": [
        {
          "topic": "Contact Information",
          "details": "The user seeks information on how to get in touch with the institution, including phone numbers and email.",
          "end_message": "can u give social media accounts",
          "start_message": "how can i contact with you"
        },
        {
          "topic": "Social Media and Online Presence",
          "details": "The user requests social media accounts for updates, and the assistant provides the necessary information.",
          "end_message": "are u alive",
          "start_message": "can u give social media accounts"
        },
        {
          "topic": "Engagement and Interaction",
          "details": "The user and assistant engage in a light-hearted manner, with the user checking the assistant’s responsiveness.",
          "end_message": "ping",
          "start_message": "are u alive"
        },
        {
          "topic": "Event Details",
          "details": "The user seeks specific information regarding the trailer and the number of firms attending the Hacettepe Career Fair.",
          "end_message": "how many firm attendeed",
          "start_message": "can u give the link of trailer"
        },
        {
          "topic": "Registration Process",
          "details": "The user expresses a desire to register for the event, and the assistant provides guidance on how to do that.",
          "end_message": "can u fill it",
          "start_message": "i want to register"
        }
      ],
      "context_changes": [
        {
          "details": "The user shifted focus from basic contact details to inquiring about social media accounts for more dynamic updates.",
          "to_topic": "Social Media and Online Presence",
          "from_topic": "Contact Information",
          "change_message": "can u give social media accounts"
        },
        {
          "details": "The user transitions from seeking information to testing the assistant’s presence and engagement through casual interaction.",
          "to_topic": "Engagement and Interaction",
          "from_topic": "Social Media and Online Presence",
          "change_message": "are u alive"
        },
        {
          "details": "The conversation shifts from a friendly interaction to specific inquiries about event-related content.",
          "to_topic": "Event Details",
          "from_topic": "Engagement and Interaction",
          "change_message": "can u give the link of trailer"
        },
        {
          "details": "The user moves from asking about event details to expressing intent to participate in the event, leading to questions about registration.",
          "to_topic": "Registration Process",
          "from_topic": "Event Details",
          "change_message": "i want to register"
        }
      ],
      "created_at": "2025-09-05T14:03:33.790363+03:00",
      "updated_at": "2025-09-05T14:03:33.790366+03:00"
    }
  ],
  "duration": "12.311 ms"
}
```

##### **Error (400 Bad Request)**:

```json
{
  "status": "error",
  "content": {
    "error": "Invalid request parameters."
  }
}
```

---

### **Get Context Change Details**

**Endpoint**: `/api/analyze/context_change/<conversation_id>/details/`  
**Method**: `GET`  
**Authentication**: Required  
**Description**: Retrieves detailed context change information for a specific conversation.

#### **Path Parameters**:

- **`conversation_id`**: (Required) The ID of the conversation to retrieve context change details for.

#### **Response**:

##### **Success (200 OK)**:

```json
{
  "status": "SUCCESS",
  "content": {
    "conversation_id": "0198c15bd1107e669d3c8420cd06442b4dc3",
    "overall_context": "The conversation revolves around the user seeking information about the Computer Engineering and Artificial Intelligence programs at Hacettepe University, while expressing frustration with the assistant's responses.",
    "topics": [
      {
        "topic": "University Overview",
        "details": "The conversation begins with the assistant introducing Hacettepe University and its relevant departments for the user.",
        "end_message": "user: üniversite adını söylemeden neden bölüm söyledin salak mısın",
        "start_message": "assistant: Merhaba! 👋 Ben **Noupe**. Bu sitede Bilgisayar Mühendisliği ve Yapay Zekâ alanlarındaki akademik programlar ve kaynaklar hakkında bilgi verebilirim. Size nasıl yardımcı olabilirim?"
      },
      {
        "topic": "Information Request",
        "details": "The user requests specific information about the head of a department, reflecting a desire for more detailed information.",
        "end_message": "user: hiçbir şey bilmiyorken nasıl yardımcı olabilirsin",
        "start_message": "user: bölüm başkanı kim"
      }
    ],
    "context_changes": [
      {
        "details": "The user shifts from general inquiries about the university to a specific question about the head of the department, indicating increased frustration and disappointment with the assistant's previous responses.",
        "to_topic": "Information Request",
        "from_topic": "University Overview",
        "change_message": "user: bölüm başkanı kim"
      }
    ],
    "created_at": "2025-09-05T14:03:33.790458+03:00",
    "updated_at": "2025-09-05T14:03:33.790461+03:00"
  },
  "duration": "14.744 ms"
}
```

##### **Error (400 Bad Request)**:

```json
{
  "status": "error",
  "content": {
    "error": "conversation_id is required."
  }
}
```

##### **Error (404 Not Found)**:

```json
{
  "status": "error",
  "content": {
    "error": "Conversation not found."
  }
}
```
