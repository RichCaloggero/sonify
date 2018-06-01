# Sonify

## Developer Notes

Sonify a function over a given inclusive range, with a given precision (step size).

Generally, the function is represented by a set of points, based on initial range and step size. They are rounded to a precision based on the step size. If step is .1 the precision is 1. Generally precision is:

```
Math.abs(Math.floor(Math.log10(stepSize)))
```

If this is not done, rounding errors due to javascript numbers being represented as binary floating point will tend to cause unwanted results from functions which misbehave such as 1/x. For instance, the following test:

```
for (let x=-1; x<=0; x+=.1) 
console.log ("- ", p(x), 1/p(x));

function p(x) {
return Number(x.toFixed(3));
} // p
```

will produce -Infinity as expected when x reaches 0. However, if x were not massaged via the function p(x) as above, x would never reach 0, thus 1/x would become extremely large. This would create an issue with sonification because the scaling factor which depends on knowing the range of the function over the given interval would go toward zero.

```
scaleFactor = frequencyRange / funcRange
```

The results of the above test are as follows:

>-  -1 -1
-  -0.9 -1.1111111111111112
-  -0.8 -1.25
-  -0.7 -1.4285714285714286
-  -0.6 -1.6666666666666667
-  -0.5 -2
-  -0.4 -2.5
-  -0.3 -3.3333333333333335
-  -0.2 -5
-  -0.1 -10
-  0 -Infinity


If we simply run the test without the fixing and rounding, we get the following:

>-  -1 -1
-  -0.9 -1.1111111111111112
-  -0.8 -1.25
-  -0.7000000000000001 -1.4285714285714284
-  -0.6000000000000001 -1.6666666666666665
-  -0.5000000000000001 -1.9999999999999996
-  -0.40000000000000013 -2.499999999999999
-  -0.30000000000000016 -3.3333333333333317
-  -0.20000000000000015 -4.9999999999999964
-  -0.10000000000000014 -9.999999999999986
-  -1.3877787807814457e-16 -7205759403792794
