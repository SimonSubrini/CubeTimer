const h = document.querySelector('.hours');
const m = document.querySelector('.minutes');
const s = document.querySelector('.seconds');
const c = document.querySelector('.cents');
const body = document.querySelector('body');
const main = document.querySelector('.main');
const txt = document.querySelector('.text');
const chrono = document.querySelector('.chronometer');
const scramble = document.getElementById('scramble')
const timesTableBody = document.getElementById('timesTableBody');
const cubePlot = document.querySelector('.rubiks-cube')

const times = [];
const moves = ['R', 'L', 'U', 'D', 'F', 'B', "R'", "L'", "U'", "D'", "F'", "B'", 'R2', 'L2', 'U2', 'D2', 'F2', 'B2'];
const colors = {
    u: '#e7e6e5',  // Cara superior (Up)
    l: '#ff7d09',  // Cara izquierda (Left)
    f: '#06ff00',    // Cara frontal (Front)
    r: '#ff0000',     // Cara derecha (Right)
    b: '#1908b4',   // Cara trasera (Back)
    d: '#f3e119'    // Cara inferior (Down)
};

let state = 0; // 0: pause, 1: 15sec 2: go
let [hours, minutes, seconds, cents] = [0, 0, 0, 0];
let timeInterval;



body.addEventListener("keyup", (e) => {
    if (e.key === " ") {
        e.preventDefault();
        changeState();
    }
});

function changeState() {
    changeStyles(state);
    switch (state) {
        case 0:
            seconds = 15; // arranco por 16 porque en la primer llamada resto 1
            updateCronometer(0, 0, seconds, -1);
            timeInterval = window.setInterval(Timer, 1000);
            state = 1;
            break;
        case 1:
            [hours, minutes, seconds, cents] = [0, 0, 0, 0]
            window.clearInterval(timeInterval);
            timeInterval = window.setInterval(startChronometer, 10);
            state = 2;
            break;
        default:
            addTimeToTable(hours, minutes, seconds, cents);
            window.clearInterval(timeInterval);
            updateScramble();
            state = 0;
            break;
    }

}

function Timer() {
    seconds--;
    if (seconds < 0) {
        [hours, minutes, seconds, cents] = [0, 0, 0, 0];
        changeStyles(state);
        window.clearInterval(timeInterval);
        timeInterval = window.setInterval(startChronometer, 10);
        state = 2;
    } else if (seconds <= 5) {
        chrono.style.color = 'red';
    } else if (seconds <= 10) {
        chrono.style.color = 'yellow';
        chrono.style.textShadow = '2px 2px 10px black';
    }
    updateCronometer(0, 0, seconds, -1);
}

function startChronometer() {
    cents++;
    if (cents >= 100) {
        seconds++;
        cents = 0;
    }
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours++;
    }
    updateCronometer(hours, minutes, seconds, cents);
}

function updateCronometer(hours, minutes, seconds, cents) {
    h.innerText = hours > 0 ? hours < 10 ? '0' + hours + ':' : hours + ':' : '';
    m.innerText = minutes < 10 ? '0' + minutes + ':' : minutes + ':';
    s.innerText = seconds < 10 ? '0' + seconds : seconds;
    c.innerText = cents !== -1 ? cents < 10 ? '0' + cents : cents : '';
}

function changeStyles(state) {
    switch (state) {
        case 0: // Timer
            txt.style.display = 'none';
            chrono.style.fontSize = '200px';
            cubePlot.style.display = 'none';
            break;
        case 1: // Chronometer
            txt.style.display = 'none';
            chrono.style.textShadow = 'none';
            chrono.style.color = 'black';
            chrono.style.fontSize = '200px';
            cubePlot.style.display = 'none';
            break;
        default: // Pause
            txt.style.display = 'block';
            chrono.style.textShadow = 'none';
            chrono.style.color = 'black';
            chrono.style.fontSize = '120px';
            cubePlot.style.display = 'block';
            break;
    }
}

function updateScramble() {
    let len = Math.floor(Math.random() * 8 + 16)
    let cube = createRubiksCube();
    let scramb = ''
    let move = ''
    let prevMove = ''
    for (let i = 0; i <= len; i++) {
        prevMove = move
        move = moves[Math.floor(Math.random() * moves.length)]
        while (move[0] === prevMove[0]) {
            move = moves[Math.floor(Math.random() * moves.length)]
        }
        cube = executeMove(cube, move)
        scramb += move + ' '
    }
    scramble.innerText = scramb;
}

