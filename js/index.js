// /**
//  * FutureNav - Main JavaScript
//  * script.js - Combined interactive functionality for the futuristic navigation experience and GSAP carousel
//  * July 14, 2025
//  */



// // Register GSAP plugins
// gsap.registerPlugin(Draggable, InertiaPlugin);

// document.addEventListener('DOMContentLoaded', () => {
//   // DOM Elements for Website
//   const navbar = document.getElementById('navbar');
//   const mobileMenuButton = document.getElementById('mobile-menu-button');
//   const mobileMenu = document.getElementById('mobile-menu');
//   const navLinks = document.querySelectorAll('.nav-link');
//   const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
//   const sections = document.querySelectorAll('section');
//   const bgElements = document.querySelectorAll('.fixed > div');

//   // DOM Elements for Carousel
//   const carouselItemsEl = document.querySelector(".carousel-items");
//   const carouselContainerEl = document.querySelector(".carousel-container");
//   const resetBtn = document.getElementById("resetBtn");
//   const circleBtn = document.getElementById("circleBtn");
//   const waveBtn = document.getElementById("waveBtn");
//   const staggerBtn = document.getElementById("staggerBtn");
//   const gridBtn = document.getElementById("gridBtn");
//   const fanBtn = document.getElementById("fanBtn");
//   const depthBtn = document.getElementById("depthBtn");
//   const switchMenu = document.querySelector(".switch");
//   const allButtons = document.querySelectorAll(".switch-button");

//   // Carousel Configuration
//   const CONFIG = {
//     totalCards: 12,
//     wheelRadius: 35, // 35% of viewport
//     images: [
//       "images/1.jpg",
//       "images/2.jpg",
//       "images/3.jpg",
//       "images/4.jpg",
//       "images/5.jpg",
//       "images/6.jpg",
//       "images/7.jpg",
//       "images/8.png",
//       "images/9.png",
//       "images/10.png",
//       "images/11.png",
//       "images/12.png"
//     ],
//     animations: {
//       initialDuration: 1,
//       rotationDuration: 0.64,
//       flipDuration: 0.64,
//       transitionDuration: 1.2,
//       circleTransitionDuration: 0.8
//     }
//   };

//   // Carousel State Variables
//   let currentAnimation = "circle";
//   let isTransitioning = false;
//   let activeAnimations = [];
//   let draggableInstance = null;
//   let originalZIndices = [];
//   let cardInitialAngles = [];

//   // Website: Mobile Menu Toggle
//   mobileMenuButton.addEventListener('click', () => {
//     mobileMenuButton.classList.toggle('active');

//     if (mobileMenu.classList.contains('open')) {
//       mobileMenu.style.height = '0';
//       mobileMenu.classList.remove('open');
//     } else {
//       mobileMenu.classList.add('open');
//       mobileMenu.style.height = `${mobileMenu.scrollHeight}px`;
//     }
//   });

//   // Website: Close mobile menu when a link is clicked
//   mobileNavLinks.forEach(link => {
//     link.addEventListener('click', () => {
//       mobileMenuButton.classList.remove('active');
//       mobileMenu.style.height = '0';
//       mobileMenu.classList.remove('open');
//     });
//   });

//   // Website: Navbar scroll effect
//   window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) {
//       navbar.classList.add('scrolled');
//     } else {
//       navbar.classList.remove('scrolled');
//     }

//     highlightCurrentSection();
//   });

//   // Website: Smooth scroll for nav links
//   navLinks.forEach(link => {
//     link.addEventListener('click', (e) => {
//       e.preventDefault();
//       const targetId = link.getAttribute('href');
//       const targetSection = document.querySelector(targetId);

//       if (targetSection) {
//         const offsetTop = targetSection.offsetTop - 70; // Adjust for navbar height
//         window.scrollTo({
//           top: offsetTop,
//           behavior: 'smooth'
//         });

//         // Highlight the section briefly
//         targetSection.classList.add('section-highlight');
//         setTimeout(() => {
//           targetSection.classList.remove('section-highlight');
//         }, 1000);
//       }
//     });
//   });

//   // Website: Highlight active section in navbar
//   function highlightCurrentSection() {
//     let current = '';

//     sections.forEach(section => {
//       const sectionTop = section.offsetTop - 100;
//       const sectionHeight = section.offsetHeight;

//       if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
//         current = section.getAttribute('id');
//       }
//     });

//     navLinks.forEach(link => {
//       link.classList.remove('active');
//       if (link.getAttribute('href') === `#${current}`) {
//         link.classList.add('active');
//       }
//     });

//     mobileNavLinks.forEach(link => {
//       link.classList.remove('active');
//       if (link.getAttribute('href') === `#${current}`) {
//         link.classList.add('active');
//       }
//     });
//   }

//   // Website: Scroll animations for sections
//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add('section-visible');
//       }
//     });
//   }, { threshold: 0.1 });

//   sections.forEach(section => {
//     section.classList.add('section-hidden');
//     observer.observe(section);
//   });

//   // Website: Initialize active section on page load
//   highlightCurrentSection();

//   // Website: Make header text visible with animation
//   setTimeout(() => {
//     const headerText = document.querySelector('.text-6xl');
//     if (headerText) {
//       headerText.style.opacity = 1;
//       headerText.style.transform = 'translateY(0)';
//     }
//   }, 300);

