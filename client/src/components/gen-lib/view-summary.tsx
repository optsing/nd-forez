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
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                px: 1,
                height: '48px',
            }}>
                <Typography sx={{ mx: 1 }}>Сводный график</Typography>
            </Box>
            {genLibs.length > 0
                ? <Box sx={{ p: 2 }}>
                    <ChartWithZoom
                        height={chartHeight}
                        rawData={genLibs}
                        prepare={prepareGenLibs}
                    />
                </Box>
                : <Box p={2} height={`${chartHeight + 32}px`} display='flex' alignItems='center' justifyContent='center'>
                    <Typography variant='h5' textAlign='center'>Выберите геномные библиотки для просмотра</Typography>
                </Box>}
        </div>
    );
}

export default GenLibSummaryChart;