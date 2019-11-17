const goldenRatio = (1 + Math.sqrt(5)) / 2;

/**
 * A deterministic way to produce a random tag color from its name.
 */
export const getTagCSSColor = tag => {
  const hash = tag.split('').reduce((res, char) => {
    res = res + (char.charCodeAt(0) * goldenRatio) / 256;
    return Math.abs(res - Math.trunc(res));
  }, 0);
  const hue = Math.round(hash * 360);
  return `hsl(${hue}, 66%, 42%)`;
};