//   // Carousel: Get viewport dimensions
//   const getViewportSize = () => {
//     return {
//       width: window.innerWidth,
//       height: window.innerHeight
//     };
//   };

//   // Carousel: Get card dimensions
//   const getCardDimensions = () => {
//     return {
//       width: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-card-width')),
//       height: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-card-height'))
//     };
//   };

//   // Carousel: Update menu button states
//   function updateMenuState(newAnimation) {
//     allButtons.forEach((button) => {
//       button.classList.remove("switch-button-current");
//     });
//     let activeButton;
//     switch (newAnimation) {
//       case "circle":
//         activeButton = circleBtn;
//         break;
//       case "wave":
//         activeButton = waveBtn;
//         break;
//       case "stagger":
//         activeButton = staggerBtn;
//         break;
//       case "grid":
//         activeButton = gridBtn;
//         break;
//       case "fan":
//         activeButton = fanBtn;
//         break;
//       case "depth":
//         activeButton = depthBtn;
//         break;
//       default:
//         activeButton = circleBtn;
//     }
//     if (activeButton) {
//       activeButton.classList.add("switch-button-current");
//     }
//   }

//   // Carousel: Generate cards
//   function generateCards() {
//     carouselItemsEl.innerHTML = "";
//     for (let i = 1; i <= CONFIG.totalCards; i++) {
//       const cardEl = document.createElement("div");
//       cardEl.className = "carousel-item";
//       const formattedNumber = String(i).padStart(3, "0");
//       const imageIndex = i - 1;
//       if (imageIndex < CONFIG.images.length) {
//         cardEl.style.backgroundImage = `url(${CONFIG.images[imageIndex]})`;
//       } else {
//         cardEl.style.backgroundImage = `url(${CONFIG.images[0]})`;
//       }
//       cardEl.innerHTML = `<div class="card__number">${formattedNumber}</div>`;
//       carouselItemsEl.appendChild(cardEl);
//       cardEl.style.zIndex = i;
//     }
//     initializeZIndices();
//   }

//   // Carousel: Initialize z-indices
//   function initializeZIndices() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     originalZIndices = cards.map((card, index) => {
//       const zIndex = 100 + (CONFIG.totalCards - index);
//       gsap.set(card, { zIndex: zIndex });
//       return zIndex;
//     });
//   }

//   // Carousel: Kill active animations
//   function killActiveAnimations() {
//     gsap.killTweensOf(".carousel-items");
//     gsap.killTweensOf(".carousel-item");
//     activeAnimations.forEach((animation) => {
//       if (animation && animation.kill) {
//         animation.kill();
//       }
//     });
//     activeAnimations = [];
//   }

//   // Carousel: Calculate circle positions
//   function setupCirclePositions(animated = true) {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewportSize = Math.min(window.innerWidth, window.innerHeight);
//     const radius = viewportSize * (CONFIG.wheelRadius / 100);
//     const totalAngle = 2 * Math.PI;
//     const angleStep = totalAngle / CONFIG.totalCards;
//     const currentWheelRotation = gsap.getProperty(".carousel-items", "rotation") || 0;
//     const currentWheelRotationRad = currentWheelRotation * (Math.PI / 180);
//     const timeline = gsap.timeline();
//     cards.forEach((card, i) => {
//       const angle = i * angleStep + currentWheelRotationRad;
//       const x = radius * Math.cos(angle);
//       const y = radius * Math.sin(angle);
//       if (animated) {
//         timeline.to(
//           card,
//           {
//             x: x,
//             y: y,
//             rotation: -currentWheelRotation,
//             scale: 0.8,
//             duration: CONFIG.animations.transitionDuration,
//             ease: "power2.inOut"
//           },
//           0
//         );
//       } else {
//         gsap.set(card, {
//           x: x,
//           y: y,
//           rotation: -currentWheelRotation,
//           scale: 0.8
//         });
//       }
//     });
//     return timeline;
//   }

//   // Carousel: Calculate and store circle data
//   function calculateAndStoreCircleData() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const totalCards = cards.length;
//     const degreePerCard = 360 / totalCards;
//     const viewport = getViewportSize();
//     const minDimension = Math.min(viewport.width, viewport.height);
//     const radius = minDimension * (CONFIG.wheelRadius / 100);
//     cardInitialAngles = [];
//     cards.forEach((card, index) => {
//       const angle = index * degreePerCard * (Math.PI / 180);
//       cardInitialAngles[index] = angle;
//     });
//   }

//   // Carousel: Setup draggable for rotation
//   function setupDraggable(target = ".carousel-items") {
//     if (draggableInstance) {
//       draggableInstance.kill();
//       draggableInstance = null;
//     }
//     carouselItemsEl.classList.add("draggable");
//     draggableInstance = Draggable.create(target, {
//       type: "rotation",
//       inertia: true,
//       throwResistance: 0.3,
//       snap: function (endValue) {
//         return endValue;
//       },
//       onDrag: updateCardRotations,
//       onThrowUpdate: updateCardRotations,
//       onThrowComplete: function () {
//         console.log("Throw completed with velocity:", this.tween.data);
//       }
//     })[0];
//     gsap.set(target, { overwrite: "auto" });
//   }

