
const JUMPSCARE_GIF = 'icons/88fvmm7.gif';
const JUMPSCARE_MP3 = 'icons/DudePlaya - MANIC .mp3';
const JUMPSCARE_SESSION_MS = 5 * 60 * 1000;
const JUMPSCARE_DURATION_MS = 10000;
const JUMPSCARE_AUDIO_START_S = 13;
const JUMPSCARE_FADE_IN_S = 2;
const JUMPSCARE_FADE_OUT_S = 2;

let jumpscareTriggered = false;
let jumpscareSessionStart = Date.now();
let jumpscareIntervalId = null;

function getSessionTimeMs() {
    return Date.now() - jumpscareSessionStart;
}

function generateFakeIP() {
    const octets = [];
    for (let i = 0; i < 4; i++) {
        octets.push(Math.floor(Math.random() * 223) + 1);
    }
    return octets.join('.');
}

async function getUserCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        return data.country_name || 'Unknown';
    } catch {
        try {
            const res2 = await fetch('https://ipwhois.app/json/', { signal: AbortSignal.timeout(3000) });
            const data2 = await res2.json();
            return data2.country || 'Unknown';
        } catch {
            return 'Unknown';
        }
    }
}

function createJumpscareOverlay(country) {
    const overlay = document.createElement('div');
    overlay.id = 'jumpscare-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '999999',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'none',
        overflow: 'hidden',
    });

    const gifContainer = document.createElement('div');
    Object.assign(gifContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    });

    const gif = document.createElement('img');
    gif.src = JUMPSCARE_GIF;
    gif.alt = '';
    Object.assign(gif.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        imageRendering: 'auto',
        animation: 'jumpscareShake 0.05s infinite alternate',
    });
    gifContainer.appendChild(gif);
    overlay.appendChild(gifContainer);

    const doxText = document.createElement('div');
    const fakeIP = generateFakeIP();
    doxText.innerHTML = `<div style="
        font-family: 'Courier New', monospace;
        color: #ff0000;
        font-size: clamp(18px, 4vw, 48px);
        text-align: center;
        text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 80px #880000;
        animation: jumpscareFlicker 0.15s infinite alternate;
        position: relative;
        z-index: 2;
        padding: 20px;
        background: rgba(0,0,0,0.7);
        border: 2px solid #ff0000;
        border-radius: 8px;
        max-width: 90vw;
        word-break: break-all;
    ">
        <div style="font-size:clamp(24px,5vw,64px);margin-bottom:16px;font-weight:bold;">⚠ YOU'VE BEEN DOXXED ⚠</div>
        <div>IP ADDRESS: ${fakeIP}</div>
        <div>COUNTRY: ${country}</div>
        <div style="margin-top:12px;font-size:clamp(12px,2vw,24px);color:#ff6666;">All your data belongs to us now 😈</div>
    </div>`;
    Object.assign(doxText.style, {
        position: 'relative',
        zIndex: '2',
    });
    overlay.appendChild(doxText);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes jumpscareShake {
            0% { transform: translate(-2px, -1px) scale(1.02); }
            100% { transform: translate(2px, 1px) scale(0.98); }
        }
        @keyframes jumpscareFlicker {
            0% { opacity: 1; }
            100% { opacity: 0.7; }
        }
    `;
    overlay.appendChild(style);

    return overlay;
}

async function triggerJumpscare() {
    if (jumpscareTriggered) return;
    jumpscareTriggered = true;

    if (jumpscareIntervalId) {
        clearInterval(jumpscareIntervalId);
        jumpscareIntervalId = null;
    }

    const country = await getUserCountry();

    const overlay = createJumpscareOverlay(country);
    document.body.appendChild(overlay);

    const audio = new Audio(JUMPSCARE_MP3);
    audio.currentTime = JUMPSCARE_AUDIO_START_S;

    let audioCtx, gainNode;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        const mediaSource = audioCtx.createMediaElementSource(audio);
        mediaSource.connect(gainNode);
        gainNode.connect(audioCtx.destination);
    } catch {
        gainNode = null;
    }

    audio.play().catch(() => {});

    if (gainNode) {
        const fadeInStart = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime(1, fadeInStart + JUMPSCARE_FADE_IN_S);

        const fadeOutTime = fadeInStart + (JUMPSCARE_DURATION_MS / 1000) - JUMPSCARE_FADE_OUT_S;
        gainNode.gain.setValueAtTime(1, fadeOutTime);
        gainNode.gain.linearRampToValueAtTime(0, fadeOutTime + JUMPSCARE_FADE_OUT_S);
    }

    setTimeout(() => {
        overlay.style.transition = 'opacity 0.5s';
        overlay.style.opacity = '0';
        audio.pause();
        audio.src = '';
        if (audioCtx) audioCtx.close().catch(() => {});
        setTimeout(() => {
            overlay.remove();
        }, 600);
    }, JUMPSCARE_DURATION_MS);
}

function checkJumpscare() {
    if (jumpscareTriggered) return;

    const sessionTime = getSessionTimeMs();
    if (sessionTime >= JUMPSCARE_SESSION_MS) {
        triggerJumpscare();
    }
}

jumpscareIntervalId = setInterval(() => {
    checkJumpscare();
}, 5000);

(function() {
    let testBuffer = '';
    const testWord = 'test';
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        testBuffer += e.key.toLowerCase();
        if (testBuffer.length > testWord.length) {
            testBuffer = testBuffer.slice(-testWord.length);
        }
        if (testBuffer === testWord) {
            testBuffer = '';
            triggerJumpscare();
        }
    });
})();
