import { Box, Typography } from "@mui/material";
import { SizeStandardAnalyzeError, SizeStandardAnalyzeResult } from "../../models/models";
import ChartWithZoom from "../chart-with-zoom";
import { prepareStadardAnalyzedData, prepareStandardAnalyzedTable } from "../../chart-data/chart-data";
import SimpleTable from "../simple-table";

type Props = {
    sizeStandard: SizeStandardAnalyzeResult | SizeStandardAnalyzeError | null;
    chartHeight: number;
}

const SizeStandardAnalyzedChart: React.FC<Props> = ({
    sizeStandard,
    chartHeight,
}) => {
    if (sizeStandard?.state != 'success') {
        return (
            <Box p={2} height='480px' display='flex' alignItems='center' justifyContent='center'>
                <Typography variant='h5' textAlign='center'>{sizeStandard?.message ?? 'Анализ стандарта длин не был проведен.'}</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <ChartWithZoom
                rawData={sizeStandard}
                prepare={prepareStadardAnalyzedData}
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

export default SizeStandardAnalyzedChart;
