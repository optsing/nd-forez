import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";
import { AnalyzeResult } from "../models/models";
import { round } from "../helpers/helpers";


interface Props {
    analyzeResult: AnalyzeResult;
}

interface TableRow {
    size: number;
    concentration: number;
    molarity: number;
    peak: number;
    led: number;
}

const StandardAnalyzedTable: React.FC<Props> = ({
    analyzeResult,
}) => {
    const headers: string[] = ["Длина фрагментов, пн", "Концентрация, нг/мкл", "Молярность, нмоль/л", "Время выхода, с", "Площадь * 10^7"];
    const rows: TableRow[] = [];

    for (let i = 0; i < analyzeResult.sizes.length; i++) {
        rows.push({
            size: analyzeResult.sizes[i],
            concentration: analyzeResult.concentrations[i],
            molarity: round(analyzeResult.SD_molarity[i]),
            peak: analyzeResult.peak[i],
            led: round(analyzeResult.led_area[i]),
        });
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 1, mb: 3 }}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        {headers.map((title, i) => <TableCell key={i}>{title}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => (
                        <TableRow
                            key={row.size}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell>{row.size} </TableCell>
                            <TableCell>{row.concentration}</TableCell>
                            <TableCell>{row.molarity}</TableCell>
                            <TableCell>{row.peak}</TableCell>
                            <TableCell>{row.led}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default StandardAnalyzedTable;