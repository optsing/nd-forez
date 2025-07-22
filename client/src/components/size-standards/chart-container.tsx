import { ReactNode, useMemo } from 'react';
import {
    Box,
    Tabs,
    Tab,
} from '@mui/material';
import ChartContainer from '../chart-container';
import SizeStandardRawChart from './raw-chart';
import SizeStandardAnalyzedChart from './analyzed-chart';
import SizeStandardAnalyzedCurveChart from './analyzed-curve-chart';
import { SizeStandardComplete } from '../../models/client';
import SizeStandardSummaryChart from './summary-chart';
import SizeStandardSidebar from './sidebar';


type ToolbarProps = {
    selected: number;
}

type Props = {
    sizeStandards: SizeStandardComplete[];
    selectedMulti: boolean[];
    setSelectedMulti: (selectedMulti: boolean[]) => void;
    selected: number;
    setSelected: (selected: number) => void;
    selectedTab: number;
    setSelectedTab: (selected: number) => void;
    chartHeight: number;
    isCompactMode?: boolean;
    toolbar: (props: ToolbarProps) => ReactNode;
}

const StandardChartContainer: React.FC<Props> = ({
    sizeStandards,
    selectedMulti,
    setSelectedMulti,
    selected,
    setSelected,
    selectedTab,
    setSelectedTab,
    chartHeight,
    isCompactMode,
    toolbar,
}) => {
    const selectedSizeStandards = useMemo(() => {
        return sizeStandards
            .filter((_, i) => selectedMulti[i])
            .map(item => item.parsed);
    }, [sizeStandards, selectedMulti])

    return (
        <ChartContainer
            title={selected >= 0 ? sizeStandards[selected].parsed.description.title : 'Сводный график'}
            toolbar={toolbar({ selected })}
            sidebar={isCompactMode && <SizeStandardSidebar
                sizeStandards={sizeStandards}
                selected={selected}
                setSelected={setSelected}
                selectedMulti={selectedMulti}
                setSelectedMulti={setSelectedMulti}
            />}
            hideSideBar={!isCompactMode}
        >
            {selected >= 0 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, value) => setSelectedTab(value)}
                    variant='scrollable'
                >
                    <Tab
                        value={0}
                        label='Исходные данные'
                    />
                    <Tab
                        value={1}
                        label='Пики и коррекция'
                    />
                    <Tab
                        value={2}
                        label='Калибровочная кривая'
                    />
                </Tabs>
            </Box>}

            {selected === -1 && <SizeStandardSummaryChart
                sizeStandards={selectedSizeStandards}
                chartHeight={chartHeight}
            />}

            {selected >= 0 && selectedTab === 0 &&
                <SizeStandardRawChart
                    sizeStandard={sizeStandards[selected].parsed}
                    chartHeight={chartHeight}
                />
            }
            {selected >= 0 && selectedTab === 1 &&
                <SizeStandardAnalyzedChart
                    sizeStandard={sizeStandards[selected].analyzed}
                    chartHeight={chartHeight}
                />
            }
            {selected >= 0 && selectedTab === 2 &&
                <SizeStandardAnalyzedCurveChart
                    sizeStandard={sizeStandards[selected].analyzed}
                    chartHeight={chartHeight}
                />
            }
        </ChartContainer>
    );
};

export default StandardChartContainer;
