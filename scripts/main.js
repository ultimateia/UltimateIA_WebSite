// Scroll effects

const maxScroll = 350;
const header = document.querySelector('header');
const btn = document.querySelector('.scroll-btn');
const boxes = document.querySelectorAll('.main_index > div');

const directionMap = {
    'up-left': { x: -1, y: -1 },
    'up-right': { x: 1, y: -1 },
    'down-left': { x: -1, y: 1 },
    'down-right': { x: 1, y: 1 }
};

function updateScrollEffects() {
    const scroll = Math.min(window.scrollY, maxScroll);
    const t = scroll / maxScroll;
    const offset = 70 * t;
    const opacity = Math.max(0, 1 - t * 1.2);

    // Header & bouton
    if (header) header.style.opacity = 1 - t;
    if (btn) btn.style.opacity = 1 - t;

    const blurValue = 7 * (1 - t);
    const mainIndex = document.querySelector('.main_index');
    
    if (mainIndex) {
        mainIndex.style.setProperty('--bg-blur', `${blurValue}px`, 'important');
    }

    boxes.forEach((box) => {
        const dir = directionMap[box.dataset.dir] || { x: 0, y: 0 };
        const tx = dir.x * offset;
        const ty = dir.y * offset;
        box.style.transform = `translate(${tx}px, ${ty}px)`;
        box.style.opacity = opacity;
    });
}

window.addEventListener('scroll', updateScrollEffects, { passive: true });
window.addEventListener('load', updateScrollEffects);

// scroll button

function slowScrollTo(id, duration = 800) {
    const target = document.getElementById(id);
    if (!target) return;

    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + window.scrollY;
    const distance = end - start;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Easing
        const ease = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;

        window.scrollTo(0, start + distance * ease);

        if (elapsed < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}