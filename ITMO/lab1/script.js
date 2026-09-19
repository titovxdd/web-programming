const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const scale = 50;
const form = document.getElementById('pointForm');
const clearBtn = document.getElementById('clearBtn');



function toCanvasX(x) { return centerX + x * scale; }
function toCanvasY(y) { return centerY - y * scale; }

let points = [];
let lastPoint = null;

function drawGrid(R) {
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#333';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.moveTo(canvas.width, centerY);
    ctx.lineTo(canvas.width - 10, centerY - 5);
    ctx.lineTo(canvas.width - 10, centerY + 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - 5, 10);
    ctx.lineTo(centerX + 5, 10);
    ctx.closePath();
    ctx.fill();

    ctx.font = '13px Arial';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    function drawX(value, label) {
        const px = toCanvasX(value);

        ctx.beginPath();
        ctx.moveTo(px, centerY - 5);
        ctx.lineTo(px, centerY + 5);
        ctx.stroke();
        ctx.fillText(label, px, centerY + 8);
    }

    drawX(-R,    '-R');
    drawX(-R/2,  '-R/2');
    drawX(R/2,   'R/2');
    drawX(R,     'R');

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    function drawY(value, label) {
        const py = toCanvasY(value);

        ctx.beginPath();
        ctx.moveTo(centerX - 5, py);
        ctx.lineTo(centerX + 5, py);
        ctx.stroke();
        ctx.fillText(label, centerX - 8, py);
    }

    drawY(-R,    '-R');
    drawY(-R/2,  '-R/2');
    drawY(R/2,   'R/2');
    drawY(R,     'R');

    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('0', centerX - 5, centerY + 5);
}

function drawArea(R) {
    ctx.fillStyle = 'rgba(0, 102, 255, 0.69)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(toCanvasX(-R), centerY);
    ctx.arc(
        centerX,
        centerY,
        R * scale,
        Math.PI,
        Math.PI / 2,
        true
    );
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.rect(
        toCanvasX(0),
        toCanvasY(R),
        R/2 * scale,
        R * scale
    );
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toCanvasX(0),toCanvasY(0));
    ctx.lineTo(toCanvasX(R/2), toCanvasY(0));
    ctx.lineTo(toCanvasX(0),toCanvasY(-R/2));
    ctx.closePath();
    ctx.fill();
}

function drawPoint(x, y) {
    const px = toCanvasX(x);
    const py = toCanvasY(y);

    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#c21129'
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('(' + x + ', ' + y + ')', px + 10, py - 10);
}

function drawScene(R) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(R);
    drawArea(R);

    const savedPoint = localStorage.getItem('lastPoint');
    if (savedPoint) {
        const parsedPoint = JSON.parse(savedPoint);
        drawPoint(parsedPoint.x, parsedPoint.y, parsedPoint.hit);
    }
}


function isHit(x, y, R) {
    const inCircle = (x <= 0 && y <= 0 && x * x + y * y <= R * R);

    const inRect = (x >= 0 && x <= R/2 && y >= 0 && y <= R);
    
    const inTriangle = (x >= 0 && x <= R/2 && y >= -R/2 && y <= 0 && y >= x);

    return inCircle || inRect || inTriangle;
}



function addRowToTable(point) {
    const tbody = document.getElementById('resultsBody');

    const row = document.createElement('tr');

    const tdX = document.createElement('td');
    tdX.textContent = point.x;
    row.appendChild(tdX);

    const tdY = document.createElement('td');
    tdY.textContent = point.y;
    row.appendChild(tdY);

    const tdR = document.createElement('td');
    tdR.textContent = point.r;
    row.appendChild(tdR);

    const tdHit = document.createElement('td');
    tdHit.textContent = point.hit ? 'Yes' : 'No';
    row.appendChild(tdHit);

    const tdTime = document.createElement('td');
    tdTime.textContent = new Date(point.timestamp).toLocaleString('ru-RU');
    row.appendChild(tdTime);

    tbody.appendChild(row);
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const xChecked = document.querySelector('input[name="x"]:checked');
    if (!xChecked) {
        alert('Выберите X');
        return;
    }
    const x = parseFloat(xChecked.value);

    const yValue = document.getElementById('yInput').value.trim();
    const y = Number(yValue);
    if (yValue === '' || isNaN(y) || y < -3 || y > 5) {
        alert('Y должен быть числом от -3 до 5');
        return;
    }

    const rChecked = document.querySelector('input[name="r"]:checked');
    if (!rChecked) {
        alert('Выберите R');
        return;
    }
    const R = parseFloat(rChecked.value);

    const hit = isHit(x, y, R);

    const point = {
        x: x,
        y: y,
        r: R,
        hit: hit,
        timestamp: Date.now()
    };
    points.push(point);
    localStorage.setItem('points', JSON.stringify(points));
    localStorage.setItem('lastR', R);
    lastPoint = {x: x, y: y, hit: hit};
    localStorage.setItem('lastPoint', JSON.stringify(lastPoint));
    drawScene(R);
    addRowToTable(point);
});

document.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('points');

    if (saved) {
        points = JSON.parse(saved);
        points.forEach(function (p) {
            addRowToTable(p);
        });
    }


    const R = Number(localStorage.getItem('lastR')) || 2;

    drawScene(R);
});

clearBtn.addEventListener('click', function () {
    points = [];
    localStorage.removeItem('points');
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
});
