export type WidgetPasswordOptions = {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
};

export const DEFAULT_WIDGET_PASSWORD_OPTIONS: WidgetPasswordOptions = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
};
