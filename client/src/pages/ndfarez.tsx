import React, { useState, ChangeEvent, useEffect } from 'react';
import { Typography, CircularProgress, Fab, Box, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { Science, UploadFile } from '@mui/icons-material';
import GenLibChart from '../components/genlib-chart';
import StandardChart from '../components/standard-chart';
import { AnalyzeInput, AnalyzeResult, ParseResult } from '../models/models';
import StandardAnalyzedChart from '../components/standard-analyzed-chart';
import GenLibAnalyzedChart from '../components/genlib-analyzed-chart';
import StandardAnalyzedTable from '../components/standard-analyzed-table';
import GenLibAnalyzedTable from '../components/genlib-analyzed-table';
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
import { API_URL } from '../consts';
import { useSearchParams } from 'react-router';


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
);


const FileUploadPage: React.FC = () => {
    const [parsing, setParsing] = useState<boolean>(false);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [analyzing, setAnalysing] = useState<boolean>(false);
    const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

    const [currentTab, setCurrentTab] = useState<number>(0);

    const [selectedStandard, setSelectedStandard] = useState(0);
    const [selectedGenLibs, setSelectedGenLibs] = useState<boolean[]>([]);
    const [selectedGenLibsAnalyzed, setSelectedGenLibsAnalyzed] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fn = async (id: number) => {
            setCurrentTab(0);
            setParsing(true);
            setParseResult(null);
            setAnalyzeResult(null);
            setError(null);

            try {
                const response = await fetch(API_URL + `/api/parse-results/${id}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const data: ParseResult = await response.json();
                setParseResult(data);
                setSelectedGenLibs(new Array(data.gen_libs.length).fill(true));
            } catch (err) {
                console.error(err);
                setError('Ошибка при получении данных');
                setIsAlertOpen(true);
            } finally {
                setParsing(false);
            }
        }
        const id = searchParams.get('id')
        if (id) {
            fn(Number.parseInt(id));
        }
    }, []);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (parsing) return;
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) return;

        setCurrentTab(0);
        setParsing(true);
        setParseResult(null);
        setAnalyzeResult(null);
        setError(null);

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));
            const response = await fetch(API_URL + '/api/parse', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const data: ParseResult = await response.json();
            setParseResult(data);
            setSelectedGenLibs(new Array(data.gen_libs.length).fill(true));
            if (data.id) {
                searchParams.append('id', data.id.toString());
                setSearchParams(searchParams);
            }
        } catch (err) {
            console.error(err);
            setError('Ошибка при парсинге');
            setIsAlertOpen(true);
        } finally {
            setParsing(false);
        }
    };

    const handleAnalyzeClick = async () => {
        if (!parseResult || analyzing) return;
        const payload: AnalyzeInput = {
            size_standard: parseResult.size_standards[selectedStandard],
            gen_libs: parseResult.gen_libs.filter((_, i) => selectedGenLibs[i]),
        };

        setAnalysing(true);
        setAnalyzeResult(null);
        setError(null);

        try {
            const response = await fetch(API_URL + '/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const result: AnalyzeResult = await response.json();
            setAnalyzeResult(result);
            setCurrentTab(1);
        } catch (error) {
            console.error('Analysis error:', error);
            setError('Ошибка при анализе')
            setIsAlertOpen(true);
        } finally {
            setAnalysing(false);
        }
    };

    const handleAlertClose = () => setIsAlertOpen(false);

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)} aria-label="basic tabs example">
                    <Tab label="Просмотр данных" />
                    <Tab label="Результаты анализа" disabled={!analyzeResult} />
                </Tabs>
            </Box>

            {currentTab == 0 && (parseResult
                ? <Box margin={3} mb={10}>
                    {parseResult.size_standards.length > 0 && <StandardChart
                        sizeStandards={parseResult.size_standards}
                        selectedStandard={selectedStandard}
                        setSelectedStandard={setSelectedStandard}
                    />}
                    {parseResult.gen_libs.length > 0 && <GenLibChart
                        genLibs={parseResult.gen_libs}
                        selectedGenLibs={selectedGenLibs}
                        setSelectedGenLibs={setSelectedGenLibs}
                    />}
                </Box>
                : (!parsing && <Box margin={3} mb={10} display='flex' alignItems='center' justifyContent='center' height='100vh'>
                    <Typography variant='h4' textAlign='center'>Выберите файлы для просмотра</Typography>
                </Box>)
            )}

            {currentTab == 1 && analyzeResult && (
                <Box margin={3} mb={10}>
                    <StandardAnalyzedChart
                        analyzeResult={analyzeResult}
                    />
                    <StandardAnalyzedTable
                        analyzeResult={analyzeResult}
                    />
                    {selectedGenLibsAnalyzed < analyzeResult.genlib_data.length &&
                        <>
                            <GenLibAnalyzedChart
                                analyzeResultData={analyzeResult.genlib_data}
                                selected={selectedGenLibsAnalyzed}
                                setSelected={setSelectedGenLibsAnalyzed}
                            />
                            <GenLibAnalyzedTable
                                analyzeResultData={analyzeResult.genlib_data}
                                selected={selectedGenLibsAnalyzed}
                            />
                        </>}
                </Box>
            )}

            <Box
                display='flex'
                gap={1}
                sx={{
                    position: 'absolute',
                    right: '2em',
                    bottom: '2em',
                }}
            >
                <Fab
                    variant="extended"
                    color="primary"
                    component='label'
                >
                    {parsing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <UploadFile />}
                    Выбрать файлы
                    <input type="file" hidden multiple onChange={handleFileChange} />
                </Fab>
                <Fab
                    variant="extended"
                    color="secondary"
                    onClick={handleAnalyzeClick}
                    disabled={!parseResult || parseResult.size_standards.length === 0}
                >
                    {analyzing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <Science sx={{ mr: 1 }} />}
                    Анализ
                </Fab>
            </Box>

            <Snackbar open={isAlertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert severity='error' variant="filled" onClose={handleAlertClose}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};

export default FileUploadPage;
