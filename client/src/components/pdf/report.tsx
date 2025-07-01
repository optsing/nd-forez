import { Page, Text, Document, StyleSheet, Image, View, Font } from '@react-pdf/renderer';
import robotoSrc from '../../assets/Roboto-Regular.ttf'
import { AnalyzedTable } from '../../chart-data/chart-data';
import { GenLibPdf } from '../../helpers/pdf';

Font.register({
    family: 'Roboto',
    src: robotoSrc
})

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 12, fontFamily: 'Roboto' },
    title: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
    section: { marginBottom: 30 },
    image: { width: '100%', height: 'auto' },
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
    reportDate: Date;
    standardTitle: string;
    standardChart: string;
    standardCalibrationCurveChart: string;
    standardTable: AnalyzedTable;
    genLibs: GenLibPdf[];
}


const ReportPDF: React.FC<Props> = ({
    reportDate,
    standardTitle,
    standardChart,
    standardCalibrationCurveChart,
    standardTable,
    genLibs,
}) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>Отчёт по результатам анализа</Text>
                    <Text>Дата: {reportDate.toLocaleString('ru-RU')}</Text>
                </View>
            </Page>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Стандарт длин - {standardTitle}</Text>
                <View style={styles.section}>
                    <Image src={standardChart} style={styles.image} />
                </View>
            </Page>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Стандарт длин - {standardTitle}</Text>
                <View style={styles.section}>
                    <Image src={standardCalibrationCurveChart} style={styles.image} />
                </View>

                <View style={styles.section}>
                    <View style={styles.table}>
                        <View style={styles.row}>
                            <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Длина фрагментов, пн</Text>
                            <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Концентрация, нг/мкл</Text>
                            <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Молярность, нмоль/л</Text>
                            <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Время выхода, с</Text>
                            <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Площадь * 10⁷</Text>
                        </View>
                        {standardTable.map((row, i) => (
                            <View key={i} style={styles.row}>
                                <Text style={[styles.cell, { width: 100 }]}>{row.size}</Text>
                                <Text style={[styles.cell, { width: 100 }]}>{row.concentration}</Text>
                                <Text style={[styles.cell, { width: 100 }]}>{row.molarity}</Text>
                                <Text style={[styles.cell, { width: 100 }]}>{row.peak}</Text>
                                <Text style={[styles.cell, { width: 100 }]}>{row.led}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Page>
            {genLibs.map((lib, i) => (
                <Page key={i} size="A4" style={styles.page}>
                    <Text style={styles.title}>Геномная библиотека - {lib.title}</Text>
                    <View style={styles.section}>
                        <Image src={lib.chartImage} style={styles.image} />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.table}>
                            <View style={styles.row}>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Длина фрагментов, пн</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Концентрация, нг/мкл</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Молярность, нмоль/л</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Время выхода, с</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Площадь * 10⁷</Text>
                            </View>
                            {lib.table.map((row, i) => (
                                <View key={i} style={styles.row}>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.size}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.concentration}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.molarity}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.peak}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.led}</Text>
                                </View>
                            ))}
                            <View style={styles.row}>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Длина максимального фрагмента, пн</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Концентрация геномной библиотеки, нг/мкл</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Молярность геномной библиотеки, пмоль/л</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Время выхода максимального фрагмента, с</Text>
                                <Text style={[styles.cell, { fontWeight: 'bold', backgroundColor: '#add8e6', width: 100 }]}>Площадь геномной библиотеки * 10⁷</Text>
                            </View>
                            {lib.tableTotal.map((row, i) => (
                                <View key={i} style={styles.row}>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.size}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.concentration}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.molarity}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.peak}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.led}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </Page>
            ))}
        </Document>
    );
}

export default ReportPDF;
