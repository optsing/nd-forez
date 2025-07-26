import { MenuOpenTwoTone } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";


type Props = {
    leftSidebar: ReactNode;
    leftSidebarTitle: string;
    isLeftOpen: boolean;
    setIsLeftOpen: (isOpen: boolean) => void;
    rightSidebar: ReactNode;
    rightSidebarTitle: string;
    isRightOpen: boolean;
    setIsRightOpen: (isOpen: boolean) => void;
    isSmallScreen: boolean;
}

const SidebarContainer: React.FC<PropsWithChildren<Props>> = ({
    leftSidebar,
    leftSidebarTitle,
    rightSidebar,
    rightSidebarTitle,
    isLeftOpen,
    setIsLeftOpen,
    isRightOpen,
    setIsRightOpen,
    children,
    isSmallScreen,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {isLeftOpen && <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: isSmallScreen ? '100%' : '296px',
                position: isSmallScreen ? 'fixed' : 'static',
                zIndex: isSmallScreen ? 10000 : 'inherit',
                height: '100%',
                flexShrink: 0,
                inset: 0,
                borderRight: isSmallScreen ? 0 : 1,
                borderColor: 'divider',
                bgcolor: 'background.default',
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    p: 1,
                    gap: 1,
                    width: '100%',
                    height: '48px'
                }}>
                    <Typography sx={{ mx: 1 }}>{leftSidebarTitle}</Typography>
                    <Tooltip title='Скрыть'>
                        <IconButton
                            sx={{ ml: 'auto' }}
                            onClick={() => setIsLeftOpen(false)}>
                            <MenuOpenTwoTone />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                }}>
                    {leftSidebar}
                </Box>
            </Box>}
            {isRightOpen && <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: isSmallScreen ? '100%' : '296px',
                position: isSmallScreen ? 'fixed' : 'static',
                zIndex: isSmallScreen ? 10000 : 'inherit',
                height: '100%',
                flexShrink: 0,
                inset: 0,
                borderRight: isSmallScreen ? 0 : 1,
                borderColor: 'divider',
                bgcolor: 'background.default',
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    p: 1,
                    gap: 1,
                    width: '100%',
                    height: '48px'
                }}>
                    <Typography sx={{ mx: 1 }}>{rightSidebarTitle}</Typography>
                    <Tooltip title='Скрыть'>
                        <IconButton
                            sx={{ ml: 'auto' }}
                            onClick={() => setIsRightOpen(false)}>
                            <MenuOpenTwoTone />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                }}>
                    {rightSidebar}
                </Box>
            </Box>}
            <div
                style={{
                    flex: 1,
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

export default SidebarContainer;