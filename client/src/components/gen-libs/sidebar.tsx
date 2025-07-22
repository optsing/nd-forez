import { Checkbox, List, ListItem, ListItemButton } from "@mui/material";
import TitleAnalyzeState from "../title-analyze-state";
import { GenLibComplete } from "../../models/client";
import { SsidChartTwoTone } from "@mui/icons-material";
import { genLibAnalyzeState } from "../../helpers/helpers";
import { ChangeEvent } from "react";


type Props = {
    genLibs: GenLibComplete[];
    selected: number;
    setSelected: (selected: number) => void;
    selectedMulti: boolean[];
    setSelectedMulti: (selectedMulti: boolean[]) => void;
}

const GenLibSidebar: React.FC<Props> = ({
    genLibs,
    selected,
    setSelected,
    selectedMulti,
    setSelectedMulti,
}) => {
    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectedMulti(new Array(genLibs.length).fill(checked));
    };

    const handleSelect = (index: number) => {
        setSelectedMulti(selectedMulti.map((val, i) => i === index ? !val : val));
    };

    return (
        <List>
            <ListItem
                disablePadding
                secondaryAction={
                    <Checkbox
                        checked={selectedMulti.length > 0 && selectedMulti.every(item => item)}
                        onChange={handleSelectAll}
                    />
                }
            >
                <ListItemButton
                    selected={selected === -1}
                    onClick={() => setSelected(-1)}
                >
                    <SsidChartTwoTone sx={{ mr: 1 }} />
                    Все библиотеки
                </ListItemButton>
            </ListItem>
            {genLibs.map((g, i) => (
                <ListItem
                    key={i}
                    disablePadding
                    secondaryAction={
                        <Checkbox
                            checked={selectedMulti[i]}
                            onChange={() => handleSelect(i)}
                        />
                    }
                >
                    <ListItemButton
                        selected={selected === i}
                        onClick={() => setSelected(i)}
                    >
                        <TitleAnalyzeState
                            title={g.parsed.description.title}
                            state={genLibAnalyzeState(g)}
                            messageSuccess='Есть успешно выполненные анализы'
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default GenLibSidebar;