import datetime
from pydantic import Field, BaseModel
import sqlalchemy as sa
from typing import Annotated, Literal

class Dosage:
    amount: float
    unit: Literal[
        "mg",  # milligrams - most common
        "g",  # grams
        "mcg",  # micrograms (ug is ambiguous, mcg is standard medical)
        # volume-based (liquid meds, syrup)
        "ml",  # milliliters
        "l",  # liters (rare but complete)
        "tbsp",  # tablespoon (common for syrups)
        "tsp",  # teaspoon (common for syrups)
        # unit-based (solid forms)
        "tablet",
        "capsule",
        "caplet",
        "softgel",
        "patch",  # transdermal patches
        "suppository",
        # concentration-based (injectable)
        "meq",  # milliequivalents - used for lithium, electrolytes
        "iu",  # international units - used for some vitamins/hormones
        # other
        "drop",  # eye/ear drops
        "spray",  # nasal sprays
        "puff",  # inhalers
    ]


class Frequency:

    # for "every X days/weeks"
    every: int | None = None  # every 1 day, every 7 days
    unit: Literal[
        "hourly",  # every X hours
        "daily",  # every X days
        "weekly",  # every X weeks
        "monthly",  # every X months
        # meal-based
        "before_meal",  # 30mins before eating
        "with_meal",  # take with food
        "after_meal",  # take after eating
        "on_empty_stomach",
        # time of day
        "morning",  # once in the morning
        "afternoon",
        "evening",
        "bedtime",  # very common for psych meds
        # conditional
        "as_needed",  # PRN in medical terms
        "during_episode",  # only during mood episodes
    ]

    # for "3 times a day at these times"
    times_per: int
    when: list[datetime.time] = []


class Medication(BaseModel):
    id: str
    name: str
    dosage: Dosage
    frequency: Frequency


class MedicationLog(BaseModel):
    id: str
    medication: Medication
    time_taken: Annotated[datetime.datetime | None, Field(sa.TIMESTAMP(timezone=True))]  # None if not taken
    taken: bool  # derived from time_taken but explicit is better than implicit
