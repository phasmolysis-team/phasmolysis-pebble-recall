import math
from typing import Annotated, Literal

from pydantic import Field, BaseModel

emotions = {
    # Unpleasant + High Activation
    "panicked": (10, 95),
    "terrified": (5, 90),
    "stressed": (15, 80),
    "angry": (10, 85),
    "anxious": (20, 75),
    "tense": (25, 70),
    # Unpleasant + Mid Activation
    "frustrated": (20, 55),
    "irritable": (25, 50),
    "upset": (20, 45),
    "distressed": (15, 50),
    "worried": (25, 55),
    # Unpleasant + Low Activation
    "sad": (20, 30),
    "miserable": (10, 20),
    "depressed": (15, 15),
    "lethargic": (25, 10),
    "exhausted": (30, 10),
    "drained": (25, 15),
    "withdrawn": (20, 25),
    "empty": (15, 20),
    # Neutral
    "indifferent": (50, 40),
    "numb": (45, 20),
    # Pleasant + Low Activation
    "calm": (70, 25),
    "serene": (75, 20),
    "relaxed": (75, 30),
    "content": (80, 35),
    "at ease": (70, 30),
    # Pleasant + Mid Activation
    "pleased": (80, 50),
    "cheerful": (80, 60),
    "happy": (85, 55),
    "grateful": (80, 45),
    "hopeful": (75, 55),
    # Pleasant + High Activation
    "excited": (85, 85),
    "elated": (90, 80),
    "energized": (80, 85),
    "motivated": (75, 80),
    "enthusiastic": (85, 80),
}


class Emotion(BaseModel):
    valence: float
    arousal: float


class EmotionResult(BaseModel):
    status: Annotated[Literal["fallback", "found", "error"], Field()] = "fallback"
    message: Annotated[str, Field()] = ""
    closest_emotions: Annotated[set[str], Field()] = set()
    emotion: Annotated[Emotion, Field()]


def get_closest_emotions(
    emotion: Emotion, top_n: int = 3, threshold: float = 25
) -> EmotionResult:
    try:
        valence = emotion.valence
        arousal = emotion.arousal
    except Exception as e:
        print(f"EmotionMapping error: {e}")
        return EmotionResult(status="error", emotion=Emotion(valence=50, arousal=50))

    try:
        results = []

        for word, (v, a) in emotions.items():
            distance = math.sqrt((v - valence) ** 2 + (a - arousal) ** 2)
            results.append((word, distance))

        results.sort(key=lambda x: x[1])
        within = [word for word, d in results if d <= threshold]

        if within:
            return EmotionResult(
                status="found", closest_emotions=set(within[:top_n]), emotion=emotion
            )

        return EmotionResult(status="fallback", emotion=emotion)

    except Exception as e:
        print(f"EmotionMapping error: {e}")
        return EmotionResult(
            status="error", emotion=Emotion(valence=valence, arousal=arousal)
        )


# print(get_closest_emotions(Emotion(valence=67, arousal=70)))
