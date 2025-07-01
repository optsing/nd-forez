import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useMemo } from "react";
import { AnalyzeResultData } from "../models/models";
import { prepareGenLibAnalyzedTable, prepareGenLibAnalyzedTotalTable } from "../chart-data/chart-data";


interface Props {
    analyzeResultData: AnalyzeResultData;
}


const GenLibAnalyzedTable: React.FC<Props> = ({
    analyzeResultData,
}) => {
    const rows = useMemo(() => {
        return prepareGenLibAnalyzedTable(analyzeResultData);
    }, [analyzeResultData])
    const rowsTotal = useMemo(() => {
        return prepareGenLibAnalyzedTotalTable(analyzeResultData);
    }, [analyzeResultData])

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
                            <TableCell>{row.size} </TableCell>
                            <TableCell>{row.concentration}</TableCell>
                            <TableCell>{row.molarity}</TableCell>
                            <TableCell>{row.peak}</TableCell>
                            <TableCell>{row.led}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableHead>
                    <TableRow>
                        <TableCell>Длина максимального фрагмента, пн</TableCell>
                        <TableCell>Концентрация геномной библиотеки, нг/мкл</TableCell>
                        <TableCell>Молярность геномной библиотеки, пмоль/л</TableCell>
                        <TableCell>Время выхода максимального фрагмента, с</TableCell>
                        <TableCell>Площадь геномной библиотеки * 10⁷</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsTotal.map(row => (
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

export default GenLibAnalyzedTable;