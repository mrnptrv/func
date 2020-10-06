export const numberFormat = (value) =>
    new Intl.NumberFormat('ru-Ru', { maximumSignificantDigits: 3 }).format(value)
