import React, { useState, ChangeEvent, useEffect } from 'react';
import { Typography, CircularProgress, Fab, Box, Tabs, Tab } from '@mui/material';
import { Science, UploadFile } from '@mui/icons-material';
import GenLibChart from '../components/genlib-chart';
import StandardChart from '../components/standard-chart';
import { AnalyzeResult, ParseResult } from '../models/models';
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
import { useSearchParams } from 'react-router';
import { analyzeData as PostAnalyze, getParseResult, parseFiles as PostParseFiles, getErrorMessage } from '../api';
import { useAlert } from '../context/alert-context';


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
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [isAnalyzing, setIsAnalysing] = useState<boolean>(false);
    const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
    const showAlert = useAlert();

    const [currentTab, setCurrentTab] = useState<number>(0);

    const [selectedStandard, setSelectedStandard] = useState(0);
    const [selectedGenLibs, setSelectedGenLibs] = useState<boolean[]>([]);
    const [selectedGenLibsAnalyzed, setSelectedGenLibsAnalyzed] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fn = async (id: number) => {
            setCurrentTab(0);
            setIsParsing(true);
            setParseResult(null);
            setAnalyzeResult(null);

            try {
                const result = await getParseResult(id);
                setParseResult(result);
                setSelectedStandard(0);
                setSelectedGenLibs(new Array(result.gen_libs.length).fill(true));
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
        const id = searchParams.get('id')
        if (id) {
            fn(Number.parseInt(id));
        }
    }, []);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (isParsing || isAnalyzing) return;
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) return;

        setCurrentTab(0);
        setIsParsing(true);
        setParseResult(null);
        setAnalyzeResult(null);

        try {
            const result = await PostParseFiles(files);
            setParseResult(result);
            setSelectedStandard(0);
            setSelectedGenLibs(new Array(result.gen_libs.length).fill(true));
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

    const handleAnalyzeClick = async () => {
        if (!parseResult || isAnalyzing) return;

        setIsAnalysing(true);
        setAnalyzeResult(null);
        try {
            const result = await PostAnalyze({
                size_standard: parseResult.size_standards[selectedStandard],
                gen_libs: parseResult.gen_libs.filter((_, i) => selectedGenLibs[i]),
            });

            setAnalyzeResult(result);
            setSelectedGenLibsAnalyzed(0);
            setCurrentTab(1);
        } catch (err) {
            console.error('Analysis error:', err);
            showAlert(`Ошибка при анализе: ${getErrorMessage(err)}`, 'error');
        } finally {
            setIsAnalysing(false);
        }
    };

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, value) => setCurrentTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
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
                : (!isParsing && <Box margin={3} mb={10} display='flex' alignItems='center' justifyContent='center' height='100vh'>
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
                    {analyzeResult.genlib_data.length > 0 &&
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
                    {isParsing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <UploadFile />}
                    Выбрать файлы
                    <input type="file" hidden multiple onChange={handleFileChange} />
                </Fab>
                <Fab
                    variant="extended"
                    color="secondary"
                    onClick={handleAnalyzeClick}
                    disabled={!parseResult || parseResult.size_standards.length === 0}
                >
                    {isAnalyzing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <Science sx={{ mr: 1 }} />}
                    Анализ
                </Fab>
            </Box>
        </>
    );
};

export default FileUploadPage;
