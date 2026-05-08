// components/ItemsPDF.tsx
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';

// Interfaces
interface ItemPDF {
    id: string;
    name: string;
    code?: string;
    description?: string;
    type?: { name: string };
    typeId?: string;
    totalStock: number;
    availableStock?: number;
    status: string;
}

interface ItemsPDFProps {
    items: ItemPDF[];
    title?: string;
    logo?: string;
}
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica', // Inter si la registras
        fontSize: 10,
        color: '#334155',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: '2pt solid #E2E8F0',
        paddingBottom: 20,
        marginBottom: 20,
    },
    titleSection: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 9,
        color: '#64748B',
        marginTop: 4,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 15,
        marginBottom: 25,
        border: '1pt solid #F1F5F9',
    },
    summaryItem: {
        marginRight: 40,
    },
    summaryLabel: {
        fontSize: 8,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    // Estilos de la Tabla Mejorados
    table: {
        width: 'auto',
    },
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
    headerText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
        padding: 8,
    },
    cell: {
        padding: 8,
    },
    // Anchos de columna proporcionales
    colName: { width: '30%' },
    colCode: { width: '15%' },
    colType: { width: '15%' },
    colStock: { width: '20%', textAlign: 'right' },
    colStatus: { width: '20%', textAlign: 'center' },

    itemName: { fontWeight: 'bold', color: '#0F172A', fontSize: 10 },
    itemSub: { fontSize: 8, color: '#94A3B8', marginTop: 1 },

    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 60,
    },
    activeBadge: { backgroundColor: '#DCFCE7', color: '#166534' },
    inactiveBadge: { backgroundColor: '#FEE2E2', color: '#991B1B' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: '1pt solid #E2E8F0',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#94A3B8',
    }
});

const ItemsPDF: React.FC<ItemsPDFProps> = ({ items = [], title = 'Reporte de Inventario', logo }) => {
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.totalStock, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.date}>
                            Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                        </Text>
                    </View>
                    {logo && <Image src={logo} style={{ width: 50, height: 50 }} />}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total de Items</Text>
                        <Text style={styles.summaryValue}>{totalItems}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Stock Global</Text>
                        <Text style={styles.summaryValue}>{totalStock.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.headerText, styles.colName]}>PRODUCTO / DESCRIPCIÓN</Text>
                        <Text style={[styles.headerText, styles.colCode]}>CÓDIGO</Text>
                        <Text style={[styles.headerText, styles.colType]}>CATEGORÍA</Text>
                        <Text style={[styles.headerText, styles.colStock]}>STOCK (DISP.)</Text>
                        <Text style={[styles.headerText, styles.colStatus]}>ESTADO</Text>
                    </View>

                    {items.map((item) => (
                        <View key={item.id} style={styles.tableRow} wrap={false}>
                            <View style={[styles.cell, styles.colName]}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemSub}>{item.description || 'Sin descripción'}</Text>
                            </View>
                            <View style={[styles.cell, styles.colCode]}>
                                <Text>{item.code || '-'}</Text>
                            </View>
                            <View style={[styles.cell, styles.colType]}>
                                <Text>{item.type?.name || 'General'}</Text>
                            </View>
                            <View style={[styles.cell, styles.colStock]}>
                                <Text style={{ fontWeight: 'bold' }}>{item.totalStock}</Text>
                                <Text style={styles.itemSub}>Disp: {item.availableStock}</Text>
                            </View>
                            <View style={[styles.cell, styles.colStatus]}>
                                <Text style={[
                                    styles.badge,
                                    item.status === 'DISPONIBLE' ? styles.activeBadge : styles.inactiveBadge
                                ]}>
                                    {item.status === 'DISPONIBLE' ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer con paginación */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => (
                        `Reporte de Items | Página ${pageNumber} de ${totalPages}`
                    )}
                    fixed
                />
            </Page>
        </Document>
    );
};

export default ItemsPDF;