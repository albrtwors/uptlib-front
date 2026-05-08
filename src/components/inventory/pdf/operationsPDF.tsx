import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos adaptados para Operaciones
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
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
        fontSize: 18,
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
        padding: 12,
        marginBottom: 20,
        border: '1pt solid #F1F5F9',
    },
    summaryItem: {
        marginRight: 40,
    },
    summaryLabel: {
        fontSize: 7,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0F172A',
    },
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
        paddingVertical: 4,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: 'bold',
        padding: 8,
    },
    cell: {
        padding: 8,
    },
    // Ajuste de anchos para operaciones
    colItem: { width: '25%' },
    colPerson: { width: '25%' },
    colType: { width: '15%', textAlign: 'center' },
    colQty: { width: '10%', textAlign: 'center' },
    colDate: { width: '25%', textAlign: 'right' },

    itemName: { fontWeight: 'bold', color: '#0F172A', fontSize: 9 },
    itemSub: { fontSize: 7, color: '#94A3B8' },

    // Colores para tipos de operación
    typeText: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    typePRESTAMO: { color: '#EAB308' },   // Yellow-500 aprox
    typeDEVOLUCION: { color: '#2563EB' }, // Blue-600
    typeBAJA: { color: '#DC2626' },       // Red-600
    typeENTRADA: { color: '#16A34A' },    // Green-600

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

interface OperationsPDFProps {
    items: any[]; // Aquí recibes 'operations'
    title?: string;
    logo?: string;
}

const OperationsPDF: React.FC<OperationsPDFProps> = ({ items = [], title = 'Reporte de Operaciones', logo }) => {

    // Cálculos rápidos para el resumen
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
                    {logo && <Image src={logo} style={{ width: 45, height: 45 }} />}
                </View>

                {/* Resumen Informativo */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Operaciones</Text>
                        <Text style={styles.summaryValue}>{totalOps}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Items Movilizados</Text>
                        <Text style={styles.summaryValue}>{totalQty}</Text>
                    </View>
                </View>

                {/* Tabla de Operaciones */}
                <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.headerText, styles.colItem]}>ITEM / ID</Text>
                        <Text style={[styles.headerText, styles.colPerson]}>RESPONSABLE</Text>
                        <Text style={[styles.headerText, styles.colType]}>TIPO</Text>
                        <Text style={[styles.headerText, styles.colQty]}>CANT.</Text>
                        <Text style={[styles.headerText, styles.colDate]}>FECHA</Text>
                    </View>

                    {items.map((op) => (
                        <View key={op.id} style={styles.tableRow} wrap={false}>
                            {/* Item e ID */}
                            <View style={[styles.cell, styles.colItem]}>
                                <Text style={styles.itemName}>{op.item?.name || 'N/A'}</Text>
                                <Text style={styles.itemSub}>ID: {op.item?.id || 'N/A'}</Text>
                            </View>

                            {/* Responsable */}
                            <View style={[styles.cell, styles.colPerson]}>
                                <Text>{`${op.personNames || ''} ${op.personSurNames || ''}`.trim() || 'N/A'}</Text>
                            </View>

                            {/* Tipo de Operación con Color dinámico */}
                            <View style={[styles.cell, styles.colType]}>
                                <Text >
                                    {op.type}
                                </Text>
                            </View>

                            {/* Cantidad */}
                            <View style={[styles.cell, styles.colQty]}>
                                <Text style={{ fontWeight: 'bold' }}>{op.quantity}</Text>
                            </View>

                            {/* Fecha formateada */}
                            <View style={[styles.cell, styles.colDate]}>
                                <Text>{new Date(op.createdAt).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => (
                        `Reporte de Operaciones | Página ${pageNumber} de ${totalPages}`
                    )}
                    fixed
                />
            </Page>
        </Document>
    );
};

export default OperationsPDF;