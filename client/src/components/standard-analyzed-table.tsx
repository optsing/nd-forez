import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useMemo } from "react";
import { AnalyzeResult } from "../models/models";
import { prepareStandardAnalyzedTable } from "../chart-data/chart-data";


interface Props {
    analyzeResult: AnalyzeResult;
}


const StandardAnalyzedTable: React.FC<Props> = ({
    analyzeResult,
}) => {
    const rows = useMemo(() => {
        return prepareStandardAnalyzedTable(analyzeResult);
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
                        <TableCell>Площадь * 10⁷</TableCell>
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