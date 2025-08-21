import json
from chat.models.conversation import ChatMessage, Conversation
from common.utils.jotform_api import JotFormAPIService
from common.models.connection import Agent


def get_chat_messages(
    service: JotFormAPIService,
    agent_id,
    chat_id,
    logger,
    chat_message_ids=None,
):
    if chat_message_ids is None:
        chat_message_ids = ChatMessage.objects.values_list("id", flat=True)

    response_code, content = service.get_chat_history(
        agent_id=agent_id,
        chat_id=chat_id,
    )
    if response_code != 200:
        logger.error(
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
        if not message_content.get("content"):
            continue
        if "thought" in message_content["content"]:
            continue
        if "message" in message_content["content"]:
            message_content["content"] = json.loads(message_content["content"])[
                "message"
            ]

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


def get_conversations(
    service: JotFormAPIService,
    agent_id,
    user_id,
    logger,
    conversation_ids=None,
):
    if conversation_ids is None:
        conversation_ids = Conversation.objects.values_list("id", flat=True)

    response_code, content = service.get_agent_conversations(agent_id=agent_id)
    conversations = []
    if response_code != 200:
        logger.error(
            f"Failed to fetch conversations for agent {agent_id}: {content.get('error', 'Unknown error')}"
        )
        return
    logger.info(f"Fetched {len(content)} conversations for agent {agent_id}.")
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


def get_agents(
    service: JotFormAPIService,
    agent_ids=None,
):
    """
    Fetch JotForm agents and return a list of Agent objects.
    If agent_ids is provided, only those agents will be fetched.
    If agent_ids is None, all agents will be fetched.
    """
    if agent_ids is None:
        agent_ids = Agent.objects.values_list("id", flat=True)

    response_code, content = service.get_agents()
    if response_code != 200:
        raise ValueError(
            f"Failed to fetch agents: {content.get('error', 'Unknown error')}"
        )

    agents = []
    for agent in content:
        if agent["uuid"] in agent_ids:
            continue

        agents.append(
            Agent(
                id=agent["uuid"],
                connection_id=service.connection.id,
                name=agent["title"],
                avatar_url=agent.get("avatarIconLink"),
                jotform_render_url=agent.get("renderURL", ""),
            )
        )
    return agents


def sync_agents(
    service: JotFormAPIService,
    logger,
    agent_ids=None,
):
    """
    Sync JotForm agents with the database.
    If agent_ids is provided, only those agents will be synced.
    If agent_ids is None, all agents will be synced.
    """
    if agent_ids is None:
        agent_ids = Agent.objects.values_list("id", flat=True)

    response_code, content = service.get_agents()

    if response_code != 200:
        raise ValueError(
            f"Failed to fetch agents: {content.get('error', 'Unknown error')}"
        )

    # Prepare bulk update for agents
    agents_to_update = []
    for agent in content:
        if agent["uuid"] not in agent_ids:
            logger.info(f"Agent record not added: {agent['title']}")
            continue

        logger.info(f"Syncing agent: {agent['title']}")
        agentRecord = Agent.objects.filter(id=agent["uuid"]).first()

        if not agentRecord:
            logger.warning(f"Agent record not found: {agent['title']}")
            continue

        updated = False
        if agent["title"] != agentRecord.name:
            logger.info(f"Updating agent name: {agent['title']}")
            agentRecord.name = agent["title"]
            updated = True
        if agent.get("avatarIconLink") != agentRecord.avatar_url:
            logger.info(f"Updating agent avatar: {agent['title']}")
            agentRecord.avatar_url = agent.get("avatarIconLink")
            updated = True
        if updated:
            agents_to_update.append(agentRecord)
            logger.info(f"Agent {agent['title']} marked for bulk update.")

    if agents_to_update:
        Agent.objects.bulk_update(agents_to_update, ["name", "avatar_url"])
        logger.info(f"{len(agents_to_update)} agents updated in bulk.")
