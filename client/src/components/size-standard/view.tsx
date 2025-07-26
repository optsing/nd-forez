import { Box, Tab, Tabs, Typography } from "@mui/material";
import { SizeStandardComplete } from "../../models/client";
import SizeStandardTabRaw from "./tab-raw";
import SizeStandardTabAnalyzed from "./tab-analyzed";
import SizeStandardTabAnalyzedCurve from "./tab-analyzed-curve";


type Props = {
    sizeStandard: SizeStandardComplete | null;
    selectedTab: number;
    setSelectedTab: (selectedTab: number) => void;
    chartHeight: number;
}

const SizeStandardView: React.FC<Props> = ({
    sizeStandard,
    selectedTab,
    setSelectedTab,
    chartHeight,
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                height: '48px',
            }}>
                {sizeStandard && <Tabs
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
                </Tabs>}
            </Box>
            {sizeStandard
                ? <div style={{
                    height: '100%',
                    overflowY: 'auto',
                }}>
                    {selectedTab === 0 &&
                        <SizeStandardTabRaw
                            sizeStandard={sizeStandard.parsed}
                            chartHeight={chartHeight}
                        />
                    }
                    {selectedTab === 1 &&
                        <SizeStandardTabAnalyzed
                            sizeStandard={sizeStandard.analyzed}
                            chartHeight={chartHeight}
                        />
                    }
                    {selectedTab === 2 &&
                        <SizeStandardTabAnalyzedCurve
                            sizeStandard={sizeStandard.analyzed}
                            chartHeight={chartHeight}
                        />
                    }
                </div>
                : <Box p={2} height={`${chartHeight + 32}px`} display='flex' alignItems='center' justifyContent='center'>
                    <Typography variant='h5' textAlign='center'>Выберите стандарт длин для просмотра</Typography>
                </Box>
            }
        </div>
    )
}

export default SizeStandardView;