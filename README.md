# Sonify

Sonify a function over a given inclusive range, with a given precision (step size), or sonify arbitrary data.

## Demo

https://RichCaloggero.github.io/sonify/sonify.html

To specify data, use either of the following formats:

1. data: a b c d e (the string "data:" followed by a space separated list of numbers)
2. data: a,b c,d e,f ... (the string "data:" followed by a space separated list of 2d points, whose members are separated via comma)

In case 1 above, the values are converted to points with x values based on the index of the point in the set. The value of the user specified x1 value is added to the index. Thus, be sure that the value of x1 is set to 0 if you want x values to begin with 0. By default, x1 is -10.0

Case 2 above let's you specify both x and y values for each point as a space separated list of coordinates whose x and y values are separated by commas.

The scale factor defaults to 13 which is usable, however depending upon what you are sonifying, this may need to be adjusted to allow you discern the shape of the data. Use 0 to scale to the entire desired frequency range.

## Developer Notes
Before sonification, function over given range is converted to a set of points. Each point is an object with keys "x" and "y". 

Values are rounded to one more decimal place than stepSize via Number.toFixed(), then converted back to Number.  If this is not done, rounding errors due to javascript numbers being represented as binary floating point will tend to cause unwanted results from functions which misbehave such as 1/x. 

```
function precision (x) {
return  Math.abs(Math.floor(Math.log10(x)));
} // precision

function toFixed (x, n) {
return Number(
Number(x).toFixed(n)
); // Number
} // toFixed
```

For instance, the following test:

```
for (let x=-1; x<=0; x+=.1) 
console.log ("- ", p(x), 1/p(x));

function p(x) {
return Number(x.toFixed(3));
} // p
```

will produce -Infinity as expected when x reaches 0. However, if x were not massaged via the function p(x) as above, x would never reach 0, thus 1/x would become extremely large. This would create an issue with sonification because the scaling factor which depends on knowing the range of the function over the given interval would go toward zero.  However, if scale factor is user specified, then this may not be an issue, so may be able to revisit this at later time.

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