//   // Carousel: Update card rotations
//   function updateCardRotations() {
//     if (isTransitioning) return;
//     const wheelRotation = this.rotation || 0;
//     const cards = gsap.utils.toArray(".carousel-item");
//     if (currentAnimation === "circle") {
//       cards.forEach((card) => {
//         gsap.set(card, { rotation: -wheelRotation });
//       });
//     } else if (currentAnimation === "fan") {
//       const viewport = getViewportSize();
//       const maxFanAngle = Math.min(180, viewport.width / 5);
//       const fanStartAngle = -maxFanAngle / 2;
//       const fanEndAngle = maxFanAngle / 2;
//       cards.forEach((card, index) => {
//         const progress = index / (CONFIG.totalCards - 1);
//         const fanAngle = fanStartAngle + progress * (fanEndAngle - fanStartAngle);
//         gsap.set(card, { rotation: fanAngle - wheelRotation });
//       });
//     }
//   }

//   // Carousel: Setup wave positions
//   function setupWavePositions() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewport = getViewportSize();
//     const cardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-width"));
//     const lineWidth = Math.min(viewport.width * 0.8, CONFIG.totalCards * cardWidth * 0.4);
//     const cardSpacing = lineWidth / (CONFIG.totalCards - 1);
//     const waveHeight = Math.min(viewport.height * 0.1, 80);
//     const timeline = gsap.timeline();
//     cards.forEach((card, index) => {
//       const xPos = (index - (CONFIG.totalCards - 1) / 2) * cardSpacing;
//       const yPos = Math.sin((index / (CONFIG.totalCards - 1)) * Math.PI * 2) * waveHeight;
//       timeline.to(
//         card,
//         {
//           x: xPos,
//           y: yPos,
//           rotation: 0,
//           scale: 0.7,
//           duration: CONFIG.animations.transitionDuration,
//           ease: "power2.inOut"
//         },
//         0
//       );
//     });
//     return timeline;
//   }

//   // Carousel: Start wave animation
//   function startWaveAnimation() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewport = getViewportSize();
//     const waveHeight = Math.min(viewport.height * 0.1, 80);
//     return gsap.to(cards, {
//       y: (i) => Math.sin((i / (CONFIG.totalCards - 1)) * Math.PI * 2 + Math.PI) * waveHeight,
//       duration: 1.5,
//       repeat: -1,
//       yoyo: true,
//       ease: "sine.inOut"
//     });
//   }

//   // Carousel: Setup stagger positions
//   function setupStaggerPositions() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewport = getViewportSize();
//     const cardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-width"));
//     const cardHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-height"));
//     const rows = 3;
//     const cols = 4;
//     const xSpacing = cardWidth * 0.7;
//     const ySpacing = cardHeight * 0.7;
//     const timeline = gsap.timeline();
//     cards.forEach((card, index) => {
//       const row = Math.floor(index / cols);
//       const col = index % cols;
//       const xOffset = row % 2 === 1 ? xSpacing / 2 : 0;
//       const xPos = (col - (cols - 1) / 2) * xSpacing + xOffset;
//       const yPos = (row - (rows - 1) / 2) * ySpacing;
//       timeline.to(
//         card,
//         {
//           x: xPos,
//           y: yPos,
//           rotation: 0,
//           scale: 0.7,
//           duration: CONFIG.animations.transitionDuration,
//           ease: "power2.inOut"
//         },
//         0
//       );
//     });
//     return timeline;
//   }

//   // Carousel: Setup stagger mouse tracking
//   function setupStaggerMouseTracking() {
//     const viewport = getViewportSize();
//     const cardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-width"));
//     const cardHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-height"));
//     const rows = 3;
//     const cols = 4;
//     const xSpacing = cardWidth * 0.7;
//     const ySpacing = cardHeight * 0.7;
//     const maxOffset = 40;
//     carouselContainerEl.onmousemove = (e) => {
//       if (currentAnimation !== "stagger" || isTransitioning) return;
//       const mouseY = e.clientY / viewport.height;
//       const offset = (mouseY - 0.5) * -maxOffset;
//       const cards = gsap.utils.toArray(".carousel-item");
//       cards.forEach((card, index) => {
//         const row = Math.floor(index / cols);
//         const col = index % cols;
//         const xOffset = row % 2 === 1 ? xSpacing / 2 : 0;
//         const xPos = (col - (cols - 1) / 2) * xSpacing + xOffset;
//         const yPos = (row - (rows - 1) / 2) * ySpacing + offset;
//         gsap.to(card, {
//           y: yPos,
//           duration: 0.8,
//           ease: "power2.out"
//         });
//       });
//     };
//   }

