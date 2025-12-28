import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const response = await fetch('https://www.bnr.ro/nbrfxrates.xml', {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`BNR API responded with ${response.status}`);
        }

        const xmlText = await response.text();

        // Simple regex parsing to avoid heavy XML parser dependency for just one value
        // Target: <Rate currency="EUR">4.9765</Rate>
        const eurMatch = xmlText.match(/<Rate currency="EUR">([0-9.]+)<\/Rate>/);
        const dateMatch = xmlText.match(/<PublishingDate>([0-9-]+)<\/PublishingDate>/); // Or inside Cube date

        // BNR XML structure: <Cube date="2024-03-22">
        const cubeDateMatch = xmlText.match(/<Cube date="([0-9-]+)">/);

        if (eurMatch && eurMatch[1]) {
            const rate = parseFloat(eurMatch[1]);
            const date = cubeDateMatch ? cubeDateMatch[1] : (dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]);

            return NextResponse.json({
                currency: 'EUR',
                rate,
                date
            });
        } else {
            throw new Error('Could not parse EUR rate from BNR XML');
        }

    } catch (error) {
        console.error('BNR Fetch Error:', error);
        // Fallback to static config if fetch fails, but for API we return error or fallback?
        // Let's return error status so UI knows to use default
        return NextResponse.json(
            { error: 'Failed to fetch BNR rates', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
