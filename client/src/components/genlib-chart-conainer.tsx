import { ChangeEvent, SetStateAction, Dispatch, useMemo } from 'react';
import {
    Typography,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Paper,
    Box,
} from '@mui/material';
import { GenLib } from '../models/models';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';
import { prepareGenLibs } from '../chart-data/chart-data';

interface Props {
    genLibs: GenLib[];
    selected: boolean[];
    setSelected: Dispatch<SetStateAction<boolean[]>>;
    chartHeight: number;
}

const GenLibChartContainer: React.FC<Props> = ({
    genLibs,
    selected,
    setSelected,
    chartHeight,
}) => {
    const selectedGenLibs = useMemo(() => {
        return genLibs.filter((_, i) => selected[i]);
    }, [genLibs, selected])

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelected(new Array(genLibs.length).fill(checked));
    };

    const handleSelect = (index: number) => {
        const updated = [...selected];
        updated[index] = !updated[index];
        setSelected(updated);
    };

    return (
        <Box>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Геномные библиотеки
            </Typography>

            <ChartContainer
                sidebar={
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selected.every(item => item)}
                                    onChange={handleSelectAll}
                                />
                            }
                            label="Выбрать все"
                        />
                        {genLibs.map((g, i) => (
                            <FormControlLabel
                                key={i}
                                control={
                                    <Checkbox
                                        checked={selected[i]}
                                        onChange={() => handleSelect(i)}
                                    />
                                }
                                label={g.title}
                            />
                        ))}
                    </FormGroup>
                }
            >
                <Paper sx={{ p: 2 }}>
                    <ChartWithZoom
                        height={chartHeight}
                        rawData={selectedGenLibs}
                        prepare={prepareGenLibs}
                    />
                </Paper>
            </ChartContainer>
        </Box>
    );
};

export default GenLibChartContainer;
