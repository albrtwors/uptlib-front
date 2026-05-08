'use client'
import { usePDF } from '@react-pdf/renderer';
import ItemsPDF from './physicalBooksPDF';
import { useEffect } from 'react';
import BooksPDF from './physicalBooksPDF';

export default function ExportItemsPDFButton({ items, title }: any) {
    const [instance, updateInstance] = usePDF({
        document: <BooksPDF items={items} title={title || 'Reporte de Items'} />,
    });

    useEffect(() => {
        updateInstance(<BooksPDF items={items} title={title} />);
    }, [items, title, updateInstance]);

    const handlePrintPDF = () => {
        // Verificamos que el blob exista y no esté cargando
        if (instance.loading || !instance.blob) return;

        const url = URL.createObjectURL(instance.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `items-${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(a); // Buena práctica añadirlo al DOM temporalmente
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handlePrintPDF}
            // instance.loading es un booleano, se usa sin paréntesis
            disabled={instance.loading}
            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {instance.loading ? (
                <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generando...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir PDF
                </>
            )}
        </button>
    );
}