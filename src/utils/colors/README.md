# Color utilities

themetron themes use color ramps from 10 - 100, with preset luminances to preserve WCAG contrast ratios.

The color utilities include model these ramps using the `ColorRamp` class.

To make it easy for a user to generate a theme from their own designs or brand guidelines, there are color utilities to take any hex color and generate a ramp from it. The ramp likely won't include the exact original color, but it will try to preserve the hue and saturation as much as possible; resulting in a usable, accessible palette of colors.

Colors more than 5 steps away from each other will meet WCAG contrast requirements for regular-size text, e.g. colors 10 and 60 or 50 and 100.

White and black bookend the ramp, acting as though they're color stop 0 and 110 respectively.
They're not included in the color ramp, however, since they're constant for all colors.
