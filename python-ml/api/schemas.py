from datetime import date

from pydantic import BaseModel, ConfigDict, Field

CURRENT_YEAR = date.today().year


class HousePriceInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    area_sqft: float = Field(gt=50, le=100_000)
    bedrooms: int = Field(ge=0, le=20)
    bathrooms: float = Field(ge=0, le=20)
    year_built: int | None = Field(default=None, ge=1800, le=CURRENT_YEAR + 1)
    lot_size_sqft: float | None = Field(default=None, ge=0, le=10_000_000)
    garage_spaces: int | None = Field(default=None, ge=0, le=10)
    location: str = Field(default="unknown", max_length=100)
    property_type: str = Field(default="unknown", max_length=50)


class TrainRequest(BaseModel):
    dataset: str = Field(default="houses.csv", pattern=r"^[A-Za-z0-9_\-]{1,80}\.csv$")
