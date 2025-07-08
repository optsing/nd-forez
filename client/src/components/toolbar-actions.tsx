import { GitHub } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ThemeSwitcher } from "@toolpad/core";

const SOURCE_URL = import.meta.env.VITE_SOURCE_URL;

const ToolbarActions: React.FC = () => {
    return (
        <Box display='flex' gap={1}>
            {SOURCE_URL && <Tooltip title='Перейти к исходному коду'>
                <IconButton href={SOURCE_URL} target='_blank' rel='noopener'>
                    <GitHub />
                </IconButton>
            </Tooltip>}
            <ThemeSwitcher />
        </Box>
    );
}

export default ToolbarActions;
