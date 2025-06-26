import { Box, useMediaQuery, useTheme } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";

interface Props {
    sidebar: ReactNode;
}

const ChartContainer: React.FC<PropsWithChildren<Props>> = ({
    sidebar,
    children,
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            display="flex"
            flexDirection={isSmallScreen ? 'column' : 'row'}
        >
            <Box
                flexShrink={0}
                sx={{
                    width: isSmallScreen ? '100%' : '200px',
                }}
            >
                {sidebar}
            </Box>
            <Box
                flexGrow={1}
                width="100%"
                height="480px"
                position="relative"
            >
                {children}
            </Box>
        </Box>
    );
};

export default ChartContainer;