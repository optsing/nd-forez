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
import StandardChart from './standard-chart';


interface Props {
    sizeStandards: SizeStandard[];
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
}

const StandardChartContainer: React.FC<Props> = ({
    sizeStandards,
    selected,
    setSelected,
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
                    <StandardChart
                        sizeStandard={sizeStandards[selected]}
                    />
                </Paper>
            </ChartContainer>
        </Box>
    );
};

export default StandardChartContainer;
