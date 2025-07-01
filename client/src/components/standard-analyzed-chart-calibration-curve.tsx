import { useMemo } from 'react';
import { AnalyzeResult } from '../models/models';
import ChartWithZoom, { DatasetWithAnnotations } from './chart-with-zoom';


interface Props {
    analyzeResult: AnalyzeResult
}


const StandardAnalyzedChartCalibrationCurve: React.FC<Props> = ({
    analyzeResult,
}) => {
    const datasets: DatasetWithAnnotations[] = useMemo(() => {
        return [
            {
                title: 'Исходные данные',
                type: 'point',
                color: 'primary',
                points: analyzeResult.sizes.map((x, i) => ({ x, y: analyzeResult.peak[i] })),
            },
            {
                title: 'Подгонка полинома',
                type: 'line',
                color: 'secondary',
                points: analyzeResult.liz_fit.map((x, i) => ({ x, y: analyzeResult.locs_fit[i] })),
            },
        ];
    }, [analyzeResult]);

    return (
        <ChartWithZoom
            datasets={datasets}
            yTitle='Время выхода, с'
        />
    );
};

export default StandardAnalyzedChartCalibrationCurve;
