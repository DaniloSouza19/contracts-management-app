import { parseISO, format } from 'date-fns';

export const formatValueAsCurrency = (value: number): string => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
};

export const formatValueWithThousandsSeparator = (value: number): string => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
  });

  return formatter.format(value);
};

export const formatStringDate = (
  date: string,
  patternDateFns: string
): string => {
  const dateParsed = parseISO(date);

  const formattedDate = format(dateParsed, patternDateFns);
  return formattedDate;
};
