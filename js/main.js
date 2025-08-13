const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Main Logic
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("characterForm");
    const editForm = document.getElementById("editCharacterForm");
    const navbar = document.getElementById('navbar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const sections = document.querySelectorAll('section');
    const particleWrapper = document.getElementById('particleWrapper');

    // Text-to-Speech Setup
    let synth = window.speechSynthesis;
    let utterance = null;
    let isSpeaking = false;

    // Function to Show Loading Overlay
    function showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    // Function to Hide Loading Overlay
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    // Mobile Menu Toggle
    mobileMenuButton.addEventListener('click', () => {
        mobileMenuButton.classList.toggle('active');
        if (mobileMenu.classList.contains('open')) {
            mobileMenu.style.height = '0';
            mobileMenu.classList.remove('open');
        } else {
            mobileMenu.classList.add('open');
            mobileMenu.style.height = `${mobileMenu.scrollHeight}px`;
        }
    });

    // Close mobile menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuButton.classList.remove('active');
            mobileMenu.style.height = '0';
            mobileMenu.classList.remove('open');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightCurrentSection();
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                targetSection.classList.add('section-highlight');
                setTimeout(() => {
                    targetSection.classList.remove('section-highlight');
                }, 1000);
            }
        });
    });

    // Highlight active section in navbar
    function highlightCurrentSection() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Scroll animations for sections
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });

    // Initialize active section on page load
    highlightCurrentSection();

    // Firebase Authentication
    auth.onAuthStateChanged(user => {
        console.log('Auth State:', user ? user.uid : 'No user');
        if (!user) {
            alert("✅ You have been logged out successfully");
            window.location.href = "login.html";
        } else {
            const email = user.email || "User";
            const initial = email.charAt(0).toUpperCase();
            document.getElementById("profileBadge").textContent = initial;
            document.getElementById("userEmail").textContent = `Email: ${email}`;
            displayCharacters();
            displayStoryCount();
        }
    });

    // Display Story Count in Profile
    async function displayStoryCount() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const snapshot = await db.collection("characters")
                .where("userId", "==", user.uid)
                .get();
            const totalStories = snapshot.size;
            const publicStories = snapshot.docs.filter(doc => doc.data().isPublic).length;
            const privateStories = totalStories - publicStories;

            const storyCountElement = document.getElementById("story-count");
            if (storyCountElement) {
                storyCountElement.innerHTML = `
                    <p class="text-sm text-gray-300">Total Stories: ${totalStories}</p>
                    <p class="text-sm text-gray-300">Public Stories: ${publicStories}</p>
                    <p class="text-sm text-gray-300">Private Stories: ${privateStories}</p>
                `;
                console.log('Story counts updated:', { totalStories, publicStories, privateStories });
            } else {
                console.warn('Story count element not found');
                const profilePanel = document.getElementById("profilePanel");
                if (profilePanel) {
                    const storyCountDiv = document.createElement("div");
                    storyCountDiv.id = "story-count";
                    storyCountDiv.className = "text-gray-300 mt-2 p-2";
                    storyCountDiv.innerHTML = `
                        <p class="text-sm text-gray-300">Total Stories: ${totalStories}</p>
                        <p class="text-sm text-gray-300">Public Stories: ${publicStories}</p>
                        <p class="text-sm text-gray-300">Private Stories: ${privateStories}</p>
                    `;
                    const userEmail = document.getElementById("userEmail");
                    if (userEmail && userEmail.nextSibling) {
                        profilePanel.insertBefore(storyCountDiv, userEmail.nextSibling);
                    } else {
                        profilePanel.appendChild(storyCountDiv);
                    }
                    console.log('Story count element created and appended');
                }
            }
        } catch (error) {
            console.error('Error fetching story counts:', error);
            alert('Failed to fetch story counts. Please try again.');
        }
    }

    // Enhanced Prompt Generator
    function enhancePrompt(name, backstory, powers, weaknesses, fights) {
        return `Generate a Marvel-style multiversal story (maximum 500 words) for a character named **${name}**. Incorporate the following details seamlessly:

- **Backstory**: ${backstory}. Highlight their origin and motivations in a vivid, cinematic way.
- **Powers**: ${powers}. Showcase their unique abilities in action-packed scenes.
- **Weaknesses**: ${weaknesses}. Integrate these vulnerabilities to add depth and tension.
- **Fights**: ${fights}. Create dynamic battle sequences that reflect their skills and challenges.
- **Style**: Use a dramatic, engaging tone with vivid imagery, suitable for a Marvel multiverse story.
- **Emojis**: Include relevant emojis (e.g., ⚡, 🦸, 🌌) to enhance emotional and visual impact.
- **Format**: Return the story in valid Markdown format with clear headings and sections.

Ensure the story is concise, emotionally resonant, and captures the essence of a Marvel epic.`;
    }

    // Enhance Prompt with AI
    async function enhancePromptWithAI(prompt) {
        showLoadingOverlay();
        try {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
            const response = await fetchWithRetry(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Enhance the following prompt to make it more detailed, creative, and engaging for a Marvel-style multiversal story generation. Keep the structure intact and add vivid descriptors, additional context, or emotional hooks where appropriate. Original prompt: "${prompt}"`
                            }]
                        }]
                    }),
                },
                3,
                1000
            );
            const result = await response.json();
            let enhancedPrompt = result?.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
            if (enhancedPrompt.length > 1000) {
                enhancedPrompt = enhancedPrompt.substring(0, 1000) + "...";
            }
            document.getElementById("promptText").value = enhancedPrompt;
            return enhancedPrompt;
        } catch (err) {
            console.error("Prompt Enhancement Error:", err);
            alert("Failed to enhance prompt. Using original prompt.");
            return prompt;
        } finally {
            hideLoadingOverlay();
        }
    }

    // Generate Story with Enhanced Prompt
    async function generateStoryWithPrompt(prompt, isEnhanced = false) {
        showLoadingOverlay();
        const nameInput = document.getElementById("name");
        const backstoryInput = document.getElementById("backstory");
        const powersInput = document.getElementById("powers");
        const weaknessesInput = document.getElementById("weaknesses");
        const fightsInput = document.getElementById("fights");
        const imageInput = document.getElementById("image");
        const output = document.getElementById("output");

        const name = nameInput?.value?.trim() || "";
        const backstory = backstoryInput?.value?.trim() || "";
        const powers = powersInput?.value?.trim() || "";
        const weaknesses = weaknessesInput?.value?.trim() || "";
        const fights = fightsInput?.value?.trim() || "";

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to create a story.");
            hideLoadingOverlay();
            return;
        }

        let imageUrl = "";
        if (imageInput?.files?.length > 0) {
            const formData = new FormData();
            formData.append("file", imageInput.files[0]);
            formData.append("upload_preset", "loki_Uploads");




            try {
                const res = await fetchWithRetry(
                    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    },
                    3,
                    1000
                );
                const data = await res.json();
                if (data.secure_url) {
                    imageUrl = data.secure_url;
                } else {
                    throw new Error("No secure_url in Cloudinary response");
                }
            } catch (err) {
                console.error("Image Upload Error:", err);
                output.innerHTML = `<p style="color:red;">Failed to upload image: ${err.message}. Proceeding without image.</p>`;
            }
        }

        try {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
            let requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            };
            if (isEnhanced) {
                requestBody.contents[0].parts[0].text += `
- **Quality Boost**: Elevate the narrative with richer character development, intricate plot twists, and cinematic detail. Use advanced storytelling techniques to create a polished, professional-grade Marvel epic, surpassing the quality of a standard prompt-generated story.`;
            }

            const response = await fetchWithRetry(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                },
                3,
                1000
            );

            const result = await response.json();
            let story = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!story) {
                output.innerHTML = `<p style="color:red;">Failed to generate story. Try again.</p>`;
                hideLoadingOverlay();
                return;
            }

            const words = story.split(/\s+/).length;
            if (words > 500) {
                story = story.split(/\s+/).slice(0, 500).join(" ") + "...";
            }

            if (typeof marked === "undefined") {
                console.error("marked.js not loaded");
                output.innerHTML = `<p style="color:red;">Markdown rendering failed: marked.js not loaded. Displaying raw story.</p><div class="bg-gray-900/70 p-4 rounded-lg">${story}</div>`;
                hideLoadingOverlay();
                return;
            }
            const renderedStory = marked.parse(story, { breaks: true, gfm: true });

            const characterData = {
                name,
                backstory,
                powers,
                weaknesses,
                fights,
                story,
                imageUrl,
                createdAt: new Date().toISOString(),
                isPublic: false,
                userId: user.uid,
            };

            console.log('Saving character to Firestore:', characterData);
            let docRef;
            try {
                docRef = await db.collection("characters").add(characterData);
                console.log('Character saved with ID:', docRef.id);
            } catch (err) {
                console.error('Firestore write error:', err);
                output.innerHTML = `<p style="color:red;">Error saving to Firestore: ${err.message}</p>`;
                hideLoadingOverlay();
                throw err;
            }

            const outputId = `storyOutput-${docRef.id}`;
            output.innerHTML = `
                <div class="story-container bg-gray-900/70 p-4 rounded-lg" id="storyContainer-${outputId}">
                    <h2 class="text-2xl font-medium text-white mb-4">Story for ${name} 🌟</h2>
                    ${imageUrl ? `<img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" class="story-image" crossorigin="anonymous"><br>` : ""}
                    <div id="ttsControls-${outputId}" class="tts-controls"></div>
                    <div id="storyText-${outputId}" class="markdown-content">${renderedStory}</div>
                    <div class="mt-4 flex gap-2">
                        ${!characterData.isPublic ? `<button class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded" onclick="makeStoryPublic('${docRef.id}')">Make Public 📢</button>` : `<button class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded" onclick="makeStoryPrivate('${docRef.id}')">Make Private 🔒</button>`}
                        <button class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded" onclick="generateAnotherStory()">Generate Another Story 🔄</button>
                        <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onclick="exportToPDF('${outputId}')">Export to PDF 📥</button>
                    </div>
                </div>
            `;
            hideLoadingOverlay();
            requestAnimationFrame(() => {
                const container = document.getElementById(`storyText-${outputId}`);
                console.log('Post-render check for:', `storyText-${outputId}`, 'Container:', container);
                if (container) {
                    const ttsControls = setupTTS(story, outputId);
                    document.getElementById(`ttsControls-${outputId}`).innerHTML = ttsControls;
                    requestAnimationFrame(() => {
                        console.log('Attempting to populate voice selector for:', `voiceSelect-${outputId}`);
                        populateVoiceSelector(`voiceSelect-${outputId}`);
                    });
                } else {
                    console.error('Failed to find container after render:', `storyText-${outputId}`);
                }
            });
            displayCharacters();
            displayStoryCount();
        } catch (err) {
            console.error("Story Generation Error:", err);
            output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
            hideLoadingOverlay();
        }
    }

    // Timeout Promise Utility
    const timeoutPromise = (promise, timeoutMs) =>
        Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
            ),
        ]);

    // Fetch with Retry Utility
    async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await timeoutPromise(fetch(url, options), 60000);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API failed: ${errorData.error?.message || 'Unknown error'}`);
                }
                return response;
            } catch (err) {
                console.error(`Attempt ${i + 1} failed:`, err);
                if (i === retries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    // Populate Voice Selector with Retry
    function populateVoiceSelector(selectorId, retries = 5, delay = 300) {
        const attemptPopulate = (attempt) => {
            console.log('TTS Support:', 'speechSynthesis' in window, 'Voices:', synth ? synth.getVoices() : 'No synth', 'Selector ID:', selectorId);
            const voiceSelect = document.getElementById(selectorId);
            if (!voiceSelect || !synth || !('speechSynthesis' in window)) {
                console.warn(`Voice selector not populated (attempt ${attempt}): TTS not supported or element missing`);
                if (attempt < retries) {
                    setTimeout(() => attemptPopulate(attempt + 1), delay);
                } else if (voiceSelect) {
                    voiceSelect.innerHTML = '<option value="">TTS Not Supported</option>';
                    voiceSelect.disabled = true;
                }
                return;
            }
            voiceSelect.innerHTML = '<option value="">Select Voice</option>';
            const voices = synth.getVoices();
            if (voices.length === 0 && attempt < retries) {
                console.warn(`No voices available (attempt ${attempt})`);
                setTimeout(() => attemptPopulate(attempt + 1), delay);
                return;
            }
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
            voiceSelect.disabled = false;
            console.log(`Voice selector populated for ${selectorId}`);
        };
        if (synth && 'speechSynthesis' in window) {
            if (synth.getVoices().length === 0) {
                synth.onvoiceschanged = () => {
                    attemptPopulate(1);
                    synth.onvoiceschanged = null;
                };
            } else {
                requestAnimationFrame(() => attemptPopulate(1));
            }
        } else {
            attemptPopulate(1);
        }
    }

    // Text-to-Speech Handler with Retry
    function setupTTS(storyText, containerId, retries = 3, delay = 100) {
        const attemptSetup = (attempt) => {
            console.log(`Attempting to setup TTS for ${containerId} (attempt ${attempt})`);
            const container = document.getElementById(`storyText-${containerId}`);
            console.log('Container ID:', `storyText-${containerId}`, 'Container:', container);
            if (!container || !('speechSynthesis' in window)) {
                console.warn(`TTS setup failed (attempt ${attempt}): TTS not supported or container not found`);
                if (attempt < retries) {
                    setTimeout(() => attemptSetup(attempt + 1), delay);
                    return '';
                }
                return '<p style="color:orange;">Text-to-Speech is not supported in your browser or the story container was not found.</p>';
            }
            const selectorId = `voiceSelect-${containerId}`;
            const ttsControls = `
                <div class="tts-controls" id="ttsControls-${containerId}">
                    <button aria-label="Play story audio" id="playTTS-${containerId}" onclick="playTTS('${containerId}', '${selectorId}')">🎙️ Play</button>
                    <button aria-label="Pause story audio" onclick="pauseTTS()">⏸ Pause</button>
                    <button aria-label="Stop story audio" onclick="stopTTS()">⏹ Stop</button>
                    <select id="${selectorId}" onchange="updateVoice(this, '${containerId}')"></select>
                </div>
            `;
            if (!('speechSynthesis' in window)) {
                setTimeout(() => {
                    const playButton = document.getElementById(`playTTS-${containerId}`);
                    if (playButton) playButton.disabled = true;
                }, 0);
            }
            return ttsControls;
        };
        return attemptSetup(1);
    }

    window.playTTS = function (containerId, selectorId) {
        console.log('playTTS called for:', containerId, 'Selector:', selectorId);
        console.log('SpeechSynthesis states:', {
            supported: 'speechSynthesis' in window,
            speaking: synth?.speaking,
            paused: synth?.paused,
            isSpeaking: isSpeaking
        });

        if (synth && synth.paused) {
            console.log('Resuming paused utterance');
            setTimeout(() => {
                try {
                    synth.resume();
                    isSpeaking = true;
                    console.log('Utterance resumed successfully');
                } catch (err) {
                    console.error('Error resuming utterance:', err);
                    alert('Failed to resume audio. Please try again or check browser permissions.');
                }
            }, 100);
            return;
        }
        if (isSpeaking) {
            console.log('TTS already speaking, ignoring play request');
            return;
        }
        const storyContainer = document.getElementById(`storyText-${containerId}`);
        if (!storyContainer) {
            console.error('Story container not found for TTS:', `storyText-${containerId}`);
            alert('Story container not found. Please try again.');
            return;
        }
        const storyText = storyContainer.textContent.trim();
        if (!storyText) {
            console.error('No text content found in story container:', `storyText-${containerId}`);
            alert('No story text available for TTS.');
            return;
        }
        const voiceSelect = document.getElementById(selectorId);
        if (!voiceSelect) {
            console.error('Voice selector not found:', selectorId);
            alert('Voice selector not found. Please try again.');
            return;
        }
        const voiceIndex = voiceSelect.value;
        const voices = synth ? synth.getVoices() : [];
        if (!('speechSynthesis' in window) || !synth) {
            console.error('Text-to-Speech not supported in this browser');
            const playButton = document.getElementById(`playTTS-${containerId}`);
            if (playButton) playButton.disabled = true;
            alert('Text-to-Speech is not supported in your browser.');
            return;
        }
        try {
            utterance = new SpeechSynthesisUtterance(storyText);
            if (voiceIndex && voices[voiceIndex]) {
                utterance.voice = voices[voiceIndex];
                console.log('Selected voice:', voices[voiceIndex].name);
            } else {
                console.log('Using default voice');
            }
            utterance.onend = () => {
                isSpeaking = false;
                console.log('TTS utterance ended');
            };
            utterance.onerror = (event) => {
                isSpeaking = false;
                if (event.error !== 'interrupted') {
                    console.error('TTS utterance error:', event.error);
                    alert(`TTS error: ${event.error}. Please check browser permissions or try a different voice.`);
                } else {
                    console.log('TTS interrupted (expected, e.g., by stopTTS)');
                }
            };
            synth.speak(utterance);
            isSpeaking = true;
            console.log('TTS utterance started');
        } catch (err) {
            console.error('Error starting TTS utterance:', err);
            alert('Failed to start audio. Please check browser permissions or try again.');
        }
    };

    window.pauseTTS = function () {
        if (synth && synth.speaking && !synth.paused) {
            console.log('Pausing TTS');
            try {
                synth.pause();
                isSpeaking = false;
                console.log('TTS paused successfully');
            } catch (err) {
                console.error('Error pausing TTS:', err);
                alert('Failed to pause audio. Please try again.');
            }
        } else {
            console.log('Pause called but TTS not speaking or already paused');
        }
    };

    window.stopTTS = function () {
        if (synth && synth.speaking) {
            console.log('Stopping TTS');
            try {
                synth.cancel();
                isSpeaking = false;
                console.log('TTS stopped successfully');
            } catch (err) {
                console.error('Error stopping TTS:', err);
                alert('Failed to stop audio. Please try again.');
            }
        } else {
            console.log('Stop called but TTS not speaking');
        }
    };

    window.updateVoice = function (select, containerId) {
        console.log('Updating voice for:', containerId, 'Selected index:', select.value);
        if (synth && synth.speaking) {
            synth.cancel();
            playTTS(containerId, select.id);
        }
    };

    // Form Submission (Create New Character)
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById("name");
            const backstoryInput = document.getElementById("backstory");
            const powersInput = document.getElementById("powers");
            const weaknessesInput = document.getElementById("weaknesses");
            const fightsInput = document.getElementById("fights");
            const imageInput = document.getElementById("image");
            const output = document.getElementById("output");

            const name = nameInput?.value?.trim() || "";
            const backstory = backstoryInput?.value?.trim() || "";
            const powers = powersInput?.value?.trim() || "";
            const weaknesses = weaknessesInput?.value?.trim() || "";
            const fights = fightsInput?.value?.trim() || "";

            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to create a story.");
                return;
            }

            const requiredFields = { name, backstory, powers, weaknesses, fights };
            const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
            if (missingFields.length > 0) {
                console.error('Form validation failed:', missingFields);
                alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
                return;
            }

            showLoadingOverlay();

            let imageUrl = "";
            if (imageInput?.files?.length > 0) {
                const formData = new FormData();
                formData.append("file", imageInput.files[0]);
                formData.append("upload_preset", "loki_Uploads");
                try {
                    const res = await fetchWithRetry(
                        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, // Replace {your_cloud_name}
                        {
                            method: "POST",
                            body: formData,
                        },
                        3,
                        1000
                    );
                    const data = await res.json();
                    if (data.secure_url) {
                        imageUrl = data.secure_url;
                    } else {
                        throw new Error("No secure_url in Cloudinary response");
                    }
                } catch (err) {
                    console.error("Image Upload Error:", err);
                    output.innerHTML = `<p style="color:red;">Failed to upload image: ${err.message}. Proceeding without image.</p>`;
                    hideLoadingOverlay();
                }
            }

            const initialPrompt = enhancePrompt(name, backstory, powers, weaknesses, fights);
            document.getElementById("promptText").value = initialPrompt;

            let finalPrompt = document.getElementById("promptText").value;
            const isEnhanced = finalPrompt.includes("Enhanced") || finalPrompt.length > initialPrompt.length + 50;
            if (isEnhanced) {
                finalPrompt += `
- **Quality Boost**: Elevate the narrative with richer character development, intricate plot twists, and cinematic detail. Use advanced storytelling techniques to create a polished, professional-grade Marvel epic, surpassing the quality of a standard prompt-generated story.`;
            }

            await generateStoryWithPrompt(finalPrompt, isEnhanced);
        });

        document.getElementById("enhancePromptBtn").addEventListener("click", async () => {
            const nameInput = document.getElementById("name");
            const backstoryInput = document.getElementById("backstory");
            const powersInput = document.getElementById("powers");
            const weaknessesInput = document.getElementById("weaknesses");
            const fightsInput = document.getElementById("fights");

            const name = nameInput?.value?.trim() || "";
            const backstory = backstoryInput?.value?.trim() || "";
            const powers = powersInput?.value?.trim() || "";
            const weaknesses = weaknessesInput?.value?.trim() || "";
            const fights = fightsInput?.value?.trim() || "";

            if (!name || !backstory || !powers || !weaknesses || !fights) {
                alert("Please fill in all fields before enhancing the prompt.");
                return;
            }

            const initialPrompt = enhancePrompt(name, backstory, powers, weaknesses, fights);
            document.getElementById("promptText").value = initialPrompt;
            const enhancedPrompt = await enhancePromptWithAI(initialPrompt);
            document.getElementById("promptText").value = enhancedPrompt;
        });

        document.getElementById("generateStoryBtn").addEventListener("click", async () => {
            const prompt = document.getElementById("promptText").value.trim();
            if (!prompt) {
                alert("Please enhance the prompt or fill the form fields to generate a story.");
                return;
            }
            await generateStoryWithPrompt(prompt, true);
        });
    }

    // Edit Character Form Submission
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = editForm.dataset.characterId;
            const nameInput = document.getElementById("editName");
            const backstoryInput = document.getElementById("editBackstory");
            const powersInput = document.getElementById("editPowers");
            const weaknessesInput = document.getElementById("editWeaknesses");
            const fightsInput = document.getElementById("editFights");
            const imageInput = document.getElementById("editImage");
            const output = document.getElementById("output");

            const name = nameInput?.value?.trim() || "";
            const backstory = backstoryInput?.value?.trim() || "";
            const powers = powersInput?.value?.trim() || "";
            const weaknesses = weaknessesInput?.value?.trim() || "";
            const fights = fightsInput?.value?.trim() || "";

            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to edit a story.");
                return;
            }

            const requiredFields = { name, backstory, powers, weaknesses, fights };
            const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
            if (missingFields.length > 0) {
                console.error('Edit form validation failed:', missingFields);
                alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
                return;
            }

            showLoadingOverlay();

            let imageUrl = "";
            try {
                const doc = await db.collection("characters").doc(id).get();
                imageUrl = doc.data().imageUrl || "";
            } catch (err) {
                console.error("Error fetching character data:", err);
            }

            if (imageInput?.files?.length > 0) {
                const formData = new FormData();
                formData.append("file", imageInput.files[0]);
                formData.append("upload_preset", "loki_Uploads");
                try {
                    const res = await fetchWithRetry(
                        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, // Replace {your_cloud_name}
                        {
                            method: "POST",
                            body: formData,
                        },
                        3,
                        1000
                    );
                    const data = await res.json();
                    if (data.secure_url) {
                        imageUrl = data.secure_url;
                    } else {
                        throw new Error("No secure_url in Cloudinary response");
                    }
                } catch (err) {
                    console.error("Image Upload Error:", err);
                    output.innerHTML = `<p style="color:red;">Failed to upload image: ${err.message}. Proceeding with existing or no image.</p>`;
                    hideLoadingOverlay();
                }
            }

            const initialPrompt = enhancePrompt(name, backstory, powers, weaknesses, fights);
            let finalPrompt = initialPrompt;

            try {
                const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
                const response = await fetchWithRetry(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
                    },
                    3,
                    1000
                );

                const result = await response.json();
                let story = result?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!story) {
                    output.innerHTML = `<p style="color:red;">Failed to regenerate story. Try again.</p>`;
                    hideLoadingOverlay();
                    return;
                }

                const words = story.split(/\s+/).length;
                if (words > 500) {
                    story = story.split(/\s+/).slice(0, 500).join(" ") + "...";
                }

                if (typeof marked === "undefined") {
                    console.error("marked.js not loaded");
                    output.innerHTML = `<p style="color:red;">Markdown rendering failed: marked.js not loaded. Displaying raw story.</p><div class="bg-gray-900/70 p-4 rounded-lg">${story}</div>`;
                    hideLoadingOverlay();
                    return;
                }
                const renderedStory = marked.parse(story, { breaks: true, gfm: true });

                const characterData = {
                    name,
                    backstory,
                    powers,
                    weaknesses,
                    fights,
                    story,
                    imageUrl,
                    updatedAt: new Date().toISOString(),
                    isPublic: false,
                    userId: user.uid,
                };

                console.log('Updating character in Firestore:', characterData);
                try {
                    await db.collection("characters").doc(id).update(characterData);
                    console.log('Character updated with ID:', id);
                } catch (err) {
                    console.error('Firestore update error:', err);
                    output.innerHTML = `<p style="color:red;">Error updating Firestore: ${err.message}</p>`;
                    hideLoadingOverlay();
                    throw err;
                }

                const outputId = `storyOutput-${id}`;
                output.innerHTML = `
                    <div class="story-container bg-gray-900/70 p-4 rounded-lg" id="storyContainer-${outputId}">
                        <h2 class="text-2xl font-medium text-white mb-4">Updated Story for ${name} 🌟</h2>
                        ${imageUrl ? `<img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" class="story-image" crossorigin="anonymous"><br>` : ""}
                        <div id="ttsControls-${outputId}" class="tts-controls"></div>
                        <div id="storyText-${outputId}" class="markdown-content">${renderedStory}</div>
                        <div class="mt-4 flex gap-2">
                            ${!characterData.isPublic ? `<button class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded" onclick="makeStoryPublic('${id}')">Make Public 📢</button>` : `<button class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded" onclick="makeStoryPrivate('${id}')">Make Private 🔒</button>`}
                            <button class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded" onclick="generateAnotherStory()">Generate Another Story 🔄</button>
                            <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onclick="exportToPDF('${outputId}')">Export to PDF 📥</button>
                        </div>
                    </div>
                `;
                hideLoadingOverlay();
                requestAnimationFrame(() => {
                    const container = document.getElementById(`storyText-${outputId}`);
                    console.log('Post-render check for:', `storyText-${outputId}`, 'Container:', container);
                    if (container) {
                        const ttsControls = setupTTS(story, outputId);
                        document.getElementById(`ttsControls-${outputId}`).innerHTML = ttsControls;
                        requestAnimationFrame(() => {
                            console.log('Attempting to populate voice selector for:', `voiceSelect-${outputId}`);
                            populateVoiceSelector(`voiceSelect-${outputId}`);
                        });
                    } else {
                        console.error('Failed to find container after render:', `storyText-${outputId}`);
                    }
                });
                closeEditModal();
                displayCharacters();
                displayStoryCount();
            } catch (err) {
                console.error("Story Regeneration Error:", err);
                output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
                hideLoadingOverlay();
            }
        });
    }

    // Make Story Public
    window.makeStoryPublic = async function (id) {
        try {
            console.log('Making story public for ID:', id);
            await db.collection("characters").doc(id).update({ isPublic: true });
            console.log('Story made public for ID:', id);
            alert("Story is now public! 📢");
            displayCharacters();
            displayStoryCount();
            const storyContainer = document.querySelector(`#storyContainer-storyOutput-${id}, #storyContainer-modalStory-${id}`);
            if (storyContainer) {
                const publicButton = storyContainer.querySelector(`button[onclick="makeStoryPublic('${id}')"]`);
                if (publicButton) {
                    const parent = publicButton.parentElement;
                    const newButton = document.createElement('button');
                    newButton.className = 'bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded';
                    newButton.textContent = 'Make Private 🔒';
                    newButton.onclick = () => makeStoryPrivate(id);
                    parent.replaceChild(newButton, publicButton);
                }
            }

        } catch (err) {
            console.error("Error making story public:", err);
            alert("Failed to make story public.");
        }
    };

    // Make Story Private
    window.makeStoryPrivate = async function (id) {
        try {
            console.log('Making story private for ID:', id);
            await db.collection("characters").doc(id).update({ isPublic: false });
            console.log('Story made private for ID:', id);
            alert("Story is now private! 🔒");
            displayCharacters();
            displayStoryCount();
            const storyContainer = document.querySelector(`#storyContainer-storyOutput-${id}, #storyContainer-modalStory-${id}`);
            if (storyContainer) {
                const privateButton = storyContainer.querySelector(`button[onclick="makeStoryPrivate('${id}')"]`);
                if (privateButton) {
                    const parent = privateButton.parentElement;
                    const newButton = document.createElement('button');
                    newButton.className = 'bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded';
                    newButton.textContent = 'Make Public 📢';
                    newButton.onclick = () => makeStoryPublic(id);
                    parent.replaceChild(newButton, privateButton);
                }
            }

        } catch (err) {
            console.error("Error making story private:", err);
            alert("Failed to make story private.");
        }
    };

    // Generate Another Story
    window.generateAnotherStory = function () {
        document.getElementById("characterForm").reset();
        document.getElementById("imagePreview").style.display = "none";
        document.getElementById("output").innerHTML = "";
        document.getElementById("promptText").value = "";
        displayCharacters();
        console.log('Generate Another Story triggered, character list refreshed');
    };

    // Display Character Cards
    async function displayCharacters() {
        const list = document.getElementById("characterList");
        list.innerHTML = "";

        const user = auth.currentUser;
        if (!user) {
            list.innerHTML = `<p>Please log in to see your stories.</p>`;
            return;
        }

        try {
            console.log('Fetching characters for user:', user.uid);
            const snapshot = await db.collection("characters")
                .where("userId", "==", user.uid)
                .orderBy("createdAt", "desc")
                .get();
            console.log('Firestore snapshot:', snapshot.size, 'documents');

            if (snapshot.empty) {
                list.innerHTML = `<p class="col-span-3 text-center text-gray-400">You haven't created any stories yet.</p>`;
                return;
            }

            snapshot.forEach(doc => {
                const char = doc.data();
                const id = doc.id;

                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    ${char.imageUrl ? `<img src="${char.imageUrl}" alt="${char.name}">` : ""}
                    <h3 class="font-medium text-lg text-white mb-2">${char.name} 🌟</h3>
                    <p><strong>Status:</strong> <span class="${char.isPublic ? 'text-cyan-400' : 'text-gray-400'}">${char.isPublic ? 'Public' : 'Private'}</span></p>
                    <p class="text-sm text-gray-400">${char.backstory.substring(0, 80)}...</p>
                    <div class="mt-4 flex gap-2 flex-wrap justify-center">
                        <button class="view-btn bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded" onclick="viewCharacter('${id}')">📖 View</button>
                        <button class="edit-btn bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded" onclick="editCharacter('${id}')">✏️ Edit</button>
                        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onclick="deleteCharacter('${id}')">🗑️ Delete</button>
                    </div>
                `;
                list.appendChild(card);
            });
        } catch (err) {
            console.error("Load Error:", err);
            list.innerHTML = `<p style="color:red;">Error loading your stories: ${err.message}. Please check Firebase configuration.</p>`;
        }
    }

    // Edit Character
    window.editCharacter = async function (id) {
        try {
            console.log('Loading character for edit:', id);
            const doc = await db.collection("characters").doc(id).get();
            if (!doc.exists) {
                alert("Character not found.");
                return;
            }
            const char = doc.data();
            const modal = document.getElementById("editModal");
            const form = document.getElementById("editCharacterForm");
            document.getElementById("editName").value = char.name;
            document.getElementById("editBackstory").value = char.backstory;
            document.getElementById("editPowers").value = char.powers;
            document.getElementById("editWeaknesses").value = char.weaknesses;
            document.getElementById("editFights").value = char.fights;
            const imagePreview = document.getElementById("editImagePreview");
            if (char.imageUrl) {
                imagePreview.src = char.imageUrl;
                imagePreview.style.display = "block";
            } else {
                imagePreview.style.display = "none";
            }
            form.dataset.characterId = id;
            modal.style.display = "flex";
        } catch (err) {
            console.error("Error loading character for edit:", err);
            alert("Failed to load character for editing.");
        }
    };

    // Close Edit Modal
    window.closeEditModal = function () {
        document.getElementById("editModal").style.display = "none";
        document.getElementById("editCharacterForm").reset();
        document.getElementById("editImagePreview").style.display = "none";
        delete document.getElementById("editCharacterForm").dataset.characterId;
    };

    // Preview Edited Image
    window.previewEditImage = function (event) {
        const preview = document.getElementById("editImagePreview");
        preview.src = URL.createObjectURL(event.target.files[0]);
        preview.style.display = "block";
    };

    // Delete Character
    window.deleteCharacter = async function (id) {
        if (confirm("Are you sure you want to delete this story forever?")) {
            try {
                console.log('Deleting character:', id);
                await db.collection("characters").doc(id).delete();
                console.log('Character deleted:', id);
                displayCharacters();
                document.getElementById("output").innerHTML = "";
                displayStoryCount();
            } catch (err) {
                console.error("Delete Error:", err);
                alert("Failed to delete character.");
            }
        }
    };

    // View Character in Modal
    window.viewCharacter = async function (id) {
        const modal = document.getElementById("storyModal");
        const body = document.getElementById("modalBody");
        try {
            console.log('Loading character for view:', id);
            const doc = await db.collection("characters").doc(id).get();
            const char = doc.data();
            const renderedStory = typeof marked !== "undefined" ? marked.parse(char.story, { breaks: true, gfm: true }) : char.story;
            const modalId = `modalStory-${id}`;
            body.innerHTML = `
                <div class="story-container bg-gray-900/70 p-4 rounded-lg" id="storyContainer-${modalId}">
                    <h2 class="text-2xl font-medium text-white mb-4">${char.name} 🌟</h2>
                    ${char.imageUrl ? `<img src="${char.imageUrl}" style="max-width: 100%; border-radius: 8px;" class="story-image" crossorigin="anonymous"><br>` : ""}
                    <div id="ttsControls-${modalId}" class="tts-controls"></div>
                    <div id="storyText-${modalId}" class="markdown-content">${renderedStory}</div>
                    <div class="mt-4 flex gap-2">
                        ${!char.isPublic ? `<button class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded" onclick="makeStoryPublic('${id}')">Make Public 📢</button>` : `<button class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded" onclick="makeStoryPrivate('${id}')">Make Private 🔒</button>`}
                        <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onclick="exportToPDF('${modalId}')">Export to PDF 📥</button>
                    </div>
                </div>
            `;
            modal.style.display = "flex";
            requestAnimationFrame(() => {
                const container = document.getElementById(`storyText-${modalId}`);
                console.log('Post-render check for:', `storyText-${modalId}`, 'Container:', container);
                if (container) {
                    const ttsControls = setupTTS(char.story, modalId);
                    document.getElementById(`ttsControls-${modalId}`).innerHTML = ttsControls;
                    requestAnimationFrame(() => {
                        console.log('Attempting to populate voice selector for:', `voiceSelect-${modalId}`);
                        populateVoiceSelector(`voiceSelect-${modalId}`);
                    });
                } else {
                    console.error('Failed to find container after render:', `storyText-${modalId}`);
                }
            });
        } catch (err) {
            console.error("Modal Load Error:", err);
            body.innerHTML = `<p style="color:red;">Error loading story: ${err.message}</p>`;
        }
    };

    // Close Modal
    window.closeModal = function () {
        document.getElementById("storyModal").style.display = "none";
        stopTTS();
    };

    // Smooth Scroll to Form
    window.scrollToForm = function () {
        document.querySelector("#form-section").scrollIntoView({ behavior: "smooth" });
    };

    // Preview Selected Image (Create Form)
    window.previewImage = function (event) {
        const preview = document.getElementById("imagePreview");
        preview.src = URL.createObjectURL(event.target.files[0]);
        preview.style.display = "block";
    };

    // Profile Panel Toggle
    window.toggleProfilePanel = function () {
        const profilePanel = document.getElementById("profilePanel");
        profilePanel.classList.toggle("hidden");
        if (!profilePanel.classList.contains("hidden")) {
            displayStoryCount();
        }
        console.log('Profile panel toggled, story count refreshed');
    };

    // Toggle Email Display
    window.toggleEmailDisplay = function () {
        const userEmail = document.getElementById("userEmail");
        userEmail.classList.toggle("hidden");
        console.log('Email display toggled');
    };

    // Logout
    window.logout = function () {
        auth.signOut().then(() => {
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    };

    // Close profile panel when clicked outside
    document.addEventListener("click", (e) => {
        const panel = document.getElementById("profilePanel");
        const btn = document.querySelector(".contact-btn");
        if (panel && !panel.classList.contains("hidden") && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.add("hidden");
            console.log('Clicked outside, profile panel closed');
        }
    });

    // Attach event listener for edit image preview
    const editImageInput = document.getElementById("editImage");
    if (editImageInput) {
        editImageInput.addEventListener("change", window.previewEditImage);
    }

    /**
     * --- Final PDF Export Function ---
     * This version prioritizes readability by rendering the story as native PDF text,
     * which is guaranteed to be black on white. It retains the high-quality image rendering.
     */
    window.exportToPDF = async function (outputId) {
        showLoadingOverlay();
        const { jsPDF } = window.jspdf;

        if (!jsPDF) {
            console.error('jsPDF library is not loaded!');
            alert('PDF export failed because a required library (jsPDF) is missing.');
            hideLoadingOverlay();
            return;
        }

        const storyContainer = document.getElementById(`storyContainer-${outputId}`);
        const storyTextElement = document.getElementById(`storyText-${outputId}`);
        const storyImage = storyContainer.querySelector('.story-image');
        const title = storyContainer.querySelector('h2')?.textContent || 'Marvel Story';

        if (!storyContainer || !storyTextElement) {
            console.error('PDF Export Error: Could not find story elements with ID:', outputId);
            alert('Failed to export PDF: Story content could not be found.');
            hideLoadingOverlay();
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 40;
            const contentWidth = pageWidth - (margin * 2);
            let yOffset = margin;

            // 1. Add the Title
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            const splitTitle = doc.splitTextToSize(title, contentWidth);
            doc.text(splitTitle, margin, yOffset);
            yOffset += (doc.getTextDimensions(splitTitle).h) + 20;

            // 2. Add the Character Image if it exists
            if (storyImage && storyImage.src) {
                const imageCanvas = await html2canvas(storyImage, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: null
                });
                const imgData = imageCanvas.toDataURL('image/png');
                const imgProps = doc.getImageProperties(imgData);
                const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

                if (yOffset + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    yOffset = margin;
                }
                doc.addImage(imgData, 'PNG', margin, yOffset, contentWidth, imgHeight);
                yOffset += imgHeight + 20;
            }

            // 3. Add Story Text as Black, Readable Text
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); // Explicitly set text color to black

            // Using innerText is better at preserving visual line breaks than textContent
            const storyText = storyTextElement.innerText;

            const textLines = doc.splitTextToSize(storyText, contentWidth);

            // Check for page overflow before adding each line
            textLines.forEach(line => {
                const lineHeight = doc.getTextDimensions(line).h * 0.75; // Adjust line height for better spacing
                if (yOffset + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    yOffset = margin;
                }
                doc.text(line, margin, yOffset);
                yOffset += lineHeight + 4; // Add a little space between lines
            });


            // 4. Save the PDF
            doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_Story.pdf`);
            console.log('Readable PDF exported successfully for:', outputId);

        } catch (err) {
            console.error('An error occurred during readable PDF export:', err);
            alert(`Failed to export PDF. Error: ${err.message}`);
        } finally {
            hideLoadingOverlay();
        }
    };
});