
function sonify (audio, f, x1, x2, dx = 0.1, sweepTime = 2.0, frequency = 500, frequencyRange = 200, volume = .07) {
let maxFrequency = frequency + frequencyRange / 2;
let minFrequency = frequency - frequencyRange / 2;

let _max = max(f, x1,x2, dx).y;
let _min = min (f, x1, x2, dx).y;
if (Number.isNaN(_max) || Number.isNaN(_min)) {
message ("cannot sonify this function");
return;
} // if

let funcRange = (_max-_min);
let scaleFactor = (funcRange !== 0)? frequencyRange / funcRange : 1;
let panScaleFactor = 2 / Math.abs(x2-x1);
console.log ("debug: ", {_max, _min, funcRange, frequencyRange, scaleFactor});

return run (getPoints(f, x1, x2, dx));


function run (points) {
let dt = sweepTime * (dx / Math.abs(x2-x1));
//console.log ("dt: ", toFixed(dt, precision(dx)+1));
let gain = audio.createGain ();
gain.gain.value = volume;
let pan = audio.createStereoPanner();
let oscillator = audio.createOscillator();
oscillator.connect (gain).connect(pan).connect (audio.destination);

let noise = createNoise();
let noiseGain = audio.createGain ();
noiseGain.gain.value = 0;
let noiseVolume = 2 * volume;
noise.connect (noiseGain).connect (gain);
//console.log (`sonifying ${points.length} points...`);

let t = audio.currentTime;
points.forEach (point => {
//console.log ("- ", typeof(point.x), typeof(point.y), point);
if (isValidNumber(point.y)) {
pan.pan.setValueAtTime (panScaleFactor * point.x, t);
//console.log ("- frequency: ", point.y * scaleFactor + frequency);
oscillator.frequency.setValueAtTime (point.y * scaleFactor + frequency, t);

if (point.y < 0) {
noiseGain.gain.setValueAtTime (noiseVolume, t);
console.log ("noise: ", point.y, point.y < 0, noiseVolume);
} else {
noiseGain.gain.setValueAtTime (0, t);
console.log ("noise: ", point.y, point.y < 0, 0);
} // if

/*noiseGain.gain.setValueAtTime (
point.y < 0? noiseVolume : 0, t
);
*/
} // if

t += dt;
}); // forEach point

oscillator.start ();
noise.start ();
oscillator.stop (t);
noise.stop (t);
return oscillator;
} // run


function createNoise () {
let buf = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
let data = buf.getChannelData(0);

for (var i = 0; i < data.length; i++) {
data[i] = Math.random() * 2 - 1;
} // for i

let noise = audio.createBufferSource();
noise.buffer = buf;
return noise;
} // createNoise
} // sonify

function describe (f, x1, x2, dx) {
let _precision = precision(dx);
let xIntercepts = findXIntercepts(f, x1, x2, dx);
let slopes = xIntercepts.map (x => findSlope(f, x, dx));
message (`
X intercepts: ${xIntercepts};
slopes: ${slopes};
`);
} // describe


/// helpers

function getPoints (f, x1, x2, dx) {
if (f instanceof Function) {
return enumerate (x1,x2,dx)
.map (x => {
return {x: x, y: toFixed(f(x), precision(dx)+1)};
});

} else if (typeof(f) === "object" && f instanceof Array) {
return f;

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
for (let x=first; x<=last; x += step) result.push (toFixed(x, precision(step)+1));
return result;
} // enumerate

function max (f, x1,x2, dx) {
return getPoints (f, x1,x2, dx)
.reduce ((m, p) => {
if (isValidNumber(p.y) && p.y > m.y) m = p;
return m;
});
} // max

function min (f, x1,x2, dx) {
return getPoints (f, x1,x2, dx)
.reduce ((m, p) => {
if (isValidNumber(p.y) && p.y < m.y) m = p;
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
let points = getPoints (f, x1,x2, dx);

// we need at least two points in order to find an intercept
if (points.length < 2) {
if (points.length === 1 && points[0].y === 0) return points;
else return null;
} // if

// first create a list of pairs of adjacent points
return points.map ((p, i, a) => {
let pNext = a[i+1];
return pNext? [p, pNext] : null;
})
// next, find all such pairs where the sign of f(x) changes
.filter (pair => {
if (pair) {
let p1 = pair[0], p2 = pair[1];
return Math.sign (p1.y) !== Math.sign(p2.y);
} // if
})
// and return value of x intercept found by linearly interpreting between these pairs of points
.map (pair => [toFixed(x_intercept(pair[0], pair[1]), precision(dx)+1), 0]);
} // findXIntercept


function findSlope (f, x, dx) {
if (! (f instanceof Function)) {
alert ("findSlope only defined for functions, not lists of points");
return undefined;
} // if
if (dx === 0) return undefined;

let x1 = x - dx/10;
let x2 = x + dx/10;
let dY = f(x1) - f(x2);
return toFixed(dY / dx, precision(dx)+1);
} // findSlope

function precision (x) {
return  Math.abs(Math.floor(Math.log10(x)));
} // precision

function toFixed (x, n) {
return Number(
Number(x).toFixed(n)
); // Number
} // toFixed

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
return a.x - a.y*(b.x-a.x)/(b.y-a.y);
} // x_intercept
