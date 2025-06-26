from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from lib.parsing import parse_file
from lib.analyzis import analyze

from models.models import ParsedData, AnalyzeInput, AnalyzeResult, SizeStandart, GenLib


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/parse")
async def parse_endpoint(files: List[UploadFile] = File(...)) -> ParsedData:
    size_standarts: list[SizeStandart] = []
    gen_libs: list[GenLib] = []
    for file in files:
        content = await file.read()
        print(f"Received {file.filename}: {len(content)} bytes")
        s, g = parse_file(content)
        size_standarts += s
        gen_libs += g
    return ParsedData(
        size_standarts=size_standarts,
        gen_libs=gen_libs,
    )


@app.post('/analyze')
async def analyze_endpoint(data: AnalyzeInput) -> AnalyzeResult:
    return analyze(data.size_standart, data.gen_libs)
