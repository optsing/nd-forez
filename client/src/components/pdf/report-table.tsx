import { StyleSheet, View, Text } from "@react-pdf/renderer";
import { AnalyzedTable } from "../../chart-data/chart-data";


const styles = StyleSheet.create({
    table: { width: 'auto', borderStyle: 'solid', borderRight: 1, borderBottom: 1 },
    row: { flexDirection: 'row' },
    cell: {
        borderStyle: 'solid',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        padding: 4,
        flexGrow: 1,
        textAlign: 'center',
    },
});


type Props = {
    tableData: AnalyzedTable;
    style?: any;
}


const ReportTable = ({
    tableData,
    style,
}: Props) => {
    return (
        <View style={style} wrap={false}>
            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>{tableData.header.size}</Text>
                    <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>{tableData.header.concentration}</Text>
                    <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>{tableData.header.molarity}</Text>
                    <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>{tableData.header.peak}</Text>
                    <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>{tableData.header.area}</Text>
                </View>
                {tableData.rows.map(row => (
                    <View key={row.size} style={styles.row}>
                        <Text style={[styles.cell, { width: 100 }]}>{row.size}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{row.concentration}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{row.molarity}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{row.peak}</Text>
                        <Text style={[styles.cell, { width: 100 }]}>{row.area}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default ReportTable;