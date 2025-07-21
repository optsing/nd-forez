import { Page, Text, Document, StyleSheet, Image, View, Font } from '@react-pdf/renderer';
import robotoSrc from '../../assets/Roboto-Regular.ttf'
import { SizeStandardPdf } from '../../helpers/pdf';
import ReportTable from './report-table';


Font.register({
    family: 'Roboto',
    src: robotoSrc,
})

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 12, fontFamily: 'Roboto' },
    title: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
    section: { marginBottom: 30 },
    image: { width: '100%', height: 'auto' },

});

type Props = {
    reportDate: Date;
    sizeStandards: SizeStandardPdf[];
}


const ReportPdf: React.FC<Props> = ({
    reportDate,
    sizeStandards,
}) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>Отчёт по результатам анализа</Text>
                    <Text>Дата: {reportDate.toLocaleString('ru-RU')}</Text>
                </View>
            </Page>
            {sizeStandards.map(sizeStandard => (
                <>
                    <Page size="A4" style={styles.page}>
                        <Text style={styles.title}>Стандарт длин - {sizeStandard.title}</Text>
                        <View style={styles.section}>
                            <Image src={sizeStandard.chartImage} style={styles.image} />
                        </View>
                    </Page>
                    <Page size="A4" style={styles.page}>
                        <Text style={styles.title}>Стандарт длин - {sizeStandard.title}</Text>
                        <View style={styles.section}>
                            <Image src={sizeStandard.curveChartImage} style={styles.image} />
                        </View>
                        <ReportTable
                            style={styles.section}
                            tableData={sizeStandard.table}
                        />
                    </Page>
                    {
                        sizeStandard.genLibs.map((lib, i) => (
                            <Page key={i} size="A4" style={styles.page}>
                                <Text style={styles.title}>Геномная библиотека - {lib.title}</Text>
                                <View style={styles.section}>
                                    <Image src={lib.chartImage} style={styles.image} />
                                </View>
                                <ReportTable
                                    style={styles.section}
                                    tableData={lib.totalTable}
                                />
                                <ReportTable
                                    style={styles.section}
                                    tableData={lib.table}
                                />
                            </Page>
                        ))
                    }
                </>))}
        </Document>
    );
}

export default ReportPdf;
