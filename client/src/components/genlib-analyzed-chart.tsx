import { useMemo } from 'react';
import { AnalyzeResultData } from '../models/models';
import ChartWithZoom, { DatasetWithAnnotations } from './chart-with-zoom';


interface Props {
    analyzeResultData: AnalyzeResultData;
}


const GenLibAnalyzedChart: React.FC<Props> = ({
    analyzeResultData,
}) => {
    const datasets: DatasetWithAnnotations[] = useMemo(() => {
        const result: DatasetWithAnnotations[] = [{
            title: 'Интенсивность',
            type: 'line',
            points: analyzeResultData.t_main.map((x, i) => ({ x, y: analyzeResultData.denoised_data[i] * 1e-6 })),
            color: 'primary',
        }];
        if (analyzeResultData.st_peaks.length > 0) {
            result.push({
                title: 'Пики',
                color: 'secondary',
                type: 'point',
                pointStyle: 'crossRot',
                points: analyzeResultData.st_peaks.map((x, i) => ({ x, y: analyzeResultData.denoised_data[analyzeResultData.st_length[i]] * 1e-6 })),
                showLines: true,
                lineValues: analyzeResultData.stp,
            });
        }
        if ( analyzeResultData.t_unrecognized_peaks.length > 0) {
            result.push({
                title: 'Пики (неизвестные)',
                color: 'secondary',
                type: 'point',
                pointStyle: 'cross',
                points: analyzeResultData.t_unrecognized_peaks.map((x, i) => ({ x, y: analyzeResultData.denoised_data[analyzeResultData.unrecognized_peaks[i]] * 1e-6 })),
                showLines: true,
                lineValues: analyzeResultData.unr,
            });
        }
        if (analyzeResultData.lib_length.length > 0) {
            result.push({
                title: 'Пики (библиотека)',
                color: 'secondary',
                type: 'point',
                pointStyle: 'circle',
                points: analyzeResultData.lib_length.map((x, i) => ({ x, y: analyzeResultData.denoised_data[analyzeResultData.LibPeakLocations[i]] * 1e-6 })),
                showLines: true,
                lineValues: analyzeResultData.hpx,
            });
        }
        if (analyzeResultData.x_fill.length > 0) {
            result.push({
                title: 'Заливка',
                color: 'secondary',
                type: 'filled',
                points: analyzeResultData.x_fill.map((x, i) => ({ x, y: analyzeResultData.y_fill[i] * 1e-6 })),
            });
        }
        if (analyzeResultData.x_Lib_fill.length > 0) {
            result.push({
                title: 'Заливка',
                color: 'secondary',
                type: 'filled',
                points: analyzeResultData.x_Lib_fill.map((x, i) => ({ x, y: analyzeResultData.y_Lib_fill[i] * 1e-6 })),
            });
        }
        return result;
    }, [analyzeResultData])

    return (
        <ChartWithZoom
            datasets={datasets}
        />
    );
};

export default GenLibAnalyzedChart;
