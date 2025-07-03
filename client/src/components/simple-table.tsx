import { Paper, SxProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useMemo } from "react";
import { AnalyzedTable } from "../chart-data/chart-data";


interface Props<T> {
    rawData: T;
    prepare: (rawData: T) => AnalyzedTable;
    sx?: SxProps;
}


const SimpleTable = <T,>({
    rawData,
    prepare,
    sx,
}: Props<T>) => {
    const { header, rows } = useMemo(() => prepare(rawData), [rawData, prepare]);

    return (
        <TableContainer sx={sx}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: '20%' }}>{header.size}</TableCell>
                        <TableCell sx={{ width: '20%' }}>{header.concentration}</TableCell>
                        <TableCell sx={{ width: '20%' }}>{header.molarity}</TableCell>
                        <TableCell sx={{ width: '20%' }}>{header.peak}</TableCell>
                        <TableCell sx={{ width: '20%' }}>{header.area}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => (
                        <TableRow
                            key={row.size}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell sx={{ width: '20%' }}>{row.size}</TableCell>
                            <TableCell sx={{ width: '20%' }}>{row.concentration}</TableCell>
                            <TableCell sx={{ width: '20%' }}>{row.molarity}</TableCell>
                            <TableCell sx={{ width: '20%' }}>{row.peak}</TableCell>
                            <TableCell sx={{ width: '20%' }}>{row.area}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default SimpleTable;