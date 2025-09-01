from .ai_service import AIService, EngineType


class EmbeddingService(AIService):
    model = None

    def __init__(self, model: str = "text-embedding-3-large"):
        super().__init__(engine=EngineType.OPENAI, endpoint="v1/embeddings")
        self.model = model

    def send_request(self, content):
        data = {
            "model": self.model,
            "input": content,
            "endcoding_format": "float",
            "dimensions": 3072,
        }

        return super().send_request(data)

    def parse_response(self, response):
        if "data" not in response:
            return None
        if "embedding" not in response["data"][0]:
            return None
        return response["data"][0]["embedding"]

    def generate_embedding(self, messages):
        if not messages:
            raise ValueError("No messages provided for embedding generation.")

        points = []
        for message in messages:
            response = self.send_request(message["content"])
            if response:
                points.append(
                    {
                        "id": message["embedding_id"],
                        "payload": {
                            "content": message["content"],
                            "sender_type": message["sender_type"],
                        },
                        "vector": response,
                    }
                )
        return points
