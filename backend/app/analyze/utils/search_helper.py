from analyze.utils.qdrant_service import QDrantService
from analyze.utils.embedding_service import EmbeddingService
from chat.models.conversation import ChatMessage


def search_agent_with_qdrant(agent_id: str, query: str):
    """
    Search for messages in a QDrant collection.
    :param agent_id: The ID of the agent.
    :param query: The search query.
    :return: A dictionary containing the search results.
    """
    qdrant_service = QDrantService()
    embedding_service = EmbeddingService()

    try:
        query_vector = embedding_service.generate_query_vector(query)
        response = qdrant_service.get_messages_with_query(
            collection_name=agent_id, query=query_vector, limit=10
        )
        if response:
            return True, response
        else:
            return False, "No response from QDrant Service"
    except Exception as e:
        return False, str(e)


def get_grouped_messages(
    agent_id: str,
    sender_type: str = ChatMessage.SENDER_TYPE_USER,
):
    """
    Get grouped messages from the database.
    :param agent_id: The ID of the agent.
    :param message_ids: The IDs of the messages to group.
    :param sender_type: The type of the sender (user or assistant).
    :return: A dictionary containing the grouped messages.
    """
    messages = ChatMessage.objects.filter(conversation__agent_id=agent_id)
    embed_id_to_messages = {msg.embedding_id: msg for msg in messages}
    message_ids = messages.values_list("embedding_id", flat=True)

    response = QDrantService().get_grouped_messages(
        agent_id,
        message_ids,
        sender_type,
    )

    if not response:
        return False, "No response from QDrant Service"

    for group in response:
        group["payloads"] = [
            embed_id_to_messages[m_id].content
            for m_id in group["ids"]
            if m_id in embed_id_to_messages
        ]
        group["ids"] = [
            embed_id_to_messages[m_id].id
            for m_id in group["ids"]
            if m_id in embed_id_to_messages
        ]

    return True, response
