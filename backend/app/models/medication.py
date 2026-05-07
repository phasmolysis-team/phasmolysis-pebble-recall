from uuid import uuid7 # type: ignore[attr-defined]
from pydantic import BaseModel, UUID7
import sqlalchemy as sa
from typing import Annotated, Literal
from sqlmodel import SQLModel
import sqlmodel as sm

type DosageUnit = Literal[
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

type FreqUnit = Literal[
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


class Dosage(BaseModel):
    amount: float
    unit: DosageUnit | str


class Frequency(BaseModel):
    # for "every X days/weeks"
    every: int | None = None  # every 1 day, every 7 days
    unit: FreqUnit | str

    # for "3 times a day at these times"
    times_per: int


class TMedication(SQLModel, table=True):
    __tablename__ = "medication" # type: ignore[assignment]
    id: Annotated[
        UUID7,
        sm.Field(
            primary_key=True,
        ),
    ] = uuid7()
    name: Annotated[str, sm.Field(sa_column=sa.Column(sa.Text))]
    frequency: Annotated[int, sm.Field(sa_column=sa.Column(sa.Integer))]
    frequency_unit: Annotated[FreqUnit | str, sm.Field(sa_column=sa.Column(sa.Text))]
    frequency_times_per_unit: Annotated[int, sm.Field(sa_column=sa.Column(sa.Integer))]
    recommended_dosage: Annotated[float, sm.Field(sa_column=sa.Column(sa.Float))]
    recommended_dosage_unit: Annotated[
        DosageUnit | str, sm.Field(sa_column=sa.Column(sa.Text))
    ]

    def get_dosage(self) -> Dosage:
        d = Dosage(unit=self.recommended_dosage_unit, amount=self.recommended_dosage)
        return d

    def get_frequency(self) -> Frequency:
        f = Frequency(
            every=self.frequency,
            unit=self.frequency_unit,
            times_per=self.frequency_times_per_unit,
        )
        return f
