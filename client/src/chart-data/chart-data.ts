import { DatasetWithAnnotations } from "../helpers/chart";
import { round } from "../helpers/helpers";
import { GenLibAnalyzeResult, GenLibParseResult, SizeStandardAnalyzeResult, SizeStandardParseResult } from "../models/models";


export function prepareStadardData(sizeStandard: SizeStandardParseResult): DatasetWithAnnotations[] {
    return [
        {
            title: 'Интенсивность',
            type: 'line',
            color: 'primary',
            points: sizeStandard.signal.map((y, x) => ({ x, y: y * 1e-6 })),
        }
    ];
}

export function prepareSizeStandards(sizeStandards: SizeStandardParseResult[]): DatasetWithAnnotations[] {
    return sizeStandards.map(
        sizeStandard => ({
            title: sizeStandard.description.title,
            type: 'line',
            color: 'primary',
            points: sizeStandard.signal.map((y, x) => ({ x, y: y * 1e-6 })),
        })
    );
}


export function prepareStadardAnalyzedData(sizeStandard: SizeStandardAnalyzeResult): DatasetWithAnnotations[] {
    return [
        {
            title: 'Интенсивность',
            type: 'line',
            color: 'primary',
            points: sizeStandard.ZrRef.map((y, x) => ({ x, y: y * 1e-6 })),
            showChromatogram: true,
        },
        {
            title: 'Пики',
            type: 'point',
            color: 'secondary',
            points: sizeStandard.peaks.data.map(x => ({ x, y: sizeStandard.ZrRef[x] * 1e-6 })),
            showLines: true,
            lineValues: sizeStandard.peaks.sizes,
        },
    ];
}

export function prepareStandardAnalyzedCalibrationCurve(sizeStandard: SizeStandardAnalyzeResult): DatasetWithAnnotations[] {
    return [
        {
            title: 'Исходные данные',
            type: 'point',
            color: 'primary',
            points: sizeStandard.peaks.sizes.map((x, i) => ({ x, y: sizeStandard.peaks.data[i] })),
        },
        {
            title: 'Подгонка полинома',
            type: 'line',
            color: 'secondary',
            points: sizeStandard.liz_fit.map((x, i) => ({ x, y: sizeStandard.locs_fit[i] })),
        },
    ];
}

export function prepareGenLib(genLib: GenLibParseResult): DatasetWithAnnotations[] {
    return [
        {
            title: 'Интенсивность',
            type: 'line',
            color: 'primary',
            points: genLib.signal.map((y, x) => ({ x, y: y * 1e-6 })),
        }
    ];
}

export function prepareGenLibs(genLibs: GenLibParseResult[]): DatasetWithAnnotations[] {
    return genLibs.map(
        genLib => ({
            title: genLib.description.title,
            type: 'line',
            color: 'primary',
            points: genLib.signal.map((y, x) => ({ x, y: y * 1e-6 })),
        })
    );
}

export function prepareGenLibAnalyzed(genLib: GenLibAnalyzeResult): DatasetWithAnnotations[] {
    const result: DatasetWithAnnotations[] = [{
        title: 'Интенсивность',
        type: 'line',
        points: genLib.t_main.map((x, i) => ({ x, y: genLib.denoised_data[i] * 1e-6 })),
        showChromatogram: true,
        color: 'primary',
    }];
    if (genLib.st_peaks.length > 0) {
        result.push({
            title: 'Реперные пики',
            color: 'tertiary',
            type: 'point',
            pointStyle: 'crossRot',
            points: genLib.st_peaks.map((x, i) => ({ x, y: genLib.denoised_data[genLib.st_length[i]] * 1e-6 })),
            showLines: true,
            lineValues: genLib.stp,
        });
    }
    if (genLib.t_unrecognized_peaks.length > 0) {
        result.push({
            title: 'Нераспознанные пики',
            color: 'secondary',
            type: 'point',
            pointStyle: 'cross',
            points: genLib.t_unrecognized_peaks.map((x, i) => ({ x, y: genLib.denoised_data[genLib.unrecognized_peaks[i]] * 1e-6 })),
            showLines: true,
            lineValues: genLib.unr,
        });
    }
    if (genLib.lib_length.length > 0) {
        result.push({
            title: 'Библиотечные пики',
            color: 'secondary',
            type: 'point',
            pointStyle: 'circle',
            points: genLib.lib_length.map((x, i) => ({ x, y: genLib.denoised_data[genLib.LibPeakLocations[i]] * 1e-6 })),
            showLines: true,
            lineValues: genLib.hpx,
        });
    }
    if (genLib.x_fill.length > 0) {
        result.push({
            title: 'Заливка',
            color: 'secondary',
            type: 'filled',
            points: genLib.x_fill.map((x, i) => ({ x, y: genLib.y_fill[i] * 1e-6 })),
        });
    }
    if (genLib.x_Lib_fill.length > 0) {
        result.push({
            title: 'Заливка',
            color: 'secondary',
            type: 'filled',
            points: genLib.x_Lib_fill.map((x, i) => ({ x, y: genLib.y_Lib_fill[i] * 1e-6 })),
        });
    }
    return result;
}

