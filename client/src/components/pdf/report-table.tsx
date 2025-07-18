import { StyleSheet, View, Text } from "@react-pdf/renderer";
import { SimpleTableData } from "../../chart-data/chart-data";


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
    },
});


type Props = {
    tableData: SimpleTableData;
    style?: any;
}


const ReportTable = ({
    tableData,
    style,
}: Props) => {
    const { columnCount, header, rows } = tableData;
    const cellWidth = `${100 / columnCount}%`;

    return (
        <View style={style} wrap={false}>
            <View style={styles.table}>
                {header && header.length > 0 && <View style={styles.row}>
                    {header.map((cell, j) => (
                        <Text key={j} style={[styles.cell, styles.header, { width: cellWidth }]}>{cell}</Text>
                    ))}
                </View>}
                {rows.map((row, i) => (
                    <View key={i} style={styles.row}>
                        {row.map((cell, j) => (
                            <Text key={j} style={[styles.cell, { width: cellWidth }]}>{cell}</Text>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

export default ReportTable;