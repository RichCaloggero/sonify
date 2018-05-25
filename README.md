# Sonify

## Developer Notes

Sonify a function over a given inclusive range, with a given precision (step size).

Generally, the function is represented by a set of points, based on initial range and step size. They are rounded to a precision based on the step size. If step is .1 the precision is 1. Generally precision is:

```
Math.abs(Math.floor(Math.log10(stepSize)))
```

