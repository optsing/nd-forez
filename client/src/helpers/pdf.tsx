import { useState } from 'react';
import { saveAs } from 'file-saver';
import { SizeStandardComplete } from '../models/client';

import { Chart } from 'chart.js';
import { CHART_LIGHT_THEME, createChartOptions, DatasetWithAnnotations, prepareDataAndAnnotations } from './chart';
import { prepareGenLibAnalyzed, prepareGenLibAnalyzedTable, prepareGenLibAnalyzedTotalTable, prepareStadardAnalyzedData, prepareStandardAnalyzedCalibrationCurve, prepareStandardAnalyzedTable, SimpleTableData } from '../chart-data/chart-data';
import { getTimestampFilename } from './helpers';
import { useAlert } from '../context/alert-context';
import { GenLibParseResult } from '../models/models';


export type GenLibPdf = {
  title: string;
  chartImage: string;
  table: SimpleTableData;
  totalTable: SimpleTableData;
}

export type SizeStandardPdf = {
  title: string;
  chartImage: string;
  curveChartImage: string;
  table: SimpleTableData;
  genLibs: GenLibPdf[];
}

async function renderChartToImage(datasets: DatasetWithAnnotations[], { yTitle }: { yTitle?: string } = {}): Promise<string> {
  const offscreenCanvas = new OffscreenCanvas(800, 480);

  const [data, annotations, chromatogram] = prepareDataAndAnnotations(datasets, CHART_LIGHT_THEME);
  const options = createChartOptions(CHART_LIGHT_THEME, { yTitle, annotations, chromatogram, disableAnimation: true, disableZoom: true });

  const chart = new Chart(offscreenCanvas as unknown as HTMLCanvasElement, {
    type: 'line',
    options,
    data,
  });

  const blob = await offscreenCanvas.convertToBlob({ type: 'image/png' });
  const image = await new Promise((resolve: (image: string) => void, reject) => {
    const fr = new FileReader();
    fr.onload = e => {
      const result = e.target?.result;
      if (result) {
        resolve(result as string);
      } else {
        reject();
      }
    };
    fr.readAsDataURL(blob);
  });

  chart.destroy();
  return image;
}


export function useOffscreenChartsToPdf() {
  const showAlert = useAlert();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePdf = async (sizeStandard: SizeStandardComplete, genLibs: GenLibParseResult[], genLibIndices: number[]) => {
    if (isGeneratingPDF) return;

    if (sizeStandard.analyzed?.state !== 'success') {
      showAlert('Сначала завершите анализ выбранного стандарта длин', 'warning');
      return;
    }

    for (const genLibInd of genLibIndices) {
      if (sizeStandard.analyzedGenLibs.get(genLibInd)?.state !== 'success') {
        showAlert('Сначала завершите анализ выбранных геномных библиотек', 'warning');
        return;
      }
    }

    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ReportPdf } = await import('../components/pdf/report-pdf');
      
      const sizeStandardCharts: SizeStandardPdf[] = [];
      if (sizeStandard.analyzed?.state !== 'success') return;
      const genLibCharts: GenLibPdf[] = []
      for (const genLibInd of genLibIndices) {
        const genLib = genLibs[genLibInd];
        const genLibAnalyzed = sizeStandard.analyzedGenLibs.get(genLibInd) ?? null;
        if (genLibAnalyzed?.state !== 'success') return;
        const chartImage = await renderChartToImage(prepareGenLibAnalyzed(genLibAnalyzed));
        genLibCharts.push({
          title: genLib.description.title,
          chartImage,
          table: prepareGenLibAnalyzedTable(genLibAnalyzed),
          totalTable: prepareGenLibAnalyzedTotalTable(genLibAnalyzed),
        });
      }
      sizeStandardCharts.push({
        title: sizeStandard.parsed.description.title,
        chartImage: await renderChartToImage(prepareStadardAnalyzedData(sizeStandard.analyzed)),
        curveChartImage: await renderChartToImage(prepareStandardAnalyzedCalibrationCurve(sizeStandard.analyzed)),
        table: prepareStandardAnalyzedTable(sizeStandard.analyzed),
        genLibs: genLibCharts,
      });

      const now = new Date();
      const blob = await pdf(<ReportPdf
        reportDate={now}
        sizeStandards={sizeStandardCharts}
      />).toBlob();
      saveAs(blob, getTimestampFilename(now));
    } catch (err) {
      console.error(err);
      showAlert('Не удалось создать отчет', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return { generatePdf, isGeneratingPDF };
}