//   // Carousel: Setup grid positions
//   function setupGridPositions() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewport = getViewportSize();
//     const cardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-width"));
//     const cardHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--carousel-card-height"));
//     const viewport_ratio = viewport.width / viewport.height;
//     let rows, cols;
//     if (viewport_ratio > 1) {
//       rows = 3;
//       cols = 4;
//     } else {
//       rows = 4;
//       cols = 3;
//     }
//     const scale = Math.min(0.8, viewport.width / (cols * cardWidth * 1.2), viewport.height / (rows * cardHeight * 1.2));
//     const xSpacing = cardWidth * scale * 1.2;
//     const ySpacing = cardHeight * scale * 1.2;
//     const timeline = gsap.timeline();
//     cards.forEach((card, index) => {
//       const col = index % cols;
//       const row = Math.floor(index / cols);
//       const xPos = (col - (cols - 1) / 2) * xSpacing;
//       const yPos = (row - (rows - 1) / 2) * ySpacing;
//       timeline.to(
//         card,
//         {
//           x: xPos,
//           y: yPos,
//           rotation: 0,
//           scale: scale,
//           duration: CONFIG.animations.transitionDuration,
//           ease: "power2.inOut"
//         },
//         0
//       );
//     });
//     return timeline;
//   }

//   // Carousel: Setup fan positions
//   function setupFanPositions() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewport = getViewportSize();
//     const maxFanAngle = Math.min(180, viewport.width / 5);
//     const fanStartAngle = -maxFanAngle / 2;
//     const fanEndAngle = maxFanAngle / 2;
//     const timeline = gsap.timeline();
//     cards.forEach((card, index) => {
//       const progress = index / (CONFIG.totalCards - 1);
//       const angle = fanStartAngle + progress * (fanEndAngle - fanStartAngle);
//       const yOffset = Math.sin((progress - 0.5) * Math.PI) * 50;
//       timeline.to(
//         card,
//         {
//           x: 0,
//           y: yOffset,
//           rotation: angle,
//           scale: 0.8,
//           duration: CONFIG.animations.transitionDuration,
//           ease: "power2.inOut"
//         },
//         0
//       );
//     });
//     return timeline;
//   }

//   // Carousel: Setup 3D depth positions
//   function setup3DDepthPositions() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const viewport = getViewportSize();
//     const positions = [
//       { x: -viewport.width * 0.25, y: -viewport.height * 0.2, z: -200, scale: 0.9, rotX: -5, rotY: 5 },
//       { x: viewport.width * 0.25, y: -viewport.height * 0.25, z: -300, scale: 0.85, rotX: -3, rotY: -4 },
//       { x: -viewport.width * 0.3, y: viewport.height * 0.2, z: -400, scale: 0.8, rotX: 4, rotY: 6 },
//       { x: viewport.width * 0.3, y: viewport.height * 0.25, z: -500, scale: 0.75, rotX: 5, rotY: -5 },
//       { x: 0, y: -viewport.height * 0.3, z: -700, scale: 0.7, rotX: -6, rotY: 0 },
//       { x: -viewport.width * 0.35, y: 0, z: -800, scale: 0.65, rotX: 0, rotY: 7 },
//       { x: viewport.width * 0.35, y: 0, z: -900, scale: 0.6, rotX: 0, rotY: -7 },
//       { x: 0, y: viewport.height * 0.3, z: -1000, scale: 0.55, rotX: 6, rotY: 0 },
//       { x: -viewport.width * 0.2, y: -viewport.height * 0.15, z: -1200, scale: 0.5, rotX: -3, rotY: 3 },
//       { x: viewport.width * 0.2, y: -viewport.height * 0.15, z: -1300, scale: 0.45, rotX: -3, rotY: -3 },
//       { x: -viewport.width * 0.2, y: viewport.height * 0.15, z: -1400, scale: 0.4, rotX: 3, rotY: 3 },
//       { x: viewport.width * 0.2, y: viewport.height * 0.15, z: -1500, scale: 0.35, rotX: 3, rotY: -3 }
//     ];
//     const timeline = gsap.timeline();
//     cards.forEach((card, index) => {
//       if (index >= positions.length) return;
//       const pos = positions[index];
//       const zIndex = 1000 - Math.round(Math.abs(pos.z));
//       gsap.set(card, { zIndex: zIndex });
//       timeline.to(
//         card,
//         {
//           x: pos.x,
//           y: pos.y,
//           z: pos.z,
//           rotationX: pos.rotX,
//           rotationY: pos.rotY,
//           scale: pos.scale,
//           duration: CONFIG.animations.transitionDuration,
//           ease: "power2.inOut"
//         },
//         0
//       );
//     });
//     return timeline;
//   }

//   // Carousel: Setup 3D depth mouse tracking
//   function setup3DDepthMouseTracking() {
//     const viewport = getViewportSize();
//     carouselContainerEl.onmousemove = (e) => {
//       if (currentAnimation !== "depth" || isTransitioning) return;
//       const mouseX = e.clientX / viewport.width - 0.5;
//       const mouseY = e.clientY / viewport.height - 0.5;
//       gsap.to(".carousel-items", {
//         rotationY: mouseX * 3,
//         rotationX: -mouseY * 3,
//         duration: 1.2,
//         ease: "power1.out"
//       });
//     };
//   }

//   // Carousel: Update z-indices for different patterns
//   function updateZIndices(pattern) {
//     const cards = gsap.utils.toArray(".carousel-item");
//     if (pattern === "depth") {
//       const positions = setup3DDepthPositions();
//       cards.forEach((card, index) => {
//         if (index < CONFIG.totalCards) {
//           const zIndex = 1000 - Math.round(Math.abs(positions[index]?.z || 0));
//           gsap.set(card, { zIndex: zIndex });
//         }
//       });
//     } else {
//       cards.forEach((card, index) => {
//         if (index < originalZIndices.length) {
//           gsap.set(card, { zIndex: originalZIndices[index] });
//         }
//       });
//     }
//   }

