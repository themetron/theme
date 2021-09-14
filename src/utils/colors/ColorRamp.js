class Channel {
  constructor({
    name = undefined,
    values = [],
    base = '',
  }) {
    this.base = base;
    this.name = name;
    this.values = values || []; // get values
  }

  base(b = undefined) {
    if (typeof b === 'undefined') return this.base;

    this.base = b;
    // Update ramp
    return this;
  }

  name(n = undefined) {
    if (typeof b === 'undefined') return this.name;

    this.name = n;
    return this;
  }

  values(v = undefined) {
    if (typeof v === 'undefined') return this.values;

    throw new Error(
      'Setting values directly is not supported. If you want to change the color ramp, set a new base color with `colorRamp.base()`'
    );
  }
}


/*
{
  base: '#397f3e',
  name: 'danger',
  values: [
    '#010101' // array starting at 10, ending at 100
  ],
  // Do we want an "extends" here?
}
*/

export default Channel;
