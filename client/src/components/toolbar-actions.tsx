import { CloudOffTwoTone, CloudTwoTone, GitHub } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ThemeSwitcher } from "@toolpad/core";
import { useAppSettings } from "../context/app-settings";

const SOURCE_URL = import.meta.env.VITE_SOURCE_URL;

const ToolbarActions: React.FC = () => {
    const { localCalculations, setLocalCalculations } = useAppSettings();

    return (
        <Box display='flex' gap={1}>
            <Tooltip title={localCalculations ? 'Отключить вычисления на клиенте' : 'Включить вычисления на клиенте'}>
                <IconButton onClick={() => setLocalCalculations(!localCalculations)}>
                    {localCalculations ? <CloudTwoTone /> : <CloudOffTwoTone />}
                </IconButton>
            </Tooltip>
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
