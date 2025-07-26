import { Box, Tab, Tabs } from "@mui/material";
import { GenLibAnalyzeError, GenLibAnalyzeResult, GenLibParseResult } from "../../models/models";
import GenLibTabRaw from "./tab-raw";
import GenLibTabAnalyzed from "./tab-analyzed";


type Props = {
    genLib: GenLibParseResult;
    genLibAnalyzed: GenLibAnalyzeResult | GenLibAnalyzeError | null;
    selectedTab: number;
    setSelectedTab: (selectedTab: number) => void;
    chartHeight: number;
}

const GenLibView: React.FC<Props> = ({
    genLib,
    genLibAnalyzed,
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
                        label='Результаты анализа'
                    />
                </Tabs>
            </Box>
            <div style={{
                height: '100%',
                overflowY: 'auto',
            }}>
                {selectedTab === 0 && <GenLibTabRaw
                    genLib={genLib}
                    chartHeight={chartHeight}
                />}
                {selectedTab === 1 && <GenLibTabAnalyzed
                    genLib={genLibAnalyzed}
                    chartHeight={chartHeight}
                />}
            </div>
        </div>
    )
}

export default GenLibView;