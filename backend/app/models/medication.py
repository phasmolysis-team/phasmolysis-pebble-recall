from pydantic import Field, BaseModel


class Medication(BaseModel):
    name: str
    taken: bool
    side_effects: str | None = None