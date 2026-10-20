import React, { Suspense } from 'react';
import WhatsAppNumbersPageClient from '../../../components/inventory/WhatsAppNumbersPageClient';

export default function WhatsAppNumbersPage() {
    // The page reads ?businessId= from the address, which needs a Suspense boundary
    return (
        <Suspense fallback={null}>
            <WhatsAppNumbersPageClient />
        </Suspense>
    );
}
