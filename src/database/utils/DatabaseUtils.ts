export const boolToInt = (value: boolean): number => value ? 1 : 0;

export const intToBool = (value: number): boolean => value === 1;

export const nullable = <T>(value: T | undefined): T | null =>
    value ?? null;