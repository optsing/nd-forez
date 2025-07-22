import { SsidChartTwoTone } from "@mui/icons-material";
import { Checkbox, List, ListItem, ListItemButton } from "@mui/material";
import TitleAnalyzeState from "../title-analyze-state";
import { SizeStandardComplete } from "../../models/client";
import { ChangeEvent } from "react";


type Props = {
    sizeStandards: SizeStandardComplete[];
    selected: number;
    setSelected: (selected: number) => void;
    selectedMulti: boolean[];
    setSelectedMulti: (selectedMulti: boolean[]) => void;
}

const SizeStandardSidebar: React.FC<Props> = ({
    sizeStandards,
    selected,
    setSelected,
    selectedMulti,
    setSelectedMulti,
}) => {
    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectedMulti(new Array(sizeStandards.length).fill(checked));
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
                    Все стандарты
                </ListItemButton>
            </ListItem>
            {sizeStandards.map((sizeStandard, i) => (
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
                        selected={i === selected}
                        onClick={() => setSelected(i)}
                    >
                        <TitleAnalyzeState
                            title={sizeStandard.parsed.description.title}
                            state={sizeStandard.analyzed}
                            messageSuccess='Анализ был успешно проведен'
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default SizeStandardSidebar;