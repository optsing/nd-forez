import { useMemo } from 'react';
import { SizeStandard } from '../models/models';
import ChartWithZoom, { DatasetWithAnnotations } from './chart-with-zoom';


interface Props {
    sizeStandard: SizeStandard;
}

const StandardChart: React.FC<Props> = ({
    sizeStandard,
}) => {
    const datasets: DatasetWithAnnotations[] = useMemo(() => {
        return [
            {
                title: sizeStandard.title,
                type: 'line',
                color: 'primary',
                points: sizeStandard.data.map((y, x) => ({ x, y: y * 1e-6 })),
            }
        ];
    }, [sizeStandard]);

    return (
        <ChartWithZoom
            datasets={datasets}
        />
    );
};

export default StandardChart;
