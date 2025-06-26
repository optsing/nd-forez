from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from lib.parsing import parse_file
from lib.analyzis import analyze

from models.models import ParsedData, AnalyzeInput, AnalyzeResult, SizeStandart, GenLib


api = FastAPI(title='Farez API')


@api.post("/parse")
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


@api.post('/analyze')
async def analyze_endpoint(data: AnalyzeInput) -> AnalyzeResult:
    return analyze(data.size_standart, data.gen_libs)


app = FastAPI(title='Farez')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/api', api)
app.mount('/assets', StaticFiles(directory='assets', html=True))


@app.get('/{full_path:path}')
def index() -> FileResponse:
    return FileResponse('index.html')
