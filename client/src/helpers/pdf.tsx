import { useState } from 'react';
import { saveAs } from 'file-saver';
import { AnalyzeResult } from '../models/models';

import { Chart } from 'chart.js';
import { CHART_LIGHT_THEME, createChartOptions, DatasetWithAnnotations, prepareDataAndAnnotations } from './chart';
import { AnalyzedTable, prepareGenLibAnalyzed, prepareGenLibAnalyzedTable, prepareGenLibAnalyzedTotalTable, prepareStadardAnalyzedData, prepareStandardAnalyzedCalibrationCurve, prepareStandardAnalyzedTable } from '../chart-data/chart-data';
import { getTimestampFilename } from './helpers';
import { useAlert } from '../context/alert-context';


export type GenLibPdf = {
  title: string;
  chartImage: string;
  table: AnalyzedTable;
  totalTable: AnalyzedTable;
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

  const generatePdf = async (analyzeResult: AnalyzeResult) => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ReportPdf } = await import('../components/pdf/report-pdf');
      const standardChart = await renderChartToImage(prepareStadardAnalyzedData(analyzeResult));
      const standardCalibrationCurve = await renderChartToImage(prepareStandardAnalyzedCalibrationCurve(analyzeResult));
      const genLibCharts: GenLibPdf[] = await Promise.all(analyzeResult.genlib_data.map(async genLib => (
        {
          title: genLib.title,
          chartImage: await renderChartToImage(prepareGenLibAnalyzed(genLib)),
          table: prepareGenLibAnalyzedTable(genLib),
          totalTable: prepareGenLibAnalyzedTotalTable(genLib),
        }
      )));

      const now = new Date();

      const blob = await pdf(<ReportPdf
        reportDate={now}
        standardTitle={analyzeResult.title}
        standardChart={standardChart}
        standardCalibrationCurveChart={standardCalibrationCurve}
        standardTable={prepareStandardAnalyzedTable(analyzeResult)}
        genLibs={genLibCharts}
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
