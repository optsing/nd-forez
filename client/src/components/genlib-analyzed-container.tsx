import React, { Dispatch, SetStateAction, useMemo } from 'react';
import {
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Box,
    Paper,
} from '@mui/material';
import { AnalyzeResultData } from '../models/models';
import ChartContainer from './chart-container';
import ChartWithZoom from './chart-with-zoom';
import { prepareGenLibAnalyzed, prepareGenLibAnalyzedTable, prepareGenLibAnalyzedTotalTable } from '../chart-data/chart-data';
import SimpleTable from './simple-table';



interface Props {
    analyzeResultData: AnalyzeResultData[];
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
    isCompactMode?: boolean;
}

const GenLibAnalyzedChartContainer: React.FC<Props> = ({
    analyzeResultData,
    selected,
    setSelected,
    isCompactMode,
}) => {
    const data: AnalyzeResultData[] = useMemo(() => {
        if (isCompactMode) {
            return [analyzeResultData[selected]];
        } else {
            return analyzeResultData;
        }
    }, [analyzeResultData, isCompactMode, selected]);

    return (
        <Box>
            <Typography variant="h5" textAlign='center' gutterBottom>
                Геномные библиотеки
            </Typography>

            <ChartContainer
                sidebar={isCompactMode && <FormControl component="fieldset">
                    <RadioGroup
                        value={selected}
                        onChange={(e) => setSelected(parseInt(e.target.value))}
                    >
                        {analyzeResultData.map((s, i) => (
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
                {data.map((data, i) => <Paper key={i} sx={{ p: 2 }}>
                    <Typography variant="h6" textAlign='center' gutterBottom>
                        Геномная библиотека: {data.title}
                    </Typography>
                    <ChartWithZoom
                        sx={{ mb: 3 }}
                        rawData={data}
                        prepare={prepareGenLibAnalyzed}
                    />
                    <SimpleTable
                        sx={{ mb: 3 }}
                        rawData={data}
                        prepare={prepareGenLibAnalyzedTotalTable}
                    />
                    <SimpleTable
                        rawData={data}
                        prepare={prepareGenLibAnalyzedTable}
                    />
                </Paper>)}
            </ChartContainer>
        </Box>
    );
};

export default GenLibAnalyzedChartContainer;
