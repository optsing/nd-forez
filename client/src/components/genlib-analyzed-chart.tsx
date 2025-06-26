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
import { round, UseChartColors, useChartOptions } from '../helpers/helpers';
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

    const chartColors = UseChartColors();
    const chartOptions = useChartOptions(chartColors, { annotations });

    const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

    useEffect(() => {
        if (analyzeResultData.length === 0) return;
        const source = analyzeResultData[selected];
        const annotations: AnnotationOptions[] = [];
        const data: ChartData<'line'> = {
            datasets: [
                {
                    label: 'Интенсивность',
                    data: source.t_main.map((x, i) => ({ x, y: source.denoised_data[i] })),
                    borderColor: chartColors.primaryLineColor,
                    backgroundColor: chartColors.primaryLineBackgroudColor,
                    pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                    pointBorderColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 2,
                }
            ]
        };
        if (source.st_peaks.length > 0) {
            for (let i = 0; i < source.st_peaks.length; i++) {
                annotations.push({
                    type: 'line',
                    xMin: source.st_peaks[i],
                    xMax: source.st_peaks[i],
                    yMin: 0,
                    yMax: source.denoised_data[source.st_length[i]],
                    borderColor: chartColors.secondaryLineBackgroundColor,
                    borderWidth: 2,
                    label: {
                        content: round(source.st_peaks[i]).toString(),
                        display: true,
                        position: 'end',
                        color: chartColors.textColor,
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        xAdjust: -10,
                        yAdjust: -10,
                    },
                })
            }
            data.datasets.push({
                label: 'Пики',
                data: source.st_peaks.map((x, i) => ({ x, y: source.denoised_data[source.st_length[i]] })),
                borderColor: chartColors.secondaryLineColor,
                backgroundColor: chartColors.secondaryLineBackgroundColor,
                pointBorderColor: chartColors.secondaryLineColor,
                pointBackgroundColor: chartColors.secondaryLineColor,
                pointStyle: 'crossRot',
                pointBorderWidth: 3,
                pointRadius: 8,
                showLine: false
            });
        }
        if (source.t_unrecognized_peaks.length > 0) {
            for (let i = 0; i < source.t_unrecognized_peaks.length; i++) {
                annotations.push({
                    type: 'line',
                    xMin: source.t_unrecognized_peaks[i],
                    xMax: source.t_unrecognized_peaks[i],
                    yMin: 0,
                    yMax: source.denoised_data[source.unrecognized_peaks[i]],
                    borderColor: chartColors.secondaryLineBackgroundColor,
                    borderWidth: 2,
                    label: {
                        content: round(source.t_unrecognized_peaks[i]).toString(),
                        display: true,
                        position: 'end',
                        color: chartColors.textColor,
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        xAdjust: -10,
                        yAdjust: -10,
                    },
                })
            }
            data.datasets.push({
                label: 'Нераспознанные пики',
                data: source.t_unrecognized_peaks.map((x, i) => ({ x, y: source.denoised_data[source.unrecognized_peaks[i]] })),
                borderColor: chartColors.secondaryLineColor,
                backgroundColor: chartColors.secondaryLineBackgroundColor,
                pointBorderColor: chartColors.secondaryLineColor,
                pointBackgroundColor: chartColors.secondaryLineColor,
                pointStyle: 'cross',
                pointBorderWidth: 3,
                pointRadius: 8,
                showLine: false
            });
        }
        if (source.lib_length.length > 0) {
            for (let i = 0; i < source.lib_length.length; i++) {
                annotations.push({
                    type: 'line',
                    xMin: source.lib_length[i],
                    xMax: source.lib_length[i],
                    yMin: 0,
                    yMax: source.denoised_data[source.LibPeakLocations[i]],
                    borderColor: chartColors.secondaryLineBackgroundColor,
                    borderWidth: 2,
                    label: {
                        content: round(source.lib_length[i]).toString(),
                        display: true,
                        position: 'end',
                        color: chartColors.textColor,
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        xAdjust: -10,
                        yAdjust: -10,
                    },
                })
            }
            data.datasets.push({
                label: 'Библиотечные пики',
                data: source.lib_length.map((x, i) => ({ x, y: source.denoised_data[source.LibPeakLocations[i]] })),
                borderColor: chartColors.secondaryLineColor,
                backgroundColor: chartColors.secondaryLineBackgroundColor,
                pointBorderColor: chartColors.secondaryLineColor,
                pointBackgroundColor: chartColors.secondaryLineColor,
                pointRadius: 6,
                showLine: false,
            });
        }
        if (source.x_fill.length > 0) {
            data.datasets.push({
                label: 'Заливка',
                data: source.x_fill.map((x, i) => ({ x, y: source.y_fill[i] })),
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 255, 0, 0.3)',
                backgroundColor: 'rgba(0, 255, 0, 0.3)',
                fill: true,
            });
        }
        if (source.x_Lib_fill.length > 0) {
            data.datasets.push({
                label: 'Заливка',
                data: source.x_Lib_fill.map((x, i) => ({ x, y: source.y_Lib_fill[i] })),
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 255, 0, 0.5)',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                fill: true,
            });
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
