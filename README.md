# Test case for setValueCurveAtTime()

The lenght of the Float32 array used in `setValueCurveAtTime()` is important in new versions of Chrome. The code in `toneCloud.js` is an example of the problem encountered with version after **58.0.3029.81**. So it should work in **58.0.3029.81** but not in **59.0.3071.86** or after.

To try it, copy and paste this piece of code in the different versions of Chrome console.

Decreasing the length of the Float32 array (for instance from 10000 to 100) solve the problem for the new versions. To change the try it change the value of `valueCount`:

```js
cosSquared({direction, min=0, max} = {}) {
    // Create a cosine squared up or down ramp
    var duration = (Math.PI)/2;
    var valueCount = 10000;
    ...
```

by

```js
cosSquared({direction, min=0, max} = {}) {
    // Create a cosine squared up or down ramp
    var duration = (Math.PI)/2;
    var valueCount = 100;
    ...
```

The error in new versions of Chrome is:

```js
Uncaught DOMException: Failed to execute 'setValueCurveAtTime' on 'AudioParam': setValueAtTime(0, 0.2119423349114291) overlaps setValueCurveAtTime(..., 0.2031746031746032, 0.01)
```

If the error doesn't show up, try increasing the number of values or the number of parallel loops in `nTones`:

```js
var toneCloud = new ToneCloud({
  nTones: 30, // increase this value
  toneGain: 0.5,
  toneDur: 0.05,
  jitterMin: 0.03,
  jitterMax: 1,
});
```
