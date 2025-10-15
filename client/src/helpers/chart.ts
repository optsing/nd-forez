import { ChartData, ChartDataset, ChartOptions, Point, PointStyle } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { round } from "./helpers";
import { useColorScheme, useMediaQuery } from "@mui/material";
import { buildChromatogram } from "./chromatogram";


export type ChartPoint = {
    x: number;
    y: number;
}

type BaseDataset = {
    title: string;
    color?: 'primary' | 'secondary' | 'tertiary';
    points: ChartPoint[];
    showChromatogram?: boolean;
}

type NonPointDatasetExtra = {
    type: 'line' | 'filled';
}

type PointDatasetExtra = {
    type: 'point';
    pointStyle?: PointStyle;
}

type WithLines = {
    showLines: true;
    lineValues: number[];
};

type WithoutLines = {
    showLines?: false;
};

export type DatasetWithAnnotations = BaseDataset & (NonPointDatasetExtra | PointDatasetExtra) & (WithLines | WithoutLines);

interface ChartDatasetColors {
    line: string;
    background: string;
}

export interface ChartColors {
    textColor: string;
    gridColor: string;
    primary: ChartDatasetColors;
    secondary: ChartDatasetColors;
    tertiary: ChartDatasetColors;
}

export const CHART_LIGHT_THEME: ChartColors = {
    textColor: '#333',
    gridColor: '#bbb',
    primary: {
        line: 'rgba(40, 53, 147, 1)',
        background: 'rgba(40, 53, 147, 0.5)',
    },
    secondary: {
        line: 'rgba(198, 40, 40, 1)',
        background: 'rgba(198, 40, 40, 0.5)',
    },
    tertiary: {
        line: 'rgba(0, 105, 92, 1)',
        background: 'rgba(0, 105, 92, 0.5)',
    },
};

export const CHART_DARK_THEME: ChartColors = {
    textColor: '#fff',
    gridColor: '#444',
    primary: {
        line: 'rgba(63, 81, 181, 1)',
        background: 'rgba(63, 81, 181, 0.5)',
    },
    secondary: {
        line: 'rgba(213, 0, 0, 1)',
        background: 'rgba(213, 0, 0, 0.5)',
    },
    tertiary: {
        line: 'rgba(0, 150, 136, 1)',
        background: 'rgba(0, 150, 136, 0.5)',
    },
}

export function useChartColors(): ChartColors {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const scheme = useColorScheme();
    const isDarkMode = scheme.mode === 'dark' || (scheme.mode === 'system' && prefersDarkMode);
    return isDarkMode ? CHART_DARK_THEME : CHART_LIGHT_THEME;
}

interface ChartOptionsExtraProps {
    yTitle?: string;
    annotations: AnnotationOptions[];
    chromatogram: number[];
    disableAnimation: boolean;
    disableZoom: boolean;
}

export function createChartOptions(chartColors: ChartColors, { yTitle, annotations, chromatogram, disableAnimation, disableZoom }: ChartOptionsExtraProps): ChartOptions<'line'> {
    return {
        responsive: true,
        normalized: true,
        parsing: false,
        maintainAspectRatio: false,
        animation: disableAnimation ? false : undefined,
        layout: {
            padding: {
                right: chromatogram.length > 0 ? 40 : 0,
            }
        },
        scales: {
            x: {
                type: 'linear',
                ticks: {
                    display: false,
                    color: chartColors.textColor,
                },
                grid: {
                    display: true,
                    color: chartColors.gridColor
                },
            },
            y: {
                title: {
                    display: true,
                    text: yTitle || 'Интенсивность * 10⁶',
                    color: chartColors.textColor,
                },
                type: 'linear',
                ticks: {
                    display: true,
                    color: chartColors.textColor,
                },
                grid: {
                    display: true,
                    color: chartColors.gridColor,
                },
            },
        },
        plugins: {
            tooltip: {
                intersect: false,
            },
            legend: {
                labels: {
                    color: chartColors.textColor,
                    boxWidth: 16,
                    boxHeight: 16,
                },
            },
            zoom: {
                zoom: {
                    pinch: { enabled: !disableZoom },
                    drag: {
                        enabled: !disableZoom,
                        threshold: 10,
                    },
                    mode: 'x' as 'x',
                },
                pan: {
                    enabled: !disableZoom,
                    modifierKey: 'ctrl',
                    mode: 'x' as 'x',
                },
            },
            annotation: {
                annotations,
            },
            chromatogram: {
                data: chromatogram,
                maxGray: 245,
                width: 40,
            },
        },
    };
}


