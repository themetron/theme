import colorConvert from 'color-convert';

export const getContrastRatio = ({ hexA, hexB, luminanceA, luminanceB }) => {
  luminanceA = luminanceA || luminanceA === 0 ? luminanceA : getLuminance(hexA);
  luminanceB = luminanceB || luminanceB === 0 ? luminanceB : getLuminance(hexB);
  const [darker, lighter] = [luminanceA, luminanceB].sort();
  const contrastRatio = ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  return contrastRatio;
};

export const getNextLuminanceByContrastRatio = ({ luminance, contrastRatio }) =>
  luminance * contrastRatio + contrastRatio / 20 - 1 / 20;

export const getPrevLuminanceByContrastRatio = ({ luminance, contrastRatio }) =>
  (luminance + 1 / 20) / contrastRatio - 1 / 20;

export const getLuminance = (hex) => {
  const rgb = colorConvert.hex.rgb(hex);

  let rgb2 = rgb.map((channel) => {
    let c = channel / 255;

    if (c <= 0.03928) {
      return c / 12.92;
    } else {
      return Math.pow((c + 0.055) / 1.055, 2.4);
    }
  });

  const luminance = (0.2126 * rgb2[0] + 0.7152 * rgb2[1] + 0.0722 * rgb2[2]);
  return luminance;
};

export const setColorByLuminanceWithHsl = ({
  attempt = 0,
  hex,
  initHsl,
  luminance: targetLuminance,
  maxAttempts = 10,
}) => {
  const luminance = getLuminance(hex);

  if (luminance === targetLuminance || attempt >= maxAttempts) {
    return hex;
  }

  const darken = luminance > targetLuminance;
  const jumpSize = (darken ? -100 : 100) / Math.pow(2, attempt + 1);
  let prevHsl = colorConvert.hex.hsl(hex);
  let safeInitHsl = initHsl !== undefined ? initHsl : prevHsl;

  const hsl = setHsl({
    hsl: safeInitHsl,
    l: Math.max(0, Math.min(prevHsl[2] + jumpSize, 100)),
  });

  if (`#${colorConvert.hsl.hex(hsl)}` === hex) {
    return hex;
  }

  return setColorByLuminanceWithHsl({
    attempt: attempt + 1,
    hex: `#${colorConvert.hsl.hex(hsl)}`,
    initHsl: safeInitHsl,
    luminance: targetLuminance,
    maxAttempts,
  });
};

export const setColorByContrastWithHsl = ({
  attempt = 0,
  baseHex,
  contrastRatio: targetContrastRatio,
  originalContrastRatio,
  direction,
  hex,
  maxAttempts = 10,
}) => {
  let targetLuminance;
  originalContrastRatio = originalContrastRatio || targetContrastRatio;

  if (!direction) {
    targetLuminance = getLuminance(baseHex) > 0.5 ?
      getPrevLuminanceByContrastRatio({
        contrastRatio: targetContrastRatio,
        luminance: getLuminance(baseHex),
      }) :
      getNextLuminanceByContrastRatio({
        contrastRatio: targetContrastRatio,
        luminance: getLuminance(baseHex),
      });
  } else if (direction === 'asc') {
    targetLuminance = getNextLuminanceByContrastRatio({
      contrastRatio: targetContrastRatio,
      luminance: getLuminance(baseHex),
    });
  } else if (direction === 'desc') {
    targetLuminance = getPrevLuminanceByContrastRatio({
      contrastRatio: targetContrastRatio,
      luminance: getLuminance(baseHex),
    })
  }

  const nextColor = setColorByLuminanceWithHsl({
    hex,
    luminance: targetLuminance,
    maxAttempts,
  });

  if (getContrastRatio({ hexA: nextColor, hexB: baseHex }) >= originalContrastRatio || attempt > maxAttempts) {
    return nextColor;
  }

  return setColorByContrastWithHsl({
    attempt: attempt + 1,
    baseHex,
    contrastRatio: targetContrastRatio + 0.05,
    originalContrastRatio,
    direction,
    hex,
    maxAttempts,
  });
};

export const setHsl = ({ hsl: [h, s, l], h: h2, s: s2, l: l2 }) => ([
  typeof h2 === 'number' ? h2 : h,
  typeof s2 === 'number' ? s2 : s,
  typeof l2 === 'number' ? l2 : l,
]);

export const getHexFromHexOrName = (color) => {
  let safeValue;

  try {
    safeValue = colorConvert.keyword.hex(color).toLowerCase();
  } catch(e) {
    safeValue = color[0] === '#' ? color.substr(1) : color;
  }

  return `#${safeValue}` || '#000000';
}

export default {
  getContrastRatio,
  getHexFromHexOrName,
  getLuminance,
  setColorByContrastWithHsl,
  setHsl,
};
