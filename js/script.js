window.requestAnimationFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
        return function (callback, element) {
            var lastTime = element.__lastTime || 0;
            var currTime = Date.now();
            var timeToCall = Math.max(1, 33 - (currTime - lastTime));
            window.setTimeout(callback, timeToCall);
            element.__lastTime = currTime + timeToCall;
        };
    })();

window.isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test((navigator.userAgent || navigator.vendor || window.opera).toLowerCase());

var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;

    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * 900; // Fixed for mobile width FINAL
    var height = canvas.height = koef * 1800; // Fixed for mobile height FINAL
    var rand = Math.random;

    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    var heartPosition = function (rad) {
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };

    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener('resize', function () {
        width = canvas.width = koef * 360;
        height = canvas.height = koef * 720;
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
    });

    var traceCount = mobile ? 60 : 120; // Increased trace count for better trails
    var pointsOrigin = [];
    var dr = mobile ? 0.2 : 0.2; // Higher density of heart points for better shape

    for (let i = 0; i < Math.PI * 2; i += dr) 
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 180, 12, 0, 0));

    var heartPointsCount = pointsOrigin.length;
    var targetPoints = [];

    var pulse = function (kx, ky) {
        for (let i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (let i = 0; i < heartPointsCount * 3; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 1, // Larger particles
            speed: rand() + 0.05,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(0," + ~~(40 * rand() + 60) + "%," + ~~(60 * rand() + 40) + "%,.5)", // More visible particles
            trace: Array.from({ length: traceCount }, () => ({ x, y }))
        };
    }

    var config = {
        traceK: 0.6,
        timeDelta: 0.01
    };

    var time = 0;
    var loop = function () {
        var n = -Math.cos(time);
        pulse((1 + n) * 0.5, (1 + n) * 0.5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta;
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);
    
        // Draw particles
        for (let i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
    
            if (10 > length) {
                if (0.95 < rand()) u.q = ~~(rand() * heartPointsCount);
                else {
                    if (0.99 < rand()) u.D *= -1;
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (u.q < 0) u.q += heartPointsCount;
                }
            }
    
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;
    
            for (let k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
    
            ctx.fillStyle = u.f;
            for (let k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1.5, 1.5); // Bigger dots for visibility
            }
        }
    
        function drawMultilineText(ctx, text, x, y, lineHeight, maxWidth) {
            const lines = text.split("<br>");
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + i * lineHeight, maxWidth);
            }
        }
        
        // for upper text ni
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Thank you deeply and sincerely!", width / 2, height / 2 - 250);

        
        
        // for lower text ni
        drawMultilineText(
            ctx,
            "Merry Christmas<br>and a<br>Happy New Year, Almin!",
            width / 2,
            height / 2 + 300,
            35, // Line height
            width // Maximum width
        );
    
        window.requestAnimationFrame(loop, canvas);
    };
    

    loop();
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);
