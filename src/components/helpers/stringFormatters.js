const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

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
  const intDigits = Math.round(absValue).toString().length;
  const fractionBase = intDigits > 3 ? 1 : Math.pow(10, 4 - intDigits);
  const rounded = Math.round(absValue * fractionBase) / fractionBase;
  return { value: rounded.toString(), unit: units[unit] };
}

export function prettyPrintBytes(input) {
  const { value, unit } = parseBytes(input);
  return `${value} ${unit}`;
}

export function prettyPrintPercent(percent) {
  percent = Number(percent);
  if (Number.isNaN(percent)) {
    return '-';
  }
  return (Math.round(percent * 1000) / 10).toString() + '%';
}
