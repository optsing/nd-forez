import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";

interface Props {
    title: string;
    toolbar: ReactNode;
    sidebar: ReactNode;
    hideSideBar?: boolean;
}

const ChartContainer: React.FC<PropsWithChildren<Props>> = ({
    title,
    toolbar,
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
            }}
        >
            {!hideSideBar && <div
                style={{
                    flexShrink: 0,
                    width: isSmallScreen ? '100%' : '296px',
                    position: 'relative',
                }}
            >
                <div style={{
                    position: isSmallScreen ? 'static' : 'absolute',
                    maxHeight: isSmallScreen ? '256px' : 'none',
                    overflowY: 'auto',
                    inset: 0,
                    right: '12px',
                    marginBottom: isSmallScreen ? '12px' : 0,
                }}>
                    {sidebar}
                </div>
            </div>}
            <Paper
                sx={{
                    flexShrink: 1,
                    flexGrow: 1,
                    minWidth: 0,
                    width: '100%',
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', p: 1, gap: 1 }}>
                    <Typography variant="h6" sx={{ mx: 2 }}>{title}</Typography>
                    <div style={{ marginLeft: 'auto' }}>{toolbar}</div>
                </Box>
                {children}
            </Paper>
        </div>
    );
};

export default ChartContainer;