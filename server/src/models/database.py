from datetime import datetime, timezone
from typing import Optional
from sqlmodel import JSON, Column, Relationship, SQLModel, Field


class SizeStandardDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    filename: str
    data: list[int] = Field(sa_column=Column(JSON))
    sizes: list[float] = Field(sa_column=Column(JSON))
    concentrations: list[float] = Field(sa_column=Column(JSON))
    release_times: list[int] = Field(sa_column=Column(JSON))
    parsed_result_id: Optional[int] = Field(default=None, foreign_key="parseresultdb.id")
    parsed_result: Optional['ParseResultDB'] = Relationship(back_populates="standards")


class GenLibDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    filename: str
    data: list[int] = Field(sa_column=Column(JSON))
    parsed_result_id: Optional[int] = Field(default=None, foreign_key="parseresultdb.id")
    parsed_result: Optional['ParseResultDB'] = Relationship(back_populates="genlibs")


class ParseResultDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    standards: list[SizeStandardDB] = Relationship(back_populates="parsed_result")
    genlibs: list[GenLibDB] = Relationship(back_populates="parsed_result")
    created_at: datetime = Field(default=datetime.now(timezone.utc))
