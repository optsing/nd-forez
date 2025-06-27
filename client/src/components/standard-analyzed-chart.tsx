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
import { UseChartColors, useChartOptions } from '../helpers/helpers';
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

    const chartColors = UseChartColors();
    const chartOptions = useChartOptions(chartColors, { yTitle, annotations });

    useEffect(() => {
        if (selected === 0) {
            setYTitle('Интенсивность');
            setChartData({
                datasets: [
                    {
                        label: 'Интенсивность',
                        data: analyzeResult.ZrRef.map((y, x) => ({ x, y })),
                        borderColor: chartColors.primaryLineColor,
                        backgroundColor: chartColors.primaryLineBackgroudColor,
                        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                        pointBorderColor: 'rgba(0, 0, 0, 0)',
                        borderWidth: 2,
                    },
                    {
                        label: 'Пики',
                        data: analyzeResult.peak.map(x => ({ x, y: analyzeResult.ZrRef[x] })),
                        borderColor: chartColors.secondaryLineColor,
                        backgroundColor: chartColors.secondaryLineBackgroundColor,
                        pointBorderColor: chartColors.secondaryLineColor,
                        pointBackgroundColor: chartColors.secondaryLineColor,
                        pointRadius: 6,
                        showLine: false
                    }
                ]
            });
            const annotations: AnnotationOptions[] = [];
            for (const p of analyzeResult.peak) {
                annotations.push({
                    type: 'line',
                    xMin: p,
                    xMax: p,
                    yMin: 0,
                    yMax: analyzeResult.ZrRef[p],
                    borderColor: chartColors.secondaryLineBackgroundColor,
                    borderWidth: 2,
                    label: {
                        content: p.toString(),
                        display: true,
                        position: 'end',
                        color: chartColors.textColor,
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        xAdjust: -10,
                        yAdjust: -10,
                    },
                })
            }
            setAnnotations(annotations);
        } else if (selected === 1) {
            setYTitle('Время выхода, сек')
            setChartData({
                datasets: [
                    {
                        label: 'Исходные данные',
                        data: analyzeResult.sizes.map((x, i) => ({ x, y: analyzeResult.peak[i] })),
                        borderColor: chartColors.primaryLineColor,
                        backgroundColor: chartColors.primaryLineBackgroudColor,
                        pointBorderColor: chartColors.primaryLineColor,
                        pointBackgroundColor: chartColors.primaryLineColor,
                        pointRadius: 6,
                        showLine: false,
                    },
                    {
                        label: 'Подгонка полинома',
                        data: analyzeResult.liz_fit.map((x, i) => ({ x, y: analyzeResult.locs_fit[i] })),
                        borderColor: chartColors.secondaryLineColor,
                        backgroundColor: chartColors.secondaryLineBackgroundColor,
                        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                        pointBorderColor: 'rgba(0, 0, 0, 0)',
                        borderWidth: 2,
                    }
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
