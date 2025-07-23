import { Box, Typography } from "@mui/material";
import { GenLibAnalyzeError, GenLibAnalyzeResult } from "../../models/models";
import ChartWithZoom from "../chart-with-zoom";
import SimpleTable from "../simple-table";
import { prepareGenLibAnalyzed, prepareGenLibAnalyzedTable, prepareGenLibAnalyzedTotalTable } from "../../chart-data/chart-data";

type Props = {
    genLib: GenLibAnalyzeResult | GenLibAnalyzeError | null;
    chartHeight: number;
}

const GenLibTabAnalyzed: React.FC<Props> = ({
    genLib,
    chartHeight,
}) => {
    if (genLib?.state != 'success') {
        return (
            <Box p={2} height={`${chartHeight + 32}px`} display='flex' alignItems='center' justifyContent='center'>
                <Typography variant='h5' textAlign='center'>{genLib?.message ?? 'Анализ геномной библиотеки не был проведен'}</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <ChartWithZoom
                sx={{ mb: 3 }}
                height={chartHeight}
                rawData={genLib}
                prepare={prepareGenLibAnalyzed}
            />
            <SimpleTable
                sx={{ mb: 3 }}
                rawData={genLib}
                prepare={prepareGenLibAnalyzedTotalTable}
            />
            <SimpleTable
                rawData={genLib}
                prepare={prepareGenLibAnalyzedTable}
            />
        </Box>
    )
}

export default GenLibTabAnalyzed;