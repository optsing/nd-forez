import { useMemo } from 'react';
import { GenLib } from '../models/models';
import ChartWithZoom, { DatasetWithAnnotations } from './chart-with-zoom';

interface Props {
    genLibs: GenLib[];
}

const GenLibChart: React.FC<Props> = ({
    genLibs,
}) => {
    const datasets: DatasetWithAnnotations[] = useMemo(() => {
        return genLibs.map(
            genLib => ({
                title: genLib.title,
                type: 'line',
                color: 'primary',
                points: genLib.data.map((y, x) => ({ x, y: y * 1e-6 })),
            })
        );
    }, [genLibs])

    return (
        <ChartWithZoom
            datasets={datasets}
        />
    );
};

export default GenLibChart;
