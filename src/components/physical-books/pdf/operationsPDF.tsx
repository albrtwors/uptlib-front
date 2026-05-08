import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 35,
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
        marginBottom: 20,
        border: '1pt solid #F1F5F9',
    },
    summaryItem: { marginRight: 40 },
    summaryLabel: { fontSize: 7, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 },
    summaryValue: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },

    table: { width: '100%' },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 4,
        marginBottom: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid #E2E8F0',
        alignItems: 'center',
        minHeight: 35,
        paddingVertical: 5,
    },
    headerText: { color: '#FFFFFF', fontSize: 8, fontWeight: 'bold', padding: 8 },
    cell: { padding: 8 },

    // Columnas ajustadas a la tabla de operaciones de libros
    colTitle: { width: '30%' },
    colIsbn: { width: '20%' },
    colType: { width: '15%', textAlign: 'center' },
    colQty: { width: '10%', textAlign: 'center' },
    colDate: { width: '25%', textAlign: 'right' },

    bookTitle: { fontWeight: 'bold', color: '#1E293B', fontSize: 9 },
    bookId: { fontSize: 7, color: '#94A3B8', marginTop: 1 },
    isbnBadge: { color: '#1E40AF', fontSize: 8 },

    // Tipos de operación (Colores del PDF)
    typeText: { fontSize: 8, fontWeight: 'bold' },
    typePRESTAMO: { color: '#CA8A04' },   // Yellow-600
    typeDEVOLUCION: { color: '#2563EB' }, // Blue-600
    typeBAJA: { color: '#DC2626' },       // Red-600
    typeENTRADA: { color: '#16A34A' },    // Green-600

    footer: {
        position: 'absolute', bottom: 25, left: 35, right: 35,
        borderTop: '1pt solid #E2E8F0', paddingTop: 10,
        flexDirection: 'row', justifyContent: 'space-between',
        fontSize: 7, color: '#94A3B8',
    }
});

interface BookOperationsPDFProps {
    items: any[]; // operations
    title?: string;
}

const BookOperationsPDF = ({ items = [], title = 'Historial de Operaciones de Libros' }: BookOperationsPDFProps) => {
    const totalOps = items.length;
    const totalQty = items.reduce((sum, op) => sum + (Number(op.quantity) || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.date}>
                            Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                        </Text>
                    </View>
                </View>

                {/* Resumen */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Movimientos</Text>
                        <Text style={styles.summaryValue}>{totalOps}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Ejemplares Afectados</Text>
                        <Text style={styles.summaryValue}>{totalQty.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Tabla */}
                <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.headerText, styles.colTitle]}>LIBRO / ID</Text>
                        <Text style={[styles.headerText, styles.colIsbn]}>ISBN</Text>
                        <Text style={[styles.headerText, styles.colType]}>OPERACIÓN</Text>
                        <Text style={[styles.headerText, styles.colQty]}>CANT.</Text>
                        <Text style={[styles.headerText, styles.colDate]}>FECHA Y HORA</Text>
                    </View>

                    {items.map((op) => (
                        <View key={op.id} style={styles.tableRow} wrap={false}>
                            {/* Libro */}
                            <View style={[styles.cell, styles.colTitle]}>
                                <Text style={styles.bookTitle}>{op.book?.title || 'Sin Título'}</Text>
                                <Text style={styles.bookId}>ID: {op.book?.id || 'N/A'}</Text>
                            </View>

                            {/* ISBN */}
                            <View style={[styles.cell, styles.colIsbn]}>
                                <Text style={styles.isbnBadge}>{op.book?.isbn || 'N/A'}</Text>
                            </View>

                            {/* Tipo de Operación Condicional */}
                            <View style={[styles.cell, styles.colType]}>
                                <Text>
                                    {op.type}
                                </Text>
                            </View>

                            {/* Cantidad */}
                            <View style={[styles.cell, styles.colQty]}>
                                <Text style={{ fontWeight: 'bold' }}>{op.quantity}</Text>
                            </View>

                            {/* Fecha */}
                            <View style={[styles.cell, styles.colDate]}>
                                <Text>
                                    {new Date(op.createdAt).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text
                    style={styles.footer}
                    fixed
                    render={({ pageNumber, totalPages }) => (
                        `Reporte de Operaciones | Página ${pageNumber} de ${totalPages}`
                    )}
                />
            </Page>
        </Document>
    );
};

export default BookOperationsPDF;