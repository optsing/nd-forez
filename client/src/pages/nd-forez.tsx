import { useState, ChangeEvent, useEffect } from 'react';
import { Typography, CircularProgress, Button } from '@mui/material';
import { ScienceTwoTone, AssessmentTwoTone, AddTwoTone } from '@mui/icons-material';
import { GenLibAnalyzeError, GenLibAnalyzeResult, GenLibParseResult } from '../models/models';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import Zoom from 'chartjs-plugin-zoom';
import Annotation from 'chartjs-plugin-annotation';
import { useSearchParams } from 'react-router';
import { useAlert } from '../context/alert-context';
import MainContainer from '../components/main-container';
import { useOffscreenChartsToPdf } from '../helpers/pdf';
import { Chromatogram } from '../helpers/chromatogram';
import { parseFiles as serverParseFiles, getParseResult, getErrorMessage, analyzeGenLibs, analyzeSizeStandard } from '../helpers/api';
import { SizeStandardComplete } from '../models/client';


ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Filler,
    Legend,
    Zoom,
    Annotation,
    Chromatogram,
);


const chartHeight = 480;

const FileUploadPage: React.FC = () => {
    const showAlert = useAlert();

    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalysing] = useState<boolean>(false);

    const [sizeStandards, setSizeStandards] = useState<SizeStandardComplete[]>([]);
    const [genLibs, setGenLibs] = useState<GenLibParseResult[]>([]);

    const [selectedGenLibMulti, setSelectedGenLibMulti] = useState<boolean[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    const { generatePdf, isGeneratingPDF } = useOffscreenChartsToPdf();

    const selectedGenLibCount = selectedGenLibMulti.reduce((cnt, val) => val ? cnt + 1 : cnt, 0);

    // const { localCalculations } = useAppSettings();

    // const parseFiles = localCalculations ? clientParseFiles : serverParseFiles;
    // const analyzeData = localCalculations ? clientAnalyzeData : serverAnalyzeData;

    useEffect(() => {
        const id = searchParams.get('id')
        if (id) {
            const fn = async (id: number) => {
                setIsParsing(true);
                try {
                    const result = await getParseResult(id);
                    setSizeStandards([...sizeStandards, ...result.size_standards.map((sizeStandard) => ({
                        parsed: sizeStandard,
                        analyzed: null,
                        analyzedGenLibs: new Map(),
                    }))]);
                    setGenLibs([...genLibs, ...result.gen_libs]);
                    setSelectedGenLibMulti([...selectedGenLibMulti, ...new Array(result.gen_libs.length).fill(false)]);
                    if (result.id) {
                        searchParams.set('id', result.id.toString());
                        setSearchParams(searchParams);
                    }
                } catch (err) {
                    console.error(err);
                    showAlert(`Ошибка при получении данных: ${getErrorMessage(err)}`, 'error');
                } finally {
                    setIsParsing(false);
                }
            }
            fn(Number.parseInt(id));
        }
    }, []);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (isParsing || isAnalyzing) return;
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) return;

        setIsParsing(true);
        try {
            const result = await serverParseFiles(files);
            setSizeStandards([...sizeStandards, ...result.size_standards.map((sizeStandard) => ({
                parsed: sizeStandard,
                analyzed: null,
                analyzedGenLibs: new Map(),
            }))]);
            setGenLibs([...genLibs, ...result.gen_libs]);
            setSelectedGenLibMulti([...selectedGenLibMulti, ...new Array(result.gen_libs.length).fill(false)]);
            if (result.id) {
                searchParams.set('id', result.id.toString());
                setSearchParams(searchParams);
            }
        } catch (err) {
            console.error(err);
            showAlert(`Ошибка при парсинге: ${getErrorMessage(err)}`, 'error');
        } finally {
            setIsParsing(false);
        }
    };

    const handleAnalyze = async (sizeStandardIndex: number, genLibMulti: boolean[]) => {
        if (isAnalyzing) return;

        const genLibIndices: number[] = genLibMulti
            .map((val, i) => val ? i : -1)
            .filter(ind => ind !== -1);

        setIsAnalysing(true);
        try {
            const { data: [sizeStandardResult] } = await analyzeSizeStandard({
                items: [{
                    raw_signal: sizeStandards[sizeStandardIndex].parsed.signal,
                    calibration: sizeStandards[sizeStandardIndex].parsed.calibration,
                }],
            });

            setSizeStandards(prev => prev.map((sizeStandard, i) => (
                i === sizeStandardIndex
                    ? {
                        ...sizeStandard,
                        analyzed: sizeStandardResult,
                    }
                    : sizeStandard
            )));

            if (sizeStandardResult.state != 'success') {
                showAlert(`Анализ стандарта длин выполнен с ошибкой: ${sizeStandardResult.message}`, 'error');
                return;
            }

            if (genLibIndices.length === 0) {
                showAlert(`Анализ стандарта длин выполнен успешно`, 'success');
                return;
            }

            const { data: genLibResults } = await analyzeGenLibs({
                raw_signals: genLibIndices.map(i => genLibs[i].signal),
                size_standard_analyze_peaks: sizeStandardResult.peaks,
            });

            const preparedResult = genLibIndices.map<[number, GenLibAnalyzeResult | GenLibAnalyzeError]>((ind, i) => [ind, genLibResults[i]]);
            setSizeStandards(prev => prev.map((sizeStandard, i) => (
                i === sizeStandardIndex
                    ? {
                        ...sizeStandard,
                        analyzedGenLibs: new Map([
                            ...sizeStandard.analyzedGenLibs,
                            ...preparedResult,
                        ])
                    }
                    : sizeStandard
            )))

            const errorCount = genLibResults.reduce((cnt, res) => res.state === 'error' ? cnt + 1 : cnt, 0);
            const state = errorCount === 0 ? 'success' : errorCount < genLibIndices.length ? 'warning' : 'error';
            showAlert(`Анализ геномных библиотек выполнен - успешно: ${genLibIndices.length - errorCount}, ошибка: ${errorCount}`, state);
        } catch (err) {
            console.error('Analysis error:', err);
            showAlert(`Ошибка при анализе: ${getErrorMessage(err)}`, 'error');
        } finally {
            setIsAnalysing(false);
        }
    };

    const handleGeneratePdf = async (sizeStandardIndex: number, genLibMulti: boolean[]) => {
        const selectedGenLibIndices: number[] = genLibMulti
            .map((val, i) => val ? i : -1)
            .filter(ind => ind !== -1);
        await generatePdf(sizeStandards[sizeStandardIndex], genLibs, selectedGenLibIndices);
    }

    return (
        <MainContainer
            sizeStandards={sizeStandards}
            genLibs={genLibs}
            selectedGenLibMulti={selectedGenLibMulti}
            setSelectedGenLibMulti={setSelectedGenLibMulti}
            chartHeight={chartHeight}
            isCompactMode
            leftToolbar={null}
            toolbar={({ selectedSizeStandard, selectedGenLibMulti, isSmallScreen }) => (
                <>
                    {sizeStandards.length > 0 && <>
                        <Typography color='textSecondary' sx={{ whiteSpace: 'nowrap', mr: 1 }}>{selectedGenLibCount} ГБ</Typography>
                        <Button
                            variant='outlined'
                            color='secondary'
                            onClick={() => handleAnalyze(selectedSizeStandard, selectedGenLibMulti)}
                            disabled={isParsing || isAnalyzing || isGeneratingPDF}
                        >
                            {isAnalyzing ? <CircularProgress color='inherit' size={24} sx={{ mr: isSmallScreen ? 0 : 1 }} /> : <ScienceTwoTone sx={{ mr: isSmallScreen ? 0 : 1 }} />}
                            {!isSmallScreen && 'Анализ'}
                        </Button>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={() => handleGeneratePdf(selectedSizeStandard, selectedGenLibMulti)}
                            disabled={isParsing || isAnalyzing || isGeneratingPDF}
                        >
                            {isGeneratingPDF ? <CircularProgress color='inherit' size={24} sx={{ mr: isSmallScreen ? 0 : 1 }} /> : <AssessmentTwoTone sx={{ mr: isSmallScreen ? 0 : 1 }} />}
                            {!isSmallScreen && 'Создать отчет'}
                        </Button>
                    </>}
                    <Button
                        variant='outlined'
                        color='inherit'
                        component='label'
                        disabled={isParsing || isAnalyzing || isGeneratingPDF}
                    >
                        {isParsing ? <CircularProgress color='inherit' size={24} sx={{ mr: isSmallScreen ? 0 : 1 }} /> : <AddTwoTone sx={{ mr: isSmallScreen ? 0 : 1 }} />}
                        {!isSmallScreen && 'Файлы'}
                        <input type="file" hidden multiple accept='.frf' onChange={handleFileChange} />
                    </Button>
                </>
            )}
        />
    );
};

export default FileUploadPage;