//   // Carousel: Transition to a different pattern
//   function transitionToPattern(newPattern) {
//     if (isTransitioning) return;
//     isTransitioning = true;
//     updateMenuState(newPattern);
//     killActiveAnimations();
//     const currentWheelRotation = draggableInstance ? draggableInstance.rotation : 0;
//     if (draggableInstance) {
//       draggableInstance.kill();
//       draggableInstance = null;
//     }
//     carouselItemsEl.classList.remove("draggable");
//     carouselContainerEl.onmousemove = null;
//     const prevAnimation = currentAnimation;
//     currentAnimation = newPattern;
//     const timeline = gsap.timeline({
//       onComplete: () => {
//         isTransitioning = false;
//         if (newPattern === "circle" || newPattern === "fan") {
//           setupDraggable();
//         } else if (newPattern === "wave") {
//           const waveAnim = startWaveAnimation();
//           if (waveAnim) activeAnimations.push(waveAnim);
//         } else if (newPattern === "stagger") {
//           setupStaggerMouseTracking();
//         } else if (newPattern === "depth") {
//           setup3DDepthMouseTracking();
//         }
//       }
//     });
//     activeAnimations.push(timeline);
//     if (prevAnimation === "fan") {
//       const cards = gsap.utils.toArray(".carousel-item");
//       const normalizeTimeline = gsap.timeline();
//       cards.forEach((card) => {
//         normalizeTimeline.to(
//           card,
//           {
//             rotation: 0,
//             rotationX: 0,
//             rotationY: 0,
//             duration: CONFIG.animations.transitionDuration / 2,
//             ease: "power2.inOut"
//           },
//           0
//         );
//       });
//       timeline.add(normalizeTimeline);
//       timeline.to({}, { duration: 0.1 });
//     }
//     if (newPattern !== "circle" && newPattern !== "fan") {
//       if (prevAnimation === "circle" || prevAnimation === "fan") {
//         timeline.set(".carousel-items", { rotationX: 0, rotationY: 0 });
//       } else {
//         timeline.set(".carousel-items", { rotation: 0, rotationX: 0, rotationY: 0 });
//       }
//     }
//     let patternTimeline;
//     switch (newPattern) {
//       case "circle":
//         patternTimeline = setupCirclePositions(true);
//         if (patternTimeline) timeline.add(patternTimeline, 0);
//         break;
//       case "wave":
//         patternTimeline = setupWavePositions();
//         if (patternTimeline) timeline.add(patternTimeline, 0);
//         if (prevAnimation === "circle" || prevAnimation === "fan") {
//           timeline.to(".carousel-items", { rotation: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut" }, 0);
//         }
//         break;
//       case "stagger":
//         patternTimeline = setupStaggerPositions();
//         if (patternTimeline) timeline.add(patternTimeline, 0);
//         if (prevAnimation === "circle" || prevAnimation === "fan") {
//           timeline.to(".carousel-items", { rotation: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut" }, 0);
//         }
//         break;
//       case "grid":
//         patternTimeline = setupGridPositions();
//         if (patternTimeline) timeline.add(patternTimeline, 0);
//         if (prevAnimation === "circle" || prevAnimation === "fan") {
//           timeline.to(".carousel-items", { rotation: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut" }, 0);
//         }
//         break;
//       case "fan":
//         patternTimeline = setupFanPositions();
//         if (patternTimeline) timeline.add(patternTimeline, 0);
//         if (prevAnimation === "circle") {
//           timeline.to(".carousel-items", { rotation: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut" }, 0);
//         }
//         break;
//       case "depth":
//         patternTimeline = setup3DDepthPositions();
//         if (patternTimeline) timeline.add(patternTimeline, 0);
//         if (prevAnimation === "circle" || prevAnimation === "fan") {
//           timeline.to(".carousel-items", { rotation: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut" }, 0);
//         }
//         break;
//     }
//   }

//   // Carousel: Initialize carousel
//   function initializeCarousel() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const totalCards = cards.length;
//     gsap.set(cards, { x: 0, y: 0, rotation: 0, scale: 0, opacity: 0 });
//     gsap.set(".switch", { opacity: 0, visibility: "hidden" });
//     const timeline = gsap.timeline({
//       onComplete: () => {
//         isTransitioning = false;
//         setupDraggable();
//         gsap.to(".switch", { opacity: 1, visibility: "visible", duration: 0.8, ease: "power2.inOut" });
//       }
//     });
//     for (let i = 0; i < totalCards; i++) {
//       const card = cards[i];
//       const delay = (totalCards - 1 - i) * 0.1;
//       gsap.set(card, { zIndex: 100 + (totalCards - 1 - i) });
//       timeline.to(card, { opacity: 1, scale: 0.8, duration: 0.5, ease: "power2.out" }, delay);
//     }
//     timeline.to({}, { duration: 0.3 });
//     const circleTimeline = setupCirclePositions(true);
//     timeline.add(circleTimeline);
//     currentAnimation = "circle";
//     activeAnimations.push(timeline);
//     updateMenuState("circle");
//     return timeline;
//   }

