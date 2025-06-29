import { useEffect, useState } from 'react';
import {
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import { ChartData, } from 'chart.js';
import { AnalyzeResult } from '../models/models';
import { CreateVerticalLines as CreateChartVerticalLines, CreateLineDataset, CreatePointDataset, useChartColors, useChartOptions } from '../helpers/helpers';
import ChartContainer from './chart-container';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import ChartWithZoom from './chart-with-zoom';


interface Props {
    analyzeResult: AnalyzeResult
}

const StandardAnalyzedChart: React.FC<Props> = ({
    analyzeResult,
}) => {
    const [selected, setSelected] = useState<number>(0);
    const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

    const [yTitle, setYTitle] = useState<string>();
    const [annotations, setAnnotations] = useState<AnnotationOptions[]>([]);

    const chartColors = useChartColors();
    const chartOptions = useChartOptions(chartColors, { yTitle, annotations });

    useEffect(() => {
        if (selected === 0) {
            const peakPoints = analyzeResult.peak.map(x => ({ x, y: analyzeResult.ZrRef[x] * 1e-6 }));
            const annotations = CreateChartVerticalLines(peakPoints, analyzeResult.sizes, chartColors, chartColors.secondary);
            setYTitle('Интенсивность * 10^6');
            setChartData({
                datasets: [
                    CreateLineDataset('Интенсивность', analyzeResult.ZrRef.map((y, x) => ({ x, y: y * 1e-6 })), chartColors.primary),
                    CreatePointDataset('Пики', peakPoints, chartColors.secondary),
                ]
            });
            setAnnotations(annotations);
        } else if (selected === 1) {
            setYTitle('Время выхода, с')
            setChartData({
                datasets: [
                    CreatePointDataset('Исходные данные', analyzeResult.sizes.map((x, i) => ({ x, y: analyzeResult.peak[i] })), chartColors.primary),
                    CreateLineDataset('Подгонка полинома', analyzeResult.liz_fit.map((x, i) => ({ x, y: analyzeResult.locs_fit[i] })), chartColors.secondary),
                ]
            });
            setAnnotations([]);
        } else {
            setChartData(null);
        }
    }, [selected, chartColors, analyzeResult])

    return (
        <>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Стандарты длин
            </Typography>

            <ChartContainer
                sidebar={
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={selected}
                            onChange={(e) => setSelected(parseInt(e.target.value))}
                        >
                            <FormControlLabel
                                value={0}
                                control={<Radio />}
                                label='Пики и коррекция'
                            />
                            <FormControlLabel
                                value={1}
                                control={<Radio />}
                                label='Калибровочная кривая'
                            />
                        </RadioGroup>
                    </FormControl>
                }
            >
                {chartData && <ChartWithZoom
                    options={chartOptions}
                    data={chartData}
                />}
            </ChartContainer>
        </>
    );
};

export default StandardAnalyzedChart;
