import * as Astronomy from 'astronomy-engine';

const date = new Date(1991, 9, 9, 9, 10); // Oct 9, 1991
console.log('Date:', date.toLocaleString());
const sunLong = Astronomy.SunPosition(date).elon;
console.log('Sun Longitude:', sunLong);

// Find when it crosses 195 (寒露)
const start = new Date(1991, 9, 7);
for(let h=0; h<72; h++) {
    const d = new Date(start.getTime() + h * 3600000);
    const sl = Astronomy.SunPosition(d).elon;
    if (sl >= 195) {
        console.log('寒露 starts at:', d.toLocaleString(), 'Sun Long:', sl);
        break;
    }
}
