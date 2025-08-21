import enum


class EngineType(enum.Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    REPLICATE = "replicate"
    ANTHROPIC_CLOUD = "cloud"

    @staticmethod
    def choices():
        return [(engine.value, engine.name) for engine in EngineType]
