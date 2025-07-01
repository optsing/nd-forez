import { DatasetWithAnnotations } from "../helpers/chart";
import { round } from "../helpers/helpers";
import { AnalyzeResult, AnalyzeResultData, GenLib, SizeStandard } from "../models/models";


export function prepareStadardData(sizeStandard: SizeStandard): DatasetWithAnnotations[] {
    return [
        {
            title: sizeStandard.title,
            type: 'line',
            color: 'primary',
            points: sizeStandard.data.map((y, x) => ({ x, y: y * 1e-6 })),
        }
    ];
}


export function prepareStadardAnalyzedData(analyzeResult: AnalyzeResult): DatasetWithAnnotations[] {
    return [
        {
            title: 'Интенсивность',
            type: 'line',
            color: 'primary',
            points: analyzeResult.ZrRef.map((y, x) => ({ x, y: y * 1e-6 })),
        },
        {
            title: 'Пики',
            type: 'point',
            color: 'secondary',
            points: analyzeResult.peak.map(x => ({ x, y: analyzeResult.ZrRef[x] * 1e-6 })),
            showLines: true,
            lineValues: analyzeResult.sizes,
        },
    ];
}

export function prepareStandardAnalyzedCalibrationCurve(analyzeResult: AnalyzeResult): DatasetWithAnnotations[] {
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
}

export function prepareGenLibs(genLibs: GenLib[]): DatasetWithAnnotations[] {
    return genLibs.map(
        genLib => ({
            title: genLib.title,
            type: 'line',
            color: 'primary',
            points: genLib.data.map((y, x) => ({ x, y: y * 1e-6 })),
        })
    );
}

export function prepareGenLibAnalyzed(analyzeResultData: AnalyzeResultData): DatasetWithAnnotations[] {
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
    if (analyzeResultData.t_unrecognized_peaks.length > 0) {
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
}

export type AnalyzedTable = {
    size: string;
    concentration: string;
    molarity: string;
    peak: string;
    led: string;
}[]

export function prepareStandardAnalyzedTable(analyzeResult: AnalyzeResult): AnalyzedTable {
    const result: AnalyzedTable = [];
    for (let i = 0; i < analyzeResult.sizes.length; i++) {
        result.push({
            size: analyzeResult.sizes[i].toString(),
            concentration: analyzeResult.concentrations[i].toString(),
            molarity: round(analyzeResult.SD_molarity[i]).toString(),
            peak: analyzeResult.peak[i].toString(),
            led: round(analyzeResult.led_area[i] * 1e-7).toString(),
        });
    }
    return result;
}

export function prepareGenLibAnalyzedTable(analyzeResultData: AnalyzeResultData): AnalyzedTable {
    const result: AnalyzedTable = [];
    for (let i = 0; i < analyzeResultData.peaksCorr.length; i++) {
        result.push({
            size: round(analyzeResultData.peaksCorr[i]).toString(),
            concentration: round(analyzeResultData.areaCorr[i]).toString(),
            molarity: round(analyzeResultData.molarity[i]).toString(),
            peak: round(analyzeResultData.library_peaks[i]).toString(),
            led: round(analyzeResultData.GLAreas[i] * 1e-7).toString(),
        });
    }
    return result;
}

export function prepareGenLibAnalyzedTotalTable(analyzeResultData: AnalyzeResultData): AnalyzedTable {
    return [{
        size: round(analyzeResultData.maxLibPeak).toString(),
        concentration: round(analyzeResultData.totalLibConc).toString(),
        molarity: round(analyzeResultData.totalLibMolarity).toString(),
        peak: round(analyzeResultData.maxLibValue).toString(),
        led: round(analyzeResultData.totalLibArea * 1e-7).toString(),
    }];
}
