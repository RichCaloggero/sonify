
function sonify (audio, func, x1, x2, dx = 0.1, sweepTime = 2.0, frequency = 500, frequencyRange = 200, volume = .07) {
var maxFrequency = frequency + frequencyRange / 2;
var minFrequency = frequency - frequencyRange / 2;

var max = findMax(func, x1,x2, dx);
var min = findMin (func, x1, x2, dx);

var funcRange = (max-min);
var scaleFactor = (funcRange !== 0)? frequencyRange / funcRange : 1;
var panScaleFactor = 2 / Math.abs(x2-x1);
var freqFunc = x => func(x) * scaleFactor + frequency;

//debugging
var fX1 = func(x1);
var fX2 = func(x2);
var f0 = func(0);

var freqX1 = freqFunc(x1);
var freqX2 = freqFunc(x2);
console.log ("sonify: ", {max, min, funcRange, frequencyRange, scaleFactor, fX1, freqX1, fX2, freqX2});


run ();


function run () {
let dt = sweepTime / (Math.abs(x2-x1) / dx);
let oscillator = audio.createOscillator();
let gain = audio.createGain ();
gain.gain.value = volume;
let pan = audio.createStereoPanner();
let x = x1;
let started = false;
oscillator.frequency.value = frequency;
oscillator.connect (gain).connect(pan).connect (audio.destination);

setTimeout (function _tick () {
//console.log ("- ", x, func(x), freqFunc(x));

if (isValidNumber(func(x))) {
if (x >= x2) {
if (started) {
oscillator.stop ();
console.log ("stop at ", x);
} // if
return;
} // if

pan.pan.value = panScaleFactor * x;
oscillator.frequency.value = freqFunc (x);

if (! started) {
oscillator.start();
started = true;
} // if

//if (Number.isNaN(func(x))) pan.disconnect (audio.destination);
//else pan.connect (audio.destination);

} // if

x += dx;
setTimeout (_tick, dt * 1000);
}, dt * 1000);

} // run
} // sonify

function describe (f, x1, x2, dx, precision = 2) {
let xIntercepts = findXIntercepts(f, x1, x2, dx, precision+1);
let slopes = xIntercepts.map (x => findSlope(f, x, dx));
message (`
X intercepts: ${xIntercepts.map(x => round(x,precision))};
slopes: ${slopes.map(x => round(x, precision))};
`);
} // describe

/// helpers

function findMin (f, x1, x2, dx) {
x1 = findFirstValidResult (f, x1,x2, dx);
if (x1 === undefined) return NaN;
let min = f(x1);

for (let x = x1; x <= x2; x += dx) {
let y = f(x);
if (isValidNumber(y) && y < min) min = y;
} // for

return min;
} // findMin

function findMax (f, x1, x2, dx) {
x1 = findFirstValidResult (f, x1,x2, dx);
if (x1 === undefined) return NaN;
let max = f(x1);

for (let x = x1; x <= x2; x += dx) {
let y = f(x);
if (isValidNumber(y) && y > max) max = y;
} // for

return max;
} // findMax

function findFirstValidResult (f, x1,x2, dx) {
for (let x = x1; x <= x2; x += dx) {
if (isValidNumber(f(x))) return x;
} // for

return undefined;
} // findFirstValidResult 


function findXIntercepts (f, x1, x2, dx, refinement = 4) {
let result = [];

do {
x1 = find (f, x1, x2, dx, refinement);
if (x1 === undefined) break;
result.push (x1);
} while ((x1 += dx) <= x2);
return result;

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
