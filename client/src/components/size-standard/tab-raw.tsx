import { Box } from "@mui/material";
import ChartWithZoom from '../chart-with-zoom';
import SimpleTable from '../simple-table';
import { SizeStandardParseResult } from '../../models/models';
import { prepareStadardData, prepareStandartTable } from '../../chart-data/chart-data';

type Props = {
    sizeStandard: SizeStandardParseResult;
    chartHeight: number;
}

const SizeStandardTabRaw: React.FC<Props> = ({
    sizeStandard,
    chartHeight,
}) => {
    return (
        <Box p={2}>
            <ChartWithZoom
                height={chartHeight}
                rawData={sizeStandard}
                prepare={prepareStadardData}
                sx={{ mb: 3 }}
            />
            <SimpleTable
                rawData={sizeStandard}
                prepare={prepareStandartTable}
            />
        </Box>
    );
};

export default SizeStandardTabRaw;