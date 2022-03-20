/* eslint-disable import/prefer-default-export */
export const calculateValueFromPercentage = (
  percentage: number,
  totalValue: number
): number => {
  return totalValue * (percentage / 100);
};
