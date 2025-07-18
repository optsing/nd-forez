import { SxProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useMemo } from "react";
import { SimpleTableData } from "../chart-data/chart-data";


interface Props<T> {
    rawData: T;
    prepare: (rawData: T) => SimpleTableData;
    sx?: SxProps;
}


const SimpleTable = <T,>({
    rawData,
    prepare,
    sx,
}: Props<T>) => {
    const { columnCount, header, rows } = useMemo(() => prepare(rawData), [rawData, prepare]);
    const cellWidth = `${100 / columnCount}%`;

    return (
        <TableContainer sx={sx}>
            <Table size='small'>
                {header && header.length > 0 && <TableHead>
                    <TableRow>
                        {header.map((cell, j) => (
                            <TableCell key={j} sx={{ width: cellWidth }}>{cell}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>}
                <TableBody>
                    {rows.map((row, i) => (
                        <TableRow
                            key={i}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {row.map((cell, j) => (
                                <TableCell key={j} sx={{ width: cellWidth }}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default SimpleTable;