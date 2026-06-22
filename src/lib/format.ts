export const moneyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

export const integerFormatter = new Intl.NumberFormat("es-EC", {
  maximumFractionDigits: 0,
});

export function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

export function formatInteger(value: number) {
  return integerFormatter.format(value);
}

export function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
