import { StyleSheet, View, Text } from "@react-pdf/renderer";
import { AnalyzedTable } from "../../chart-data/chart-data";


const styles = StyleSheet.create({
    table: { width: 'auto', borderStyle: 'solid', borderRight: 1, borderBottom: 1 },
    row: { flexDirection: 'row' },
    header: {
        fontWeight: 'bold',
        backgroundColor: '#add8e6',
    },
    cell: {
        borderStyle: 'solid',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        padding: 4,
        flexGrow: 1,
        textAlign: 'center',
        width: '20%',
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
                    <Text style={[styles.cell, styles.header]}>{tableData.header.size}</Text>
                    <Text style={[styles.cell, styles.header]}>{tableData.header.concentration}</Text>
                    <Text style={[styles.cell, styles.header]}>{tableData.header.molarity}</Text>
                    <Text style={[styles.cell, styles.header]}>{tableData.header.peak}</Text>
                    <Text style={[styles.cell, styles.header]}>{tableData.header.area}</Text>
                </View>
                {tableData.rows.map(row => (
                    <View key={row.size} style={styles.row}>
                        <Text style={styles.cell}>{row.size}</Text>
                        <Text style={styles.cell}>{row.concentration}</Text>
                        <Text style={styles.cell}>{row.molarity}</Text>
                        <Text style={styles.cell}>{row.peak}</Text>
                        <Text style={styles.cell}>{row.area}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default ReportTable;