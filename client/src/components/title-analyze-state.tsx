import { ErrorTwoTone, HelpTwoTone, CheckCircleTwoTone } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { AnalyzeState } from "../models/client";

type Props = {
    title: string;
    state: AnalyzeState;
    messageSuccess: string;
}

const TitleAnalyzeState: React.FC<Props> = ({
    title,
    state,
    messageSuccess,
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {!state && <Tooltip title='Анализ не был проведен.'>
                <HelpTwoTone sx={{ mr: 1 }} color='info' />
            </Tooltip>}
            {state?.state === 'success' && <Tooltip title={messageSuccess}>
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
