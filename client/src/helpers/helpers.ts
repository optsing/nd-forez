import { useColorScheme, useMediaQuery } from "@mui/material";
import { ChartDataset, ChartOptions, Point, PointStyle } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { useMemo } from "react";


export function round(num: number) {
    return Math.round(num * 100) / 100;
}

interface ChartDatasetColors {
    line: string;
    background: string;
}

interface ChartColors {
    textColor: string;
    gridColor: string;
    primary: ChartDatasetColors;
    secondary: ChartDatasetColors;
    tertiary: ChartDatasetColors;
}

const CHART_LIGHT_THEME: ChartColors = {
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

const CHART_DARK_THEME: ChartColors = {
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

interface UseChartOptionsProps {
    yTitle?: string;
    annotations?: AnnotationOptions[];
}

export function useChartColors(): ChartColors {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const scheme = useColorScheme();
    const isDarkMode = scheme.mode === 'dark' || (scheme.mode === 'system' && prefersDarkMode);
    return isDarkMode ? CHART_DARK_THEME : CHART_LIGHT_THEME;
}

export function useChartOptions(chartColors: ChartColors, { yTitle, annotations }: UseChartOptionsProps = {}): ChartOptions<'line'> {
    return useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    ticks: {
                        display: true,
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
                        text: yTitle || 'Интенсивность * 10^6',
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
                        pinch: { enabled: true },
                        drag: {
                            enabled: true,
                            threshold: 10,
                        },
                        mode: 'x' as 'x',
                    },
                    pan: {
                        enabled: true,
                        modifierKey: 'ctrl',
                        mode: 'x' as 'x',
                    },
                },
                annotation: {
                    annotations: annotations || [],
                },
            },
        };
    }, [chartColors, yTitle, annotations]);
}

export function CreateVerticalLines(points: Point[], titles: number[], chartColors: ChartColors, datasetColors: ChartDatasetColors): AnnotationOptions[] {
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
        })
    }
    return result;
}

export function CreateLineDataset(title: string, points: Point[], datasetColors: ChartDatasetColors): ChartDataset<'line'> {
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

export function CreatePointDataset(title: string, points: Point[], datasetColors: ChartDatasetColors, pointStyle: PointStyle = 'circle'): ChartDataset<'line'> {
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

export function CreateFilledDataset(title: string, points: Point[], datasetColors: ChartDatasetColors): ChartDataset<'line'> {
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
