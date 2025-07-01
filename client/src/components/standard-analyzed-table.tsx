import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useMemo } from "react";
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
    const rows: TableRow[] = useMemo(() => {
        const result: TableRow[] = [];
        for (let i = 0; i < analyzeResult.sizes.length; i++) {
            result.push({
                size: analyzeResult.sizes[i],
                concentration: analyzeResult.concentrations[i],
                molarity: round(analyzeResult.SD_molarity[i]),
                peak: analyzeResult.peak[i],
                led: round(analyzeResult.led_area[i] * 1e-7),
            });
        }
        return result;
    }, [analyzeResult]);

    return (
        <TableContainer component={Paper} elevation={1}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>Длина фрагментов, пн</TableCell>
                        <TableCell>Концентрация, нг/мкл</TableCell>
                        <TableCell>Молярность, нмоль/л</TableCell>
                        <TableCell>Время выхода, с</TableCell>
                        <TableCell>Площадь * 10^7</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => (
                        <TableRow
                            key={row.size}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell>{row.size}</TableCell>
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