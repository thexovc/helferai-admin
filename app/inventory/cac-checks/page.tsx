import React, { Suspense } from 'react';
import CacChecksPageClient from '../../../components/inventory/CacChecksPageClient';

export default function CacChecksPage() {
    return (
        <Suspense fallback={null}>
            <CacChecksPageClient />
        </Suspense>
    );
}
