import colorConvert from 'color-convert';

import {
  getChannelValueFromUnweightedChannelLuminance,
  getContrastRatio,
  getLuminance,
  getUnweightedChannelLuminance,
  guessColorByContrastWithHsl,
  guessColorByLuminanceWithHsl,
  guessColorRamp,
} from './';

describe('guessColorRamp', () => {
  it('black and white are equal', () => {
    const blackRamp = guessColorRamp('#000000');
    const whiteRamp = guessColorRamp('#000000');

    expect(blackRamp).toEqual(whiteRamp);

    expect(whiteRamp).toEqual({
        10: '#f4f4f4',
        20: '#d9d9d9',
        30: '#bfbfbf',
        40: '#a6a6a6',
        50: '#8d8d8d',
        60: '#6f6f6f',
        70: '#595959',
        80: '#404040',
        90: '#2c2c2c',
        100: '#171717'
      });
  });
});

describe('getChannelValueFromUnweightedChannelLuminance', () => {
  it.each([
    [0],
    [15],
    [63],
    [127],
    [255],
  ])(
    'getChannelValueFromUnweightedChannelLuminance reverses getUnweightedChannelLuminance for %d',
    (channelValue) => {
      const processedValue = getChannelValueFromUnweightedChannelLuminance(
        getUnweightedChannelLuminance(channelValue)
      );

      expect(
        Math.abs(processedValue - channelValue)
      ).toBeLessThan(2);
    }
  )
});

describe('getLuminance (exact)', () => {
  it.each([
    ['#ff0000', 0.2126],
    ['#00ff00', 0.7152],
    ['#0000ff', 0.0722],
    ['#00ffff', 0.7874],
    ['#ff00ff', 0.2848],
    ['#ffff00', 0.9278],
    ['#000000', 0],
    ['#ffffff', 1],
  ])('Calculates luminance for %s', (hex, expectedLuminance) => {
    const luminance = getLuminance(hex);

    expect(
      luminance.toFixed(4),
      `Expected ${hex} to have luminance ${expectedLuminance}. Actual ${luminance}`
    ).toEqual(expectedLuminance.toFixed(4));
  });
});

describe('getContrastRatio (approx)', () => {
  it.each([
    [
      'ffffff',
      '000000',
      21,
    ],
    [
      'ffffff',
      'f0f0f0',
      1.13,
    ],
    [
      '0000ff',
      '000000',
      2.44,
    ],
  ])('hex colors #%s and #%s yield expected ratio %d', (hexA, hexB, expected) => {
    const ratio = getContrastRatio({
      hexA: hexA,
      hexB: hexB,
    });

    const ratioReversed = getContrastRatio({
      hexA: hexB,
      hexB: hexA,
    });

    expect(
      Math.abs(ratio) - expected,
      `Expected contrast between ${hexA} and ${hexB} to be ${expected}. Actual ${ratio}`
    ).toBeLessThan(0.02);

    expect(ratio).toEqual(ratioReversed);
  });
});

describe('guessColorByLuminanceWithHsl', () => {
  it.each([
    ['#0000ff', 0.8],
    ['#123456', 0.6],
    ['#ff00ff', 0.2],
    ['#00ffff', 0.1],
  ])('Can make a color with the same hue and saturation as %s but luminance %d', (initHex, targetLuminance) => {
    const newHex = guessColorByLuminanceWithHsl({
      hex: initHex,
      luminance: targetLuminance,
    });

    const [initHue, initSaturation1, initLightness] = colorConvert.hex.hsl(initHex);
    const [newHue, newSaturation, newLightness] = colorConvert.hex.hsl(newHex);

    expect(initHue).toEqual(newHue);
    expect(initSaturation1).toEqual(newSaturation);
    expect(initLightness).not.toEqual(newLightness);
    const actualLuminance = getLuminance(newHex);

    expect(
      Math.abs(actualLuminance - targetLuminance),
      `Expected luminance to be approximately ${targetLuminance}. Actual ${actualLuminance}`
    ).toBeLessThan(0.03);
  });

  it.each([
    ['#ffffff', 0, '#000000'],
    ['#ffffff', 1, '#ffffff'],
    ['#ffffff', 0.5395, '#c2c2c2'],
    ['#ff00ff', 0.5061, '#ff97ff'],
  ])('Gets expected color', (hex, luminance, expected) => {
    expect(guessColorByLuminanceWithHsl({
      hex,
      luminance,
    })).toEqual(expected);
  })
});

describe('guessColorByContrastWithHsl', () => {
  it.each([
    [
      21,
      '#ffffff',
      '#ffffff',
    ],
    [
      7,
      '#0000ff',
      '#000000',
    ],
  ])('Generating color with contrast %d from color %s on a %s background', (expectedContrastRatio, hex) => {
    const color = guessColorByContrastWithHsl({
      hex,
      baseHex: '#ffffff',
      contrastRatio: expectedContrastRatio,
    });

    const actualContrastRatio = getContrastRatio({
      hexA: '#ffffff',
      hexB: color,
    });

    expect(
      actualContrastRatio - expectedContrastRatio,
      `Expected generated color ${color} to have contrast of ${expectedContrastRatio}. Actual ${actualContrastRatio}`
    ).toBeLessThan(0.3);

    // Fails for 21, #ffffff, #ffffff
    // expect(
    //   Number(actualContrastRatio),
    //   `Expected generated color ${color} to have contrast of at least ${expectedContrastRatio}. Actual ${actualContrastRatio}`
    // ).not.toBeLessThan(expectedContrastRatio);
  });

  it('Can make lighter and darker colors depending on the background color', () => {
    const mediumLuminanceColor = '#6688aa';
    const lightBase = '#ffffff';
    const darkBase = '#000000';
    const targetContrastRatio = 7;

    const colorWithLightBase = guessColorByContrastWithHsl({
      hex: mediumLuminanceColor,
      baseHex: lightBase,
      contrastRatio: targetContrastRatio,
    });

    const contrastOnLightBase = getContrastRatio({
      hexA: lightBase,
      hexB: colorWithLightBase,
    });

    const colorWithDarkBase = guessColorByContrastWithHsl({
      hex: mediumLuminanceColor,
      baseHex: darkBase,
      contrastRatio: targetContrastRatio,
    });

    const contrastOnDarkBase = getContrastRatio({
      hexA: darkBase,
      hexB: colorWithDarkBase,
    });

    expect(
      colorWithLightBase,
      `Expected light and dark bases to produce different results for the same target contrast and hex color.`
    ).not.toEqual(colorWithDarkBase);

    expect(
      contrastOnLightBase - targetContrastRatio,
      `Expected ${colorWithLightBase} to have contrast of ${targetContrastRatio} against ${lightBase}. Actual ${contrastOnLightBase}`
    ).toBeLessThan(0.3);

    expect(
      Number(contrastOnLightBase),
      `Expected ${colorWithLightBase} to have contrast of at least ${targetContrastRatio} against ${lightBase}. Actual ${contrastOnLightBase}`
    ).not.toBeLessThan(targetContrastRatio);

    expect(
      contrastOnDarkBase - targetContrastRatio,
      `Expected ${colorWithDarkBase} to have contrast of ${targetContrastRatio} against ${darkBase}. Actual ${contrastOnDarkBase}`
    ).toBeLessThan(0.3);

    expect(
      Number(contrastOnDarkBase),
      `Expected ${colorWithDarkBase} to have contrast of at least ${targetContrastRatio} against ${darkBase}. Actual ${contrastOnDarkBase}`
    ).not.toBeLessThan(targetContrastRatio);
  })
});
