export const fmtMillions = (v: number, currency: string = '') => {
    if (v >= 1000000000) return `${currency}${parseFloat((v / 1000000000).toFixed(3))}B`;
    if (v >= 1000000) return `${currency}${parseFloat((v / 1000000).toFixed(3))}M`;
    if (v >= 1000) return `${currency}${parseFloat((v / 1000).toFixed(3))}K`;
    return `${currency}${v}`;
};
