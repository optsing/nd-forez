from fastapi import FastAPI, File, HTTPException, UploadFile, Depends
from sqlmodel import Session, desc, select

from database import get_session
from lib.analyzis import analyze_size_standard, analyze_gen_lib
from lib.parsing import parse_file
from models.models import GenLibAnalyzeError, GenLibAnalyzeResult, GenLibParseResult, GenLibDescription, GenLibsAnalyzeInput, GenLibsAnalyzeOutput, ParseResult, ParseResultDescription, SizeStandardAnalyzeError, SizeStandardAnalyzeInput, SizeStandardAnalyzeOutput, SizeStandardAnalyzeResult, SizeStandardCalibration, SizeStandardParseResult, SizeStandardDescription
from models.database import GenLibDB, ParseResultDB, SizeStandardDB


apiRoute = FastAPI(title='ND Forez API')


@apiRoute.post("/parse-files")
async def do_parse(files: list[UploadFile] = File(...), session: Session = Depends(get_session)) -> ParseResult:
    standards: list[SizeStandardParseResult] = []
    genlibs: list[GenLibParseResult] = []

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
            title=s.description.title,
            filename=s.description.filename,
            data=s.signal,
            sizes=s.calibration.sizes,
            concentrations=s.calibration.concentrations,
            release_times=s.calibration.release_times
        ))
    for g in genlibs:
        genlibs_db.append(GenLibDB(
            title=g.description.title,
            filename=g.description.filename,
            data=g.signal,
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


@apiRoute.post('/analyze-size-standards')
def do_analyze_size_standard(input: SizeStandardAnalyzeInput) -> SizeStandardAnalyzeOutput:
    result: list[SizeStandardAnalyzeResult | SizeStandardAnalyzeError] = []
    for size_standard in input.items:
        result.append(analyze_size_standard(size_standard.raw_signal, size_standard.calibration))
    return SizeStandardAnalyzeOutput(
        data=result,
    )


@apiRoute.post('/analyze-gen-libs')
def do_analyze_gen_lib(input: GenLibsAnalyzeInput) -> GenLibsAnalyzeOutput:
    result: list[GenLibAnalyzeResult | GenLibAnalyzeError] = []
    for raw_signal in input.raw_signals:
        result.append(analyze_gen_lib(raw_signal, input.size_standard_analyze_peaks))
    return GenLibsAnalyzeOutput(
        data=result,
    )


@apiRoute.get('/parse-results')
def get_parse_results(session: Session = Depends(get_session)) -> list[ParseResultDescription]:
    statement = select(ParseResultDB).order_by(desc(ParseResultDB.id)).limit(50)
    results = session.exec(statement).all()
    parsed_datas: list[ParseResultDescription] = []
    for r in results:
        standards: list[SizeStandardDescription] = []
        genlibs: list[GenLibDescription] = []
        for s in r.standards:
            standards.append(SizeStandardDescription(
                title=s.title,
                filename=s.filename,
            ))
        for g in r.genlibs:
            genlibs.append(GenLibDescription(
                title=g.title,
                filename=g.filename,
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
    standards: list[SizeStandardParseResult] = []
    genlibs: list[GenLibParseResult] = []
    for s in r.standards:
        raw_signal = s.data
        calibration = SizeStandardCalibration(
            sizes=s.sizes,
            concentrations=s.concentrations,
            release_times=s.release_times,
        )
        standards.append(SizeStandardParseResult(
            description=SizeStandardDescription(
                title=s.title,
                filename=s.filename,
            ),
            signal=raw_signal,
            calibration=calibration,
        ))
    for g in r.genlibs:
        genlibs.append(GenLibParseResult(
            description=GenLibDescription(
                title=g.title,
                filename=g.filename,
            ),
            signal=g.data,
        ))
    if not standards and not genlibs:
        raise HTTPException(status_code=422, detail='В файлах отсутствуют данные')
    return ParseResult(
        id=r.id,
        size_standards=standards,
        gen_libs=genlibs,
    )
