import requests

from django.conf import settings
from analyze.models.log import QDrantServiceLog


class QDrantService:
    """
    Base class for QDrant services.
    """

    base_url = None
    headers = {}
    prefix = ""

    def __init__(self):
        self.base_url = settings.QDRANT_SERVICE_URL
        self.headers = {
            "Content-Type": "application/json",
        }
        self.prefix = "chat_analyzer"

    def parse_response(self, response):
        if "status" in response and response["status"] != "ok":
            return response
        if "result" in response:
            return response["result"]
        return response

    def send_request(self, endpoint, data, method):
        if method not in ["GET", "PUT", "POST", "DELETE"]:
            return None

        log = QDrantServiceLog.objects.create(
            request_payload=data,
            endpoint=endpoint,
            http_method=method,
            status=QDrantServiceLog.PENDING,
        )
        if method == "GET":
            response = requests.get(endpoint, headers=self.headers)
        elif method == "POST":
            response = requests.post(endpoint, headers=self.headers, json=data)
        elif method == "PUT":
            response = requests.put(endpoint, headers=self.headers, json=data)
        elif method == "DELETE":
            response = requests.delete(endpoint, headers=self.headers)

        if response.status_code not in [200, 201]:
            log.status = QDrantServiceLog.ERROR
            log.status_code = response.status_code
            try:
                log.response_payload = response.json()
            except ValueError:
                log.response_payload = response.text
            log.save()
            return response

        log.status = QDrantServiceLog.SUCCESS
        log.status_code = response.status_code
        log.response_payload = response.json()
        log.save()
        return self.parse_response(response.json())

    def send_get_request(self, endpoint):
        return self.send_request(endpoint, {}, method="GET")

    def send_put_request(self, endpoint, data):
        return self.send_request(endpoint, data, method="PUT")

    def send_post_request(self, endpoint, data):
        return self.send_request(endpoint, data, method="POST")

    def send_delete_request(self, endpoint):
        return self.send_request(endpoint, {}, method="DELETE")

    def check_collection_exists(self, collection_name):
        response = self.send_get_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/exists"
        )
        return response["exists"]

    def get_collections(self, all=False):
        response = self.send_get_request(f"{self.base_url}/collections")
        if "collections" in response:
            collections = response["collections"]
            if all:
                return [collection["name"] for collection in collections]
            return [
                collection["name"]
                for collection in collections
                if self.prefix in collection["name"]
            ]
        return response

    def create_collection(self, collection_name, size=3072, distance="Cosine"):
        response = self.send_put_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}",
            {
                "vectors": {
                    "size": size,
                    "distance": distance,
                },
            },
        )
        return response

    def get_collection_details(self, collection_name):
        response = self.send_get_request(
            f"{self.base_url}/collections/{collection_name}"
        )
        return response

    def delete_collection(self, collection_name, with_prefix=True):
        if with_prefix:
            collection_name = f"{self.prefix}_{collection_name}"
        response = self.send_delete_request(
            f"{self.base_url}/collections/{collection_name}"
        )
        return response

    def add_messages_to_collection(self, collection_name, points):
        response = self.send_put_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/points",
            {"points": points},
        )
        return response.get("status", "nok") == "acknowledged"

    def get_messages_with_query(
        self,
        collection_name,
        query,
        limit=10,
        sender_type=None,
        with_payload=True,
    ):
        payload = {
            "query": query,
            "with_payload": with_payload,
            "limit": limit,
            "score_threshold": 0.5,
        }

        if sender_type:
            payload["filter"] = {
                "must": [
                    {"key": "sender_type", "match": {"value": sender_type}},
                ],
            }

        response = self.send_post_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/points/query",
            payload,
        )

        if "points" in response:
            return response["points"]
        return response

    def get_messages(self, collection_name, limit=1000, sender_type=None):
        payload = {
            "limit": limit,
            "with_payload": True,
            "with_vector": True,
        }

        if sender_type:
            payload = {
                "filter": {
                    "must": {"key": "sender_type", "match": {"value": sender_type}}
                }
            }

        response = self.send_post_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/points/scroll",
            payload,
        )
        if "points" in response:
            return response["points"]

        return response

    def get_message(self, collection_name, message_id):
        return self.send_get_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/points/{message_id}"
        )

    def get_messages_in_batch(self, collection_name, message_id):
        response = self.send_post_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/points/query/batch",
            {
                "searches": [
                    {"query": {"nearest": "05e5b568-8ff4-419a-b943-09361c35c13f"}},
                    {
                        "filter": {
                            "must": {"key": "sender_type", "match": {"value": "user"}}
                        },
                        # "score_threshold": 0.5,
                    },
                ]
            },
        )
        return response

    def get_messages_with_similarity(
        self,
        collection_name,
        message_ids,
        sender_type=None,
        with_payload=True,
    ):
        message_details = {}
        for message_id in message_ids:
            points = self.get_messages_with_query(
                collection_name,
                message_id,
                limit=10,
                sender_type=sender_type,
                with_payload=with_payload,
            )

            for point in points:
                message_details.setdefault(
                    message_id,
                    {
                        "total_score": 0,
                        "point_ids": [],
                    },
                )
                message_details[message_id]["total_score"] += point["score"]
                message_details[message_id]["point_ids"].append(point["id"])

                if with_payload:
                    message_details[message_id].setdefault("payloads", []).append(
                        point["payload"]
                    )

        ordered = dict(
            sorted(
                message_details.items(),
                key=lambda item: item[1]["total_score"],
                reverse=True,
            )
        )

        return ordered

    def get_grouped_messages(
        self,
        collection_name,
        message_ids,
        sender_type=None,
    ):
        message_details = {}
        visited = set()
        clusters = []

        for message_id in message_ids:
            points = self.get_messages_with_query(
                collection_name,
                query=message_id,
                limit=10,
                sender_type=sender_type,
                with_payload=False,
            )

            for point in points:
                message_details.setdefault(
                    message_id,
                    {
                        "total_score": 0,
                        "point_ids": [],
                    },
                )
                message_details[message_id]["total_score"] += point["score"]
                message_details[message_id]["point_ids"].append(point["id"])

        # Perform clustering using BFS
        for current_id, current_data in message_details.items():
            if current_id in visited:
                continue

            # Create a new cluster
            cluster = {"ids": set(), "total_score": 0}
            queue = [current_id]

            while queue:
                point_id = queue.pop(0)
                if point_id in visited:
                    continue

                visited.add(point_id)

                cluster["ids"].add(point_id)
                cluster["total_score"] += message_details[point_id]["total_score"]

                for related_id in message_details[point_id]["point_ids"]:
                    if related_id not in visited:
                        queue.append(related_id)

            if len(cluster["ids"]) > 1:
                clusters.append(cluster)

        clusters = sorted(clusters, key=lambda c: c["total_score"], reverse=True)

        return clusters
