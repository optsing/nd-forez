import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    IconButton,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { SizeStandardComplete } from '../models/client';
import SizeStandardSidebar from './size-standard/sidebar';
import GenLibSidebar from './gen-lib/sidebar';
import { GenLibParseResult } from '../models/models';
import GenLibSummaryChart from './gen-lib/view-summary';
import SizeStandardView from './size-standard/view';
import GenLibView from './gen-lib/view';
import { ChevronRightTwoTone, MenuTwoTone, SsidChartTwoTone } from '@mui/icons-material';
import SidebarContainer from './sidebar-container';
import TitleAnalyzeState from './title-analyze-state';


type ToolbarProps = {
    selectedSizeStandard: number;
    selectedGenLibMulti: boolean[];
    isSmallScreen: boolean;
}

type Props = {
    sizeStandards: SizeStandardComplete[];
    genLibs: GenLibParseResult[];
    selectedGenLibMulti: boolean[];
    setSelectedGenLibMulti: (selectedGenLibMulti: boolean[]) => void;
    chartHeight: number;
    isCompactMode?: boolean;
    leftToolbar: ReactNode;
    toolbar: (props: ToolbarProps) => ReactNode;
}

const MainContainer: React.FC<Props> = ({
    sizeStandards,
    genLibs,
    selectedGenLibMulti,
    setSelectedGenLibMulti,
    chartHeight,
    toolbar,
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [isStandardSidebarOpenDesktop, setIsStandardSidebarOpenDesktop] = useState(true);
    const [isStandardSidebarOpenMobile, setIsStandardSidebarOpenMobile] = useState(false);
    const [isGenLibSidebarOpenDesktop, setIsGenLibSidebarOpenDesktop] = useState(true);
    const [isGenLibSidebarOpenMobile, setIsGenLibSidebarOpenMobile] = useState(false);

    const [selectedSizeStandard, setSelectedSizeStandard] = useState<number>(0);
    const [selectedSizeStandardTab, setSelectedSizeStandardTab] = useState<number>(0);

    const [selectedGenLib, setSelectedGenLib] = useState<number>(-2);
    const [selectedGenLibTab, setSelectedGenLibTab] = useState<number>(0);

    const isStandardSidebarOpen = isSmallScreen ? isStandardSidebarOpenMobile : isStandardSidebarOpenDesktop;
    const isGenLibSidebarOpen = isSmallScreen ? isGenLibSidebarOpenMobile : isGenLibSidebarOpenDesktop;

    const handleIsStadardSidebarOpen = (open: boolean) => {
        if (isSmallScreen) {
            setIsStandardSidebarOpenMobile(open);
        } else {
            setIsStandardSidebarOpenDesktop(open)
        }
    };

    const handleIsGenLibSidebarOpen = (open: boolean) => {
        if (isSmallScreen) {
            setIsGenLibSidebarOpenMobile(open);
        } else {
            setIsGenLibSidebarOpenDesktop(open)
        }
    };

    useEffect(() => {
        setIsStandardSidebarOpenMobile(false);
        setIsGenLibSidebarOpenMobile(false);
    }, [isSmallScreen]);

    const handleSizeStandardSelect = (idx: number) => {
        setSelectedSizeStandard(idx);
        setIsStandardSidebarOpenMobile(false);
    }

    const handleGenLibSelect = (idx: number) => {
        setSelectedGenLib(idx);
        setIsGenLibSidebarOpenMobile(false);
    }

    const selectedGenLibs = useMemo(() => {
        return genLibs
            .filter((_, i) => selectedGenLibMulti[i]);
    }, [genLibs, selectedGenLibMulti])

    return (
        <SidebarContainer
            isLeftOpen={isStandardSidebarOpen}
            setIsLeftOpen={handleIsStadardSidebarOpen}
            leftSidebarTitle='Стандарты длин'
            leftSidebar={<SizeStandardSidebar
                sizeStandards={sizeStandards}
                selected={selectedSizeStandard}
                setSelected={handleSizeStandardSelect}
            />}
            isRightOpen={isGenLibSidebarOpen}
            setIsRightOpen={handleIsGenLibSidebarOpen}
            rightSidebarTitle='Геномные библиотеки'
            rightSidebar={<GenLibSidebar
                sizeStandard={sizeStandards[selectedSizeStandard]}
                genLibs={genLibs}
                selected={selectedGenLib}
                setSelected={handleGenLibSelect}
                selectedMulti={selectedGenLibMulti}
                setSelectedMulti={setSelectedGenLibMulti}
            />}
            isSmallScreen={isSmallScreen}
        >
            <Box sx={{
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    px: 1,
                    gap: 1,
                    width: '100%',
                    height: '48px'
                }}>
                    {!isSmallScreen && !isStandardSidebarOpen && <Tooltip title='Показать список стандартов длин'>
                        <IconButton
                            onClick={() => handleIsStadardSidebarOpen(true)}>
                            <Badge
                                badgeContent={<Typography color='textSecondary' fontWeight={700}>СД</Typography>}
                                overlap='circular'
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuTwoTone />
                            </Badge>
                        </IconButton>
                    </Tooltip>}
                    {!isSmallScreen && !isGenLibSidebarOpen && <Tooltip title='Показать список геномных библиотек'>
                        <IconButton
                            onClick={() => handleIsGenLibSidebarOpen(true)}>
                            <Badge
                                badgeContent={<Typography color='textSecondary' fontWeight={700}>ГБ</Typography>}
                                overlap='circular'
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuTwoTone />
                            </Badge>
                        </IconButton>
                    </Tooltip>}
                    <Box display='flex' alignItems='center' overflow='hidden'>
                        {sizeStandards.length > 0 && <Button
                            onClick={() => setSelectedGenLib(-2)}
                            sx={{ textTransform: 'none' }}
                        >
                            <TitleAnalyzeState
                                title={sizeStandards[selectedSizeStandard].parsed.description.title}
                                state={sizeStandards[selectedSizeStandard].analyzed}
                            />
                        </Button>}
                        {sizeStandards.length > 0 && selectedGenLib >= -1 && <ChevronRightTwoTone sx={{ mx: 1 }} />}
                        {selectedGenLib === -1 && <>
                            <SsidChartTwoTone sx={{ mr: 1 }} /> Все библиотеки
                        </>}
                        {selectedGenLib >= 0 && <TitleAnalyzeState
                            title={genLibs[selectedGenLib].description.title}
                            state={sizeStandards[selectedSizeStandard]?.analyzedGenLibs.get(selectedGenLib) ?? null}
                        />}
                    </Box>
                    {!isSmallScreen && <Box sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        ml: 'auto',
                    }}>
                        {toolbar({ selectedSizeStandard, selectedGenLibMulti, isSmallScreen })}
                    </Box>}
                </Box>
                <Box sx={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
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
                        genLibAnalyzed={sizeStandards[selectedSizeStandard]?.analyzedGenLibs.get(selectedGenLib) ?? null}
                        selectedTab={selectedGenLibTab}
                        setSelectedTab={setSelectedGenLibTab}
                        chartHeight={chartHeight}
                    />}
                </Box>
                {isSmallScreen && <Box sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    p: 1,
                    gap: 1,
                    width: '100%',
                    height: '48px',
                }}>
                    {!isStandardSidebarOpen && <Tooltip title='Показать список стандартов длин'>
                        <IconButton
                            onClick={() => handleIsStadardSidebarOpen(true)}>
                            <Badge
                                badgeContent={<Typography color='textSecondary' fontWeight={700}>СД</Typography>}
                                overlap='circular'
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuTwoTone />
                            </Badge>
                        </IconButton>
                    </Tooltip>}
                    {!isGenLibSidebarOpen && <Tooltip title='Показать список геномных библиотек'>
                        <IconButton
                            onClick={() => handleIsGenLibSidebarOpen(true)}>
                            <Badge
                                badgeContent={<Typography color='textSecondary' fontWeight={700}>ГБ</Typography>}
                                overlap='circular'
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuTwoTone />
                            </Badge>
                        </IconButton>
                    </Tooltip>}
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        ml: 'auto',
                    }}>
                        {toolbar({ selectedSizeStandard, selectedGenLibMulti, isSmallScreen })}
                    </Box>
                </Box>}
            </Box>
        </SidebarContainer>
    );
};

export default MainContainer;
