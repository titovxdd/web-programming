const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const scale = 50;
const form = document.getElementById('pointForm');
const tableClearBtn = document.getElementById('tableClearBtn');
const graphClearBtn = document.getElementById('graphClearBtn');
const addBtn = document.getElementById('addBtn');

const storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error(e);
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(e);
        }
    },
    clear() {
    try {
        localStorage.clear();
    } catch (e) {
        console.error(e);
    }
}
}


function toCanvasX(x) { return centerX + x * scale; }
function toCanvasY(y) { return centerY - y * scale; }
function toMathX(px) { return (px - centerX) / scale; }
function toMathY(py) { return (centerY - py) / scale; }

let points = [];
let results = [];


function drawGrid(R) {
    ctx.strokeStyle = '#cecdcd';
    ctx.fillStyle = '#cecdcd';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let i = -5; i < 6; i++){
        ctx.moveTo(10, centerY + scale * i);
        ctx.lineTo(canvas.width - 10, centerY + scale * i);
        ctx.moveTo(centerX + scale * i, 10);
        ctx.lineTo(centerX + scale * i, canvas.height -10);
    }
    ctx.stroke();

    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#333';

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

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('1', centerX + scale - 5, centerY);
    ctx.fillText('1', centerX + 5, centerY - scale);
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

function drawPoint(p, R) {
    const px = toCanvasX(p.x);
    const py = toCanvasY(p.y);
    const hit = isHit(p.x, p.y, R);

    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    if (hit){
        ctx.fillStyle = '#07b624'
    } else {
        ctx.fillStyle = '#c21129'
    }
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('(' + p.x + ', ' + p.y + ')', px + 10, py - 10);
    p.hit = hit
}

function drawScene(R) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawArea(R);
    drawGrid(R);

    if (points) {
        points.forEach(function (p) {
            drawPoint(p, R)
        });
    }
}


function isHit(x, y, R) {
    const inCircle = (x <= 0 && y <= 0 && x * x + y * y <= R * R);

    const inRect = (x >= 0 && x <= R/2 && y >= 0 && y <= R);
    
    const inTriangle = (x >= 0 && x <= R/2 && y >= -R/2 && y <= 0 && y >= x - R/2);

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

    const rChecked = document.querySelector('input[name="r"]:checked');
    if (!rChecked) {
        showToast('Выберите R');
        return;
    }
    const R = parseFloat(rChecked.value);

    drawScene(R);
    points.forEach(function (p) {
        p.r = R;
        p.timestamp = Date.now();
        addRowToTable(p);
        results.push({...p});
    });
    storage.set('lastR', R);
    storage.set('results', JSON.stringify(results));
});

addBtn.addEventListener('click', function () {
    const xChecked = document.querySelector('input[name="x"]:checked');
    if (!xChecked) {
        showToast('Выберите X');
        return;
    }
    const x = parseFloat(xChecked.value);

    const yValue = document.getElementById('yInput').value.trim();
    const y = Number(yValue);
    if (yValue === '' || isNaN(y) || y < -3 || y > 5) {
        showToast('Y должен быть числом от -3 до 5');
        return;
    }

    const R = Number(storage.get('lastR')) || 3;
    const hit = isHit(x, y, R);
    const point = {
        x: x,
        y: y,
        r: R,
        hit: hit,
        timestamp: Date.now()
    };

    const isDuplicate = points.some(p => 
        p.x === x && p.y === y
    );

    if (!(isDuplicate)) {
        points.push(point);
        storage.set('points', JSON.stringify(points));
        drawScene(R);
    } else {
        showToast("Точка уже есть на графике")
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const savedPoints = storage.get('points');
    const savedResults = storage.get('results');

    points = savedPoints || [];

    if (savedResults) {
        results = savedResults;
        results.forEach(function (p) {
            addRowToTable(p);
        });
    }


    const R = Number(storage.get('lastR')) || 3;

    drawScene(R);
});

tableClearBtn.addEventListener('click', function () {
    results = [];
    storage.remove('results');
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
});

graphClearBtn.addEventListener('click', function () {
    points = [];
    storage.remove('points');
    const R = Number(storage.get('lastR')) || 3;
    drawScene(R);
});

function showToast(message, type = 'error') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'success' ? ' success' : '');
    toast.textContent = message;

    container.appendChild(toast);


    setTimeout(function () {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

canvas.addEventListener('click', function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const X = Math.round(toMathX(mouseX) * 10) / 10;
    const Y = Math.round(toMathY(mouseY) * 10) / 10;
    const R = Number(storage.get('lastR')) || 3;

    let isValid = false;
    if (X < -4 || X > 4) { showToast('X должен быть числом от -4 до 4'); isValid = true; }
    if (Y < -3 || Y > 5) { showToast('Y должен быть числом от -3 до 5'); isValid = true; }
    if (isValid) return;

    const point = {
        x: X,
        y: Y,
        r: R,
        hit: isHit(X, Y, R),
        timestamp: Date.now()
    };

    const isDuplicate = points.some(p => 
        p.x === X && p.y === Y
    );
    if (!(isDuplicate)) {
        points.push(point);
        storage.set('points', JSON.stringify(points));
        drawScene(R);
    }
})

