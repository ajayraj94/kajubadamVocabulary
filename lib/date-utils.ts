// ── Format date for display: YYYY-MM-DD → DD-MM-YYYY ──

export function formatDate(dateStr: string): string {
    const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
        return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
    }
    return dateStr;
}
