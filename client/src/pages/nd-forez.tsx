import { useState, ChangeEvent, useEffect } from 'react';
import { Typography, CircularProgress, Box, Button, useTheme, useMediaQuery, Tabs, Tab } from '@mui/material';
import { ScienceTwoTone, AssessmentTwoTone, AddTwoTone } from '@mui/icons-material';
import { GenLibAnalyzeError, GenLibAnalyzeResult, GenLibParseResult, GenLibsAnalyzeOutput, SizeStandardAnalyzeError, SizeStandardAnalyzeInput, SizeStandardAnalyzeInputItem, SizeStandardAnalyzeResult } from '../models/models';
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
import StandardChartContainer from '../components/size-standards/chart-container';
import GenLibChartContainer from '../components/gen-libs/chart-conainer';
import { useOffscreenChartsToPdf } from '../helpers/pdf';
import { Chromatogram } from '../helpers/chromatogram';
import { parseFiles as serverParseFiles, getParseResult, getErrorMessage, analyzeGenLibs, analyzeSizeStandard } from '../helpers/api';
import { GenLibComplete, SizeStandardComplete } from '../models/client';


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
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const showAlert = useAlert();

    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalysing] = useState<boolean>(false);

    const [selectedTab, setSelectedTab] = useState<number>(0);

    const [sizeStandards, setSizeStandards] = useState<SizeStandardComplete[]>([]);
    const [genLibs, setGenLibs] = useState<GenLibComplete[]>([]);

    const [selectedSizeStandards, setSelectedSizeStandards] = useState<boolean[]>([]);
    const [selectedSizeStandard, setSelectedSizeStandard] = useState<number>(-1);
    const [selectedSizeStandardTab, setSelectedSizeStandardTab] = useState<number>(0);

    const [selectedGenLibs, setSelectedGenLibs] = useState<boolean[]>([]);
    const [selectedGenLib, setSelectedGenLib] = useState<number>(-1);
    const [selectedGenLibTab, setSelectedGenLibTab] = useState<number>(-1);

    const [searchParams, setSearchParams] = useSearchParams();

    const { generatePdf, isGeneratingPDF } = useOffscreenChartsToPdf();

    const selectedSizeStandardCount = selectedSizeStandards.reduce((cnt, item) => cnt + (item ? 1 : 0), 0);
    const selectedSizeGenLibCount = selectedGenLibs.reduce((cnt, item) => cnt + (item ? 1 : 0), 0);

    // const { localCalculations } = useAppSettings();

    // const parseFiles = localCalculations ? clientParseFiles : serverParseFiles;
    // const analyzeData = localCalculations ? clientAnalyzeData : serverAnalyzeData;

    useEffect(() => {
        const fn = async (id: number) => {
            setIsParsing(true);
            try {
                const result = await getParseResult(id);
                setSizeStandards([...sizeStandards, ...result.size_standards.map((sizeStandard) => ({
                    parsed: sizeStandard,
                    analyzed: null,
                }))]);
                setGenLibs([...genLibs, ...result.gen_libs.map(genLib => ({
                    parsed: genLib,
                    analyzed: new Map(),
                }))]);
                setSelectedSizeStandards([...selectedSizeStandards, ...new Array(result.size_standards.length).fill(false)])
                setSelectedGenLibs([...selectedGenLibs, ...new Array(result.gen_libs.length).fill(false)]);
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

        setIsParsing(true);

        try {
            const result = await serverParseFiles(files);
            setSizeStandards([...sizeStandards, ...result.size_standards.map((sizeStandard) => ({
                parsed: sizeStandard,
                analyzed: null,
            }))]);
            setGenLibs([...genLibs, ...result.gen_libs.map(genLib => ({
                parsed: genLib,
                analyzed: new Map(),
            }))]);
            setSelectedSizeStandards([...selectedSizeStandards, ...new Array(result.size_standards.length).fill(false)])
            setSelectedGenLibs([...selectedGenLibs, ...new Array(result.gen_libs.length).fill(false)]);
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

    const handleSizeStandardAnalyzeClick = async (sizeStandardIndex: number) => {
        if (isAnalyzing) return;
        await analyzeAllByIndices([sizeStandardIndex], []);
    }

    const handleAnalyzeAll = async (selectedSizeStandards: boolean[], selectedGenLibs: boolean[]) => {
        const selectedSizeStandardIndices: number[] = selectedSizeStandards
            .map((val, i) => val ? i : -1)
            .filter(ind => ind !== -1);
        const selectedGenLibIndices: number[] = selectedGenLibs
            .map((val, i) => val ? i : -1)
            .filter(ind => ind !== -1);
        await analyzeAllByIndices(selectedSizeStandardIndices, selectedGenLibIndices);
    }

    const handleAnalyzeGenLibClick = async (sizeStandardsIndex: number, genLibIndex: number) => {
        await analyzeAllByIndices([sizeStandardsIndex], [genLibIndex]);
    };

    const analyzeAllByIndices = async (sizeStandardIndicies: number[], genLibIndices: number[]) => {
        if (isAnalyzing) return;

        if (sizeStandardIndicies.length === 0) {
            showAlert('Выберите стандарты длин для анализа', 'warning');
            return;
        }

        setIsAnalysing(true);
        try {
            const sizeStandardInputItems: SizeStandardAnalyzeInputItem[] = [];
            for (const ind of sizeStandardIndicies) {
                sizeStandardInputItems.push({
                    raw_signal: sizeStandards[ind].parsed.signal,
                    calibration: sizeStandards[ind].parsed.calibration,
                });
            }
            const { data: sizeStandardOutput } = await analyzeSizeStandard({
                items: sizeStandardInputItems,
            });

            const sizeStandardResult = new Map<number, SizeStandardAnalyzeResult | SizeStandardAnalyzeError>();
            for (let i = 0; i < sizeStandardOutput.length; i++) {
                sizeStandardResult.set(sizeStandardIndicies[i], sizeStandardOutput[i]);
            }

            setSizeStandards(sizeStandards.map((sizeStandard, i) => (
                sizeStandardResult.has(i)
                    ? { ...sizeStandard, analyzed: sizeStandardResult.get(i)! }
                    : sizeStandard
            )));

            for (const s of sizeStandardOutput) {
                if (s.state != 'success') {
                    showAlert(`Ошибка при анализе стандартов длин: ${s.message}`, 'error');
                    return;
                }
            }

            const genLibOutput: GenLibsAnalyzeOutput[] = [];
            for (const sizeStandard of sizeStandardOutput) {
                if (sizeStandard?.state === 'error') continue;
                genLibOutput.push(await analyzeGenLibs({
                    raw_signals: genLibIndices.map(i => genLibs[i].parsed.signal),
                    size_standard_analyze_peaks: sizeStandard.peaks,
                }));
            }

            const genLibResult = new Map<number, Map<number, GenLibAnalyzeResult | GenLibAnalyzeError>>()

            for (let i = 0; i < genLibOutput.length; i++) {
                const sizeStandardInd = sizeStandardIndicies[i];
                for (let j = 0; j < genLibOutput[i].data.length; j++) {
                    const genLibInd = genLibIndices[j];
                    if (!genLibResult.has(genLibInd)) {
                        genLibResult.set(genLibInd, new Map(genLibs[genLibInd].analyzed));
                    }
                    genLibResult.get(genLibInd)!.set(sizeStandardInd, genLibOutput[i].data[j]);
                }
            }

            setGenLibs(genLibs.map((genLib, i) => (
                genLibResult.has(i)
                    ? {
                        ...genLib,
                        analyzed: genLibResult.get(i)!,
                    }
                    : genLib
            )));

            for (const genLib of genLibOutput) {
                for (const s of genLib.data) {
                    if (s.state === 'error') {
                        showAlert(`Ошибка при анализе геномных библиотек: ${s.message}`, 'error');
                        return;
                    }
                }
            }

            showAlert(`Анализ (${sizeStandardIndicies.length} СД/${genLibIndices.length} ГБ) успешно выполнен`, 'success');
        } catch (err) {
            console.error('Analysis error:', err);
            showAlert(`Ошибка при анализе: ${getErrorMessage(err)}`, 'error');
        } finally {
            setIsAnalysing(false);
        }
    };

    const handleGeneratePdf = async (selectedSizeStandards: boolean[], selectedGenLibs: boolean[]) => {
        const selectedSizeStandardIndices: number[] = selectedSizeStandards
            .map((val, i) => val ? i : -1)
            .filter(ind => ind !== -1);
        const selectedGenLibIndices: number[] = selectedGenLibs
            .map((val, i) => val ? i : -1)
            .filter(ind => ind !== -1);
        await generatePdf(sizeStandards, genLibs, selectedSizeStandardIndices, selectedGenLibIndices);
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
        }}>
            <Box sx={{
                height: '48px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexShrink: 0,
                borderBottom: 1,
                borderColor: 'divider',
                gap: 1,
            }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, value) => setSelectedTab(value)}
                    variant='standard'
                >
                    <Tab
                        value={0}
                        label='Стандарты длин'
                    />
                    <Tab
                        value={1}
                        label='Геномные библиотеки'
                    />
                </Tabs>
                {!isSmallScreen && <>
                    <Button
                        variant='outlined'
                        color='inherit'
                        component='label'
                        sx={{ ml: 1 }}
                    >
                        {isParsing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <AddTwoTone sx={{ mr: 1 }} />}
                        Файлы
                        <input type="file" hidden multiple accept='.frf' onChange={handleFileChange} />
                    </Button>
                    <Typography
                        color='textSecondary' sx={{ ml: 'auto', mr: 1, whiteSpace: 'nowrap' }}
                    >{selectedSizeStandardCount} СД/{selectedSizeGenLibCount} ГБ</Typography>
                    <Button
                        variant='outlined'
                        color='secondary'
                        onClick={() => handleAnalyzeAll(selectedSizeStandards, selectedGenLibs)}
                    >
                        {isAnalyzing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <ScienceTwoTone sx={{ mr: 1 }} />}
                        Анализ
                    </Button>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={() => handleGeneratePdf(selectedSizeStandards, selectedGenLibs)}
                        sx={{ mr: 1 }}
                    >
                        {isGeneratingPDF ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <AssessmentTwoTone sx={{ mr: 1 }} />}
                        Отчет
                    </Button>
                </>}
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                py: {
                    xs: 1,
                    sm: 3,
                },
                px: {
                    xs: 1,
                    sm: 3,
                    md: 5,
                },
                overflowY: 'auto',
            }}>
                {selectedTab === 0 && <StandardChartContainer
                    sizeStandards={sizeStandards}
                    selectedMulti={selectedSizeStandards}
                    setSelectedMulti={setSelectedSizeStandards}
                    selected={selectedSizeStandard}
                    setSelected={setSelectedSizeStandard}
                    selectedTab={selectedSizeStandardTab}
                    setSelectedTab={setSelectedSizeStandardTab}
                    chartHeight={chartHeight}
                    isCompactMode
                    toolbar={({ selected }) => (
                        selected >= 0 && <Button
                            onClick={() => handleSizeStandardAnalyzeClick(selected)}
                            variant='outlined'
                            color='secondary'
                            sx={{ ml: 'auto', flexShrink: 0 }}
                        >
                            {isAnalyzing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <ScienceTwoTone sx={{ mr: 1 }} />}
                            Анализ
                        </Button>
                    )}
                />}
                {selectedTab === 1 && <GenLibChartContainer
                    sizeStandards={sizeStandards}
                    genLibs={genLibs}
                    selectedMulti={selectedGenLibs}
                    setSelectedMulti={setSelectedGenLibs}
                    selected={selectedGenLib}
                    setSelected={setSelectedGenLib}
                    selectedTab={selectedGenLibTab}
                    setSelectedTab={setSelectedGenLibTab}
                    chartHeight={chartHeight}
                    toolbar={({ selected, selectedTab }) => (
                        selected >= 0 && selectedTab >= 0 && <Button
                            onClick={() => handleAnalyzeGenLibClick(selectedTab, selected)}
                            variant='outlined'
                            color='secondary'
                        >
                            {isAnalyzing ? <CircularProgress color='inherit' size={24} sx={{ mr: 1 }} /> : <ScienceTwoTone sx={{ mr: 1 }} />}
                            Анализ
                        </Button>
                    )}
                />}
            </Box>
            {isSmallScreen && <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexShrink: 0,
                borderTop: 1,
                borderColor: 'divider',
                p: 1,
                gap: 1,
            }}>
                <Button
                    variant='outlined'
                    color='inherit'
                    component='label'
                    sx={{ ml: 1 }}
                >
                    {isParsing ? <CircularProgress color='inherit' size={24} /> : <AddTwoTone />}
                    <input type="file" hidden multiple accept='.frf' onChange={handleFileChange} />
                </Button>
                <Typography
                    color='textSecondary' sx={{ ml: 'auto', mr: 1, whiteSpace: 'nowrap' }}
                >{selectedSizeStandardCount} СД/{selectedSizeGenLibCount} ГБ</Typography>
                <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => handleAnalyzeAll(selectedSizeStandards, selectedGenLibs)}
                >
                    {isAnalyzing ? <CircularProgress color='inherit' size={24} /> : <ScienceTwoTone />}
                </Button>
                <Button
                    variant='outlined'
                    color='primary'
                    onClick={() => handleGeneratePdf(selectedSizeStandards, selectedGenLibs)}
                    sx={{ mr: 1 }}
                >
                    {isGeneratingPDF ? <CircularProgress color='inherit' size={24} /> : <AssessmentTwoTone />}
                </Button>
            </Box>}
        </Box>
    );
};

export default FileUploadPage;
