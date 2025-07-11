from fastapi import FastAPI, File, HTTPException, UploadFile, Depends
from sqlmodel import Session, desc, select

from database import get_session
from lib.analyzis import analyze
from lib.parsing import parse_file
from models.models import AnalyzeInput, AnalyzeResult, GenLib, GenLibDescription, ParseResult, ParseResultDescription, SizeStandard, SizeStandardDescription
from models.database import GenLibDB, ParseResultDB, SizeStandardDB


apiRoute = FastAPI(title='ND Forez API')


@apiRoute.post("/parse")
async def do_parse(files: list[UploadFile] = File(...), session: Session = Depends(get_session)) -> ParseResult:
    standards: list[SizeStandard] = []
    genlibs: list[GenLib] = []

    for file in files:
        content = await file.read()
        print(f"Received {file.filename}: {len(content)} bytes")
        s, g = parse_file(content, file.filename or 'unknown')
        standards += s
        genlibs += g

    if not standards and not genlibs:
        raise HTTPException(status_code=422, detail='В файлах отсутствуют данные')

    standards_db: list[SizeStandardDB] = []
    genlibs_db: list[GenLibDB] = []
    for s in standards:
        standards_db.append(SizeStandardDB(
            title=s.title,
            filename=s.filename,
            data=s.data,
            sizes=s.sizes,
            concentrations=s.concentrations,
            release_times=s.release_times
        ))
    for g in genlibs:
        genlibs_db.append(GenLibDB(
            title=g.title,
            filename=g.filename,
            data=g.data,
        ))

    parse_result_db = ParseResultDB(
        standards=standards_db,
        genlibs=genlibs_db,
    )
    session.add(parse_result_db)
    session.commit()
    session.refresh(parse_result_db)

    return ParseResult(
        id=parse_result_db.id,
        size_standards=standards,
        gen_libs=genlibs,
    )


@apiRoute.post('/analyze')
def do_analyze(data: AnalyzeInput) -> AnalyzeResult:
    # try:
    return analyze(data.size_standard, data.gen_libs)
    # except Exception as ex:
    #     raise HTTPException(status_code=422, detail=str(ex))


@apiRoute.get('/parse-results')
def get_parse_results(session: Session = Depends(get_session)) -> list[ParseResultDescription]:
    statement = select(ParseResultDB).order_by(desc(ParseResultDB.id)).limit(50)
    results = session.exec(statement).all()
    parsed_datas: list[ParseResultDescription] = []
    for r in results:
        standards: list[SizeStandardDescription] = []
        genlibs: list[GenLibDescription] = []
        for s in r.standards:
            standards.append(SizeStandard(
                title=s.title,
                filename=s.filename,
                data=s.data,
                sizes=s.sizes,
                concentrations=s.concentrations,
                release_times=s.release_times,
            ))
        for g in r.genlibs:
            genlibs.append(GenLib(
                title=g.title,
                filename=g.filename,
                data=g.data,
            ))
        parsed_datas.append(ParseResultDescription(
            id=r.id or 0,
            size_standards=standards,
            gen_libs=genlibs,
            created_at=r.created_at,
        ))
    return parsed_datas


@apiRoute.get('/parse-results/{result_id}')
def get_parse_result(result_id: int, session: Session = Depends(get_session)) -> ParseResult:
    r = session.get(ParseResultDB, result_id)
    if r is None:
        raise HTTPException(404)
    standards: list[SizeStandard] = []
    genlibs: list[GenLib] = []
    for s in r.standards:
        standards.append(SizeStandard(
            title=s.title,
            filename=s.filename,
            data=s.data,
            sizes=s.sizes,
            concentrations=s.concentrations,
            release_times=s.release_times,
        ))
    for g in r.genlibs:
        genlibs.append(GenLib(
            title=g.title,
            filename=g.filename,
            data=g.data,
        ))
    if not standards and not genlibs:
        raise HTTPException(status_code=422, detail='В файлах отсутствуют данные')
    return ParseResult(
        id=r.id,
        size_standards=standards,
        gen_libs=genlibs,
    )
