'use client';

import { useEffect } from 'react';
import { fiscalDAL } from '@/lib/dal';

export function BNRFetcher() {
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('/api/bnr');
                if (!response.ok) throw new Error('Failed to fetch rates');

                const data = await response.json();
                if (data.rate) {
                    fiscalDAL.updateExchangeRate(data.rate);
                    console.log('BNR Rate updated:', data.rate);
                }
            } catch (error) {
                console.error('Error fetching BNR rates:', error);
            }
        };

        fetchRates();
    }, []);

    return null; // Logic only component
}
