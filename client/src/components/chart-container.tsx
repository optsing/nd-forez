import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";


type Props = {
    sidebar: ReactNode;
    hideSideBar?: boolean;
}

const ChartContainer: React.FC<PropsWithChildren<Props>> = ({
    sidebar,
    hideSideBar,
    children,
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {!hideSideBar && <Box sx={{
                width: isSmallScreen ? '100%' : '296px',
                flexShrink: 0,
                maxHeight: isSmallScreen ? '256px' : 'none',
                overflowY: 'auto',
                inset: 0,
            }}>
                {sidebar}
            </Box>}
            <div
                style={{
                    flexShrink: 1,
                    flexGrow: 1,
                    minWidth: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ChartContainer;