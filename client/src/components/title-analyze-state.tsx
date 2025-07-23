import { ErrorTwoTone, HelpTwoTone, CheckCircleTwoTone } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { AnalyzeState } from "../models/client";

type Props = {
    title: string;
    state: AnalyzeState;
}

const TitleAnalyzeState: React.FC<Props> = ({
    title,
    state,
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {!state && <Tooltip title='Анализ не был проведен'>
                <HelpTwoTone sx={{ mr: 1 }} color='info' />
            </Tooltip>}
            {state?.state === 'success' && <Tooltip title='Анализ успешно проведен'>
                <CheckCircleTwoTone sx={{ mr: 1 }} color='success' />
            </Tooltip>}
            {state?.state === 'error' && <Tooltip title={state.message}>
                <ErrorTwoTone sx={{ mr: 1 }} color='error' />
            </Tooltip>}
            {title}
        </div>
    )
};

export default TitleAnalyzeState;
