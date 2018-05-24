
function sonify (audio, f, x1, x2, dx = 0.1, sweepTime = 2.0, frequency = 500, frequencyRange = 200, volume = .07) {
let maxFrequency = frequency + frequencyRange / 2;
let minFrequency = frequency - frequencyRange / 2;

let _max = max(f, x1,x2, dx)[1];
let _min = min (f, x1, x2, dx)[1];
if (Number.isNaN(_max) || Number.isNaN(_min)) {
message ("cannot sonify this function");
return;
} // if

let funcRange = (_max-_min);
let scaleFactor = (funcRange !== 0)? frequencyRange / funcRange : 1;
let panScaleFactor = 2 / Math.abs(x2-x1);

//debugging
/*let freqFunc = x => f(x) * scaleFactor + frequency;
let fX1 = f(x1);
let fX2 = f(x2);
let f0 = f(0);

let freqX1 = freqFunc(x1);
let freqX2 = freqFunc(x2);
//console.log ("sonify: ", {_max, _min, funcRange, frequencyRange, scaleFactor, fX1, freqX1, fX2, freqX2});
*/

return run (getPoints(f, x1, x2, dx));


function run (points) {
let dt = sweepTime * (dx / Math.abs(x2-x1));
//console.log ("dt: ", dt.toFixed(Math.abs(Math.log10(dx))));
let gain = audio.createGain ();
gain.gain.value = volume;
let pan = audio.createStereoPanner();
let oscillator = audio.createOscillator();
oscillator.connect (gain).connect(pan).connect (audio.destination);
//console.log (`sonifying ${points.length} points...`);

let t = audio.currentTime;
points.forEach (point => {
let x = point[0];
let y = point[1];

if (isValidNumber(y)) {
pan.pan.setValueAtTime (panScaleFactor * x, t);
oscillator.frequency.setValueAtTime (y * scaleFactor + frequency, t);
} // if

t += dt;
}); // forEach point

oscillator.start ();
oscillator.stop (t);
return oscillator;
} // run
} // sonify

function describe (f, x1, x2, dx) {
let precision = Math.abs(Math.log10(dx));
let xIntercepts = findXIntercepts(f, x1, x2, dx, precision+1);
let slopes = xIntercepts.map (x => findSlope(f, x, dx));
message (`
X intercepts: ${xIntercepts};
slopes: ${slopes.map(x => Number(x.toFixed(precision)))};
`);
} // describe


/// helpers

function getPoints (f, x1, x2, dx) {
if (f instanceof Array && f[0] instanceof Array && f[0].length === 2) return f;

if (f instanceof Function) {
let p = Math.abs(Math.log10(dx))+1;

return enumerate (x1,x2,dx)
.map (x => {
x = Number(x.toFixed(p));
return [x, Number(f(x).toFixed(p))];
});

} else {
alert ("getPoints: first argument must be a function or array of points");
return [];
} // if
} // getPoints

function enumerate (first, last, step) {
if (first > last) {
let t = first;
first = last;
last = t;
} // if

let result = [];
for (let x=first; x<=last; x += step) result.push (x);
return result;
} // enumerate

function max (f, x1,x2, dx) {
return getPoints (f, x1,x2, dx)
.reduce ((m, p) => {
if (isValidNumber(p[1]) && p[1] > m[1]) m = p;
return m;
});
} // max

function min (f, x1,x2, dx) {
return getPoints (f, x1,x2, dx)
.reduce ((m, p) => {
if (isValidNumber(p[1]) && p[1] < m[1]) m = p;
return m;
});
} // min


function findFirstValidResult (f, x1,x2, dx) {
for (let x = x1; x <= x2; x += dx) {
if (isValidNumber(f(x))) return x;
} // for

return undefined;
} // findFirstValidResult 


function findXIntercepts (f, x1, x2, dx) {
let precision = Math.abs(Math.log10(dx)) + 1;
let points = getPoints (f, x1,x2, dx);
if (points.length < 2) return [];

return points.map ((p, i, a) => (i < a.length-1)? [p, a[i+1]] : [])
.filter (pair => pair.length == 2  && Math.sign(pair[0][1]) !== Math.sign(pair[1][1]))
.map (pair => [Number(x_intercept(pair[0], pair[1]).toFixed(precision)), 0]);



function find (f, x1, x2, dx, refine = 3) {
let xLast = x1;

for (let x = x1+dx; x <= x2; x += dx) {
if (Math.sign(f(xLast)) !== Math.sign(f(x))) {
if (refine === 0) return (xLast + x) /2;
else return find (f, xLast, x, dx/10, refine-1);
} // if

xLast = x;
} // for

return undefined;
} // find
} // findXIntercept


function findSlope (f, x, dx) {
if (dx === 0) return undefined;
let x1 = x - dx/2;
let x2 = x + dx/2;
let dY = f(x1) - f(x2);
return dY / dx;
} // findSlope

function round (x, n, truncate) {
let factor = Math.pow(10, n);
let t = x * factor;
return (truncate? Math.floor(t) : Math.round(t))
/ factor;
} // round

function isValidNumber (x) {
return x !== -Infinity && x !== Infinity && !Number.isNaN(x);
} // isValidNumber 

function validate (value, label = "value") {
if (Number.isNaN(value)) throw new Error (`${label} is not a number`);

if (value === Infinity) throw new Error (`${label} is infinity`);
if (value === Infinity) throw new Error (`${label} is negative infinity`);

return;
} // validate

function message (text) {
let display = document.querySelector ("#message, .message");
if (display) display.textContent = text;
else alert (text);
} // message

function x_intercept (a, b) {
return a[0] - a[1]*(b[0]-a[0])/(b[1]-a[1]);
} // x_intercept
