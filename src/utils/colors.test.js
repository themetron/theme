import {
  getContrastRatio,
  setColorByContrastWithHsl,
} from './colors';

describe('getContrastRatio', () => {
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

describe('setColorByContrastWithHsl', () => {
  it.each([
    [
      21,
      '#ffffff',
    ]
  ])('Generating color with contrast %d from color #%s', (expectedContrastRatio, hex) => {
    const color = setColorByContrastWithHsl({
      hex,
      baseHex: '#ffffff',
      contrastRatio: expectedContrastRatio,
    });

    const actualContrastRatio = getContrastRatio({
      hexA: '#ffffff',
      hexB: color,
    });

    expect(
      Math.abs(actualContrastRatio - expectedContrastRatio),
      `Expected generated color ${color} to have contrast of ${expectedContrastRatio}. Actual ${actualContrastRatio}`
    ).toBeLessThan(0.3);
  });
});
