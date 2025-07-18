import { Dispatch, SetStateAction } from 'react';
import {
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Paper,
    Box,
} from '@mui/material';
import { SizeStandard } from '../models/models';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';
import { prepareStadardData, prepareStandartTable } from '../chart-data/chart-data';
import SimpleTable from './simple-table';


interface Props {
    sizeStandards: SizeStandard[];
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
    chartHeight: number;
}

const StandardChartContainer: React.FC<Props> = ({
    sizeStandards,
    selected,
    setSelected,
    chartHeight,
}) => {
    return (
        <Box>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Стандарты длин
            </Typography>

            <ChartContainer
                sidebar={<FormControl component="fieldset">
                    <RadioGroup
                        value={selected}
                        onChange={(e) => setSelected(parseInt(e.target.value))}
                    >
                        {sizeStandards.map((s, i) => (
                            <FormControlLabel
                                key={i}
                                value={i}
                                control={<Radio />}
                                label={s.title}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>}
            >
                <Paper sx={{ p: 2 }}>
                    <ChartWithZoom
                        height={chartHeight}
                        rawData={sizeStandards[selected]}
                        prepare={prepareStadardData}
                        sx={{ mb: 3 }}
                    />
                    <SimpleTable
                        rawData={sizeStandards[selected]}
                        prepare={prepareStandartTable}
                    />
                </Paper>
            </ChartContainer>
        </Box>
    );
};

export default StandardChartContainer;
