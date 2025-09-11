from .ai_service import AIService, EngineType


class EmbeddingService(AIService):
    model = None

    def __init__(self, model: str = "text-embedding-3-large"):
        super().__init__(engine=EngineType.OPENAI, endpoint="v1/embeddings")
        self.model = model

    def send_request(self, content, logging=True):
        data = {
            "model": self.model,
            "input": content,
            "endcoding_format": "float",
            "dimensions": 3072,
        }

        return super().send_request(data, logging=logging)

    def parse_response(self, response):
        if "data" not in response:
            return None
        if "embedding" not in response["data"][0]:
            return None
        return response["data"][0]["embedding"]

    def generate_embedding(self, messages, logging=True):
        if not messages:
            raise ValueError("No messages provided for embedding generation.")

        points = []
        for message in messages:
            response = self.send_request(message["content"], logging=logging)
            if response:
                points.append(
                    {
                        "id": message["embedding_id"],
                        "payload": {
                            "content": message["content"],
                            "sender_type": message["sender_type"],
                            "conversation_id": message["conversation_id"],
                            "message_id": message["id"],
                        },
                        "vector": response,
                    }
                )
        return points

    def generate_query_vector(self, query: str):
        response = self.send_request(query)
        if response:
            return response
        return None
