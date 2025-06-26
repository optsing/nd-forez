import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
} from '@mui/material';
import { ChartData, } from 'chart.js';
import { SizeStandart } from '../models/models';
import { UseChartColors, useChartOptions } from '../helpers/helpers';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';


interface Props {
    sizeStandarts: SizeStandart[];
    selectedStandard: number;
    setSelectedStandard: Dispatch<SetStateAction<number>>;
}

const StandartChart: React.FC<Props> = ({
    sizeStandarts,
    selectedStandard,
    setSelectedStandard,
}) => {
    const chartColors = UseChartColors();
    const chartOptions = useChartOptions(chartColors);

    const [standartChartData, setStandartChartData] = useState<ChartData<'line'> | null>(null);

    useEffect(() => {
        if (sizeStandarts.length === 0) return;
        setStandartChartData({
            datasets: [
                {
                    label: sizeStandarts[selectedStandard].title,
                    data: sizeStandarts[selectedStandard].data.map((y, x) => ({ x, y })),
                    borderColor: chartColors.primaryLineColor,
                    backgroundColor: chartColors.primaryLineBackgroudColor,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                    pointBorderColor: 'rgba(0, 0, 0, 0)',
                }
            ],
        });
    }, [selectedStandard, sizeStandarts, chartColors])

    return (
        <>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Стандарты длин
            </Typography>

            {standartChartData && <ChartContainer
                sidebar={<FormControl component="fieldset">
                    <RadioGroup
                        value={selectedStandard}
                        onChange={(e) => setSelectedStandard(parseInt(e.target.value))}
                    >
                        {sizeStandarts.map((s, i) => (
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
                <ChartWithZoom
                    options={chartOptions}
                    data={standartChartData}
                />
            </ChartContainer>}
        </>
    );
};

export default StandartChart;
