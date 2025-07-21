import { Box, Typography } from "@mui/material";
import ChartWithZoom from "../chart-with-zoom";
import { SizeStandardParseResult } from "../../models/models";
import { prepareSizeStandards } from "../../chart-data/chart-data";


type Props = {
    sizeStandards: SizeStandardParseResult[];
    chartHeight: number;
}


const SizeStandardSummaryChart: React.FC<Props> = ({
    sizeStandards,
    chartHeight,
}) => {
    if (sizeStandards.length === 0) {
        return (
            <Box p={2} height='480px' display='flex' alignItems='center' justifyContent='center'>
                <Typography variant='h5' textAlign='center'>Выберите стандарты длин для просмотра</Typography>
            </Box>
        );
    }
    return (
        <Box sx={{ p: 2 }}>
            <ChartWithZoom
                height={chartHeight}
                rawData={sizeStandards}
                prepare={prepareSizeStandards}
            />
        </Box>
    );
}

export default SizeStandardSummaryChart;