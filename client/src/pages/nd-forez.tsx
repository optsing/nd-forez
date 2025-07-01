import { useState, ChangeEvent, useEffect } from 'react';
import { Typography, CircularProgress, Fab, Box, Tabs, Tab, Button } from '@mui/material';
import { Science, UploadFile } from '@mui/icons-material';
import { AnalyzeResult, ParseResult } from '../models/models';
import StandardAnalyzedChartContainer from '../components/standard-analyzed-chart-container';
import GenLibAnalyzedChartContainer from '../components/genlib-analyzed-chart-container';
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
import { analyzeData, getParseResult, parseFiles, getErrorMessage } from '../api';
import { useAlert } from '../context/alert-context';
import StandardChartContainer from '../components/standard-chart-container';
import GenLibChartContainer from '../components/genlib-chart-conainer';


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
    const [isCompactMode, setIsCompactMode] = useState<boolean>(true);
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
            const result = await parseFiles(files);
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
            const result = await analyzeData({
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
                ? <Box sx={{
                    marginX: {
                        xs: 1,
                        sm: 3,
                        md: 6,
                    },
                    marginTop: 3,
                    marginBottom: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}>
                    {parseResult.size_standards.length > 0 && <StandardChartContainer
                        sizeStandards={parseResult.size_standards}
                        selected={selectedStandard}
                        setSelected={setSelectedStandard}
                    />}
                    {parseResult.gen_libs.length > 0 && <GenLibChartContainer
                        genLibs={parseResult.gen_libs}
                        selected={selectedGenLibs}
                        setSelected={setSelectedGenLibs}
                    />}
                </Box>
                : (!isParsing && <Box sx={{
                    marginX: {
                        xs: 1,
                        sm: 3,
                        md: 6,
                    },
                    marginTop: 3,
                    marginBottom: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                }}>
                    <Typography variant='h4' margin='auto' textAlign='center'>Выберите файлы для просмотра</Typography>
                </Box>)
            )}

            {currentTab == 1 && analyzeResult && (
                <>
                    <Box display='flex' justifyContent='right' sx={{
                        display: 'flex',
                        justifyContent: 'right',
                        px: {
                            xs: 1,
                            sm: 3,
                            md: 6,
                        },
                        py: 1,
                    }}>
                        <Button variant='outlined' onClick={() => setIsCompactMode(!isCompactMode)}>
                            {isCompactMode ? 'Развернуть' : 'Свернуть'}
                        </Button>
                    </Box>
                    <Box sx={{
                        marginX: {
                            xs: 1,
                            sm: 3,
                            md: 6,
                        },
                        marginBottom: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}>
                        <StandardAnalyzedChartContainer
                            analyzeResult={analyzeResult}
                            isCompactMode={isCompactMode}
                        />
                        {analyzeResult.genlib_data.length > 0 &&
                            <GenLibAnalyzedChartContainer
                                analyzeResultData={analyzeResult.genlib_data}
                                selected={selectedGenLibsAnalyzed}
                                setSelected={setSelectedGenLibsAnalyzed}
                                isCompactMode={isCompactMode}
                            />}
                    </Box>
                </>
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
