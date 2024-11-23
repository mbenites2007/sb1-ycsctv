export const formatDecimal = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const parseDecimal = (value: string): number => {
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return Number(cleanValue) || 0;
};