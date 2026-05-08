import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

    table: { width: '100%' },
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
        minHeight: 35,
        paddingVertical: 4,
    },
    headerText: { color: '#FFFFFF', fontSize: 7, fontWeight: 'bold', padding: 6 },
    cell: { padding: 6 },

    // Anchos de columna optimizados
    colBook: { width: '25%' },
    colPerson: { width: '20%' },
    colQty: { width: '7%', textAlign: 'center' },
    colDate: { width: '12%', textAlign: 'center' },
    colObs: { width: '26%' },
    colDays: { width: '10%', textAlign: 'right' },

    bookTitle: { fontWeight: 'bold', color: '#0F172A' },
    subText: { fontSize: 7, color: '#94A3B8', marginTop: 1 },

    obsBox: {
        fontSize: 7,
        color: '#854d0e',
        backgroundColor: '#fefce8',
        padding: 4,
        borderRadius: 3,
        border: '0.5pt solid #fef08a'
    },

    // Colores de alerta para días (Sincronizado con tu lógica web)
    daysGreen: { color: '#16a34a', fontWeight: 'bold' },
    daysOrange: { color: '#ea580c', fontWeight: 'bold' },
    daysRed: { color: '#dc2626', fontWeight: 'bold' },

    footer: {
        position: 'absolute', bottom: 20, left: 30, right: 30,
        borderTop: '1pt solid #E2E8F0', paddingTop: 8,
        flexDirection: 'row', justifyContent: 'space-between',
        fontSize: 7, color: '#94A3B8',
    }
});

interface BookLoansPDFProps {
    items: any[]; // Recibe loanOperations (filtrado por 'PRESTAMO')
    title?: string;
}

const BookLoansPDF = ({ items = [], title = 'Reporte de Préstamos de Libros' }: BookLoansPDFProps) => {
    const totalLoans = items.length;
    const totalQty = items.reduce((sum, loan) => sum + (loan.quantity || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado */}
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.date}>Emitido el: {new Date().toLocaleString('es-ES')}</Text>
                    </View>
                </View>

                {/* Resumen */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Préstamos Activos</Text>
                        <Text style={styles.summaryValue}>{totalLoans}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Libros Fuera</Text>
                        <Text style={styles.summaryValue}>{totalQty}</Text>
                    </View>
                </View>

                {/* Tabla */}
                <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.headerText, styles.colBook]}>LIBRO / ID</Text>
                        <Text style={[styles.headerText, styles.colPerson]}>LECTOR / ID</Text>
                        <Text style={[styles.headerText, styles.colQty]}>CANT.</Text>
                        <Text style={[styles.headerText, styles.colDate]}>FECHA</Text>
                        <Text style={[styles.headerText, styles.colObs]}>OBSERVACIONES</Text>
                        <Text style={[styles.headerText, styles.colDays]}>DÍAS</Text>
                    </View>

                    {items.map((loan) => {
                        const daysAgo = Math.floor(
                            (new Date().getTime() - new Date(loan.createdAt).getTime()) / (1000 * 3600 * 24)
                        );

                        return (
                            <View key={loan.id} style={styles.tableRow} wrap={false}>
                                {/* Info Libro */}
                                <View style={[styles.cell, styles.colBook]}>
                                    <Text style={styles.bookTitle}>{loan.book?.title || 'Libro Desconocido'}</Text>
                                    <Text style={styles.subText}>ID: {loan.bookId}</Text>
                                </View>

                                {/* Info Persona */}
                                <View style={[styles.cell, styles.colPerson]}>
                                    <Text>{loan.personNames} {loan.personSurNames}</Text>
                                    <Text style={styles.subText}>ID: {loan.personId || 'N/A'}</Text>
                                </View>

                                {/* Cantidad */}
                                <View style={[styles.cell, styles.colQty]}>
                                    <Text style={{ fontWeight: 'bold' }}>{loan.quantity}</Text>
                                </View>

                                {/* Fecha Inicio */}
                                <View style={[styles.cell, styles.colDate]}>
                                    <Text>{new Date(loan.createdAt).toLocaleDateString('es-ES')}</Text>
                                </View>

                                {/* Observaciones con diseño de nota */}
                                <View style={[styles.cell, styles.colObs]}>
                                    {loan.observations ? (
                                        <Text style={styles.obsBox}>{loan.observations}</Text>
                                    ) : (
                                        <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin notas</Text>
                                    )}
                                </View>

                                {/* Días transcurridos con lógica de color */}
                                <View style={[styles.cell, styles.colDays]}>
                                    <Text style={[
                                        daysAgo > 7 ? styles.daysRed : daysAgo > 3 ? styles.daysOrange : styles.daysGreen
                                    ]}>
                                        {daysAgo} días
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Numeración de página */}
                <Text
                    style={styles.footer}
                    fixed
                    render={({ pageNumber, totalPages }) => (
                        `Biblioteca - Control de Préstamos | Página ${pageNumber} de ${totalPages}`
                    )}
                />
            </Page>
        </Document>
    );
};

export default BookLoansPDF;