export function createVerticalLines(datasetIndex: number, points: ChartPoint[], titles: number[], chartColors: ChartColors, datasetColors: ChartDatasetColors): AnnotationOptions[] {
    const result: AnnotationOptions[] = [];
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        result.push({
            type: 'line',
            xMin: p.x,
            xMax: p.x,
            yMin: 0,
            yMax: p.y,
            borderColor: datasetColors.line,
            borderWidth: 1,
            label: {
                content: round(titles[i]).toString(),
                display: true,
                position: 'end',
                color: chartColors.textColor,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                xAdjust: -10,
                yAdjust: -10,
            },
            display: ctx => ctx.chart.isDatasetVisible(datasetIndex),
        });
    }
    return result;
}

export function createLineDataset(title: string, points: ChartPoint[], datasetColors: ChartDatasetColors): ChartDataset<'line'> {
    return {
        label: title,
        data: points,
        borderColor: datasetColors.line,
        backgroundColor: datasetColors.background,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
        pointRadius: 6,
    }
}

export function createPointDataset(title: string, points: ChartPoint[], datasetColors: ChartDatasetColors, pointStyle: PointStyle = 'circle'): ChartDataset<'line'> {
    return {
        label: title,
        data: points,
        borderColor: datasetColors.line,
        backgroundColor: datasetColors.background,
        pointBorderColor: datasetColors.line,
        pointBackgroundColor: datasetColors.background,
        pointStyle: pointStyle,
        pointRadius: pointStyle === 'circle' ? 5 : 8,
        pointBorderWidth: 3,
        showLine: false,
    }
}

export function createFilledDataset(title: string, points: ChartPoint[], datasetColors: ChartDatasetColors): ChartDataset<'line'> {
    return {
        label: title,
        data: points,
        borderColor: datasetColors.line,
        backgroundColor: datasetColors.background,
        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
        showLine: false,
        fill: true,
    }
}

export function prepareDataAndAnnotations(datasets: DatasetWithAnnotations[], chartColors: ChartColors): [ChartData<'line'>, AnnotationOptions[], number[]] {
    const data: ChartDataset<'line'>[] = [];
    const annotations: AnnotationOptions[] = [];
    const chromatogram: number[] = [];
    for (let i = 0; i < datasets.length; i++) {
        const dataset = datasets[i];
        let color = chartColors.primary;
        if (dataset.color === 'secondary') {
            color = chartColors.secondary;
        } else if (dataset.color === 'tertiary') {
            color = chartColors.tertiary;
        }
        if (dataset.type === 'point') {
            data.push(
                createPointDataset(dataset.title, dataset.points, color, dataset.pointStyle)
            );
        } else if (dataset.type === 'filled') {
            data.push(
                createFilledDataset(dataset.title, dataset.points, color)
            );
        } else {
            data.push(
                createLineDataset(dataset.title, dataset.points, color)
            );
        }
        if (dataset.showLines) {
            annotations.push(
                ...createVerticalLines(i, dataset.points, dataset.lineValues, chartColors, color)
            );
        }
        if (dataset.showChromatogram) {
            chromatogram.push(
                ...buildChromatogram(dataset.points)
            );
        }
    }
    return [{ datasets: data }, annotations, chromatogram];
}
