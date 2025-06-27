import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
} from '@mui/material';
import { ChartData } from 'chart.js';
import { AnalyzeResultData } from '../models/models';
import { CreateFilledDataset, CreateLineDataset, CreatePointDataset, CreateVerticalLines, round, useChartColors, useChartOptions } from '../helpers/helpers';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';
import { AnnotationOptions } from 'chartjs-plugin-annotation';



interface Props {
    analyzeResultData: AnalyzeResultData[]
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
}

const GenLibAnalyzedChart: React.FC<Props> = ({
    analyzeResultData,
    selected,
    setSelected,
}) => {
    const [annotations, setAnnotations] = useState<AnnotationOptions[]>();

    const chartColors = useChartColors();
    const chartOptions = useChartOptions(chartColors, { annotations });

    const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

    useEffect(() => {
        if (analyzeResultData.length === 0) return;
        const source = analyzeResultData[selected];
        const annotations: AnnotationOptions[] = [];
        const data: ChartData<'line'> = {
            datasets: [
                CreateLineDataset('Интенсивность', source.t_main.map((x, i) => ({ x, y: source.denoised_data[i] })), chartColors.primary),
            ],
        };
        if (source.st_peaks.length > 0) {
            const peakPoints = source.st_peaks.map((x, i) => ({ x, y: source.denoised_data[source.st_length[i]] }));
            annotations.push(...CreateVerticalLines(peakPoints, chartColors, chartColors.secondary));
            data.datasets.push(
                CreatePointDataset('Пики', peakPoints, chartColors.secondary, 'crossRot')
            );
        }
        if (source.t_unrecognized_peaks.length > 0) {
            const peakPoints = source.t_unrecognized_peaks.map((x, i) => ({ x, y: source.denoised_data[source.unrecognized_peaks[i]] }));
            annotations.push(...CreateVerticalLines(peakPoints, chartColors, chartColors.secondary));
            data.datasets.push(
                CreatePointDataset('Пики (неизвестные)', peakPoints, chartColors.secondary, 'cross')
            );
        }
        if (source.lib_length.length > 0) {
            const peakPoints = source.lib_length.map((x, i) => ({ x, y: source.denoised_data[source.LibPeakLocations[i]] }));
            annotations.push(...CreateVerticalLines(peakPoints, chartColors, chartColors.secondary));
            data.datasets.push(
                CreatePointDataset('Пики (библиотека)', peakPoints, chartColors.secondary)
            )
        }
        if (source.x_fill.length > 0) {
            data.datasets.push(
                CreateFilledDataset('Заливка', source.x_fill.map((x, i) => ({ x, y: source.y_fill[i] })), chartColors.secondary)
            );
        }
        if (source.x_Lib_fill.length > 0) {
            data.datasets.push(
                CreateFilledDataset('Заливка', source.x_Lib_fill.map((x, i) => ({ x, y: source.y_Lib_fill[i] })), chartColors.secondary)
            );
        }
        setChartData(data);
        setAnnotations(annotations);
    }, [selected, analyzeResultData, chartColors])

    return (
        <>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Геномные библиотеки
            </Typography>

            {chartData && <ChartContainer
                sidebar={<FormControl component="fieldset">
                    <RadioGroup
                        value={selected}
                        onChange={(e) => setSelected(parseInt(e.target.value))}
                    >
                        {analyzeResultData.map((s, i) => (
                            <FormControlLabel
                                key={i}
                                value={i}
                                control={<Radio />}
                                label={s.title}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>}
            >
                <ChartWithZoom
                    options={chartOptions}
                    data={chartData}
                />
            </ChartContainer>}
        </>
    );
};

export default GenLibAnalyzedChart;
