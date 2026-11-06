// Short form for cards (₦374.6K, ₦2.83M, 1.2K) and the exact form shown on click

const trim = (n: number, digits: number) => String(+n.toFixed(digits));

export const compactNaira = (v: number) => {
    const n = Number(v || 0);
    const abs = Math.abs(n);
    if (abs >= 1e9) return `₦${trim(n / 1e9, 2)}B`;
    if (abs >= 1e6) return `₦${trim(n / 1e6, 2)}M`;
    if (abs >= 1e3) return `₦${trim(n / 1e3, 1)}K`;
    return `₦${trim(n, 0)}`;
};

export const fullNaira = (v: number) => `₦${Math.round(Number(v || 0)).toLocaleString()}`;

export const compactCount = (v: number) => {
    const n = Number(v || 0);
    if (Math.abs(n) >= 1e6) return `${trim(n / 1e6, 2)}M`;
    if (Math.abs(n) >= 1e3) return `${trim(n / 1e3, 1)}K`;
    return String(n);
};

export const fullCount = (v: number) => Number(v || 0).toLocaleString();
