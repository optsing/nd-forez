import { Checkbox, List, ListItem, ListItemButton, ListSubheader } from "@mui/material";
import TitleAnalyzeState from "../title-analyze-state";
import { SizeStandardComplete } from "../../models/client";
import { SsidChartTwoTone } from "@mui/icons-material";
import { ChangeEvent } from "react";
import { GenLibParseResult } from "../../models/models";


type Props = {
    sizeStandard: SizeStandardComplete;
    genLibs: GenLibParseResult[];
    selected: number;
    setSelected: (selected: number) => void;
    selectedMulti: boolean[];
    setSelectedMulti: (selectedMulti: boolean[]) => void;
}

const GenLibSidebar: React.FC<Props> = ({
    sizeStandard,
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
            <ListItemButton
                selected={selected === -2}
                onClick={() => setSelected(-2)}
            >
                <TitleAnalyzeState
                    title='Стандарт длин'
                    state={sizeStandard.analyzed}
                />
            </ListItemButton>
            <ListSubheader sx={{ bgcolor: 'background.paper' }}>Геномные библиотеки</ListSubheader>
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
                            title={g.description.title}
                            state={sizeStandard.analyzedGenLibs.get(i) ?? null}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default GenLibSidebar;