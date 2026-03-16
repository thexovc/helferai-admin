import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    margin?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export const SkeletonPulse: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    margin = 0,
    style
}) => {
    return (
        <div
            className="animate-pulse-soft"
            style={{
                width,
                height,
                borderRadius,
                margin,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                ...style
            }}
        />
    );
};

export const KPISkeleton = () => (
    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: '3px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <SkeletonPulse width={36} height={36} borderRadius={10} />
            <SkeletonPulse width={14} height={14} />
        </div>
        <SkeletonPulse width="60%" height={24} margin="0 0 8px" />
        <SkeletonPulse width="40%" height={12} margin="0 0 4px" />
        <SkeletonPulse width="30%" height={12} />
    </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between' }}>
            <SkeletonPulse width={150} height={20} />
            <div style={{ display: 'flex', gap: 10 }}>
                <SkeletonPulse width={100} height={34} borderRadius={8} />
                <SkeletonPulse width={80} height={34} borderRadius={8} />
            </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    {Array(cols).fill(0).map((_, i) => (
                        <th key={i} style={{ padding: '12px 14px' }}>
                            <SkeletonPulse width="80%" height={14} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array(rows).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        {Array(cols).fill(0).map((_, j) => (
                            <td key={j} style={{ padding: '16px 14px' }}>
                                <SkeletonPulse width={j === 0 ? '70%' : '90%'} height={16} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const ChartSkeleton = () => (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
        <SkeletonPulse width={150} height={18} margin="0 0 20px" />
        <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 20 }}>
            {Array(12).fill(0).map((_, i) => (
                <SkeletonPulse
                    key={i}
                    width={`${100 / 12}%`}
                    height={`${20 + Math.random() * 60}%`}
                    borderRadius="4px 4px 0 0"
                />
            ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {Array(6).fill(0).map((_, i) => (
                <SkeletonPulse key={i} width={30} height={10} />
            ))}
        </div>
    </div>
);

export const DetailHeaderSkeleton = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <SkeletonPulse width={64} height={64} borderRadius={16} />
            <div>
                <SkeletonPulse width={200} height={28} margin="0 0 8px" />
                <div style={{ display: 'flex', gap: 8 }}>
                    <SkeletonPulse width={80} height={20} borderRadius={6} />
                    <SkeletonPulse width={120} height={20} borderRadius={6} />
                </div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
            <SkeletonPulse width={100} height={40} borderRadius={10} />
            <SkeletonPulse width={120} height={40} borderRadius={10} />
        </div>
    </div>
);
