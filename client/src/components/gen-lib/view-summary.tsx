import { Box, Typography } from "@mui/material";
import ChartWithZoom from "../chart-with-zoom";
import { GenLibParseResult } from "../../models/models";
import { prepareGenLibs } from "../../chart-data/chart-data";


type Props = {
    genLibs: GenLibParseResult[];
    chartHeight: number;
}


const GenLibSummaryChart: React.FC<Props> = ({
    genLibs,
    chartHeight,
}) => {
    if (genLibs.length === 0) {
        return (
            <Box p={2} height='100%' display='flex' padding={2}>
                <Typography variant='h5' textAlign='center' margin='auto'>Выберите геномные библиотки для просмотра</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <ChartWithZoom
                height={chartHeight}
                rawData={genLibs}
                prepare={prepareGenLibs}
            />
        </Box>
    );
}

export default GenLibSummaryChart;