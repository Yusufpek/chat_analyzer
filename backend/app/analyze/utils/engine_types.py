import enum


class EngineType(enum.Enum):
    """
    Enum for different AI service engines.
    """

    OPENAI = "openai"
    GEMINI = "gemini"
    REPLICATE = "replicate"
    ANTHROPIC_CLAUDE = "claude"

    @staticmethod
    def choices():
        return [(engine.value, engine.name) for engine in EngineType]