//   // Carousel: Reset carousel
//   function resetCarousel() {
//     killActiveAnimations();
//     if (draggableInstance) {
//       draggableInstance.kill();
//       draggableInstance = null;
//     }
//     carouselContainerEl.onmousemove = null;
//     gsap.set(".carousel-items", { rotation: 0, rotationX: 0, rotationY: 0 });
//     gsap.to(".switch", {
//       opacity: 0,
//       visibility: "hidden",
//       duration: 0.3,
//       ease: "power2.inOut",
//       onComplete: () => {
//         generateCards();
//         initializeCarousel();
//       }
//     });
//     currentAnimation = "circle";
//     isTransitioning = false;
//     updateMenuState("circle");
//   }

//   // Combined: Handle resize
//   function handleResize() {
//     if (!isTransitioning) {
//       transitionToPattern(currentAnimation);
//     }
//     highlightCurrentSection();
//   }

//   // Carousel: Add event listeners
//   resetBtn.addEventListener("click", resetCarousel);
//   circleBtn.addEventListener("click", () => transitionToPattern("circle"));
//   waveBtn.addEventListener("click", () => transitionToPattern("wave"));
//   staggerBtn.addEventListener("click", () => transitionToPattern("stagger"));
//   gridBtn.addEventListener("click", () => transitionToPattern("grid"));
//   fanBtn.addEventListener("click", () => transitionToPattern("fan"));
//   depthBtn.addEventListener("click", () => transitionToPattern("depth"));
//   window.addEventListener("resize", handleResize);

//   // Initialize Carousel
//   generateCards();
//   initializeCarousel();
// });




// /**
//  * LokiVerse Public Portfolio - gog.js
//  * Handles all interactive functionality for the public-facing portfolio page,
//  * including the GSAP carousel and fetching/displaying public stories from Firebase.
//  * July 19, 2025
//  */

// // Firebase Setup
// const firebaseConfig = {
//   apiKey: "0_to",
//   authDomain: "",
//   projectId: "loki-auth-2419c",
//   storageBucket: "lom",
//   messagingSenderId: "58",
//   appId: "1b",
//   measurementId: "G-TB"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();


// // --- Main Application Logic ---
// document.addEventListener('DOMContentLoaded', () => {
//   // Register GSAP plugins
//   gsap.registerPlugin(Draggable, InertiaPlugin);

//   // --- Fetch and Display Public Stories ---
//   // This function runs as soon as the page loads.
//   displayPublicStories();


//   // --- ALL Original Website and Carousel Logic ---

//   // DOM Elements for Website
//   const navbar = document.getElementById('navbar');
//   const mobileMenuButton = document.getElementById('mobile-menu-button');
//   const mobileMenu = document.getElementById('mobile-menu');
//   const navLinks = document.querySelectorAll('.nav-link');
//   const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
//   const sections = document.querySelectorAll('section');

//   // DOM Elements for Carousel
//   const carouselItemsEl = document.querySelector(".carousel-items");
//   const carouselContainerEl = document.querySelector(".carousel-container");
//   const resetBtn = document.getElementById("resetBtn");
//   const circleBtn = document.getElementById("circleBtn");
//   const waveBtn = document.getElementById("waveBtn");
//   const staggerBtn = document.getElementById("staggerBtn");
//   const gridBtn = document.getElementById("gridBtn");
//   const fanBtn = document.getElementById("fanBtn");
//   const depthBtn = document.getElementById("depthBtn");
//   const allButtons = document.querySelectorAll(".switch-button");

//   // Carousel Configuration
//   const CONFIG = {
//     totalCards: 12,
//     wheelRadius: 35, // 35% of viewport
//     images: [
//       "images/1.jpg", "images/2.jpg", "images/3.jpg", "images/4.jpg",
//       "images/5.jpg", "images/6.jpg", "images/7.jpg", "images/8.png",
//       "images/9.png", "images/10.png", "images/11.png", "images/12.png"
//     ],
//     animations: {
//       initialDuration: 1,
//       rotationDuration: 0.64,
//       flipDuration: 0.64,
//       transitionDuration: 1.2,
//       circleTransitionDuration: 0.8
//     }
//   };

//   // Carousel State Variables
//   let currentAnimation = "circle";
//   let isTransitioning = false;
//   let activeAnimations = [];
//   let draggableInstance = null;
//   let originalZIndices = [];

//   // --- Function to Fetch and Display Public Stories ---
//   async function displayPublicStories() {
//       const featuredGrid = document.getElementById('public-stories-grid');
//       const dropdownGrid = document.getElementById('all-public-stories-dropdown');
//       const viewAllBtn = document.getElementById('view-all-stories-btn');

//       if (!featuredGrid || !dropdownGrid || !viewAllBtn) {
//           console.error("Portfolio elements not found in the DOM.");
//           return;
//       }

//       featuredGrid.innerHTML = '<p class="col-span-2 text-center text-gray-400">Loading stories...</p>';
//       dropdownGrid.innerHTML = '';

//       try {
//           // This query now works because of the new security rules
//           const snapshot = await db.collection("characters")
//                                    .where("isPublic", "==", true)
//                                    .orderBy("createdAt", "desc")
//                                    .get();

//           featuredGrid.innerHTML = ''; // Clear loading message

