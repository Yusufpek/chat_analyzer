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

    def delete_collection(self, collection_name):
        response = self.send_delete_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}"
        )
        return response

    def add_messages_to_collection(self, collection_name, points):
        response = self.send_put_request(
            f"{self.base_url}/collections/{self.prefix}_{collection_name}/points",
            {"points": points},
        )
        return response.get("status", "nok") == "acknowledged"
