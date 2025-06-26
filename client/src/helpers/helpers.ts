import { useColorScheme, useMediaQuery } from "@mui/material";
import { ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { useMemo } from "react";


export function round(num: number) {
    return Math.round(num * 100) / 100;
}

interface ChartColors {
    textColor: string;
    gridColor: string;
    primaryLineColor: string;
    primaryLineBackgroudColor: string;
    secondaryLineColor: string;
    secondaryLineBackgroundColor: string;
}

interface UseChartOptionsProps {
    yTitle?: string;
    annotations?: AnnotationOptions[];
}

export function UseChartColors(): ChartColors {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const scheme = useColorScheme();
    return useMemo(() => {
        const isDark = scheme.mode === 'dark' || (scheme.mode === 'system' && prefersDarkMode);
        return {
            textColor: isDark ? '#fff' : '#333',
            gridColor: isDark ? '#444' : '#bbb',
            primaryLineColor: isDark ? '#536DFE' : '#304FFE',
            primaryLineBackgroudColor: isDark ? '#8C9EFF' : '#3D5AFE',
            secondaryLineColor: isDark ? '#D50000' : '#FF5252',
            secondaryLineBackgroundColor: isDark ? '#FF1744' : '#FF8A80',
        };
    }, [scheme.mode, prefersDarkMode]);
}

export function useChartOptions(chartColors: ChartColors, { yTitle, annotations }: UseChartOptionsProps = { }): ChartOptions<'line'> {
    return useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Длина фрагментов, пн',
                        color: chartColors.textColor,
                    },
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
                        text: yTitle || 'Интенсивность',
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

