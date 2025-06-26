import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";
import { AnalyzeResultData } from "../models/models";
import { round } from "../helpers/helpers";

interface Props {
    analyzeResultData: AnalyzeResultData[];
    selected: number;
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
    selected,
}) => {
    const headers1: string[] = ["Длина фрагментов, пн", "Концентрация, нг/мкл", "Молярность, нмоль/л", "Время выхода, с", "Площадь * 10^7"];
    const rows1: TableRow[] = [];

    const source = analyzeResultData[selected];

    for (let i = 0; i < source.peaksCorr.length; i++) {
        rows1.push({
            peaks_corr: round(source.peaksCorr[i]),
            area_corr: round(source.areaCorr[i]),
            molarity: round(source.molarity[i]),
            library_peaks: round(source.library_peaks[i]),
            gl_areas: round(source.GLAreas[i]),
        });
    }

    const headers2: string[] = ['Длина максимального фрагмента, пн', 'Концентрация геномной библиотеки, нг/мкл', 'Молярность геномной библиотеки, пмоль/л', 'Время выхода максимального фрагмента, с', 'Площадь геномной библиотеки * 10^7'];
    const rows2: TableRow[] = [{
        peaks_corr: round(source.maxLibPeak),
        area_corr: round(source.totalLibConc),
        molarity: round(source.totalLibMolarity),
        library_peaks: round(source.maxLibValue),
        gl_areas: round(source.totalLibArea),
    }];

    return (
        <TableContainer component={Paper} sx={{ mt: 1, mb: 3 }}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        {headers2.map((title, i) => <TableCell key={i}>{title}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows2.map(row => (
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
                        {headers1.map((title, i) => <TableCell key={i}>{title}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows1.map(row => (
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