//           if (snapshot.empty) {
//               featuredGrid.innerHTML = '<p class="col-span-2 text-center text-gray-400">No public stories found yet. Be the first to publish one!</p>';
//               return;
//           }

//           snapshot.docs.forEach((doc, index) => {
//               const story = doc.data();
//               const storyCardHTML = `
//                   <div class="relative group overflow-hidden rounded-xl">
//                       <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 opacity-0 group-hover:opacity-90 transition-all duration-300 z-10 flex items-center justify-center p-4">
//                           <div class="text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
//                               <div class="text-xl font-medium text-white mb-2">${story.name || 'Untitled Story'}</div>
//                               <p class="text-gray-200 mb-4 text-sm">${(story.story || '').substring(0, 100)}...</p>
//                               <button class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded text-white hover:bg-white/30 transition-colors duration-300" onclick="alert('Viewing full story soon!')">View Story</button>
//                           </div>
//                       </div>
//                       <div class="aspect-video bg-gray-800 rounded-xl flex items-center justify-center bg-cover bg-center" style="background-image: url('${story.imageUrl || ''}')">
//                           ${!story.imageUrl ? `<div class="text-cyan-400/30 font-medium">${story.name || 'Untitled'}</div>` : ''}
//                       </div>
//                   </div>
//               `;

//               if (index < 4) {
//                   featuredGrid.insertAdjacentHTML('beforeend', storyCardHTML);
//               } else {
//                   dropdownGrid.insertAdjacentHTML('beforeend', storyCardHTML);
//               }
//           });

//           if (snapshot.docs.length > 4) {
//               viewAllBtn.classList.remove('hidden');
//               viewAllBtn.addEventListener('click', () => {
//                   const isHidden = dropdownGrid.classList.toggle('hidden');
//                   if (!isHidden) {
//                       dropdownGrid.classList.add('grid');
//                   }
//                   viewAllBtn.querySelector('span').textContent = isHidden ? 'View All Stories' : 'Show Less';
//               });
//           }

//       } catch (error) {
//           console.error("Error fetching public stories:", error);
//           featuredGrid.innerHTML = `<p class="col-span-2 text-center text-red-500">Failed to load stories. Check browser console and Firestore rules.</p>`;
//       }
//   }

//   // --- Original Website Interactivity (Menus, Scrolling) ---
//   mobileMenuButton.addEventListener('click', () => {
//     mobileMenuButton.classList.toggle('active');
//     if (mobileMenu.classList.contains('open')) {
//       mobileMenu.style.height = '0';
//       mobileMenu.classList.remove('open');
//     } else {
//       mobileMenu.classList.add('open');
//       mobileMenu.style.height = `${mobileMenu.scrollHeight}px`;
//     }
//   });

//   mobileNavLinks.forEach(link => {
//     link.addEventListener('click', () => {
//       mobileMenuButton.classList.remove('active');
//       mobileMenu.style.height = '0';
//       mobileMenu.classList.remove('open');
//     });
//   });

//   window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) navbar.classList.add('scrolled');
//     else navbar.classList.remove('scrolled');
//     highlightCurrentSection();
//   });

//   navLinks.forEach(link => {
//     link.addEventListener('click', (e) => {
//       e.preventDefault();
//       const targetId = link.getAttribute('href');
//       const targetSection = document.querySelector(targetId);
//       if (targetSection) {
//         const offsetTop = targetSection.offsetTop - 70;
//         window.scrollTo({ top: offsetTop, behavior: 'smooth' });
//         targetSection.classList.add('section-highlight');
//         setTimeout(() => targetSection.classList.remove('section-highlight'), 1000);
//       }
//     });
//   });

//   function highlightCurrentSection() {
//     let current = '';
//     sections.forEach(section => {
//       const sectionTop = section.offsetTop - 100;
//       if (window.scrollY >= sectionTop) {
//         current = section.getAttribute('id');
//       }
//     });
//     navLinks.forEach(link => {
//       link.classList.remove('active');
//       if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
//     });
//     mobileNavLinks.forEach(link => {
//         link.classList.remove('active');
//         if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
//     });
//   }

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) entry.target.classList.add('section-visible');
//     });
//   }, { threshold: 0.1 });

//   sections.forEach(section => {
//     section.classList.add('section-hidden');
//     observer.observe(section);
//   });

//   highlightCurrentSection();

//   // --- Original GSAP Carousel Functions ---
//   function updateMenuState(newAnimation) {
//     allButtons.forEach(button => button.classList.remove("switch-button-current"));
//     let activeButton;
//     switch (newAnimation) {
//       case "circle": activeButton = circleBtn; break;
//       case "wave": activeButton = waveBtn; break;
//       case "stagger": activeButton = staggerBtn; break;
//       case "grid": activeButton = gridBtn; break;
//       case "fan": activeButton = fanBtn; break;
//       case "depth": activeButton = depthBtn; break;
//       default: activeButton = circleBtn;
//     }
//     if (activeButton) activeButton.classList.add("switch-button-current");
//   }

//   function generateCards() {
//     if (!carouselItemsEl) return;
//     carouselItemsEl.innerHTML = "";
//     for (let i = 1; i <= CONFIG.totalCards; i++) {
//       const cardEl = document.createElement("div");
//       cardEl.className = "carousel-item";
//       cardEl.style.backgroundImage = `url(${CONFIG.images[i - 1] || CONFIG.images[0]})`;
//       cardEl.innerHTML = `<div class="card__number">${String(i).padStart(3, "0")}</div>`;
//       carouselItemsEl.appendChild(cardEl);
//     }
//     initializeZIndices();
//   }

