const chronometer = document.getElementById('chronometer');
const main = document.querySelector('.main'); // Usar querySelector para obtener un elemento único

let state = 0; // 0: pause, 1: 15sec 2: go

let [hours, minutes, seconds, cent] = [0, 0, 0, 0];

let timeInterval;

main.addEventListener("keyup", (e) => {
    if (e.key === " ") {
        e.preventDefault();
        changeState();
    }
});

function changeState() {
    switch (state) {
        case 0:
            seconds = 16; // arranco por 16 porque en la primer llamada resto 1
            timeInterval = window.setInterval(Timer, 1000);
            state = 1;
            console.log('timer')
            break;
        case 1:
            [hours, minutes, seconds] = [0, 0, 0, 0]
            window.clearInterval(timeInterval);
            timeInterval = window.setInterval(startChronometer, 10);
            state = 2;
            console.log('cronom')
            break;
        default:
            window.clearInterval(timeInterval);
            state = 0;
            console.log('pausa')
            break;
    }

}

function Timer() {
    seconds--;
    chronometer.innerText = updateCronometer(0, 0, seconds, -1);
}

function startChronometer() {
    cent++;
    if (cent >= 100) {
        seconds++;
        cent = 0;
    }
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours++;
    }
    chronometer.innerText = updateCronometer(hours, minutes, seconds, cent);
}

function updateCronometer(h, m, s, c) {
    let txt = '';
    if (h > 0) {
        if (h < 10) {
            txt += '0';
        }
        txt += h + ':'
    }
    txt += m < 10 ? '0' + m : m;
    txt += ':'
    txt += s < 10 ? '0' + s : s;
    if (c !== -1) {
        txt += ':'
        txt += c < 10 ? '0' + c : c;
    }
    return txt
}
