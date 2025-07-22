import { ChangeEvent, ReactNode, useMemo, useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    List,
    ListItemButton,
    ListItem,
    Checkbox,
    ListSubheader,
} from '@mui/material';
import ChartContainer from '../chart-container';
import SizeStandardRawChart from './raw-chart';
import SizeStandardAnalyzedChart from './analyzed-chart';
import SizeStandardAnalyzedCurveChart from './analyzed-curve-chart';
import { SizeStandardComplete } from '../../models/client';
import TitleAnalyzeState from '../title-analyze-state';
import { SsidChartTwoTone } from '@mui/icons-material';
import SizeStandardSummaryChart from './summary-chart';


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

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectedMulti(new Array(sizeStandards.length).fill(checked));
    };

    const handleSelect = (index: number) => {
        setSelectedMulti(selectedMulti.map((val, i) => i === index ? !val : val));
    };

    return (
        <ChartContainer
            title={selected >= 0 ? sizeStandards[selected].parsed.description.title : 'Сводный график'}
            toolbar={toolbar({ selected })}
            sidebar={isCompactMode && <List>
                <ListItem
                    disablePadding
                    secondaryAction={
                        <Checkbox
                            checked={selectedMulti.length > 0 && selectedMulti.every(item => item)}
                            onChange={handleSelectAll}
                        />
                    }
                >
                    <ListItemButton
                        selected={selected === -1}
                        onClick={() => setSelected(-1)}
                    >
                        <SsidChartTwoTone sx={{ mr: 1 }} />
                        Все стандарты
                    </ListItemButton>
                </ListItem>
                {sizeStandards.map((sizeStandard, i) => (
                    <ListItem
                        key={i}
                        disablePadding
                        secondaryAction={
                            <Checkbox
                                checked={selectedMulti[i]}
                                onChange={() => handleSelect(i)}
                            />
                        }
                    >
                        <ListItemButton
                            selected={i === selected}
                            onClick={() => setSelected(i)}
                        >
                            <TitleAnalyzeState
                                title={sizeStandard.parsed.description.title}
                                state={sizeStandard.analyzed}
                                messageSuccess='Анализ был успешно проведен'
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>}
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
            {selected >= 0 &&selectedTab === 1 &&
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
