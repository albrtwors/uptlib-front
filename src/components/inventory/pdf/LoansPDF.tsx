import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#334155',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: '2pt solid #E2E8F0',
        paddingBottom: 15,
        marginBottom: 20,
    },
    titleSection: { flexDirection: 'column' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textTransform: 'uppercase' },
    date: { fontSize: 8, color: '#64748B', marginTop: 2 },

    // Resumen dinámico
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 6,
        padding: 12,
        marginBottom: 15,
        border: '1pt solid #F1F5F9',
    },
    summaryItem: { marginRight: 30 },
    summaryLabel: { fontSize: 7, color: '#64748B', textTransform: 'uppercase' },
    summaryValue: { fontSize: 11, fontWeight: 'bold', color: '#0F172A' },

    table: { width: 'auto' },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 3,
        marginBottom: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid #E2E8F0',
        alignItems: 'center',
        minHeight: 30,
        paddingVertical: 4,
    },
    headerText: { color: '#FFFFFF', fontSize: 7, fontWeight: 'bold', padding: 6 },
    cell: { padding: 6 },

    // Anchos de columna
    colItem: { width: '25%' },
    colPerson: { width: '20%' },
    colQty: { width: '8%', textAlign: 'center' },
    colDate: { width: '12%', textAlign: 'center' },
    colObs: { width: '25%' },
    colDays: { width: '10%', textAlign: 'right' },

    itemName: { fontWeight: 'bold', color: '#0F172A' },
    itemSub: { fontSize: 7, color: '#94A3B8' },
    obsBox: { fontSize: 7, color: '#854d0e', backgroundColor: '#fefce8', padding: 3, borderRadius: 2 },

    // Alertas de días
    daysNormal: { color: '#16a34a', fontWeight: 'bold' },
    daysWarning: { color: '#ea580c', fontWeight: 'bold' },
    daysDanger: { color: '#dc2626', fontWeight: 'bold' },

    footer: {
        position: 'absolute', bottom: 20, left: 30, right: 30,
        borderTop: '1pt solid #E2E8F0', paddingTop: 8,
        flexDirection: 'row', justifyContent: 'space-between',
        fontSize: 7, color: '#94A3B8',
    }
});

interface LoansPDFProps {
    items: any[]; // loanOperations
    title?: string;
}

const LoansPDF = ({ items = [], title = 'Reporte de Préstamos Activos' }: LoansPDFProps) => {
    const totalLoans = items.length;
    const totalQty = items.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.date}>Emitido el: {new Date().toLocaleString('es-ES')}</Text>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Préstamos Pendientes</Text>
                        <Text style={styles.summaryValue}>{totalLoans}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Unidades prestadas</Text>
                        <Text style={styles.summaryValue}>{totalQty}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.headerText, styles.colItem]}>ITEM / REFERENCIA</Text>
                        <Text style={[styles.headerText, styles.colPerson]}>PERSONA</Text>
                        <Text style={[styles.headerText, styles.colQty]}>CANT.</Text>
                        <Text style={[styles.headerText, styles.colDate]}>INICIO</Text>
                        <Text style={[styles.headerText, styles.colObs]}>OBSERVACIONES</Text>
                        <Text style={[styles.headerText, styles.colDays]}>DÍAS</Text>
                    </View>

                    {items.map((loan) => {
                        const daysAgo = Math.floor(
                            (new Date().getTime() - new Date(loan.createdAt).getTime()) / (1000 * 3600 * 24)
                        );

                        return (
                            <View key={loan.id} style={styles.tableRow} wrap={false}>
                                <View style={[styles.cell, styles.colItem]}>
                                    <Text style={styles.itemName}>{loan.item?.name || 'Item Desconocido'}</Text>
                                    <Text style={styles.itemSub}>ID: {loan.itemId}</Text>
                                </View>

                                <View style={[styles.cell, styles.colPerson]}>
                                    <Text>{loan.personNames} {loan.personSurNames}</Text>
                                    <Text style={styles.itemSub}>{loan.personId || ''}</Text>
                                </View>

                                <View style={[styles.cell, styles.colQty]}>
                                    <Text style={{ fontWeight: 'bold' }}>{loan.quantity}</Text>
                                </View>

                                <View style={[styles.cell, styles.colDate]}>
                                    <Text>{new Date(loan.createdAt).toLocaleDateString('es-ES')}</Text>
                                </View>

                                <View style={[styles.cell, styles.colObs]}>
                                    {loan.observations ? (
                                        <Text style={styles.obsBox}>{loan.observations}</Text>
                                    ) : (
                                        <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin obs.</Text>
                                    )}
                                </View>

                                <View style={[styles.cell, styles.colDays]}>
                                    <Text style={[
                                        daysAgo > 7 ? styles.daysDanger : daysAgo > 3 ? styles.daysWarning : styles.daysNormal
                                    ]}>
                                        {daysAgo} d
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
                    `Control de Inventario - Préstamos | Página ${pageNumber} de ${totalPages}`
                )} />
            </Page>
        </Document>
    );
};

export default LoansPDF;