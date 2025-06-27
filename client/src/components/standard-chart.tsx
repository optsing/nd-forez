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
import { SizeStandard } from '../models/models';
import { UseChartColors, useChartOptions } from '../helpers/helpers';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';


interface Props {
    sizeStandards: SizeStandard[];
    selectedStandard: number;
    setSelectedStandard: Dispatch<SetStateAction<number>>;
}

const StandardChart: React.FC<Props> = ({
    sizeStandards,
    selectedStandard,
    setSelectedStandard,
}) => {
    const chartColors = UseChartColors();
    const chartOptions = useChartOptions(chartColors);

    const [standardChartData, setStandardChartData] = useState<ChartData<'line'> | null>(null);

    useEffect(() => {
        if (sizeStandards.length === 0) return;
        setStandardChartData({
            datasets: [
                {
                    label: sizeStandards[selectedStandard].title,
                    data: sizeStandards[selectedStandard].data.map((y, x) => ({ x, y })),
                    borderColor: chartColors.primaryLineColor,
                    backgroundColor: chartColors.primaryLineBackgroudColor,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                    pointBorderColor: 'rgba(0, 0, 0, 0)',
                }
            ],
        });
    }, [selectedStandard, sizeStandards, chartColors])

    return (
        <>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Стандарты длин
            </Typography>

            {standardChartData && <ChartContainer
                sidebar={<FormControl component="fieldset">
                    <RadioGroup
                        value={selectedStandard}
                        onChange={(e) => setSelectedStandard(parseInt(e.target.value))}
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
                <ChartWithZoom
                    options={chartOptions}
                    data={standardChartData}
                />
            </ChartContainer>}
        </>
    );
};

export default StandardChart;
