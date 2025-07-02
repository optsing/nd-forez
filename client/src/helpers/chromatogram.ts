import type { Chart, ChartTypeRegistry, Plugin, Point } from 'chart.js';


declare module 'chart.js' {
    interface PluginOptionsByType<TType extends keyof ChartTypeRegistry> {
        chromatogram?: ChromatogramPluginOptions;
    }
}


type ChromatogramPluginOptions = {
    data: number[];
    width?: number;
    maxGray?: number;
};


export function buildChromatogram(data: Point[], ): number[] {
    let maxValue = -Infinity;
    for (const p of data) {
        if (p.y > maxValue) {
            maxValue = p.y;
        }
    }

    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
        const height = i + 1;
        const value = data[i].y;
        const fillHeight = Math.round((value / maxValue) * height);
        result.push(fillHeight / height);
    }
    return result;
}


export const Chromatogram: Plugin = {
    id: 'chromatogram',
    beforeDraw(chart: Chart, args: any, options: ChromatogramPluginOptions) {
        if (!options.data || options.data.length === 0) return;
        const { ctx, chartArea } = chart;
        const data = options.data;
        const width = options.width || 20;
        const maxGray = options.maxGray || 245;
        const xRight = chartArea.right + 5;

        const yStep = chartArea.height / data.length;

        for (let i = 0; i < data.length; i++) {
            const intensity = Math.round(data[i] * maxGray);
            const gray = `rgb(${intensity},${intensity},${intensity})`;
            ctx.fillStyle = gray;

            const yPos = chartArea.top + (data.length - 1 - i) * yStep;
            ctx.fillRect(xRight, yPos - 0.5, width, yStep + 0.5);
        }
    },
};
