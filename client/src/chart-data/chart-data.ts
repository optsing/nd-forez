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
            showChromatogram: true,
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
        showChromatogram: true,
        color: 'primary',
    }];
    if (analyzeResultData.st_peaks.length > 0) {
        result.push({
            title: 'Реперные пики',
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
            title: 'Нераспознанные пики',
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
            title: 'Библиотечные пики',
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

export type SimpleTableData = {
    columnCount: number;
    header?: string[];
    rows: string[][];
}


export function prepareStandartTable(sizeStandard: SizeStandard): SimpleTableData {
    const header: string[] = [
        'Длина фрагментов, пн',
        'Концентрация, нг/мкл',
        'Время выхода, с',
    ];
    const rows: string[][] = [];
    for (let i = 0; i < sizeStandard.sizes.length; i++) {
        rows.push([
            round(sizeStandard.sizes[i]).toString(),
            round(sizeStandard.concentrations[i]).toString(),
            round(sizeStandard.release_times[i]).toString(),
        ]);
    }
    return {
        columnCount: 3,
        header,
        rows,
    }
}


export function prepareStandardAnalyzedTable(analyzeResult: AnalyzeResult): SimpleTableData {
    const header: string[] = [
        'Длина фрагментов, пн',
        'Концентрация, нг/мкл',
        'Молярность, нмоль/л',
        'Время выхода, с',
        'Площадь * 10⁷',
    ];
    const rows: string[][] = [];
    for (let i = 0; i < analyzeResult.sizes.length; i++) {
        rows.push([
            round(analyzeResult.sizes[i]).toString(),
            round(analyzeResult.concentrations[i]).toString(),
            round(analyzeResult.SD_molarity[i]).toString(),
            round(analyzeResult.peak[i]).toString(),
            round(analyzeResult.led_area[i] * 1e-7).toString(),
        ]);
    }
    return {
        columnCount: 5,
        header,
        rows,
    };
}

export function prepareGenLibAnalyzedTable(analyzeResultData: AnalyzeResultData): SimpleTableData {
    const header: string[] = [
        'Длина фрагментов, пн',
        'Концентрация, нг/мкл',
        'Молярность, нмоль/л',
        'Время выхода, с',
        'Площадь * 10⁷',
    ];
    const rows: string[][] = [];
    for (let i = 0; i < analyzeResultData.peaksCorr.length; i++) {
        rows.push([
            round(analyzeResultData.peaksCorr[i]).toString(),
            round(analyzeResultData.areaCorr[i]).toString(),
            round(analyzeResultData.molarity[i]).toString(),
            round(analyzeResultData.library_peaks[i]).toString(),
            round(analyzeResultData.GLAreas[i] * 1e-7).toString(),
        ]);
    }
    return {
        columnCount: 5,
        header,
        rows,
    };
}

export function prepareGenLibAnalyzedTotalTable(analyzeResultData: AnalyzeResultData): SimpleTableData {
    return {
        columnCount: 5,
        header: [
            'Длина максимального фрагмента, пн',
            'Концентрация геномной библиотеки, нг/мкл',
            'Молярность геномной библиотеки, пмоль/л',
            'Время выхода максимального фрагмента, с',
            'Площадь геномной библиотеки * 10⁷',
        ],
        rows: [[
            round(analyzeResultData.maxLibPeak).toString(),
            round(analyzeResultData.totalLibConc).toString(),
            round(analyzeResultData.totalLibMolarity).toString(),
            round(analyzeResultData.maxLibValue).toString(),
            round(analyzeResultData.totalLibArea * 1e-7).toString(),
        ]],
    };
}
