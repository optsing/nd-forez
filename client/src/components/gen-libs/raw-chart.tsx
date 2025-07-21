import { Box } from "@mui/material";
import { GenLibParseResult } from "../../models/models";
import ChartWithZoom from "../chart-with-zoom";
import { prepareGenLib } from "../../chart-data/chart-data";

type Props = {
    genLib: GenLibParseResult;
    chartHeight: number;
}

const GenLibRawChart: React.FC<Props> = ({
    genLib,
    chartHeight,
}) => {
    return (
        <Box p={2}>
            <ChartWithZoom
                height={chartHeight}
                rawData={genLib}
                prepare={prepareGenLib}
            />
        </Box>
    );
}

export default GenLibRawChart;