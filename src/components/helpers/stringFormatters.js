const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function parseBytes(value) {
  const bytes = Number(value);
  let absValue = Math.abs(bytes);
  if (!Number.isFinite(absValue)) return 'infinity';

  const base = 1024;
  let unit = 0;
  while (absValue >= base && unit < units.length) {
    absValue /= base;
    ++unit;
  }
  const rounded = Math.round(absValue * 1000) / 1000;
  return { value: rounded.toString(), unit: units[unit] };
}

export function prettyPrintBytes(input) {
  const { value, unit } = parseBytes(input);
  return `${value} ${unit}`;
}
