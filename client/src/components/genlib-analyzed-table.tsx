import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useMemo } from "react";
import { AnalyzeResultData } from "../models/models";
import { round } from "../helpers/helpers";

interface Props {
    analyzeResultData: AnalyzeResultData;
}

interface TableRow {
    peaks_corr: number;
    area_corr: number;
    molarity: number;
    library_peaks: number;
    gl_areas: number;
}


const GenLibAnalyzedTable: React.FC<Props> = ({
    analyzeResultData,
}) => {
    const rows: TableRow[] = useMemo(() => {
        const result: TableRow[] = [];
        for (let i = 0; i < analyzeResultData.peaksCorr.length; i++) {
            result.push({
                peaks_corr: round(analyzeResultData.peaksCorr[i]),
                area_corr: round(analyzeResultData.areaCorr[i]),
                molarity: round(analyzeResultData.molarity[i]),
                library_peaks: round(analyzeResultData.library_peaks[i]),
                gl_areas: round(analyzeResultData.GLAreas[i] * 1e-7),
            });
        }
        return result;
    }, [analyzeResultData])
    const rowsTotal: TableRow[] = useMemo(() => {
        return [{
            peaks_corr: round(analyzeResultData.maxLibPeak),
            area_corr: round(analyzeResultData.totalLibConc),
            molarity: round(analyzeResultData.totalLibMolarity),
            library_peaks: round(analyzeResultData.maxLibValue),
            gl_areas: round(analyzeResultData.totalLibArea * 1e-7),
        }];
    }, [analyzeResultData])

    return (
        <TableContainer component={Paper} elevation={1}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>Длина максимального фрагмента, пн</TableCell>
                        <TableCell>Концентрация геномной библиотеки, нг/мкл</TableCell>
                        <TableCell>Молярность геномной библиотеки, пмоль/л</TableCell>
                        <TableCell>Время выхода максимального фрагмента, с</TableCell>
                        <TableCell>Площадь геномной библиотеки * 10^7</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsTotal.map(row => (
                        <TableRow
                            key={row.peaks_corr}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell>{row.peaks_corr} </TableCell>
                            <TableCell>{row.area_corr}</TableCell>
                            <TableCell>{row.molarity}</TableCell>
                            <TableCell>{row.library_peaks}</TableCell>
                            <TableCell>{row.gl_areas}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
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
                            key={row.peaks_corr}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell>{row.peaks_corr} </TableCell>
                            <TableCell>{row.area_corr}</TableCell>
                            <TableCell>{row.molarity}</TableCell>
                            <TableCell>{row.library_peaks}</TableCell>
                            <TableCell>{row.gl_areas}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GenLibAnalyzedTable;