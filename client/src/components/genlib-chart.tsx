import { ChangeEvent, SetStateAction, useEffect, useState, Dispatch } from 'react';
import {
    Typography,
    FormControlLabel,
    Checkbox,
    FormGroup,
} from '@mui/material';
import { ChartData } from 'chart.js';
import { GenLib } from '../models/models';
import { UseChartColors, useChartOptions } from '../helpers/helpers';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';

interface Props {
    genLibs: GenLib[];
    selectedGenLibs: boolean[];
    setSelectedGenLibs: Dispatch<SetStateAction<boolean[]>>;
}

const GenLibChart: React.FC<Props> = ({
    genLibs,
    selectedGenLibs,
    setSelectedGenLibs,
}) => {
    const chartColors = UseChartColors();
    const chartOptions = useChartOptions(chartColors);

    const [genLibChartData, setGenLibChartData] = useState<ChartData<'line'> | null>(null);

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectedGenLibs(new Array(genLibs.length).fill(checked));
    };

    const handleGenLibChange = (index: number) => {
        const updated = [...selectedGenLibs];
        updated[index] = !updated[index];
        setSelectedGenLibs(updated);
    };

    useEffect(() => {
        if (genLibs.length === 0) return;
        setGenLibChartData({
            datasets: genLibs.filter((_, i) => selectedGenLibs[i]).map(g => ({
                label: g.title,
                data: g.data.map((y, x) => ({ x, y })),
                borderColor: chartColors.primaryLineColor,
                backgroundColor: chartColors.primaryLineBackgroudColor,
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2,
            })),
        });
    }, [selectedGenLibs, genLibs, chartColors])

    return (
        <>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Геномные библиотеки
            </Typography>

            {genLibChartData && <ChartContainer
                sidebar={
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedGenLibs.every(item => item)}
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
                                        checked={selectedGenLibs[i]}
                                        onChange={() => handleGenLibChange(i)}
                                    />
                                }
                                label={g.title}
                            />
                        ))}
                    </FormGroup>
                }
            >
                <ChartWithZoom
                    options={chartOptions}
                    data={genLibChartData}
                />
            </ChartContainer>}
        </>
    );
};

export default GenLibChart;
