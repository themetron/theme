import colorConvert from 'color-convert';

import luminanceMap from './luminanceMap';

import {
  getContrastRatio,
  getLuminance,
  getHigherLuminanceByContrastRatio,
  getLowerLuminanceByContrastRatio,
  setHsl,
} from './utils';

export const guessColorByLuminanceWithHsl = ({
  attempt = 0,
  hex,
  initHsl = undefined,
  luminance: targetLuminance,
  maxAttempts = 20,
}) => {
  const luminance = getLuminance(hex);

  if (luminance === targetLuminance || attempt >= maxAttempts) {
    return hex.toLowerCase();
  }

  const darken = luminance > targetLuminance;
  const jumpSize = (darken ? -100 : 100) / Math.pow(2, attempt / 2 + 1);
  let prevHsl = colorConvert.hex.hsl(hex);
  let safeInitHsl = initHsl !== undefined ? initHsl : prevHsl;

  const hsl = setHsl({
    hsl: safeInitHsl,
    l: Math.max(0, Math.min(prevHsl[2] + jumpSize, 100)),
  });

  if (`#${colorConvert.hsl.hex(hsl)}` === hex) {
    return hex.toLowerCase();
  }

  return guessColorByLuminanceWithHsl({
    attempt: attempt + 1,
    hex: `#${colorConvert.hsl.hex(hsl)}`,
    initHsl: safeInitHsl,
    luminance: targetLuminance,
    maxAttempts,
  });
};

export const guessColorRamp = hex => Object.entries(luminanceMap)
  .filter(([, l]) => [0, 1].indexOf(l) < 0)
  .reduce(
    (result, [key, luminance]) => ({
      ...result,
      [key]: guessColorByLuminanceWithHsl({
        hex,
        luminance,
      })
    }),
    {}
  );

export const guessColorByContrastWithHsl = ({
  attempt = 0,
  baseHex, // If we're given a background color, we'll try to generate a color that has sufficient color against that.
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
      getLowerLuminanceByContrastRatio({
        contrastRatio: targetContrastRatio,
        luminance: getLuminance(baseHex),
      }) :
      getHigherLuminanceByContrastRatio({
        contrastRatio: targetContrastRatio,
        luminance: getLuminance(baseHex),
      });
  } else if (direction === 'asc') {
    targetLuminance = getHigherLuminanceByContrastRatio({
      contrastRatio: targetContrastRatio,
      luminance: getLuminance(baseHex),
    });
  } else if (direction === 'desc') {
    targetLuminance = getLowerLuminanceByContrastRatio({
      contrastRatio: targetContrastRatio,
      luminance: getLuminance(baseHex),
    })
  }

  const nextColor = guessColorByLuminanceWithHsl({
    hex,
    luminance: targetLuminance,
    maxAttempts,
  });

  if (getContrastRatio({ hexA: nextColor, hexB: baseHex }) >= originalContrastRatio || attempt > maxAttempts) {
    return nextColor;
  }

  return guessColorByContrastWithHsl({
    attempt: attempt + 1,
    baseHex,
    contrastRatio: targetContrastRatio + 0.05,
    originalContrastRatio,
    direction,
    hex,
    maxAttempts,
  });
};


export default {
  guessColorByContrastWithHsl,
  guessColorByLuminanceWithHsl,
  guessColorRamp,
};
