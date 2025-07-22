import { ChangeEvent, useMemo, ReactNode, useState } from 'react';
import {
    Checkbox,
    Box,
    List,
    ListItemButton,
    ListItem,
    Tabs,
    Tab,
    ListSubheader,
} from '@mui/material';
import ChartContainer from '../chart-container';
import TitleAnalyzeState from '../title-analyze-state';
import GenLibSummaryChart from './summary-chart';
import GenLibRawChart from './raw-chart';
import GenLibAnalyzedChart from './analyzed-chart';
import { AnalyzeState, GenLibComplete, SizeStandardComplete } from '../../models/client';
import { SsidChartTwoTone } from '@mui/icons-material';


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

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectedMulti(new Array(genLibs.length).fill(checked));
    };

    const handleSelect = (index: number) => {
        setSelectedMulti(selectedMulti.map((val, i) => i === index ? !val : val));
    };

    const genLibAnalyzeState: (genLib: GenLibComplete) => AnalyzeState = genLib => {
        let hasSuccess = false;
        for (const s of genLib.analyzed.values()) {
            if (s?.state === 'error') {
                return {
                    state: 'error',
                    message: 'Есть ошибки в выполненных анализах',
                }
            } else if (s?.state === 'success') {
                hasSuccess = true;
            }
        }
        if (hasSuccess) {
            return {
                state: 'success'
            }
        }
        return null;
    }

    return (
        <ChartContainer
            title={selected >= 0 ? genLibs[selected].parsed.description.title : 'Сводный график'}
            toolbar={toolbar({ selected, selectedTab })}
            sidebar={
                <List>
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
                            Все библиотеки
                        </ListItemButton>
                    </ListItem>
                    {genLibs.map((g, i) => (
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
                                selected={selected === i}
                                onClick={() => setSelected(i)}
                            >
                                <TitleAnalyzeState
                                    title={g.parsed.description.title}
                                    state={genLibAnalyzeState(g)}
                                    messageSuccess='Есть успешно выполненные анализы'
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            }
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
