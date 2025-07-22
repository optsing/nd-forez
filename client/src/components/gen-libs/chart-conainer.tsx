import { useMemo, ReactNode } from 'react';
import {
    Box,
    Tabs,
    Tab,
} from '@mui/material';
import ChartContainer from '../chart-container';
import TitleAnalyzeState from '../title-analyze-state';
import GenLibSummaryChart from './summary-chart';
import GenLibRawChart from './raw-chart';
import GenLibAnalyzedChart from './analyzed-chart';
import { GenLibComplete, SizeStandardComplete } from '../../models/client';
import GenLibSidebar from './sidebar';


type ToolbarProps = {
    selected: number;
    selectedTab: number;
}

type Props = {
    sizeStandards: SizeStandardComplete[];
    genLibs: GenLibComplete[];
    selectedMulti: boolean[];
    setSelectedMulti: (selectedMulti: boolean[]) => void;
    selected: number;
    setSelected: (selected: number) => void;
    selectedTab: number;
    setSelectedTab: (selected: number) => void;
    chartHeight: number;
    toolbar: (props: ToolbarProps) => ReactNode;
}

const GenLibChartContainer: React.FC<Props> = ({
    sizeStandards,
    genLibs,
    selectedMulti,
    setSelectedMulti,
    selected,
    setSelected,
    selectedTab,
    setSelectedTab,
    chartHeight,
    toolbar,
}) => {
    const selectedGenLibs = useMemo(() => {
        return genLibs
            .filter((_, i) => selectedMulti[i])
            .map(item => item.parsed);
    }, [genLibs, selectedMulti])

    return (
        <ChartContainer
            title={selected >= 0 ? genLibs[selected].parsed.description.title : 'Сводный график'}
            toolbar={toolbar({ selected, selectedTab })}
            sidebar={<GenLibSidebar
                genLibs={genLibs}
                selected={selected}
                setSelected={setSelected}
                selectedMulti={selectedMulti}
                setSelectedMulti={setSelectedMulti}
            />}
        >
            {selected >= 0 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, value) => setSelectedTab(value)}
                    variant='scrollable'
                >
                    <Tab
                        value={-1}
                        label='Исходные данные'
                    />
                    {sizeStandards.map((sizeStandard, i) => (
                        <Tab
                            key={i}
                            value={i}
                            label={
                                <TitleAnalyzeState
                                    title={sizeStandard.parsed.description.title}
                                    state={genLibs[selected].analyzed.get(i) ?? null}
                                    messageSuccess='Анализ был успешно проведен'
                                />
                            }
                        />
                    ))}
                </Tabs>
            </Box>}
            {selected === -1 && <GenLibSummaryChart
                genLibs={selectedGenLibs}
                chartHeight={chartHeight}
            />}
            {selected >= 0 && selectedTab === -1 && <GenLibRawChart
                genLib={genLibs[selected].parsed}
                chartHeight={chartHeight}
            />}
            {selected >= 0 && selectedTab >= 0 && <GenLibAnalyzedChart
                genLib={genLibs[selected].analyzed.get(selectedTab) ?? null}
                chartHeight={chartHeight}
            />}
        </ChartContainer>
    );
};

export default GenLibChartContainer;
