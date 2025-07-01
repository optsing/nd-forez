import { Box } from "@mui/material";
import { useMemo, useRef } from "react"
import { Line } from "react-chartjs-2"
import { CreateFilledDataset, CreateLineDataset, CreatePointDataset, CreateVerticalLines, useChartColors, useChartOptions } from "../helpers/helpers";
import { ChartDataset, Point, PointStyle } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";

type BaseDataset = {
    title: string;
    color?: 'primary' | 'secondary';
    points: Point[];
}

type NonPointDatasetExtra = {
    type: 'line' | 'filled';
}

type PointDatasetExtra = {
    type: 'point';
    pointStyle?: PointStyle;
}

type WithLines = BaseDataset & {
  showLines: true;
  lineValues: number[];
};

type WithoutLines = BaseDataset & {
  showLines?: false;
};

export type DatasetWithAnnotations = BaseDataset & (NonPointDatasetExtra | PointDatasetExtra) & (WithLines | WithoutLines);

type Props = {
    datasets: DatasetWithAnnotations[];
    yTitle?: string;
};

const ChartWithZoom: React.FC<Props> = ({
    datasets,
    yTitle,
}) => {
    const chartRef = useRef<any>(null);
    const handleDoubleClick = () => {
        chartRef.current?.resetZoom();
    }

    const chartColors = useChartColors();
    const [data, annotations] = useMemo(() => {
        const data: ChartDataset<'line'>[] = [];
        const annotations: AnnotationOptions[] = [];
        for (let i = 0; i < datasets.length; i++) {
            const dataset = datasets[i];
            const color = dataset.color === 'secondary' ? chartColors.secondary : chartColors.primary;
            if (dataset.type === 'point') {
                data.push(
                    CreatePointDataset(dataset.title, dataset.points, color, dataset.pointStyle)
                );
            } else if (dataset.type === 'filled') {
                data.push(
                    CreateFilledDataset(dataset.title, dataset.points, color)
                );
            } else {
                data.push(
                    CreateLineDataset(dataset.title, dataset.points, color)
                );
            }
            if (dataset.showLines) {
                annotations.push(
                    ...CreateVerticalLines(dataset.points, dataset.lineValues, chartColors, color)
                );
            }
        }
        return [{ datasets: data }, annotations];
    }, [datasets, chartColors]);
    const options = useChartOptions(chartColors, { yTitle: yTitle || 'Интенсивность * 10^6', annotations })

    return (
        <Box sx={{
            position: "relative",
            width: '100%',
            height: '480px',
            mb: 3,
        }}
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
