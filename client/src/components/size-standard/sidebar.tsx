import { SsidChartTwoTone } from "@mui/icons-material";
import { Checkbox, List, ListItem, ListItemButton, ListSubheader } from "@mui/material";
import TitleAnalyzeState from "../title-analyze-state";
import { SizeStandardComplete } from "../../models/client";
import { ChangeEvent } from "react";


type Props = {
    sizeStandards: SizeStandardComplete[];
    selected: number;
    setSelected: (selected: number) => void;
}

const SizeStandardSidebar: React.FC<Props> = ({
    sizeStandards,
    selected,
    setSelected,
}) => {
    return (
        sizeStandards.length > 0 && <List>
            <ListSubheader sx= {{ bgcolor: 'background.default' }}>Стандарты длин</ListSubheader>
            {sizeStandards.map((sizeStandard, i) => (
                <ListItemButton
                    selected={i === selected}
                    onClick={() => setSelected(i)}
                >
                    <TitleAnalyzeState
                        title={sizeStandard.parsed.description.title}
                        state={sizeStandard.analyzed}
                    />
                </ListItemButton>
            ))}
        </List>
    );
}

export default SizeStandardSidebar;