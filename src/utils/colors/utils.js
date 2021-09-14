import colorConvert from 'color-convert';

import Channel from './Channel';

export const getContrastRatio = ({ hexA, hexB, luminanceA, luminanceB }) => {
  luminanceA = luminanceA || luminanceA === 0 ? luminanceA : getLuminance(hexA);
  luminanceB = luminanceB || luminanceB === 0 ? luminanceB : getLuminance(hexB);
  const [darker, lighter] = [luminanceA, luminanceB].sort();
  const contrastRatio = ((lighter + 0.05) / (darker + 0.05));
  return contrastRatio;
};

export const getHigherLuminanceByContrastRatio = ({ luminance, contrastRatio }) =>
  luminance * contrastRatio + contrastRatio / 20 - 1 / 20;

export const getLowerLuminanceByContrastRatio = ({ luminance, contrastRatio }) =>
  (luminance + 1 / 20) / contrastRatio - 1 / 20;

export const getUnweightedChannelLuminance = (channelValue) => {
  const channelPercent = new Channel(channelValue).percent();

  return channelPercent <= 0.03928
    ? channelPercent / 12.92
    : Math.pow((channelPercent + 0.055) / 1.055, 2.4)
};

// Should be the inverse of getUnweightedChannelLuminance
/*
  TODO:
  I'm not 100% sure I need this function. I suspect it will be part of the
  larger family of functions that I use to solve for a hex color, given a target
  hue, saturation, and luminance.

  GOAL: Produce a function with the signature:
  (Luminance, Hue, Saturation) => Lightness

  I know the formula for luminance given rgb or hsl.
  Here's a pretty detailed answer about the relationship of rgb channels to hsl: https://stackoverflow.com/a/39147465
  I think I need to deconstruct parts of the hsl conversion math to get ratios of r, g, and b from it.
  Then I'd need to deconstruct the luminance formula to produce some kind of luminance factor based on different color channel mixes.


  I have some notes on the inverse functions for luminance below - part of this is already formalized.
  "UnnormalizedChannelLuminance" became "unweightedChannelLuminance" in my code.

  ----

  UnnormalizedChannelLuminance = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  So to reverse UnnormalizedChannelLuminance (AntiUnnormalizedChannelLuminance), we have to know the value produced at the boundary of <= 0.3928

  Boundaries:
  * When c <= 0.3928, produces a max of 0.3928 / 12.92 === 0.03040247678018576
    * c1 = c2 / 12.92. c2 = c1 * 12.92
  * When c > 0.3928, produces a min of Math.pow(( 0.03928 + 0.055) / 1.055, 2.4) === 0.get030394924862258642
    * c1 => ((c2 + 0.055) / 1.055)^2.4.  (c1^(1/2.4) * 1.055) - 0.055

  So they're calculated to have no overlap, but due to rounding errors, there is a bit. If I'm rounding to a fixed number of digits, I can rule this out.

  ----

  (Luminance, Hue, Saturation) => Lightness

  lightness = ?


  Since we have luminance, we want a way to express r in terms of g and b, g in terms of r and b, etc.

  (
      luminance =
          0.2126 * UnnormalizedChannelLuminance(rPercent)
          + 0.7152 * UnnormalizedChannelLuminance(gPercent)
          + 0.0722 * UnnormalizedChannelLuminance(bPercent)
  )

  (
      rPercent =
          AntiUnnormalizedChannelLuminance(
              (
                  luminance
                  - 0.7152 * UnnormalizedChannelLuminance(gPercent)
                  - 0.0722 * UnnormalizedChannelLuminance(bPercent)
              ) / 0.2126
          )
  )

  So now I can get r as a percentage, given luminance, green as a percentage, and blue as a percentage.

*/

export const getChannelValueFromUnweightedChannelLuminance = (unweightedChannelLuminance) => {
  let channelPercent;

  if (unweightedChannelLuminance <= 0.030402476780185757) {
    channelPercent = unweightedChannelLuminance * 12.92;
  } else {
    channelPercent = Math.pow(unweightedChannelLuminance, 1 / 2.4) * 1.055 - 0.055;
  }

  return (new Channel()).percent(channelPercent).value();
}

const channelLuminanceWeights = [0.2126, 0.7152, 0.0722];
// So the luminance doesn't have any goofy power stuff.
// If we have the rgb, we can create a linear rgb-ratio-based luminance multiplier, I think.
// Then we can take the target luminance, divide by that multiplier, and reverse out the rgb values from there?
// This would be so much simpler in rgb color space.

// Note to self: TEST to make sure a known rgb-based formula doesn't give the same H and S values.
// If it does, we can be done.
// https://ux.stackexchange.com/questions/82319/how-to-find-an-accessible-color-by-changing-lightness-only
// Result: It does not.

const getWeightedChannelLuminances = unweightedChannelLuminances => unweightedChannelLuminances
  .map((ul, i) => ul * channelLuminanceWeights[i]);

export const getLuminance = (hex) => {
  const rgb = colorConvert.hex.rgb(hex);
  const unweightedChannelLuminances = rgb.map(getUnweightedChannelLuminance);

  return getWeightedChannelLuminances(unweightedChannelLuminances)
    .reduce(
      (luminance, weightedChannelLuminance) => luminance + weightedChannelLuminance,
      0,
    );
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
  getChannelValueFromUnweightedChannelLuminance,
  getContrastRatio,
  getHexFromHexOrName,
  getLuminance,
  getUnweightedChannelLuminance,
  setHsl,
};
