// --- 1. FIREBASE SETUP ---

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- TEXT-TO-SPEECH SETUP ---
let synth = window.speechSynthesis;
let utterance = null;
let isSpeaking = false;
let currentVoice = null;

function populateVoiceSelector(selector) {
    const voices = synth.getVoices();
    selector.innerHTML = '<option value="">Select Voice</option>';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        selector.appendChild(option);
    });
}

function setupTTS(contentElement, controlsContainer) {
    const playBtn = controlsContainer.querySelector('.play-tts');
    const pauseBtn = controlsContainer.querySelector('.pause-tts');
    const stopBtn = controlsContainer.querySelector('.stop-tts');
    const voiceSelector = controlsContainer.querySelector('.voice-selector');

    if (!playBtn || !pauseBtn || !stopBtn || !voiceSelector) return;

    // Use a timeout to ensure voices are loaded, especially in Firefox
    setTimeout(() => populateVoiceSelector(voiceSelector), 100);
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => populateVoiceSelector(voiceSelector);
    }

    voiceSelector.addEventListener('change', (e) => {
        const voiceIndex = e.target.value;
        if (voiceIndex !== '') currentVoice = synth.getVoices()[voiceIndex];
    });

    playBtn.addEventListener('click', () => {
        if (synth.paused) {
            synth.resume();
        } else if (!isSpeaking) {
            const text = contentElement.textContent;
            utterance = new SpeechSynthesisUtterance(text);
            if (currentVoice) utterance.voice = currentVoice;
            utterance.onend = () => {
                isSpeaking = false;
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
            };
            synth.cancel(); // Stop any previous speech
            synth.speak(utterance);
            isSpeaking = true;
        }
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    });

    pauseBtn.addEventListener('click', () => {
        synth.pause();
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    stopBtn.addEventListener('click', () => {
        synth.cancel();
        isSpeaking = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    });
}

// --- GLOBAL MODAL FUNCTIONS (accessible from HTML onclick) ---
window.openStoryModal = async (storyId) => {
    const modal = document.getElementById('storyModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = '<p class="text-center text-gray-300 p-8">Loading story...</p>';
    modal.classList.remove('hidden');

    try {
        const doc = await db.collection('characters').doc(storyId).get();
        if (doc.exists) {
            const story = doc.data();
            modalBody.innerHTML = `
                <div class="tts-controls flex items-center gap-2 mb-4">
                    <button class="play-tts px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Play</button>
                    <button class="pause-tts px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50" disabled>Pause</button>
                    <button class="stop-tts px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50" disabled>Stop</button>
                    <select class="voice-selector bg-gray-800 text-white rounded px-2 py-1 text-sm"></select>
                </div>
                <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">${story.name || 'Untitled'}</h2>
                ${story.imageUrl ? `<img src="${story.imageUrl}" alt="${story.name}" class="w-full h-auto max-h-80 object-cover rounded-lg mb-6 shadow-lg">` : ''}
                <div class="markdown-content text-gray-300 space-y-4 prose prose-invert max-w-none">
                    ${marked.parse(story.story || 'No story content available.')}
                </div>`;
            setupTTS(modalBody.querySelector('.markdown-content'), modalBody.querySelector('.tts-controls'));
        } else {
            modalBody.innerHTML = '<p class="text-center text-red-500 p-8">Could not find this story.</p>';
        }
    } catch (error) {
        console.error('Error loading story:', error);
        modalBody.innerHTML = '<p class="text-center text-red-500 p-8">Error loading story. Check console and Firebase config.</p>';
    }
};

window.closeStoryModal = () => {
    const modal = document.getElementById('storyModal');
    if (modal) {
        modal.classList.add('hidden');
        if (isSpeaking) synth.cancel(); // Stop TTS when modal closes
    }
};

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Register GSAP Plugins ---
    gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger);

    // --- Setup Scroll Animations ---
    setupScrollAnimations();

    // --- Start fetching Firebase data for the portfolio section ---
    displayPublicStories();

    // --- DOM Element Selectors (Non-Carousel) ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');

    // --- Non-Carousel Functions ---
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('h-0');
            mobileMenu.classList.toggle('h-auto');
            line1.classList.toggle('rotate-45');
            line1.classList.toggle('translate-y-[5px]');
            line2.classList.toggle('opacity-0');
            line3.classList.toggle('-rotate-45');
            line3.classList.toggle('-translate-y-[5px]');
        });
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('h-auto')) {
                mobileMenuButton.click();
            }
        });
    });

    async function displayPublicStories() {
        const featuredGrid = document.getElementById('public-stories-grid');
        const dropdownGrid = document.getElementById('all-public-stories-dropdown');
        const viewAllBtn = document.getElementById('view-all-stories-btn');
        if (!featuredGrid) return;

        featuredGrid.innerHTML = '<p class="col-span-2 text-center text-gray-400">Loading stories...</p>';
        if (dropdownGrid) dropdownGrid.innerHTML = '';

        try {
            const snapshot = await db.collection('characters').where('isPublic', '==', true).orderBy('createdAt', 'desc').get();
            featuredGrid.innerHTML = '';
            if (snapshot.empty) {
                featuredGrid.innerHTML = '<p class="col-span-2 text-center text-gray-400">No public stories have been shared yet.</p>';
                if (viewAllBtn) viewAllBtn.classList.add('hidden');
                return;
            }

            snapshot.docs.forEach((doc, index) => {
                const story = doc.data();
                const storyId = doc.id;
                // [MODIFIED] Added 'story-card' class for scroll animation
                const storyCardHTML = `
                    <div class="relative group overflow-hidden rounded-xl cursor-pointer story-card" onclick="openStoryModal('${storyId}')">
                        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 opacity-0 group-hover:opacity-90 transition-all duration-300 z-10 flex items-center justify-center p-4">
                            <div class="text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                                <div class="text-xl font-medium text-white mb-2">${story.name || 'Untitled'}</div>
                                <p class="text-gray-200 mb-4 text-sm">${(story.story || '').substring(0, 100)}...</p>
                                <button class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded text-white hover:bg-white/30">View Story</button>
                            </div>
                        </div>
                        <div class="aspect-video bg-gray-800 rounded-xl flex items-center justify-center bg-cover bg-center" 
                             style="background-image: url('${story.imageUrl || `https://via.placeholder.com/400x225/111827/818cf8?text=No+Image`}')">
                            ${!story.imageUrl ? `<div class="text-cyan-400/30 font-medium">${story.name || ''}</div>` : ''}
                        </div>
                    </div>`;
                if (index < 4) {
                    featuredGrid.insertAdjacentHTML('beforeend', storyCardHTML);
                } else if (dropdownGrid) {
                    dropdownGrid.insertAdjacentHTML('beforeend', storyCardHTML);
                }
            });

            if (snapshot.docs.length > 4 && viewAllBtn) {
                viewAllBtn.classList.remove('hidden');
                viewAllBtn.addEventListener('click', () => {
                    const isHidden = dropdownGrid.classList.toggle('hidden');
                    if (!isHidden) dropdownGrid.classList.add('grid');
                    viewAllBtn.querySelector('span').textContent = isHidden ? 'View All Stories' : 'Show Less';
                });
            } else if (viewAllBtn) {
                viewAllBtn.classList.add('hidden');
            }

        } catch (error) {
            console.error("Error fetching public stories:", error);
            featuredGrid.innerHTML = `<p class="col-span-2 text-center text-red-500">Could not load stories. Please check Firebase configuration and Firestore rules.</p>`;
        }
    }

    // =================================================================
    // --- [NEW] SCROLL ANIMATION LOGIC ---
    // =================================================================
    function setupScrollAnimations() {
        // --- Animation for Section Titles ---
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        // --- Staggered Animation for Story Cards ---
        // We use a small delay to ensure Firebase has loaded the content.
        setTimeout(() => {
            gsap.from('.story-card', {
                scrollTrigger: {
                    trigger: '#public-stories-grid', // Trigger when the grid itself comes into view
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
                opacity: 0,
                y: 60,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.2 // Automatically stagger each card by 0.2s
            });
        }, 500);

        // --- Animation for the Contact Form Card ---
        gsap.from('.contact-card-animate', {
            scrollTrigger: {
                trigger: '.contact-card-animate',
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            scale: 0.95,
            y: 40,
            duration: 1,
            ease: "expo.out"
        });
    }


    // =================================================================
    // --- ADVANCED CAROUSEL LOGIC ---
    // =================================================================

    // --- Carousel Config & State ---
    const CONFIG = {
        totalCards: 12,
        wheelRadius: 35,
        images: [ // Using public Unsplash URLs for immediate functionality
            "images/1.jpg",
            "images/2.png",
            "images/3.jpg",
            "images/4.jpg",
            "images/5.jpg",
            "images/6.jpg",
            "images/7.jpg",
            "images/8.jpg",
            "images/9.jpg",
            "images/10.jpg",
            "images/11.jpg",
            "images/12.jpg"
        ],
        animations: {
            transitionDuration: 1.2,
        }
    };

    // --- Carousel DOM Elements ---
    const carouselItemsEl = document.querySelector(".carousel-items");
    const carouselContainerEl = document.querySelector(".carousel-container");
    const resetBtn = document.getElementById("resetBtn");
    const circleBtn = document.getElementById("circleBtn");
    const waveBtn = document.getElementById("waveBtn");
    const staggerBtn = document.getElementById("staggerBtn");
    const gridBtn = document.getElementById("gridBtn");
    const fanBtn = document.getElementById("fanBtn");
    const depthBtn = document.getElementById("depthBtn");
    const allButtons = document.querySelectorAll(".switch-button");

    // --- Carousel State ---
    let currentAnimation = "circle";
    let isTransitioning = false;
    let activeAnimations = [];
    let draggableInstance = null;

    // --- Carousel Utility Functions ---
    const getViewportSize = () => ({ width: window.innerWidth, height: window.innerHeight });

    const getCardDimensions = () => {
        const cardEl = document.querySelector(".carousel-item");
        if (!cardEl) return { width: 240, height: 320 };
        const style = getComputedStyle(cardEl);
        return { width: parseFloat(style.width), height: parseFloat(style.height) };
    };

    function updateMenuState(newAnimation) {
        allButtons.forEach(button => button.classList.remove("switch-button-current"));
        const btnMap = { circle: circleBtn, wave: waveBtn, stagger: staggerBtn, grid: gridBtn, fan: fanBtn, depth: depthBtn };
        if (btnMap[newAnimation]) {
            btnMap[newAnimation].classList.add("switch-button-current");
        }
    }

    function killActiveAnimations() {
        gsap.killTweensOf(".carousel-items");
        gsap.killTweensOf(".carousel-item");
        activeAnimations.forEach(animation => animation && animation.kill && animation.kill());
        activeAnimations = [];
    }

    // --- Carousel Animation Setup Functions ---
    function setupCirclePositions() {
        const cards = gsap.utils.toArray(".carousel-item");
        const radius = Math.min(window.innerWidth, window.innerHeight) * (CONFIG.wheelRadius / 100);
        const angleStep = (2 * Math.PI) / CONFIG.totalCards;
        const currentWheelRotation = gsap.getProperty(".carousel-items", "rotation") || 0;
        const currentWheelRotationRad = currentWheelRotation * (Math.PI / 180);
        const timeline = gsap.timeline();

        cards.forEach((card, i) => {
            const angle = i * angleStep + currentWheelRotationRad;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            timeline.to(card, {
                x: x, y: y, z: 0,
                rotation: -currentWheelRotation, rotationX: 0, rotationY: 0,
                scale: 0.8,
                duration: CONFIG.animations.transitionDuration,
                ease: "power2.inOut"
            }, 0);
        });
        return timeline;
    }

    function setupWavePositions() {
        const cards = gsap.utils.toArray(".carousel-item");
        const viewport = getViewportSize();
        const cardWidth = getCardDimensions().width;
        const lineWidth = Math.min(viewport.width * 0.8, CONFIG.totalCards * cardWidth * 0.4);
        const cardSpacing = lineWidth / (CONFIG.totalCards - 1);
        const waveHeight = Math.min(viewport.height * 0.1, 80);
        const timeline = gsap.timeline();

        cards.forEach((card, index) => {
            const xPos = (index - (CONFIG.totalCards - 1) / 2) * cardSpacing;
            const yPos = Math.sin((index / (CONFIG.totalCards - 1)) * Math.PI * 2) * waveHeight;
            timeline.to(card, {
                x: xPos, y: yPos, z: 0,
                rotation: 0, rotationX: 0, rotationY: 0,
                scale: 0.7,
                duration: CONFIG.animations.transitionDuration,
                ease: "power2.inOut"
            }, 0);
        });
        return timeline;
    }

    function startWaveAnimation() {
        const cards = gsap.utils.toArray(".carousel-item");
        const waveHeight = Math.min(getViewportSize().height * 0.1, 80);
        return gsap.to(cards, {
            y: (i) => {
                const yStart = Math.sin((i / (CONFIG.totalCards - 1)) * Math.PI * 2) * waveHeight;
                return yStart + Math.sin((i / (CONFIG.totalCards - 1)) * Math.PI * 2 + Math.PI) * waveHeight;
            },
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    function setupStaggerPositions() {
        const cards = gsap.utils.toArray(".carousel-item");
        const cardDim = getCardDimensions();
        const rows = 3;
        const cols = 4;
        const xSpacing = cardDim.width * 0.7;
        const ySpacing = cardDim.height * 0.7;
        const timeline = gsap.timeline();

        cards.forEach((card, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const xOffset = row % 2 === 1 ? xSpacing / 2 : 0;
            const xPos = (col - (cols - 1) / 2) * xSpacing + xOffset;
            const yPos = (row - (rows - 1) / 2) * ySpacing;
            timeline.to(card, {
                x: xPos, y: yPos, z: 0,
                rotation: 0, rotationX: 0, rotationY: 0,
                scale: 0.7,
                duration: CONFIG.animations.transitionDuration,
                ease: "power2.inOut"
            }, 0);
        });
        return timeline;
    }

    function setupGridPositions() {
        const cards = gsap.utils.toArray(".carousel-item");
        const viewport = getViewportSize();
        const cardDim = getCardDimensions();
        const cols = viewport.width > viewport.height ? 4 : 3;
        const rows = viewport.width > viewport.height ? 3 : 4;
        const scale = Math.min(0.8, viewport.width / (cols * cardDim.width * 1.2), viewport.height / (rows * cardDim.height * 1.2));
        const xSpacing = cardDim.width * scale * 1.2;
        const ySpacing = cardDim.height * scale * 1.2;
        const timeline = gsap.timeline();

        cards.forEach((card, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const xPos = (col - (cols - 1) / 2) * xSpacing;
            const yPos = (row - (rows - 1) / 2) * ySpacing;
            timeline.to(card, {
                x: xPos, y: yPos, z: 0,
                rotation: 0, rotationX: 0, rotationY: 0,
                scale: scale,
                duration: CONFIG.animations.transitionDuration,
                ease: "power2.inOut"
            }, 0);
        });
        return timeline;
    }

    function setupFanPositions() {
        const cards = gsap.utils.toArray(".carousel-item");
        const maxFanAngle = Math.min(180, getViewportSize().width / 5);
        const fanStartAngle = -maxFanAngle / 2;
        const fanEndAngle = maxFanAngle / 2;
        const timeline = gsap.timeline();

        cards.forEach((card, index) => {
            const progress = index / (CONFIG.totalCards - 1);
            const angle = fanStartAngle + progress * (fanEndAngle - fanStartAngle);
            const yOffset = Math.sin((progress - 0.5) * Math.PI) * 50;
            timeline.to(card, {
                x: 0, y: yOffset, z: 0,
                rotation: angle, rotationX: 0, rotationY: 0,
                scale: 0.8,
                duration: CONFIG.animations.transitionDuration,
                ease: "power2.inOut"
            }, 0);
        });
        return timeline;
    }

    function setup3DDepthPositions() {
        const cards = gsap.utils.toArray(".carousel-item");
        const viewport = getViewportSize();
        const positions = [
            { x: -viewport.width * 0.25, y: -viewport.height * 0.1, z: 200, scale: 0.95, rotX: -5, rotY: 10 },
            { x: viewport.width * 0.25, y: -viewport.height * 0.15, z: 100, scale: 0.9, rotX: -3, rotY: -8 },
            { x: 0, y: viewport.height * 0.2, z: 0, scale: 0.85, rotX: 5, rotY: 0 },
            { x: -viewport.width * 0.3, y: viewport.height * 0.05, z: -150, scale: 0.8, rotX: 4, rotY: 12 },
            { x: viewport.width * 0.3, y: 0, z: -250, scale: 0.75, rotX: 0, rotY: -10 },
            { x: 0, y: -viewport.height * 0.2, z: -400, scale: 0.7, rotX: -6, rotY: 0 },
            { x: -viewport.width * 0.1, y: 0, z: -550, scale: 0.65, rotX: 0, rotY: 5 },
            { x: viewport.width * 0.15, y: viewport.height * 0.1, z: -700, scale: 0.6, rotX: 3, rotY: -4 },
            { x: -viewport.width * 0.25, y: -viewport.height * 0.2, z: -850, scale: 0.55, rotX: -5, rotY: 8 },
            { x: viewport.width * 0.2, y: -viewport.height * 0.05, z: -1000, scale: 0.5, rotX: -2, rotY: -6 },
            { x: -viewport.width * 0.05, y: viewport.height * 0.15, z: -1150, scale: 0.45, rotX: 4, rotY: 2 },
            { x: viewport.width * 0.05, y: 0, z: -1300, scale: 0.4, rotX: 0, rotY: -2 }
        ];
        const timeline = gsap.timeline();
        cards.forEach((card, index) => {
            const pos = positions[index % positions.length];
            gsap.set(card, { zIndex: 2000 + pos.z });
            timeline.to(card, {
                x: pos.x, y: pos.y, z: pos.z,
                rotation: 0, rotationX: pos.rotX, rotationY: pos.rotY,
                scale: pos.scale,
                duration: CONFIG.animations.transitionDuration,
                ease: "power2.inOut"
            }, 0);
        });
        return timeline;
    }

    // --- Draggable & Mouse Tracking ---
    function setupDraggable() {
        if (draggableInstance) draggableInstance.kill();
        carouselItemsEl.classList.add("draggable");
        draggableInstance = Draggable.create(".carousel-items", {
            type: "rotation",
            inertia: true,
            throwResistance: 0.3,
            onDrag: updateCardRotations,
            onThrowUpdate: updateCardRotations,
        })[0];
    }

    function updateCardRotations() {
        if (isTransitioning) return;
        const wheelRotation = this.rotation || 0;
        gsap.set(".carousel-item", { rotation: -wheelRotation });
    }

    function setup3DDepthMouseTracking() {
        carouselContainerEl.onmousemove = (e) => {
            if (currentAnimation !== "depth" || isTransitioning) return;
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            gsap.to(".carousel-items", {
                rotationY: mouseX * 10,
                rotationX: -mouseY * 10,
                duration: 1.2,
                ease: "power1.out"
            });
        };
    }

    // --- Core Transition Logic ---
    function transitionToPattern(newPattern) {
        if (isTransitioning) return;
        isTransitioning = true;
        updateMenuState(newPattern);
        killActiveAnimations();

        if (draggableInstance) draggableInstance.kill();
        draggableInstance = null;
        carouselItemsEl.classList.remove("draggable");
        carouselContainerEl.onmousemove = null;

        currentAnimation = newPattern;

        const timeline = gsap.timeline({
            onComplete: () => {
                isTransitioning = false;
                if (newPattern === "circle" || newPattern === "fan") {
                    setupDraggable();
                } else if (newPattern === "wave") {
                    const waveAnim = startWaveAnimation();
                    if (waveAnim) activeAnimations.push(waveAnim);
                } else if (newPattern === "depth") {
                    setup3DDepthMouseTracking();
                }
            }
        });
        activeAnimations.push(timeline);

        gsap.to(".carousel-items", { rotation: 0, rotationX: 0, rotationY: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut" });
        gsap.set(".carousel-item", { zIndex: 1 }); // Reset z-index for most patterns

        let patternTimeline;
        switch (newPattern) {
            case "circle": patternTimeline = setupCirclePositions(); break;
            case "wave": patternTimeline = setupWavePositions(); break;
            case "stagger": patternTimeline = setupStaggerPositions(); break;
            case "grid": patternTimeline = setupGridPositions(); break;
            case "fan": patternTimeline = setupFanPositions(); break;
            case "depth": patternTimeline = setup3DDepthPositions(); break;
        }

        if (patternTimeline) timeline.add(patternTimeline, 0);
    }

    // --- Initialization ---
    function generateCards() {
        carouselItemsEl.innerHTML = '';
        for (let i = 0; i < CONFIG.totalCards; i++) {
            const cardEl = document.createElement('div');
            cardEl.className = 'carousel-item';
            cardEl.style.backgroundImage = `url(${CONFIG.images[i % CONFIG.images.length]})`;
            carouselItemsEl.appendChild(cardEl);
        }
    }

    function initializeCarousel() {
        gsap.set(".switch", { opacity: 0, visibility: "hidden" });
        const cards = gsap.utils.toArray(".carousel-item");
        gsap.set(cards, { x: 0, y: 0, rotation: 0, scale: 0, opacity: 0 });

        const timeline = gsap.timeline({
            onComplete: () => {
                transitionToPattern("circle");
                gsap.to(".switch", {
                    opacity: 1,
                    visibility: "visible",
                    duration: 0.8,
                    ease: "power2.inOut"
                });
            }
        });

        timeline.to(cards, {
            scale: 0.8,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });
        activeAnimations.push(timeline);
    }

    function resetCarousel() {
        killActiveAnimations();
        if (draggableInstance) draggableInstance.kill();
        carouselContainerEl.onmousemove = null;
        gsap.to(".switch", {
            opacity: 0,
            visibility: "hidden",
            duration: 0.3,
            onComplete: () => {
                generateCards();
                initializeCarousel();
                updateMenuState("circle");
            }
        });
    }

    // --- Carousel Event Listeners ---
    if (resetBtn) resetBtn.addEventListener("click", resetCarousel);
    if (circleBtn) circleBtn.addEventListener("click", () => transitionToPattern("circle"));
    if (waveBtn) waveBtn.addEventListener("click", () => transitionToPattern("wave"));
    if (staggerBtn) staggerBtn.addEventListener("click", () => transitionToPattern("stagger"));
    if (gridBtn) gridBtn.addEventListener("click", () => transitionToPattern("grid"));
    if (fanBtn) fanBtn.addEventListener("click", () => transitionToPattern("fan"));
    if (depthBtn) depthBtn.addEventListener("click", () => transitionToPattern("depth"));

    window.addEventListener("resize", () => {
        if (!isTransitioning) {
            transitionToPattern(currentAnimation);
        }
    });

    // --- Initial Call for Carousel---
    generateCards();
    initializeCarousel();

});
