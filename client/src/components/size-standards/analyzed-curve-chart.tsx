import { Box, Typography } from "@mui/material";
import { SizeStandardAnalyzeError, SizeStandardAnalyzeResult, SizeStandardParseResult } from '../../models/models';
import ChartWithZoom from "../chart-with-zoom";
import { prepareStandardAnalyzedCalibrationCurve, prepareStandardAnalyzedTable } from '../../chart-data/chart-data';
import SimpleTable from "../simple-table";

type Props = {
    sizeStandard: SizeStandardAnalyzeResult | SizeStandardAnalyzeError | null;
    chartHeight: number;
}

const SizeStandardAnalyzedCurveChart: React.FC<Props> = ({
    sizeStandard,
    chartHeight,
}) => {
    if (sizeStandard?.state != 'success') {
        return (
            <Box p={2} height={`${chartHeight + 32}px`} display='flex' alignItems='center' justifyContent='center'>
                <Typography variant='h5' textAlign='center'>{sizeStandard?.message ?? 'Анализ стандарта длин не был проведен'}</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <ChartWithZoom
                rawData={sizeStandard}
                prepare={prepareStandardAnalyzedCalibrationCurve}
                yTitle='Время выхода, с'
                sx={{ mb: 3 }}
                height={chartHeight}
            />
            <SimpleTable
                rawData={sizeStandard}
                prepare={prepareStandardAnalyzedTable}
            />
        </Box>
    );
};

export default SizeStandardAnalyzedCurveChart;
