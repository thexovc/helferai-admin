'use client';
import React from 'react';

// Shows the short value; clicking switches to the exact one and back
export default function ToggleValue({ short, full, style }: { short: string; full: string; style?: React.CSSProperties }) {
    const [showFull, setShowFull] = React.useState(false);
    if (short === full) return <span style={style}>{short}</span>;
    return (
        <span
            onClick={() => setShowFull(v => !v)}
            title={showFull ? 'Click for the short value' : 'Click for the exact value'}
            style={{ cursor: 'pointer', ...style }}
        >
            {showFull ? full : short}
        </span>
    );
}
