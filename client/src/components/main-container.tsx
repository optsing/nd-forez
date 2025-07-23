import { ReactNode, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Typography,
} from '@mui/material';
import ChartContainer from './chart-container';
import { SizeStandardComplete } from '../models/client';
import SizeStandardSidebar from './size-standard/sidebar';
import GenLibSidebar from './gen-lib/sidebar';
import { GenLibParseResult } from '../models/models';
import GenLibSummaryChart from './gen-lib/view-summary';
import SizeStandardView from './size-standard/view';
import GenLibView from './gen-lib/view';
import { ChevronRightTwoTone } from '@mui/icons-material';


type ToolbarProps = {
    selectedSizeStandard: number;
    selectedGenLibMulti: boolean[];
}

type Props = {
    sizeStandards: SizeStandardComplete[];
    genLibs: GenLibParseResult[];
    selectedGenLibMulti: boolean[];
    setSelectedGenLibMulti: (selectedGenLibMulti: boolean[]) => void;
    chartHeight: number;
    isCompactMode?: boolean;
    leftToolbar: ReactNode;
    rightToolbar: (props: ToolbarProps) => ReactNode;
}

const MainContainer: React.FC<Props> = ({
    sizeStandards,
    genLibs,
    selectedGenLibMulti,
    setSelectedGenLibMulti,
    chartHeight,
    isCompactMode,
    leftToolbar,
    rightToolbar,
}) => {
    const [selectedSizeStandard, setSelectedSizeStandard] = useState<number>(0);
    const [selectedSizeStandardTab, setSelectedSizeStandardTab] = useState<number>(0);

    const [selectedGenLib, setSelectedGenLib] = useState<number>(-2);
    const [selectedGenLibTab, setSelectedGenLibTab] = useState<number>(0);

    const selectedGenLibs = useMemo(() => {
        return genLibs
            .filter((_, i) => selectedGenLibMulti[i]);
    }, [genLibs, selectedGenLibMulti])

    return (
        <ChartContainer
            sidebar={isCompactMode && <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    p: 1,
                    gap: 1,
                    width: '100%',
                    height: '48px'
                }}>{leftToolbar}</Box>
                <Box sx={{ overflowY: 'auto' }}>
                    <SizeStandardSidebar
                        sizeStandards={sizeStandards}
                        selected={selectedSizeStandard}
                        setSelected={setSelectedSizeStandard}
                    />
                </Box>
            </Box>}
            hideSideBar={!isCompactMode}
        >
            {sizeStandards.length > 0
                ? <Box sx={{
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderLeft: 1,
                    borderColor: 'divider',
                }}>
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        p: 1,
                        gap: 1,
                        width: '100%',
                        height: '48px'
                    }}>
                        <Typography variant='h6' sx={{ ml: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sizeStandards[selectedSizeStandard].parsed.description.title}
                        </Typography>
                        {selectedGenLib >= -1 && <>
                            <ChevronRightTwoTone />
                            <Typography variant='h6' sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {selectedGenLib >= 0 ? genLibs[selectedGenLib].description.title : 'Все библиотеки'}
                            </Typography>
                        </>}
                        <div style={{ marginLeft: 'auto' }}>{rightToolbar({ selectedSizeStandard, selectedGenLibMulti })}</div>
                    </Box>
                    <ChartContainer
                        sidebar={<GenLibSidebar
                            sizeStandard={sizeStandards[selectedSizeStandard]}
                            genLibs={genLibs}
                            selected={selectedGenLib}
                            setSelected={setSelectedGenLib}
                            selectedMulti={selectedGenLibMulti}
                            setSelectedMulti={setSelectedGenLibMulti}
                        />}
                        hideSideBar={!isCompactMode}
                    >
                        <Box sx={{ borderLeft: 1, borderColor: 'divider', height: '100%' }}>
                            {selectedGenLib === -2 && <SizeStandardView
                                sizeStandard={sizeStandards[selectedSizeStandard]}
                                selectedTab={selectedSizeStandardTab}
                                setSelectedTab={setSelectedSizeStandardTab}
                                chartHeight={chartHeight}
                            />}
                            {selectedGenLib === -1 && <GenLibSummaryChart
                                genLibs={selectedGenLibs}
                                chartHeight={chartHeight}
                            />}
                            {selectedGenLib >= 0 && <GenLibView
                                genLib={genLibs[selectedGenLib]}
                                genLibAnalyzed={sizeStandards[selectedSizeStandard].analyzedGenLibs.get(selectedGenLib) ?? null}
                                selectedTab={selectedGenLibTab}
                                setSelectedTab={setSelectedGenLibTab}
                                chartHeight={chartHeight}
                            />}
                        </Box>
                    </ChartContainer>
                </Box>
                : <Box sx={{
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderLeft: 1,
                    borderColor: 'divider',
                }}>
                    <Typography variant='h5' margin='auto' textAlign='center'>Выберите стандарт длин для просмотра</Typography>
                </Box>}
        </ChartContainer>
    );
};

export default MainContainer;
