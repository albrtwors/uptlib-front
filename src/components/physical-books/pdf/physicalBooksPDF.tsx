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
    title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
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

    // Anchos proporcionales para Landscape
    colTitle: { width: '22%' },
    colIsbn: { width: '12%' },
    colAuthor: { width: '15%' },
    colCat: { width: '12%' },
    colEdit: { width: '12%' },
    colYear: { width: '7%', textAlign: 'center' },
    colStock: { width: '10%', textAlign: 'right' },
    colStatus: { width: '10%', textAlign: 'center' },

    bookTitle: { fontWeight: 'bold', color: '#0F172A', fontSize: 9 },
    idSub: { fontSize: 7, color: '#94A3B8' },

    badgeActive: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 7,
        textAlign: 'center'
    },
    badgeInactive: {
        backgroundColor: '#F1F5F9',
        color: '#475569',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 7,
        textAlign: 'center'
    },

    footer: {
        position: 'absolute', bottom: 20, left: 30, right: 30,
        borderTop: '1pt solid #E2E8F0', paddingTop: 8,
        flexDirection: 'row', justifyContent: 'space-between',
        fontSize: 7, color: '#94A3B8',
    }
});

interface BooksPDFProps {
    items: any[];
    title?: string;
}

const BooksPDF = ({ items = [], title = 'Catálogo de Libros Físicos' }: BooksPDFProps) => {
    const totalBooks = items.length;
    const totalStock = items.reduce((sum, b) => sum + (b.totalStock || 0), 0);

    return (
        <Document>
            {/* Usamos orientation="landscape" para que quepan todas las columnas */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.date}>Reporte generado el: {new Date().toLocaleString('es-ES')}</Text>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Títulos</Text>
                        <Text style={styles.summaryValue}>{totalBooks}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Ejemplares Totales</Text>
                        <Text style={styles.summaryValue}>{totalStock}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.headerText, styles.colTitle]}>TÍTULO</Text>
                        <Text style={[styles.headerText, styles.colIsbn]}>ISBN</Text>
                        <Text style={[styles.headerText, styles.colAuthor]}>AUTOR</Text>
                        <Text style={[styles.headerText, styles.colCat]}>CATEGORÍA</Text>
                        <Text style={[styles.headerText, styles.colEdit]}>EDITORIAL</Text>
                        <Text style={[styles.headerText, styles.colYear]}>AÑO</Text>
                        <Text style={[styles.headerText, styles.colStock]}>STOCK</Text>
                        <Text style={[styles.headerText, styles.colStatus]}>ESTADO</Text>
                    </View>

                    {items.map((book) => (
                        <View key={book.id} style={styles.tableRow} wrap={false}>
                            <View style={[styles.cell, styles.colTitle]}>
                                <Text style={styles.bookTitle}>{book.title}</Text>
                                <Text style={styles.idSub}>ID: {book.id}</Text>
                            </View>

                            <View style={[styles.cell, styles.colIsbn]}>
                                <Text>{book.isbn || 'N/A'}</Text>
                            </View>

                            <View style={[styles.cell, styles.colAuthor]}>
                                <Text>{book.author?.name || 'N/A'}</Text>
                            </View>

                            <View style={[styles.cell, styles.colCat]}>
                                <Text>{book.category?.name || 'N/A'}</Text>
                            </View>

                            <View style={[styles.cell, styles.colEdit]}>
                                <Text>{book.editorial || 'N/A'}</Text>
                            </View>

                            <View style={[styles.cell, styles.colYear]}>
                                <Text>{book.yearOfPublication || 'N/A'}</Text>
                            </View>

                            <View style={[styles.cell, styles.colStock]}>
                                <Text style={{ fontWeight: 'bold' }}>{book.totalStock}</Text>
                                <Text style={{ fontSize: 6, color: '#64748B' }}>Disp: {book.availableStock}</Text>
                            </View>

                            <View style={[styles.cell, styles.colStatus]}>
                                <Text style={book.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive}>
                                    {book.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
                    `Sistema de Biblioteca - Listado de Libros | Página ${pageNumber} de ${totalPages}`
                )} />
            </Page>
        </Document>
    );
};

export default BooksPDF;