export type SimpleTableData = {
    columnCount: number;
    header?: string[];
    rows: string[][];
}


export function prepareStandartTable(sizeStandard: SizeStandardParseResult): SimpleTableData {
    const header: string[] = [
        'Длина фрагментов, пн',
        'Концентрация, нг/мкл',
        'Время выхода, с',
    ];
    const rows: string[][] = [];
    for (let i = 0; i < sizeStandard.calibration.sizes.length; i++) {
        rows.push([
            round(sizeStandard.calibration.sizes[i]).toString(),
            round(sizeStandard.calibration.concentrations[i]).toString(),
            round(sizeStandard.calibration.release_times[i]).toString(),
        ]);
    }
    return {
        columnCount: 3,
        header,
        rows,
    }
}


export function prepareStandardAnalyzedTable(sizeStandard: SizeStandardAnalyzeResult): SimpleTableData {
    const header: string[] = [
        'Длина фрагментов, пн',
        'Концентрация, нг/мкл',
        'Молярность, нмоль/л',
        'Время выхода, с',
        'Площадь * 10⁷',
    ];
    const rows: string[][] = [];
    for (let i = 0; i < sizeStandard.peaks.sizes.length; i++) {
        rows.push([
            round(sizeStandard.peaks.sizes[i], 0).toString(),
            round(sizeStandard.peaks.concentrations[i], 4).toString(),
            round(sizeStandard.SD_molarity[i], 4).toString(),
            round(sizeStandard.peaks.data[i]).toString(),
            round(sizeStandard.led_area[i] * 1e-7, 4).toString(),
        ]);
    }
    return {
        columnCount: 5,
        header,
        rows,
    };
}

export function prepareGenLibAnalyzedTable(genLib: GenLibAnalyzeResult): SimpleTableData {
    const header: string[] = [
        'Длина фрагментов, пн',
        'Концентрация, нг/мкл',
        'Молярность, нмоль/л',
        'Время выхода, с',
        'Площадь * 10⁷',
    ];
    const rows: string[][] = [];
    for (let i = 0; i < genLib.peaksCorr.length; i++) {
        rows.push([
            round(genLib.peaksCorr[i], 0).toString(),
            round(genLib.areaCorr[i], 4).toString(),
            round(genLib.molarity[i], 4).toString(),
            round(genLib.library_peaks[i]).toString(),
            round(genLib.GLAreas[i] * 1e-7, 4).toString(),
        ]);
    }
    return {
        columnCount: 5,
        header,
        rows,
    };
}

export function prepareGenLibAnalyzedTotalTable(genLib: GenLibAnalyzeResult): SimpleTableData {
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
            round(genLib.maxLibPeak, 0).toString(),
            round(genLib.totalLibConc, 4).toString(),
            round(genLib.totalLibMolarity, 4).toString(),
            round(genLib.maxLibValue).toString(),
            round(genLib.totalLibArea * 1e-7, 4).toString(),
        ]],
    };
}
