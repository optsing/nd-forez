import { Box, SxProps, Theme } from "@mui/material";
import { useMemo, useRef } from "react"
import { Line } from "react-chartjs-2"
import { createChartOptions, DatasetWithAnnotations, prepareDataAndAnnotations, useChartColors } from "../helpers/chart";



type Props<T> = {
    rawData: T;
    prepare: (rawData: T) => DatasetWithAnnotations[];
    yTitle?: string;
    height: number;
    sx?: SxProps<Theme>;
};

const ChartWithZoom = <T,>({
    rawData,
    prepare,
    yTitle,
    height,
    sx,
}: Props<T>) => {
    const chartRef = useRef<any>(null);
    const handleDoubleClick = () => {
        chartRef.current?.resetZoom();
    }

    const datasets = useMemo(() => prepare(rawData), [rawData, prepare]);

    const chartColors = useChartColors();

    const [data, annotations, chromatogram] = useMemo(() => {
        return prepareDataAndAnnotations(datasets, chartColors);
    }, [datasets, chartColors]);

    const options = useMemo(() => {
        return createChartOptions(chartColors, { yTitle, annotations, chromatogram, disableAnimation: false, disableZoom: false });
    }, [chartColors, yTitle, annotations]);

    return (
        <Box sx={[
            {
                position: 'relative',
                width: '100%',
                height: `${height}px`
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        >
            <Line
                options={options}
                data={data}
                ref={chartRef}
                onDoubleClick={handleDoubleClick}
            />
        </Box>
    )
}

export default ChartWithZoom;
