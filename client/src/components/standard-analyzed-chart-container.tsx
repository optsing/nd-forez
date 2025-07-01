import { useState } from 'react';
import {
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Paper,
} from '@mui/material';
import { AnalyzeResult } from '../models/models';
import ChartContainer from './chart-container';
import StandardAnalyzedChartCalibrationCurve from './standard-analyzed-chart-calibration-curve';
import StandardAnalyzedChart from './standard-analyzed-chart';
import StandardAnalyzedTable from './standard-analyzed-table';


interface Props {
    analyzeResult: AnalyzeResult;
    isCompactMode?: boolean;
}


const StandardAnalyzedChartContainer: React.FC<Props> = ({
    analyzeResult,
    isCompactMode = false,
}) => {
    const [selected, setSelected] = useState<number>(0);

    return (
        <Box>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Стандарты длин
            </Typography>

            <ChartContainer
                sidebar={isCompactMode &&
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={selected}
                            onChange={(e) => setSelected(parseInt(e.target.value))}
                        >
                            <FormControlLabel
                                value={0}
                                control={<Radio />}
                                label='Пики и коррекция'
                            />
                            <FormControlLabel
                                value={1}
                                control={<Radio />}
                                label='Калибровочная кривая'
                            />
                        </RadioGroup>
                    </FormControl>
                }
            >
                <Paper sx={{ p: 2 }}>
                    {(!isCompactMode || selected === 0) && <Box>
                        <Typography variant="h6" textAlign='center' gutterBottom>
                            Стандарт длин: {analyzeResult.title}
                        </Typography>
                        <StandardAnalyzedChart
                            analyzeResult={analyzeResult}
                        />
                    </Box>}
                    {(!isCompactMode || selected === 1) && <Box>
                        <Typography variant="h6" textAlign='center' gutterBottom>
                            Калибровочная кривая: {analyzeResult.title}
                        </Typography>
                        <StandardAnalyzedChartCalibrationCurve
                            analyzeResult={analyzeResult}
                        />
                    </Box>}
                    <StandardAnalyzedTable
                        analyzeResult={analyzeResult}
                    />
                </Paper>
            </ChartContainer>
        </Box>
    );
};

export default StandardAnalyzedChartContainer;
