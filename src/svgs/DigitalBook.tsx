import React from 'react';

const LibroDigital = ({ width = 24, height = 24, className = '' }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Cuerpo del teléfono */}
            <rect x="4" y="2" width="16" height="20" rx="3" fill="currentColor" />

            {/* Pantalla */}
            <rect x="5" y="4" width="14" height="14" rx="1.5" fill="currentColor" opacity="0.15" />

            {/* Altavoz */}
            <ellipse cx="12" cy="5.5" rx="1.5" ry="0.8" fill="currentColor" opacity="0.4" />

            {/* Botón home */}
            <circle cx="12" cy="20.5" r="1.2" fill="currentColor" opacity="0.8" />

            {/* Cámara trasera */}
            <circle cx="19" cy="6" r="0.8" fill="currentColor" opacity="0.6" />

            {/* Bordes */}
            <rect x="3.5" y="1.5" width="17" height="21" rx="3.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
    );
};

export default LibroDigital;