function addTimeToTable(hours, minutes, seconds, cents) {
    times.push({ hours, minutes, seconds, cents });
    const timeString = `${hours < 10 ? '' : hours + ':'}${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${cents < 10 ? '0' : ''}${cents}`;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${times.length}</td>
        <td>${timeString}</td>
        <td>${calculateAvg(5)}</td>
        <td>${calculateAvg(12)}</td>
    `;
    timesTableBody.appendChild(newRow);
}

function calculateAvg(n) {
    if (times.length < n) {
        return '-';
    }
    const lastTimes = times.slice(-n);
    const totalSeconds = lastTimes.reduce((acc, time) => {
        return acc + time.hours * 3600 + time.minutes * 60 + time.seconds + time.cents / 100;
    }, 0);
    const avgSeconds = totalSeconds / n;
    return formatTime(avgSeconds);
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const cents = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100);
    return `${hours < 10 ? '' : hours + ':'}${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${cents < 10 ? '0' : ''}${cents}`;
}

function createRubiksCube() {
    const cube = {};

    // Inicializar las 6 caras del cubo
    for (const key in colors) {
        cube[key] = {};
        for (let i = 1; i <= 9; i++) {
            cube[key][i] = colors[key];
        }
    }
    paintRubiksCube(cube)

    return cube;
}

function paintRubiksCube(cube) {
    // Obtener todas las piezas del cubo
    const pieces = document.querySelectorAll('.piece');

    // Recorrer todas las piezas del cubo
    pieces.forEach((piece) => {
        // Obtener las clases de la pieza
        const classes = piece.className.split(' ');

        // Verificar si la clase de la pieza corresponde a una cara en el objeto 'cube'
        if (classes.length > 1) {
            const faceClass = classes[1].charAt(0).toLowerCase(); // Obtener la primera letra de la clase (u, l, f, r, b, d)
            const pieceNumber = parseInt(classes[1].charAt(1)); // Obtener el número de la pieza (1-9)

            // Verificar si la cara existe en el objeto 'cube'
            if (cube.hasOwnProperty(faceClass)) {
                // Verificar si la pieza existe en la cara
                if (cube[faceClass].hasOwnProperty(pieceNumber)) {
                    // Asignar el color de fondo a la pieza según el objeto 'cube'
                    piece.style.backgroundColor = cube[faceClass][pieceNumber];
                }
            }
        }
    });
}

function executeMove(cube, move) {
    if (!moves.includes(move)) {
        return -1;
    }
    let copy = JSON.parse(JSON.stringify(cube));

    switch (move) {
        case "R":
            // Realizar el movimiento R (derecha) en el cubo
            copy = rotateFaceClockwise(cube, 'r')

            copy['f'][3] = cube['d'][3];
            copy['f'][6] = cube['d'][6];
            copy['f'][9] = cube['d'][9];

            copy['u'][3] = cube['f'][3];
            copy['u'][6] = cube['f'][6];
            copy['u'][9] = cube['f'][9];

            copy['b'][7] = cube['u'][3];
            copy['b'][4] = cube['u'][6];
            copy['b'][1] = cube['u'][9];

            copy['d'][3] = cube['b'][7];
            copy['d'][6] = cube['b'][4];
            copy['d'][9] = cube['b'][1];
            break;

        case "L":
            // Realizar el movimiento L (izquierda) en el cubo
            copy = rotateFaceClockwise(cube, 'l')

            copy['f'][1] = cube['u'][1];
            copy['f'][4] = cube['u'][4];
            copy['f'][7] = cube['u'][7];

            copy['u'][1] = cube['b'][9];
            copy['u'][4] = cube['b'][6];
            copy['u'][7] = cube['b'][3];

            copy['b'][9] = cube['d'][1];
            copy['b'][6] = cube['d'][4];
            copy['b'][3] = cube['d'][7];

            copy['d'][1] = cube['f'][1];
            copy['d'][4] = cube['f'][4];
            copy['d'][7] = cube['f'][7];
            break;

        case "U":
            // Realizar el movimiento U (arriba) en el cubo
            copy = rotateFaceClockwise(cube, 'u')

            copy['f'][1] = cube['r'][1];
            copy['f'][2] = cube['r'][2];
            copy['f'][3] = cube['r'][3];

            copy['l'][1] = cube['f'][1];
            copy['l'][2] = cube['f'][2];
            copy['l'][3] = cube['f'][3];

            copy['b'][1] = cube['l'][1];
            copy['b'][2] = cube['l'][2];
            copy['b'][3] = cube['l'][3];

            copy['r'][1] = cube['b'][1];
            copy['r'][2] = cube['b'][2];
            copy['r'][3] = cube['b'][3];
            break;

        case "D":
            // Realizar el movimiento D (abajo) en el cubo
            copy = rotateFaceClockwise(cube, 'd')

            copy['f'][7] = cube['l'][7];
            copy['f'][8] = cube['l'][8];
            copy['f'][9] = cube['l'][9];

            copy['l'][7] = cube['b'][7];
            copy['l'][8] = cube['b'][8];
            copy['l'][9] = cube['b'][9];

            copy['b'][7] = cube['r'][7];
            copy['b'][8] = cube['r'][8];
            copy['b'][9] = cube['r'][9];

            copy['r'][7] = cube['f'][7];
            copy['r'][8] = cube['f'][8];
            copy['r'][9] = cube['f'][9];
            break;

        case "F":
            // Realizar el movimiento F (frente) en el cubo
            copy = rotateFaceClockwise(cube, 'f')

            copy['u'][7] = cube['l'][9];
            copy['u'][8] = cube['l'][6];
            copy['u'][9] = cube['l'][3];

            copy['l'][3] = cube['d'][1];
            copy['l'][6] = cube['d'][2];
            copy['l'][9] = cube['d'][3];

            copy['d'][1] = cube['r'][7];
            copy['d'][2] = cube['r'][4];
            copy['d'][3] = cube['r'][1];

            copy['r'][1] = cube['u'][7];
            copy['r'][4] = cube['u'][8];
            copy['r'][7] = cube['u'][9];
            break;

        case "B":
            // Realizar el movimiento B (atrás) en el cubo
            copy = rotateFaceClockwise(cube, 'b')

            copy['u'][1] = cube['r'][3];
            copy['u'][2] = cube['r'][6];
            copy['u'][3] = cube['r'][9];

            copy['l'][1] = cube['u'][3];
            copy['l'][4] = cube['u'][2];
            copy['l'][7] = cube['u'][1];

            copy['d'][7] = cube['l'][1];
            copy['d'][8] = cube['l'][4];
            copy['d'][9] = cube['l'][7];

            copy['r'][3] = cube['d'][9];
            copy['r'][6] = cube['d'][8];
            copy['r'][9] = cube['d'][7];
            break;

        case "R'":
            // Realizar el movimiento R (derecha) en el cubo
            copy = rotateFaceCounterClockwise(cube, 'r')

            copy['f'][3] = cube['u'][3];
            copy['f'][6] = cube['u'][6];
            copy['f'][9] = cube['u'][9];

            copy['u'][3] = cube['b'][7];
            copy['u'][6] = cube['b'][4];
            copy['u'][9] = cube['b'][1];

            copy['b'][7] = cube['d'][3];
            copy['b'][4] = cube['d'][6];
            copy['b'][1] = cube['d'][9];

            copy['d'][3] = cube['f'][3];
            copy['d'][6] = cube['f'][6];
            copy['d'][9] = cube['f'][9];
            break;

        case "L'":
            // Realizar el movimiento L (izquierda) en el cubo
            copy = rotateFaceCounterClockwise(cube, 'l')

            copy['f'][1] = cube['d'][1];
            copy['f'][4] = cube['d'][4];
            copy['f'][7] = cube['d'][7];

            copy['u'][1] = cube['f'][1];
            copy['u'][4] = cube['f'][4];
            copy['u'][7] = cube['f'][7];

            copy['b'][9] = cube['u'][1];
            copy['b'][6] = cube['u'][4];
            copy['b'][3] = cube['u'][7];

            copy['d'][1] = cube['b'][9];
            copy['d'][4] = cube['b'][6];
            copy['d'][7] = cube['b'][3];
            break;

        case "U'":
            // Realizar el movimiento U (arriba) en el cubo
            copy = rotateFaceCounterClockwise(cube, 'u')

            copy['f'][1] = cube['l'][1];
            copy['f'][2] = cube['l'][2];
            copy['f'][3] = cube['l'][3];

            copy['l'][1] = cube['b'][1];
            copy['l'][2] = cube['b'][2];
            copy['l'][3] = cube['b'][3];

            copy['b'][1] = cube['r'][1];
            copy['b'][2] = cube['r'][2];
            copy['b'][3] = cube['r'][3];

            copy['r'][1] = cube['f'][1];
            copy['r'][2] = cube['f'][2];
            copy['r'][3] = cube['f'][3];
            break;

        case "D'":
            // Realizar el movimiento D (abajo) en el cubo
            copy = rotateFaceCounterClockwise(cube, 'd')

            copy['f'][7] = cube['r'][7];
            copy['f'][8] = cube['r'][8];
            copy['f'][9] = cube['r'][9];

            copy['l'][7] = cube['f'][7];
            copy['l'][8] = cube['f'][8];
            copy['l'][9] = cube['f'][9];

            copy['b'][7] = cube['l'][7];
            copy['b'][8] = cube['l'][8];
            copy['b'][9] = cube['l'][9];

            copy['r'][7] = cube['b'][7];
            copy['r'][8] = cube['b'][8];
            copy['r'][9] = cube['b'][9];
            break;

        case "F'":
            // Realizar el movimiento F (frente) en el cubo
            copy = rotateFaceCounterClockwise(cube, 'f')

            copy['u'][7] = cube['r'][1];
            copy['u'][8] = cube['r'][4];
            copy['u'][9] = cube['r'][7];

            copy['l'][3] = cube['u'][9];
            copy['l'][6] = cube['u'][8];
            copy['l'][9] = cube['u'][7];

            copy['d'][1] = cube['l'][3];
            copy['d'][2] = cube['l'][6];
            copy['d'][3] = cube['l'][9];

            copy['r'][1] = cube['d'][3];
            copy['r'][4] = cube['d'][2];
            copy['r'][7] = cube['d'][1];
            break;

        case "B'":
            // Realizar el movimiento B (atrás) en el cubo
            copy = rotateFaceCounterClockwise(cube, 'b')

            copy['u'][1] = cube['l'][7];
            copy['u'][2] = cube['l'][4];
            copy['u'][3] = cube['l'][1];

            copy['l'][1] = cube['d'][7];
            copy['l'][4] = cube['d'][8];
            copy['l'][7] = cube['d'][9];

            copy['d'][7] = cube['r'][9];
            copy['d'][8] = cube['r'][6];
            copy['d'][9] = cube['r'][3];

            copy['r'][3] = cube['u'][1];
            copy['r'][6] = cube['u'][2];
            copy['r'][9] = cube['u'][3];
            break;

        case "R2":
            // Realizar el movimiento R (derecha) en el cubo
            copy = rotateFaceClockwise(cube, 'r')
            copy = rotateFaceClockwise(copy, 'r')

            copy['f'][3] = cube['b'][7];
            copy['f'][6] = cube['b'][4];
            copy['f'][9] = cube['b'][1];

            copy['u'][3] = cube['d'][3];
            copy['u'][6] = cube['d'][6];
            copy['u'][9] = cube['d'][9];

            copy['b'][7] = cube['f'][3];
            copy['b'][4] = cube['f'][6];
            copy['b'][1] = cube['f'][9];

            copy['d'][3] = cube['u'][3];
            copy['d'][6] = cube['u'][6];
            copy['d'][9] = cube['u'][9];
            break;

        case "L2":
            // Realizar el movimiento L (izquierda) en el cubo
            copy = rotateFaceClockwise(cube, 'l')
            copy = rotateFaceClockwise(copy, 'l')

            copy['f'][1] = cube['b'][9];
            copy['f'][4] = cube['b'][6];
            copy['f'][7] = cube['b'][3];

            copy['u'][1] = cube['d'][1];
            copy['u'][4] = cube['d'][4];
            copy['u'][7] = cube['d'][7];

            copy['b'][9] = cube['f'][1];
            copy['b'][6] = cube['f'][4];
            copy['b'][3] = cube['f'][7];

            copy['d'][1] = cube['u'][1];
            copy['d'][4] = cube['u'][4];
            copy['d'][7] = cube['u'][7];
            break;

        case "U2":
            // Realizar el movimiento U (arriba) en el cubo
            copy = rotateFaceClockwise(cube, 'u')
            copy = rotateFaceClockwise(copy, 'u')

            copy['f'][1] = cube['b'][1];
            copy['f'][2] = cube['b'][2];
            copy['f'][3] = cube['b'][3];

            copy['l'][1] = cube['r'][1];
            copy['l'][2] = cube['r'][2];
            copy['l'][3] = cube['r'][3];

            copy['b'][1] = cube['f'][1];
            copy['b'][2] = cube['f'][2];
            copy['b'][3] = cube['f'][3];

            copy['r'][1] = cube['l'][1];
            copy['r'][2] = cube['l'][2];
            copy['r'][3] = cube['l'][3];
            break;

        case "D2":
            // Realizar el movimiento D (abajo) en el cubo
            copy = rotateFaceClockwise(cube, 'd')
            copy = rotateFaceClockwise(copy, 'd')

            copy['f'][7] = cube['b'][7];
            copy['f'][8] = cube['b'][8];
            copy['f'][9] = cube['b'][9];

            copy['l'][7] = cube['r'][7];
            copy['l'][8] = cube['r'][8];
            copy['l'][9] = cube['r'][9];

            copy['b'][7] = cube['f'][7];
            copy['b'][8] = cube['f'][8];
            copy['b'][9] = cube['f'][9];

            copy['r'][7] = cube['l'][7];
            copy['r'][8] = cube['l'][8];
            copy['r'][9] = cube['l'][9];
            break;

        case "F2":
            // Realizar el movimiento F (frente) en el cubo
            copy = rotateFaceClockwise(cube, 'f')
            copy = rotateFaceClockwise(copy, 'f')

            copy['u'][7] = cube['d'][3];
            copy['u'][8] = cube['d'][2];
            copy['u'][9] = cube['d'][1];

            copy['l'][3] = cube['r'][7];
            copy['l'][6] = cube['r'][4];
            copy['l'][9] = cube['r'][1];

            copy['d'][1] = cube['u'][9];
            copy['d'][2] = cube['u'][8];
            copy['d'][3] = cube['u'][7];

            copy['r'][1] = cube['l'][9];
            copy['r'][4] = cube['l'][6];
            copy['r'][7] = cube['l'][3];
            break;

        case "B2":
            // Realizar el movimiento B (atrás) en el cubo
            copy = rotateFaceClockwise(cube, 'b')
            copy = rotateFaceClockwise(copy, 'b')

            copy['u'][1] = cube['d'][9];
            copy['u'][2] = cube['d'][8];
            copy['u'][3] = cube['d'][7];

            copy['l'][1] = cube['r'][9];
            copy['l'][4] = cube['r'][6];
            copy['l'][7] = cube['r'][3];

            copy['d'][7] = cube['u'][3];
            copy['d'][8] = cube['u'][2];
            copy['d'][9] = cube['u'][1];

            copy['r'][3] = cube['l'][7];
            copy['r'][6] = cube['l'][4];
            copy['r'][9] = cube['l'][1];
            break;

        default:
            break;
    }

    paintRubiksCube(copy);
    return copy;
}

function rotateFaceClockwise(cube, face) {
    let copy = JSON.parse(JSON.stringify(cube));

    copy[face][1] = cube[face][7];
    copy[face][2] = cube[face][4];
    copy[face][3] = cube[face][1];
    copy[face][4] = cube[face][8];
    copy[face][6] = cube[face][2];
    copy[face][7] = cube[face][9];
    copy[face][8] = cube[face][6];
    copy[face][9] = cube[face][3];

    return copy
}

function rotateFaceCounterClockwise(cube, face) {
    let copy = JSON.parse(JSON.stringify(cube));

    copy[face][1] = cube[face][3];
    copy[face][2] = cube[face][6];
    copy[face][3] = cube[face][9];
    copy[face][4] = cube[face][2];
    copy[face][6] = cube[face][8];
    copy[face][7] = cube[face][1];
    copy[face][8] = cube[face][4];
    copy[face][9] = cube[face][7];
    return copy
}


updateScramble();


