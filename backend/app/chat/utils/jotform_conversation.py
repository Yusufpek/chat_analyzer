import json
from chat.models.conversation import ChatMessage, Conversation


def get_chat_messages(service, agent_id, chat_id, chat_message_ids=None):
    if chat_message_ids is None:
        chat_message_ids = ChatMessage.objects.values_list("id", flat=True)

    response_code, content = service.get_chat_history(
        agent_id=agent_id,
        chat_id=chat_id,
    )
    if response_code != 200:
        print(
            f"Failed to fetch conversation history: {content.get('error', 'Unknown error')}"
        )
        return

    chat_messages = []
    for message in content:
        message_content = json.loads(message["message"])
        if message["uuid"] in chat_message_ids:
            continue
        if message_content["role"] not in ["user", "assistant"]:
            continue
        if message_content.get("function_call"):
            continue
        chat_messages.append(
            ChatMessage(
                id=message["uuid"],
                conversation_id=chat_id,
                content=message_content["content"],
                sender_type=message_content["role"],
                created_at=message["created_at"],
            )
        )
    return chat_messages


def get_conversations(service, agent_id, user_id, conversation_ids=None):
    if conversation_ids is None:
        conversation_ids = Conversation.objects.values_list("id", flat=True)

    response_code, content = service.get_agent_conversations(agent_id=agent_id)
    conversations = []
    if response_code != 200:
        print(
            f"Failed to fetch conversations for agent {agent_id}: {content.get('error', 'Unknown error')}"
        )
        return
    print(f"Fetched {len(content)} conversations for agent {agent_id}.")
    for conversation in content:
        chat_id = conversation.get("aiAgentChatID")
        if chat_id in conversation_ids:
            continue
        conversations.append(
            Conversation(
                id=chat_id,
                user_id=user_id,
                agent_id=conversation["aiAgentID"],
                created_at=conversation["created_at"],
                chat_type=Conversation.TYPE_AI2U,
            )
        )
    return conversations
