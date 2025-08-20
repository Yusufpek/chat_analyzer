import csv
from io import StringIO
from chat.models.conversation import ChatMessage, Conversation
from common.constants.sources import SOURCE_FILE


def get_conversation_messages_from_csv(
    user,
    csv_data,
    agent_id=None,
    chat_message_ids=None,
):
    """
    Fetch conversation messages from a CSV file and save them to the database.
    :param user: The user for whom the conversation is being fetched.
    :param csv_file_path: The path to the CSV file containing conversation messages.
    :param agent_id: The ID of the JotForm agent (optional).
    :param chat_message_ids: A list of existing chat message IDs to avoid duplicates.
    :return: None
    :rtype: None

    Example CSV format:
    conversation_id,message_id,content,sender_type,created_at,chat_type
    123,01989e07ca817bcebfdb77ce9e92da55afe3,Hello,user,2025-08-19T12:00:00,ai2u
    123,01989e07db3170c4a4ca1ae09c898b138722,Hi there,assistant,2025-08-19T12:01:00,ai2u
    123,301989e080d477b898e484ff51e209043bce8,How can I help you?,assistant,2025-08-19T12:02:00,ai2u
    124,01989e0819737b4bbdea350f40c3d01490aa,Good morning,user,2025-08-19T12:05:00,ai2u
    """
    if chat_message_ids is None:
        chat_message_ids = ChatMessage.objects.values_list("id", flat=True)

    try:
        if isinstance(csv_data, bytes):
            csv_data = csv_data.decode("utf-8")

        with StringIO(csv_data) as csv_file:
            reader = csv.DictReader(csv_file)

            # Validate required columns
            required_columns = {
                "conversation_id",
                "message_id",
                "content",
                "sender_type",
                "created_at",
            }
            if not required_columns.issubset(reader.fieldnames):
                print(
                    f"CSV file is missing required columns: {required_columns - set(reader.fieldnames)}"
                )
                return

            conversation_messages = []
            conversation_id = None

            conversation = None
            for row in reader:
                # Extract conversation ID from the first row
                if conversation_id is None:
                    if Conversation.objects.filter(id=row["conversation_id"]).exists():
                        raise ValueError("Conversation record already exists.")
                    else:
                        conversation_id = row["conversation_id"]
                        chat_type = row.get("chat_type", Conversation.TYPE_AI2U)

                        # Create the conversation
                        conversation = Conversation.objects.create(
                            id=conversation_id,
                            source=SOURCE_FILE,
                            chat_type=chat_type,
                            user_id=user.id,
                            agent_id=agent_id,
                        )

                # Add chat messages
                if row["message_id"] not in chat_message_ids:
                    conversation_messages.append(
                        ChatMessage(
                            id=row["message_id"],
                            conversation_id=conversation.id,
                            content=row["content"],
                            sender_type=row["sender_type"],
                            created_at=row["created_at"],
                        )
                    )

            # Bulk create chat messages
            if conversation_messages:
                ChatMessage.objects.bulk_create(conversation_messages)
                print(
                    f"Successfully fetched CSV conversation history, and {len(conversation_messages)} messages saved to the database."
                )
            else:
                print("No new messages to save.")

    except Exception as e:
        raise Exception(f"Error processing CSV data: {str(e)}")


def get_conversation_messages_from_json(
    user,
    json_data,
    agent_id=None,
    chat_message_ids=None,
):
    """
    Fetch conversation messages from a JSON object and save them to the database.
    :param user: The user for whom the conversation is being fetched.
    :param json_data: The JSON object containing conversation messages.
    :param agent_id: The ID of the JotForm agent (optional).
    :param chat_message_ids: A list of existing chat message IDs to avoid duplicates.
    :return: None
    :rtype: None

    Example JSON format:
    {
        "conversation_id": "123",
        "chat_type": "ai2u",
        "content": [
            {
                "id": "1",
                "conversation": "123",
                "content": "Hello",
                "sender_type": "user",
                "created_at": "2025-08-19T12:00:00"
            },
            {
                "id": "2",
                "conversation": "123",
                "content": "Hi there",
                "sender_type": "assistant",
                "created_at": "2025-08-19T12:01:00"
            },
            {
                "id": "3",
                "conversation": "123",
                "content": "How can I help you?",
                "sender_type": "assistant",
                "created_at": "2025-08-19T12:02:00"
            }
        ]
    }
    """
    if chat_message_ids is None:
        chat_message_ids = ChatMessage.objects.values_list("id", flat=True)

    if (
        not json_data
        or "conversation_id" not in json_data
        or "content" not in json_data
    ):
        print("No conversation messages found in the JSON file.")
        return

    conversation_id = json_data["conversation_id"]
    if Conversation.objects.filter(id=conversation_id).exists():
        raise ValueError("Conversation record already exists.")

    chat_type = json_data.get("chat_type", Conversation.TYPE_AI2U)
    Conversation.objects.create(
        id=conversation_id,
        source=SOURCE_FILE,
        chat_type=chat_type,
        user_id=user.id,
        agent_id=agent_id,
    )

    conversation_messages = []
    content = json_data["content"]
    for message in content:
        conversation_messages.append(
            ChatMessage(
                id=message["id"],
                conversation_id=conversation_id,
                content=message["content"],
                sender_type=message["sender_type"],
                created_at=message["created_at"],
            )
        )

    if conversation_messages:
        ChatMessage.objects.bulk_create(conversation_messages)
        print(
            f"Successfully fetched JSON conversation history, and {len(conversation_messages)} messages saved to the database."
        )
