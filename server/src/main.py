import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from api import apiRoute
from database import create_db_and_tables

create_db_and_tables()


app = FastAPI(title='ND Forez')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/api', apiRoute)

if os.getenv("WEBVIEW_MODE") != "1":
    from fastapi.staticfiles import StaticFiles
    app.mount('/assets', StaticFiles(directory='public/assets', html=True))


@app.get('/{full_path:path}')
def index() -> FileResponse:
    return FileResponse('public/index.html')
