import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useMemo } from "react";
import { AnalyzedTable, prepareStandardAnalyzedTable } from "../chart-data/chart-data";


interface Props<T> {
    rawData: T;
    prepare: (rawData: T) => AnalyzedTable;
}


const SimpleTable = <T,>({
    rawData,
    prepare,
}: Props<T>) => {
    const { header, rows } = useMemo(() => prepare(rawData), [rawData, prepare]);

    return (
        <TableContainer component={Paper} elevation={1}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>{header.size}</TableCell>
                        <TableCell>{header.concentration}</TableCell>
                        <TableCell>{header.molarity}</TableCell>
                        <TableCell>{header.peak}</TableCell>
                        <TableCell>{header.area}</TableCell>
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
                            <TableCell>{row.area}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default SimpleTable;