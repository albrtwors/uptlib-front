import React from 'react';

const LibroIcon = ({ width = 24, height = 24, className = '' }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Portada del libro */}
            <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />

            {/* Páginas internas */}
            <path d="M5 5 L5 20 L10 20 Q11 19 10 18 L10 5 Z" fill="currentColor" opacity="0.3" />
            <path d="M5 5 L5 20 L11 20 Q12 19 11 18 L11 5 Z" fill="currentColor" opacity="0.2" />

            {/* Líneas de texto */}
            <g stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" opacity="0.6">
                <line x1="6.5" y1="8" x2="14" y2="8" />
                <line x1="6.5" y1="10" x2="13.5" y2="10" />
                <line x1="6.5" y1="12" x2="14" y2="12" />
                <line x1="6.5" y1="14" x2="13" y2="14" />
                <line x1="6.5" y1="16" x2="14.5" y2="16" />
            </g>

            {/* Marca de página / separador */}
            <path d="M14 4 L16 4 L16 20 L14 20 Z" fill="currentColor" opacity="0.7" />

            {/* Detalle esquina */}
            <path d="M4.5 4.5 L5.5 4 L6 4.5" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
    );
};

export default LibroIcon;