//   function initializeZIndices() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     originalZIndices = cards.map((card, index) => {
//       const zIndex = 100 + (CONFIG.totalCards - index);
//       gsap.set(card, { zIndex });
//       return zIndex;
//     });
//   }

//   function killActiveAnimations() {
//     gsap.killTweensOf([".carousel-items", ".carousel-item"]);
//     activeAnimations.forEach(animation => animation && animation.kill && animation.kill());
//     activeAnimations = [];
//   }

//   function setupDraggable(target = ".carousel-items") {
//     if (draggableInstance) draggableInstance.kill();
//     if (!carouselItemsEl) return;
//     carouselItemsEl.classList.add("draggable");
//     draggableInstance = Draggable.create(target, {
//       type: "rotation", inertia: true, throwResistance: 0.3,
//       onDrag: updateCardRotations, onThrowUpdate: updateCardRotations
//     })[0];
//   }

//   function updateCardRotations() {
//     if (isTransitioning) return;
//     const wheelRotation = this.rotation || 0;
//     const cards = gsap.utils.toArray(".carousel-item");
//     if (currentAnimation === "circle" || currentAnimation === "fan") {
//       cards.forEach(card => gsap.set(card, { rotation: -wheelRotation }));
//     }
//   }

//   function createPatternTimeline(pattern) {
//     const cards = gsap.utils.toArray(".carousel-item");
//     const timeline = gsap.timeline();
//     // Simplified version from original code
//     const radius = Math.min(window.innerWidth, window.innerHeight) * (CONFIG.wheelRadius / 100);
//     const angleStep = (2 * Math.PI) / CONFIG.totalCards;
//     cards.forEach((card, i) => {
//         const angle = i * angleStep;
//         timeline.to(card, {
//             x: radius * Math.cos(angle),
//             y: radius * Math.sin(angle),
//             rotation: 0,
//             scale: 0.8,
//             duration: CONFIG.animations.transitionDuration,
//             ease: "power2.inOut"
//         }, 0);
//     });
//     return timeline;
//   }

//   function transitionToPattern(newPattern) {
//     if (isTransitioning) return;
//     isTransitioning = true;
//     updateMenuState(newPattern);
//     killActiveAnimations();
//     if (draggableInstance) draggableInstance.kill();
//     draggableInstance = null;
//     if (carouselItemsEl) carouselItemsEl.classList.remove("draggable");
//     if (carouselContainerEl) carouselContainerEl.onmousemove = null;

//     currentAnimation = newPattern;
//     const timeline = gsap.timeline({
//       onComplete: () => {
//         isTransitioning = false;
//         if (newPattern === "circle" || newPattern === "fan") setupDraggable();
//       }
//     });
//     activeAnimations.push(timeline);

//     gsap.to(".carousel-items", { rotation: 0, rotationX: 0, rotationY: 0, duration: CONFIG.animations.transitionDuration, ease: "power2.inOut"}, 0);
//     const patternTimeline = createPatternTimeline(newPattern);
//     if(patternTimeline) timeline.add(patternTimeline, 0);
//   }

//   function initializeCarousel() {
//     const cards = gsap.utils.toArray(".carousel-item");
//     if (cards.length === 0) return;
//     gsap.set(cards, { scale: 0, opacity: 0 });
//     const timeline = gsap.timeline({
//         onComplete: () => {
//             isTransitioning = false;
//             setupDraggable();
//             gsap.to(".switch", { opacity: 1, visibility: "visible", duration: 0.8 });
//         }
//     });
//     timeline.to(cards, { opacity: 1, scale: 0.8, duration: 0.5, stagger: 0.05, ease: "power2.out" });
//     timeline.add(createPatternTimeline('circle'));
//     activeAnimations.push(timeline);
//   }

//   // Event Listeners for carousel
//   if(resetBtn) resetBtn.addEventListener("click", initializeCarousel);
//   if(circleBtn) circleBtn.addEventListener("click", () => transitionToPattern("circle"));
//   // Add other button listeners if they exist in your HTML

//   window.addEventListener("resize", () => {
//     if(!isTransitioning) transitionToPattern(currentAnimation);
//     highlightCurrentSection();
//   });

//   // Initializations
//   generateCards();
//   initializeCarousel();
// });













/**
 * LokiVerse Public Portfolio - gog.js
 * The definitive, complete, and final version.
 * Handles all interactive functionality:
 * - Fetches and displays public stories from Firebase.
 * - Opens a modal to view the full story.
 * - Full GSAP Carousel with all original animation patterns and interactions.
 * - Standard website navigation and interactivity.
 */

// --- 1. FIREBASE SETUP ---
// Firebase Setup


/**
 * LokiVerse Public Portfolio - gog.js
 * THE DEFINITIVE, FULLY-FEATURED, AND CORRECTED VERSION
 * - Complete, original GSAP Carousel animations are restored and fixed.
 * - Fetches and displays public stories from Firebase.
 * - Modal view for full stories now works and appears above the header.
 */

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