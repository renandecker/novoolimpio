export const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

export const parseDate = (value: string): string | null => {
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
};