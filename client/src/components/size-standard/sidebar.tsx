import { List, ListItemButton } from "@mui/material";
import TitleAnalyzeState from "../title-analyze-state";
import { SizeStandardComplete } from "../../models/client";


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
        <List>
            {sizeStandards.map((sizeStandard, i) => (
                <ListItemButton
                    key={i}
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