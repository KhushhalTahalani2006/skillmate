// ==========================================================================
// SKILLMATE · CONSUMER PLATFORM ENGINE & SCROLL-DRIVEN STORYTELLING
// Continuous Ambient Soundscape, Canvas Storytelling Engine, 100% i18n
// ==========================================================================

// ==========================================================================
// PURE SESSION REFRESH ENGINE: ZERO STALE PERSISTENCE
// Rule: "i want the site to be refreshed everytime i open it like it should not store previous chats memories etc it should refresh completly everytime"
// ==========================================================================
try {
  localStorage.clear();
  sessionStorage.clear();
} catch (e) {}

// Defeat browser back/forward and tab suspension cache (bfcache)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

// Purge any storage on exit/navigation
window.addEventListener('beforeunload', () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}
});

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currentLang: 'en',
    currentTheme: 'skillmate-calm',
    musicPlaying: false,
    scrollProgress: 0,
    currentCategory: 'all',
    user: null // Always 100% fresh, clean visitor state on every visit / page open
  };

  // ==========================================================================
  // CONTINUOUS AMBIENT MUSIC ENGINE (Web Audio API)
  // Generative relaxing collegiate soundscape:
  // - Warm chord pads (Fmaj9 -> Cmaj7 -> Am7 -> Gsus4/D) with slow crossfades
  // - Gentle low-pass breathing filter (cutoff sweeps 400Hz - 800Hz via LFO)
  // - Soft pentatonic bell chimes (G5, A5, C6, D6, E6) every 4-7 seconds
  // - ZERO interaction sounds (clicks/hovers removed per user instruction)
  // ==========================================================================
  class AmbientMusicEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.filter = null;
      this.lfo = null;
      this.isPlaying = false;
      this.chimeInterval = null;
      this.chordInterval = null;
      this.currentChordNodes = [];
      this.chordIndex = 0;
      
      // Calming, uplifting 4-chord progression
      this.chords = [
        [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4 (Fmaj9)
        [130.81, 196.00, 246.94, 261.63, 329.63], // C3, G3, B3, C4, E4 (Cmaj7)
        [110.00, 164.81, 220.00, 261.63, 329.63], // A2, E3, A3, C4, E4 (Am7)
        [146.83, 196.00, 220.00, 293.66, 392.00]  // D3, G3, A3, D4, G4 (Gsus4/D)
      ];

      // Pentatonic chime scale (C major pentatonic high notes)
      this.chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    }

    init() {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();

      // Master Gain Node for smooth fade-in/out
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Lowpass Filter for that warm, cozy, lo-fi collegiate feel
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(520, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Gentle LFO to slowly sweep the filter (ocean breath effect)
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8-second cycle
      lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);
      this.lfo.start();

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    playChord(notes) {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const fadeTime = 2.4; // 2.4s gentle crossfade

      // Fade out previous chord nodes
      const oldNodes = this.currentChordNodes;
      this.currentChordNodes = [];
      oldNodes.forEach(({ osc1, osc2, gain }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeTime);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
              gain.disconnect();
            } catch (e) {}
          }, fadeTime * 1000 + 100);
        } catch (e) {}
      });

      // Spawn new chord oscillators
      notes.forEach((freq) => {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(freq, now);
        // Slight detune for warm chorus texture
        osc2.frequency.setValueAtTime(freq * 1.0025, now);

        // Individual note gain
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.028, now + fadeTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.filter);

        osc1.start(now);
        osc2.start(now);

        this.currentChordNodes.push({ osc1, osc2, gain });
      });
    }

    playRandomChime() {
      if (!this.ctx || !this.isPlaying) return;
      try {
        const now = this.ctx.currentTime;
        const note = this.chimeNotes[Math.floor(Math.random() * this.chimeNotes.length)];
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        // Soft bell envelope: fast rise, lingering peaceful decay
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.038, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 2.9);
      } catch (e) {}
    }

    start() {
      this.init();
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isPlaying = true;
      state.musicPlaying = true;
      const now = this.ctx.currentTime;
      
      // Master volume ~0.14 for soft ambient background
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.14, now + 1.8);

      // Play initial chord immediately
      this.playChord(this.chords[this.chordIndex]);

      // Cycle chords every 7 seconds
      clearInterval(this.chordInterval);
      this.chordInterval = setInterval(() => {
        if (!this.isPlaying) return;
        this.chordIndex = (this.chordIndex + 1) % this.chords.length;
        this.playChord(this.chords[this.chordIndex]);
      }, 7000);

      // Chimes every 3.5 - 6.5 seconds
      clearTimeout(this.chimeInterval);
      const scheduleNextChime = () => {
        if (!this.isPlaying) return;
        const delay = 3500 + Math.random() * 3000;
        this.chimeInterval = setTimeout(() => {
          this.playRandomChime();
          scheduleNextChime();
        }, delay);
      };
      scheduleNextChime();

      updateMusicBtnState(true);
      return true;
    }

    stop() {
      if (!this.isPlaying || !this.ctx) return;
      this.isPlaying = false;
      state.musicPlaying = false;
      clearInterval(this.chordInterval);
      clearTimeout(this.chimeInterval);

      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      setTimeout(() => {
        this.currentChordNodes.forEach(({ osc1, osc2, gain }) => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch (e) {}
        });
        this.currentChordNodes = [];
      }, 900);

      updateMusicBtnState(false);
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        return this.start();
      }
    }
  }

  const musicEngine = new AmbientMusicEngine();

  // Helper to sync the equalizer button UI with music state
  function updateMusicBtnState(isPlaying) {
    const musicBtn = document.getElementById('bg-music-toggle-btn') || document.getElementById('sound-toggle-btn');
    if (musicBtn) {
      musicBtn.classList.toggle('playing', isPlaying);
      musicBtn.classList.toggle('active', isPlaying);
    }
  }

  // Ambient Sound is strictly opt-in (silent by default, plays only when toggled)
  let userGestureRegistered = false;

  // Music Toggle Button Listener
  const musicToggleBtn = document.getElementById('bg-music-toggle-btn') || document.getElementById('sound-toggle-btn');
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userGestureRegistered = true;
      const playing = musicEngine.toggle();
      if (playing) {
        showToast('Ambient Music: Playing 🎵');
      } else {
        showToast('Ambient Music: Paused 🔇');
      }
    });
  }

  // ==========================================================================
  // SCROLL PROGRESS TRACKER
  // ==========================================================================
  function updateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    state.scrollProgress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // Native system cursor utilized for zero-latency, high-precision trackpad & mouse responsiveness

  // ==========================================================================
  // MULTI-LANGUAGE SYSTEM (ALL 8 INDIAN LANGUAGES)
  // ==========================================================================
  function applyLanguage(langCode) {
    if (!translations || !translations[langCode]) return;
    state.currentLang = langCode;
    localStorage.setItem('skillmate_lang', langCode);

    const dict = translations[langCode];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.setAttribute('placeholder', dict[key]);
        } else {
          el.innerHTML = dict[key];
        }
      }
    });

    document.querySelectorAll('.lang-option').forEach((opt) => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === langCode);
    });

    const langBtnText = document.getElementById('current-lang-text');
    if (langBtnText) {
      const names = {
        en: 'English (EN)',
        hi: 'हिंदी (Hindi)',
        hinglish: 'Hinglish (Gen Z)',
        bn: 'বাংলা (Bengali)',
        mr: 'मराठी (Marathi)',
        ta: 'தமிழ் (Tamil)',
        te: 'తెలుగు (Telugu)',
        kn: 'ಕನ್ನಡ (Kannada)'
      };
      langBtnText.textContent = names[langCode] || 'Language';
    }

    showToast(`Language: ${langCode.toUpperCase()}`);
  }

  // ==========================================================================
  // VIEWPORT-AWARE DROPDOWN ALIGNMENT CONTROLLER
  // Prevents dropdown popups from overflowing screen boundaries on ANY device/page
  // ==========================================================================
  function alignDropdownInViewport(panel, triggerBtn) {
    if (!panel || !triggerBtn) return;
    panel.style.marginLeft = '';
    requestAnimationFrame(() => {
      const isVisible = panel.classList.contains('show') || panel.classList.contains('open');
      if (!isVisible) return;

      const panelRect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 14;

      if (panelRect.left < padding) {
        panel.style.marginLeft = `${Math.round(padding - panelRect.left)}px`;
      } else if (panelRect.right > viewportWidth - padding) {
        panel.style.marginLeft = `-${Math.round(panelRect.right - (viewportWidth - padding))}px`;
      }
    });
  }

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langPanel = document.getElementById('lang-panel');

  if (langToggleBtn && langPanel) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willShow = !langPanel.classList.contains('show');
      langPanel.classList.toggle('show', willShow);
      const themePanel = document.getElementById('theme-panel');
      if (themePanel) themePanel.classList.remove('show');
      if (willShow) alignDropdownInViewport(langPanel, langToggleBtn);
    });

    langPanel.addEventListener('click', (e) => {
      const opt = e.target.closest('.lang-option');
      if (opt) {
        const lang = opt.getAttribute('data-lang');
        applyLanguage(lang);
        langPanel.classList.remove('show');
      }
    });
  }

  // ==========================================================================
  // THEME STUDIO CONTROLLER (COHESIVE PALETTES, ZERO GLITCHES)
  // ==========================================================================
  function applyTheme(themeName) {
    state.currentTheme = themeName;
    localStorage.setItem('skillmate_theme', themeName);

    if (themeName === 'skillmate-calm' || !themeName) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }

    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-choice') === themeName);
    });

    showToast(`Applied Theme: ${themeName}`);
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themePanel = document.getElementById('theme-panel');

  if (themeToggleBtn && themePanel) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willShow = !themePanel.classList.contains('show');
      themePanel.classList.toggle('show', willShow);
      if (langPanel) langPanel.classList.remove('show');
      if (willShow) alignDropdownInViewport(themePanel, themeToggleBtn);
    });

    themePanel.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-btn');
      if (btn) {
        const theme = btn.getAttribute('data-theme-choice');
        applyTheme(theme);
        themePanel.classList.remove('show');
      }
    });
  }

  window.addEventListener('click', () => {
    if (langPanel) langPanel.classList.remove('show');
    if (themePanel) themePanel.classList.remove('show');
  });

  window.addEventListener('resize', () => {
    if (langPanel && langPanel.classList.contains('show')) alignDropdownInViewport(langPanel, langToggleBtn);
    if (themePanel && themePanel.classList.contains('show')) alignDropdownInViewport(themePanel, themeToggleBtn);
  }, { passive: true });

  // ==========================================================================
  // CATEGORY FILTERING ON CIRCLES GRID
  // ==========================================================================
  document.querySelectorAll('.cat-pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-cat');
      state.currentCategory = cat;

      document.querySelectorAll('#circles-grid .circle-card').forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // User Joined Circles Manager for Common Group Privacy Rule
  function getUserJoinedCircles() {
    if (state.user && Array.isArray(state.user.joinedCircles) && state.user.joinedCircles.length > 0) {
      return state.user.joinedCircles;
    }
    const name = state.user ? (state.user.name || '') : '';
    let defaultCircles = ['cycling', 'football'];
    if (name.includes('Aarav')) defaultCircles = ['cycling', 'football', 'coding'];
    else if (name.includes('Riya')) defaultCircles = ['reading', 'music', 'coding'];
    else if (name.includes('Kunal')) defaultCircles = ['football', 'coding'];
    else if (name.includes('Ilma')) defaultCircles = ['reading', 'music'];
    if (state.user) {
      state.user.joinedCircles = defaultCircles;
    // In-memory session only: clean fresh state guaranteed on reload
    }
    return defaultCircles;
  }

  // Join Circle Button on Cards (Delegated for live & dynamic cards)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-join-circle');
    if (btn) {
      e.stopPropagation();

      // Guard: Do not allow joining before login. Redirect to login popup (same modal as Get Started).
      if (!state.user) {
        const circleTitle = btn.closest('.hobby-exhibit-card, .circle-card, .phone-feed-item')?.querySelector('.hobby-card-title, .circle-card-title, .phone-feed-title')?.textContent.trim() || 'Circle';
        pendingCircleToJoin = circleTitle;
        openAuthModal('join-circle', `Please sign in to join the "${circleTitle}" squad! 🎓`);
        showToast('Please sign in or create a student account to join circles! 🎓');
        return;
      }

      const cardEl = btn.closest('.circle-card, .hobby-exhibit-card, .phone-feed-item');
      let cat = cardEl?.getAttribute('data-category') || '';
      if (!cat) {
        const titleText = (cardEl?.querySelector('.circle-card-title, .hobby-card-title, .phone-feed-title')?.textContent || '').toLowerCase();
        if (titleText.includes('cycling')) cat = 'cycling';
        else if (titleText.includes('football') || titleText.includes('turf')) cat = 'football';
        else if (titleText.includes('book') || titleText.includes('reading')) cat = 'reading';
        else if (titleText.includes('music') || titleText.includes('jam')) cat = 'music';
        else if (titleText.includes('code') || titleText.includes('hack')) cat = 'coding';
        else cat = 'cycling';
      }

      const isJoined = btn.classList.contains('joined');
      const userCircles = getUserJoinedCircles();

      if (!isJoined) {
        btn.classList.add('joined');
        btn.textContent = 'Joined! ✓';
        if (cat && !userCircles.includes(cat)) {
          userCircles.push(cat);
          state.user.joinedCircles = userCircles;
    // In-memory session only: clean fresh state guaranteed on reload
        }
        showToast('Joined Circle! Connecting to Campus Group Chat...');
      } else {
        btn.classList.remove('joined');
        btn.textContent = 'Join Circle';
        if (cat) {
          state.user.joinedCircles = userCircles.filter(c => c !== cat);
    // In-memory session only: clean fresh state guaranteed on reload
        }
        showToast('Left Circle.');
      }

      if (typeof applyMemoriesPrivacyFilter === 'function') {
        applyMemoriesPrivacyFilter();
      }
    }
  });

  // Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // ==========================================================================
  // FAQ ACCORDION
  // ==========================================================================
  document.querySelectorAll('.faq-question-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ==========================================================================
  // HOST A CIRCLE MODAL
  // ==========================================================================
  const hostModal = document.getElementById('host-modal');
  const openHostBtns = document.querySelectorAll('.open-host-modal');
  const closeHostBtn = document.getElementById('close-host-modal');
  const cancelHostBtn = document.getElementById('cancel-host-modal');
  const hostForm = document.getElementById('host-circle-form');

  openHostBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!state.user) {
        openAuthModal('create-circle', 'Please sign in or create an account to host a circle! 🎓');
        showToast('Please sign in or create an account to host a circle! 🎓');
        return;
      }
      if (hostModal) hostModal.classList.add('open');
    });
  });

  function closeHostModal() {
    if (hostModal) hostModal.classList.remove('open');
  }

  if (closeHostBtn) closeHostBtn.addEventListener('click', closeHostModal);
  if (cancelHostBtn) cancelHostBtn.addEventListener('click', closeHostModal);

  if (hostForm) {
    hostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-circle-name').value.trim();
      const cat = document.getElementById('new-circle-cat').value;
      const venue = document.getElementById('new-circle-venue').value.trim();

      if (!name || !venue) return;

      // Create new circle card live
      const circlesGrid = document.getElementById('circles-grid');
      if (circlesGrid) {
        const newCard = document.createElement('div');
        newCard.className = 'circle-card';
        newCard.setAttribute('data-category', cat);
        newCard.innerHTML = `
          <img src="assets/images/coding-indian.jpg" alt="${name}" class="circle-card-thumb">
          <div class="circle-card-body">
            <div class="circle-tag-row">
              <span class="craft-tag">✨ ${cat.toUpperCase()}</span>
              <span class="spots-badge">Just Created · Spots Open</span>
            </div>
            <h4 class="circle-card-title">${name}</h4>
            <div class="circle-card-meta">Upcoming · ${venue}</div>
            <p class="circle-card-desc">Newly published campus circle. Join to connect with verified members.</p>
            <div class="circle-card-footer">
              <div class="host-info">
                <div class="host-avatar">YOU</div>
                <span>Hosted by You (Verified)</span>
              </div>
              <button class="btn-join-circle joined">Joined! ✓</button>
            </div>
          </div>
        `;
        circlesGrid.prepend(newCard);
      }

      closeHostModal();
      hostForm.reset();
      showToast(`🎉 Published "${name}" live to Campus Feed!`);
    });
  }

  // Toast Notice
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="color:var(--accent-primary); font-size:1.1rem;">✨</span> <span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ==========================================================================
  // PHONE MOCKUP INTERACTIVE TAB SWITCHER (CIRCLES, RADAR, SQUAD)
  // ==========================================================================
  const phoneTabBtns = document.querySelectorAll('.phone-tab-btn');
  phoneTabBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetTab = btn.getAttribute('data-phone-tab');
      phoneTabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.phone-tab-content').forEach((pane) => {
        pane.classList.remove('active');
      });
      const targetPane = document.getElementById(`phone-pane-${targetTab}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Squad Tab Wave Interaction
  document.addEventListener('click', (e) => {
    const waveBtn = e.target.closest('.squad-wave-btn');
    if (waveBtn) {
      e.stopPropagation();
      const memberRow = waveBtn.closest('.squad-member-row');
      const name = memberRow ? memberRow.querySelector('.squad-name').textContent.trim() : 'Friend';
      waveBtn.textContent = 'Waved! ✨';
      showToast(`Waved to ${name}! 👋`);
      setTimeout(() => { waveBtn.textContent = 'Wave 👋'; }, 2000);
    }
  });

  // ==========================================================================
  // DYNAMIC 3D TILT PHYSICS & CURSOR SPOTLIGHT ENGINE
  // ==========================================================================
  const tiltElements = document.querySelectorAll(
    '.circle-card, .team-card-3d, .safety-card-box, .step-box, .hero-floating-badge'
  );

  tiltElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update spotlight CSS vars
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);

      // 3D tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    });
  });

  // Hero Phone Mockup 3D Cursor Parallax
  const phoneContainer = document.querySelector('.hero-phone-container');
  const phoneMockup = document.getElementById('interactive-phone-mockup');
  if (phoneContainer && phoneMockup) {
    phoneContainer.addEventListener('mousemove', (e) => {
      const rect = phoneContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      phoneMockup.style.transform = `perspective(1200px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateY(-6px) scale(1.01)`;
    });
    phoneContainer.addEventListener('mouseleave', () => {
      phoneMockup.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)';
    });
  }

  // ==========================================================================
  // ==========================================================================
  // SCROLL-LOCK UTILITIES FOR MODALS & POPUPS
  // Prevents background page from scrolling while any modal/popup is open
  // ==========================================================================
  function lockBodyScroll() {
    document.body.classList.add('modal-scroll-locked');
  }

  function unlockBodyScroll() {
    setTimeout(() => {
      const openModals = document.querySelectorAll('.modal-backdrop.open');
      if (openModals.length === 0) {
        document.body.classList.remove('modal-scroll-locked');
        document.documentElement.classList.remove('lenis-stopped');
      }
    }, 40);
  }

  // ==========================================================================
  // INTERACTIVE CIRCLE QUICK INTEL & RSVP MODAL
  // ==========================================================================
  const intelModal = document.getElementById('circle-detail-modal');
  const closeIntelBtn = document.getElementById('close-intel-modal');
  const intelJoinBtn = document.getElementById('intel-join-btn');
  const intelShareBtn = document.getElementById('intel-share-btn');

  function openCircleQuickIntelModal(data) {
    if (!intelModal) return;
    const titleEl = document.getElementById('intel-title');
    const catEl = document.getElementById('intel-category');
    const metaEl = document.getElementById('intel-meta');
    const descEl = document.getElementById('intel-desc');
    const imgEl = document.getElementById('intel-img');
    const venueEl = document.getElementById('intel-venue-title');
    const hostEl = document.getElementById('intel-host-name');

    if (titleEl) titleEl.textContent = data.title;
    if (catEl) catEl.textContent = data.cat;
    if (metaEl) metaEl.textContent = data.meta;
    if (descEl) descEl.textContent = data.desc;
    if (imgEl && data.img) imgEl.src = data.img;
    if (venueEl) venueEl.textContent = data.venue;
    if (hostEl) hostEl.textContent = data.host;

    if (intelJoinBtn) {
      intelJoinBtn.textContent = 'Join & RSVP Now ✨';
      intelJoinBtn.classList.remove('joined');
    }

    intelModal.classList.add('open');
    lockBodyScroll();
  }

  document.querySelectorAll('.circle-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      // Ignore if clicking the direct join button on the card
      if (e.target.closest('.btn-join-circle')) return;

      const title = card.getAttribute('data-circle-title') || card.querySelector('.circle-card-title')?.textContent;
      const cat = card.getAttribute('data-circle-category') || card.querySelector('.craft-tag')?.textContent;
      const meta = card.getAttribute('data-circle-meta') || card.querySelector('.circle-card-meta')?.textContent;
      const desc = card.getAttribute('data-circle-desc') || card.querySelector('.circle-card-desc')?.textContent;
      const img = card.getAttribute('data-circle-img') || card.querySelector('.circle-card-thumb')?.src;
      const venue = card.getAttribute('data-circle-venue') || 'Campus Verified Venue';
      const host = card.getAttribute('data-circle-host') || 'Verified Campus Student';

      openCircleQuickIntelModal({ title, cat, meta, desc, img, venue, host });
    });
  });

  // Wire up hero clickable preview cards and badges
  const heroCardCycling = document.getElementById('hero-card-cycling');
  if (heroCardCycling) {
    heroCardCycling.addEventListener('click', () => {
      openCircleQuickIntelModal({
        title: 'Sunday Sunrise Cycling & Chai',
        cat: '🚲 CYCLING & OUTDOORS',
        meta: 'Sun · 6:00 AM · Gomti Riverfront Promenade (3.2 km)',
        desc: 'Calm 18km riverfront cruise followed by hot kulhad chai. Pace: Intermediate (all bikes welcome).',
        img: 'assets/images/cycling-indian.jpg',
        venue: 'Gomti Riverfront Promenade, Lucknow',
        host: 'Kishan S. (Founding Host)'
      });
    });
  }

  const heroCardFootball = document.getElementById('hero-card-football');
  if (heroCardFootball) {
    heroCardFootball.addEventListener('click', () => {
      openCircleQuickIntelModal({
        title: 'Friday Night 5v5 Turf Football',
        cat: '⚽ TURF SPORTS',
        meta: 'Fri · 7:30 PM · Campus Sports Turf (0.8 km)',
        desc: 'Friendly fast-paced match under floodlights. Clean game, colored bibs provided. All skill levels welcome.',
        img: 'assets/images/football-indian.jpg',
        venue: 'Campus Sports Turf, Lucknow',
        host: 'Kunal S. (Student Regular)'
      });
    });
  }

  const heroPillLive = document.getElementById('hero-pill-live');
  if (heroPillLive) {
    heroPillLive.addEventListener('click', () => {
      const disc = document.getElementById('chapter-discovery');
      if (disc) disc.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const heroPillSafety = document.getElementById('hero-pill-safety');
  if (heroPillSafety) {
    heroPillSafety.addEventListener('click', () => {
      const safetySec = document.getElementById('safety');
      if (safetySec) safetySec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Top Nav Sign In Button
  const btnNavSignin = document.getElementById('btn-nav-signin');
  if (btnNavSignin) {
    btnNavSignin.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('create-circle', 'Welcome back! Sign in to access your campus circles. 🎓');
    });
  }

  // Hero Instant Discovery Console
  const heroSearchInput = document.getElementById('hero-discovery-input');
  const heroZoneSelect = document.getElementById('hero-discovery-zone');
  const btnHeroFind = document.getElementById('btn-hero-find-circles');

  function handleHeroSearch() {
    const query = heroSearchInput ? heroSearchInput.value.trim().toLowerCase() : '';
    const zone = heroZoneSelect ? heroZoneSelect.value.toLowerCase() : 'all';

    const discoverySec = document.getElementById('chapter-discovery');
    if (discoverySec) {
      discoverySec.scrollIntoView({ behavior: 'smooth' });
    }

    let matchCount = 0;
    document.querySelectorAll('.hobby-exhibit-card').forEach(card => {
      const cardText = card.textContent.toLowerCase();
      const cardCat = card.getAttribute('data-category') || '';

      const queryMatch = !query || cardText.includes(query) || cardCat.includes(query);
      const zoneMatch = zone === 'all' || cardText.includes(zone);

      if (queryMatch && zoneMatch) {
        card.style.display = '';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (query) {
      showToast(`Found ${matchCount} circle${matchCount === 1 ? '' : 's'} for "${query}" ✨`);
    } else {
      showToast('Showing campus circles nearby 🎯');
    }
  }

  if (btnHeroFind) {
    btnHeroFind.addEventListener('click', handleHeroSearch);
  }
  if (heroSearchInput) {
    heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleHeroSearch();
      }
    });
  }

  // Hero Trending Pills
  document.querySelectorAll('.hero-trend-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-trend-category');

      document.querySelectorAll('.craft-filter-pill').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === cat);
      });

      document.querySelectorAll('.hobby-exhibit-card').forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      const discoverySec = document.getElementById('chapter-discovery');
      if (discoverySec) {
        discoverySec.scrollIntoView({ behavior: 'smooth' });
      }

      showToast(`Showing ${pill.textContent.trim()} circles ✨`);
    });
  });

  // Open Frictionless Discovery: Clicking any card in Chapter 03 opens Quick Intel Modal
  document.querySelectorAll('.hobby-exhibit-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-join-circle, .hobby-btn-join')) return;

      const title = card.querySelector('.hobby-card-title')?.textContent.trim() || 'Campus Circle';
      const category = card.querySelector('.hobby-card-badge-top')?.textContent.trim() || 'Hobby';
      const meta = card.querySelector('.hobby-card-meta')?.textContent.trim() || 'This Week';
      const desc = card.querySelector('.hobby-card-desc')?.textContent.trim() || '';
      const distance = card.querySelector('.hobby-card-distance')?.textContent.trim() || 'Campus Zone';
      const spots = card.querySelector('.hobby-spots-indicator')?.textContent.trim() || 'Open Circle';
      const img = card.querySelector('.hobby-card-img')?.src || 'assets/images/cycling-indian.jpg';

      openCircleQuickIntelModal({
        title: title,
        cat: category,
        meta: `${meta} · ${spots}`,
        desc: desc,
        venue: distance.includes('KM') ? `Verified Public Campus Venue (${distance})` : distance,
        host: 'Founding Host · Verified Student 🎓',
        img: img
      });
    });
  });

  if (closeIntelBtn && intelModal) {
    closeIntelBtn.addEventListener('click', () => {
      intelModal.classList.remove('open');
      unlockBodyScroll();
    });
  }

  if (intelModal) {
    intelModal.addEventListener('click', (e) => {
      if (e.target === intelModal) {
        intelModal.classList.remove('open');
        unlockBodyScroll();
      }
    });
  }

  if (intelJoinBtn) {
    intelJoinBtn.addEventListener('click', () => {
      if (!state.user) {
        if (intelModal) {
          intelModal.classList.remove('open');
          unlockBodyScroll();
        }
        const circleTitle = document.getElementById('intel-title')?.textContent.trim() || 'Circle';
        pendingCircleToJoin = circleTitle;
        openAuthModal('join-circle', `Please sign in to RSVP for "${circleTitle}"! 🎓`);
        showToast('Please sign in or create a student account to RSVP for circles! 🎓');
        return;
      }
      const circleCategory = (document.getElementById('intel-category')?.textContent || '').toLowerCase();
      let cat = 'cycling';
      if (circleCategory.includes('football')) cat = 'football';
      else if (circleCategory.includes('book') || circleCategory.includes('reading')) cat = 'reading';
      else if (circleCategory.includes('music') || circleCategory.includes('jam')) cat = 'music';
      else if (circleCategory.includes('code') || circleCategory.includes('hack')) cat = 'coding';
      else if (circleCategory.includes('cycling')) cat = 'cycling';

      const userCircles = getUserJoinedCircles();
      const isJoined = intelJoinBtn.classList.contains('joined');
      if (!isJoined) {
        intelJoinBtn.classList.add('joined');
        intelJoinBtn.textContent = 'RSVP Confirmed! ✓';
        if (cat && !userCircles.includes(cat)) {
          userCircles.push(cat);
          state.user.joinedCircles = userCircles;
    // In-memory session only: clean fresh state guaranteed on reload
        }
        showToast('RSVP Confirmed! You are in the circle squad ✨');
      } else {
        intelJoinBtn.classList.remove('joined');
        intelJoinBtn.textContent = 'Join & RSVP Now ✨';
        if (cat) {
          state.user.joinedCircles = userCircles.filter(c => c !== cat);
    // In-memory session only: clean fresh state guaranteed on reload
        }
        showToast('RSVP Cancelled.');
      }

      if (typeof applyMemoriesPrivacyFilter === 'function') {
        applyMemoriesPrivacyFilter();
      }
    });
  }

  if (intelShareBtn) {
    intelShareBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      showToast('Invite link copied to clipboard! 📋');
    });
  }

  // ==========================================================================
  // AUTHENTICATION & STUDENT APP VIEW CONTROLLER
  // ==========================================================================
  const authModal = document.getElementById('auth-modal');
  const closeAuthBtn = document.getElementById('close-auth-modal');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const loginForm = document.getElementById('auth-login-form');
  const signupForm = document.getElementById('auth-signup-form');
  const btnGoogleAuth = document.getElementById('btn-google-auth');

  const viewPublicLanding = document.getElementById('view-public-landing');
  const viewStudentApp = document.getElementById('view-student-app');
  const appUserAvatar = document.getElementById('app-user-avatar');
  const appUserName = document.getElementById('app-user-name');
  const appUserRole = document.getElementById('app-user-role');
  const btnStudentLogout = document.getElementById('btn-student-logout');

  let pendingNavigationTarget = null;
  let pendingCircleToJoin = null;

  function updateAuthUI() {
    if (state.user) {
      if (viewPublicLanding) viewPublicLanding.style.display = 'none';
      if (viewStudentApp) viewStudentApp.style.display = 'block';
      if (appUserName) appUserName.textContent = state.user.name;
      if (appUserAvatar) appUserAvatar.textContent = state.user.initials || 'ME';
      if (appUserRole) appUserRole.textContent = state.user.role || 'Verified Student ✓';

      // Update create preview host
      const previewHost = document.getElementById('preview-card-host');
      const previewAvatar = document.getElementById('preview-card-avatar');
      if (previewHost) previewHost.textContent = `Hosted by ${state.user.name} (Verified)`;
      if (previewAvatar) previewAvatar.textContent = state.user.initials || 'YOU';

      // Ensure all scroll lock classes are cleared when student app is active
      document.documentElement.classList.remove('lenis-stopped');
      document.body.classList.remove('modal-scroll-locked');

      // Clean start: Starts strictly at student header, landing & footer hidden
      window.scrollTo(0, 0);

      if (typeof applyMemoriesPrivacyFilter === 'function') {
        applyMemoriesPrivacyFilter();
      }
    } else {
      if (viewStudentApp) viewStudentApp.style.display = 'none';
      if (viewPublicLanding) viewPublicLanding.style.display = 'block';

      // Resume Lenis smooth scrolling on public marketing landing page
      if (window.__skillmateLenis) {
        window.__skillmateLenis.start();
      }
    }
  }

  const authLoginView = document.getElementById('auth-login-view') || loginForm;
  const authSignupView = document.getElementById('auth-signup-view') || signupForm;

  function openAuthModal(targetTab = 'join-circle', customSub = null) {
    pendingNavigationTarget = targetTab;
    const authSub = document.getElementById('auth-modal-subtitle');
    if (authSub) {
      if (customSub) {
        authSub.textContent = customSub;
      } else if (targetTab === 'create-circle') {
        authSub.textContent = 'Sign in or create a student account to host circles & publish meetups.';
      } else {
        authSub.textContent = 'Connect with student circles, vetted meetups, and real hobby groups across campus.';
      }
    }
    if (tabLoginBtn && tabSignupBtn && authLoginView && authSignupView) {
      tabLoginBtn.classList.add('active');
      tabSignupBtn.classList.remove('active');
      authLoginView.style.display = 'block';
      authSignupView.style.display = 'none';
    }
    if (authModal) {
      authModal.classList.add('open');
      lockBodyScroll();
    }
  }

  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('open');
      unlockBodyScroll();
    }
  }

  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', closeAuthModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Bind All "Get Started" Buttons (Hero and Banner)
  document.querySelectorAll('.btn-hero-get-started, #btn-hero-get-started, #btn-banner-get-started').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('create-circle');
    });
  });

  // Seamless Switch between Login and Signup Wizard
  const btnSwitchToSignup = document.getElementById('btn-switch-to-signup');
  const btnSignupBackToLogin = document.getElementById('btn-signup-back-to-login');

  if (btnSwitchToSignup) {
    btnSwitchToSignup.addEventListener('click', () => {
      if (authLoginView) authLoginView.style.display = 'none';
      if (authSignupView) authSignupView.style.display = 'block';
      goToSignupStage(1);
    });
  }

  if (btnSignupBackToLogin) {
    btnSignupBackToLogin.addEventListener('click', () => {
      if (authSignupView) authSignupView.style.display = 'none';
      if (authLoginView) authLoginView.style.display = 'block';
    });
  }

  // Auth Tabs Switching (for backward compatibility if triggered)
  if (tabLoginBtn && tabSignupBtn) {
    tabLoginBtn.addEventListener('click', () => {
      tabLoginBtn.classList.add('active');
      tabSignupBtn.classList.remove('active');
      if (authLoginView) authLoginView.style.display = 'block';
      if (authSignupView) authSignupView.style.display = 'none';
    });

    tabSignupBtn.addEventListener('click', () => {
      tabSignupBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      if (authSignupView) authSignupView.style.display = 'block';
      if (authLoginView) authLoginView.style.display = 'none';
      goToSignupStage(1);
    });
  }

  // ==========================================================================
  // PROGRESSIVE DISCLOSURE SIGNUP STEPPER (4 STAGES)
  // ==========================================================================
  function goToSignupStage(stage) {
    for (let s = 1; s <= 4; s++) {
      const panel = document.getElementById(`signup-stage-${s}`);
      const dot = document.querySelector(`.stepper-dot[data-signup-step="${s}"]`);
      if (panel) {
        panel.style.display = s === stage ? 'block' : 'none';
        if (s === stage) panel.classList.add('active');
        else panel.classList.remove('active');
      }
      if (dot) {
        if (s === stage) {
          dot.classList.add('active');
          dot.classList.remove('completed');
        } else if (s < stage) {
          dot.classList.remove('active');
          dot.classList.add('completed');
        } else {
          dot.classList.remove('active');
          dot.classList.remove('completed');
        }
      }
    }
    const fill = document.getElementById('signup-progress-fill');
    if (fill) fill.style.width = `${stage * 25}%`;
  }

  const btnSignupStep1Next = document.getElementById('btn-signup-step1-next');
  const btnSignupStep2Back = document.getElementById('btn-signup-step2-back');
  const btnSignupStep2Next = document.getElementById('btn-signup-step2-next');
  const btnSignupStep3Back = document.getElementById('btn-signup-step3-back');
  const btnSignupStep3Next = document.getElementById('btn-signup-step3-next');
  const btnSignupStep4Back = document.getElementById('btn-signup-step4-back');

  if (btnSignupStep1Next) {
    btnSignupStep1Next.addEventListener('click', () => {
      const sName = document.getElementById('signup-name');
      const sEmail = document.getElementById('signup-email');
      if (!sName || !sName.value.trim()) {
        showToast('⚠️ Please enter your full name.');
        sName?.focus();
        return;
      }
      if (!sEmail || !sEmail.value.trim()) {
        showToast('⚠️ Please enter your campus email ID.');
        sEmail?.focus();
        return;
      }
      goToSignupStage(2);
    });
  }

  if (btnSignupStep2Back) btnSignupStep2Back.addEventListener('click', () => goToSignupStage(1));
  if (btnSignupStep2Next) btnSignupStep2Next.addEventListener('click', () => goToSignupStage(3));
  if (btnSignupStep3Back) btnSignupStep3Back.addEventListener('click', () => goToSignupStage(2));
  if (btnSignupStep3Next) {
    btnSignupStep3Next.addEventListener('click', () => {
      const nameVal = document.getElementById('signup-name')?.value.trim() || 'Aarav Patel';
      const emailVal = document.getElementById('signup-email')?.value.trim() || 'aarav.patel@gmail.com';
      const batchVal = document.getElementById('signup-batch')?.value.trim() || 'Campus Student';
      const hobbiesCount = document.querySelectorAll('#signup-hobbies-container .hobby-chip-btn.active').length;
      const initials = nameVal.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

      const snapAvatar = document.getElementById('signup-snapshot-avatar');
      const snapName = document.getElementById('signup-snapshot-name');
      const snapEmail = document.getElementById('signup-snapshot-email');
      const snapMeta = document.getElementById('signup-snapshot-meta');
      if (snapAvatar) snapAvatar.textContent = initials;
      if (snapName) snapName.textContent = nameVal;
      if (snapEmail) snapEmail.textContent = emailVal;
      if (snapMeta) snapMeta.textContent = `${batchVal} · Hobbies Selected: ${hobbiesCount}`;

      goToSignupStage(4);
    });
  }
  if (btnSignupStep4Back) btnSignupStep4Back.addEventListener('click', () => goToSignupStage(3));

  document.querySelectorAll('.stepper-dot[data-signup-step]').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetStep = parseInt(dot.getAttribute('data-signup-step'), 10);
      goToSignupStage(targetStep);
    });
  });

  // Interactive Hobby Chips Selector in Signup
  document.querySelectorAll('#signup-hobbies-container .hobby-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
    });
  });

  // ==========================================================================
  // AUTHENTIC GOOGLE ACCOUNT CHOOSER (SAVED DEVICE ACCOUNTS)
  // ==========================================================================
  const googleChooserModal = document.getElementById('google-account-chooser-modal');
  const closeGoogleChooserBtn = document.getElementById('close-google-chooser-modal');

  function openGoogleChooserModal() {
    if (googleChooserModal) {
      googleChooserModal.classList.add('open');
      lockBodyScroll();
    }
  }

  function closeGoogleChooserModal() {
    if (googleChooserModal) {
      googleChooserModal.classList.remove('open');
      unlockBodyScroll();
    }
  }

  if (btnGoogleAuth) {
    btnGoogleAuth.addEventListener('click', (e) => {
      e.preventDefault();
      openGoogleChooserModal();
    });
  }

  if (closeGoogleChooserBtn) {
    closeGoogleChooserBtn.addEventListener('click', closeGoogleChooserModal);
  }

  if (googleChooserModal) {
    googleChooserModal.addEventListener('click', (e) => {
      if (e.target === googleChooserModal) closeGoogleChooserModal();
    });
  }

  const GOOGLE_DEVICE_ACCOUNTS = {
    aarav: {
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      initials: 'AP',
      role: 'Verified Google Student ✓',
      branch: 'B.Tech CSE, 2nd Year',
      hostel: 'Hostel Block B',
      hobbies: ['cycling', 'football', 'coding'],
      bio: 'Tech enthusiast, morning cyclist & 5v5 midfielder'
    },
    kishan: {
      name: 'Kishan Shrivastava',
      email: 'kishan.shrivastava@gmail.com',
      initials: 'KS',
      role: 'Class Lead · CSE',
      branch: 'B.Tech CSE, 3rd Year',
      hostel: 'Hostel Block A',
      hobbies: ['cycling', 'football'],
      bio: 'Campus coordinator & weekend cyclist'
    },
    riya: {
      name: 'Riya Verma',
      email: 'riya.verma@gmail.com',
      initials: 'RV',
      role: '1st Year Student',
      branch: 'B.Tech AI/ML, 1st Year',
      hostel: 'Hostel Block C',
      hobbies: ['reading', 'music', 'coding'],
      bio: 'Acoustic jam lover & AI enthusiast'
    }
  };

  document.querySelectorAll('.google-account-item[data-google-user]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userKey = btn.getAttribute('data-google-user');
      const selectedProfile = GOOGLE_DEVICE_ACCOUNTS[userKey] || GOOGLE_DEVICE_ACCOUNTS.aarav;
      state.user = { ...selectedProfile };
    // In-memory session only: clean fresh state guaranteed on reload
      updateAuthUI();
      closeGoogleChooserModal();
      closeAuthModal();
      if (pendingCircleToJoin) {
        showToast(`Signed in! Joined "${pendingCircleToJoin}" circle squad! 🚀`);
        pendingCircleToJoin = null;
      } else {
        showToast(`Signed in with Google ID: ${state.user.name} ✨`);
      }

      const dest = pendingNavigationTarget || 'join-circle';
      pendingNavigationTarget = null;
      switchStudentTab(dest);
    });
  });

  const btnGoogleUseAnother = document.getElementById('btn-google-use-another');
  if (btnGoogleUseAnother) {
    btnGoogleUseAnother.addEventListener('click', () => {
      const promptEmail = prompt('Enter your Google Account email:', 'student.google@gmail.com');
      if (promptEmail) {
        const cleanName = promptEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
        state.user = {
          name: cleanName,
          email: promptEmail,
          initials: initials,
          role: 'Verified Google Student ✓',
          branch: 'Campus Student',
          hostel: 'Campus Hostels',
          hobbies: ['cycling', 'reading'],
          bio: 'SkillMate campus peer'
        };
    // In-memory session only: clean fresh state guaranteed on reload
        updateAuthUI();
        closeGoogleChooserModal();
        closeAuthModal();
        if (pendingCircleToJoin) {
          showToast(`Signed in! Joined "${pendingCircleToJoin}" circle squad! 🚀`);
          pendingCircleToJoin = null;
        } else {
          showToast(`Signed in with Google: ${state.user.name} ✨`);
        }
        const dest = pendingNavigationTarget || 'join-circle';
        pendingNavigationTarget = null;
        switchStudentTab(dest);
      }
    });
  }

  // 1-Tap Demo Quick Pills
  document.querySelectorAll('.btn-demo-pill, .btn-demo-login').forEach(btn => {
    btn.addEventListener('click', () => {
      const demoType = btn.getAttribute('data-demo-user');
      if (demoType === 'kishan') {
        state.user = {
          name: 'Kishan Shrivastava',
          email: 'kishan.shrivastava@gmail.com',
          initials: 'KS',
          role: 'Class Lead · CSE',
          branch: 'B.Tech CSE, 3rd Year',
          hostel: 'Hostel Block A',
          hobbies: ['cycling', 'football'],
          bio: 'Class Coordinator & Weekend Cyclist'
        };
      } else {
        state.user = {
          name: 'Riya Verma',
          email: 'riya.verma@gmail.com',
          initials: 'RV',
          role: '1st Year Student',
          branch: 'B.Tech AI/ML, 1st Year',
          hostel: 'Hostel Block C',
          hobbies: ['reading', 'music', 'coding'],
          bio: 'Acoustic jam lover & Speculative fiction reader'
        };
      }
    // In-memory session only: clean fresh state guaranteed on reload
      updateAuthUI();
      closeAuthModal();
      if (pendingCircleToJoin) {
        showToast(`Welcome ${state.user.name}! Joined "${pendingCircleToJoin}" circle squad! 🚀`);
        pendingCircleToJoin = null;
      } else {
        showToast(`Welcome, ${state.user.name}! Student App unlocked ✨`);
      }

      const dest = pendingNavigationTarget || 'join-circle';
      pendingNavigationTarget = null;
      switchStudentTab(dest);
    });
  });

  // Login Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
      
      state.user = {
        name: name,
        email: email,
        initials: initials,
        role: 'Verified Student ✓',
        branch: 'Campus Student',
        hostel: 'Campus Hostels',
        hobbies: ['cycling', 'reading'],
        bio: 'SkillMate campus peer'
      };
    // In-memory session only: clean fresh state guaranteed on reload
      updateAuthUI();
      closeAuthModal();
      if (pendingCircleToJoin) {
        showToast(`Signed in! Joined "${pendingCircleToJoin}" circle squad! 🚀`);
        pendingCircleToJoin = null;
      } else {
        showToast(`Signed in successfully as ${state.user.name} 🚀`);
      }

      const dest = pendingNavigationTarget || 'join-circle';
      pendingNavigationTarget = null;
      switchStudentTab(dest);
    });
  }

  // Signup Form Submit (Captures all student details from 4-step wizard)
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const batch = document.getElementById('signup-batch').value;
      const hostel = document.getElementById('signup-hostel')?.value || 'Campus Resident';
      const bio = document.getElementById('signup-bio')?.value || '';
      const selectedHobbies = Array.from(document.querySelectorAll('#signup-hobbies-container .hobby-chip-btn.active'))
        .map(b => b.getAttribute('data-hobby') || b.textContent.trim());
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

      state.user = {
        name: name,
        email: email,
        initials: initials,
        role: batch || 'Verified Student ✓',
        branch: batch,
        hostel: hostel,
        hobbies: selectedHobbies,
        bio: bio
      };
    // In-memory session only: clean fresh state guaranteed on reload
      updateAuthUI();
      closeAuthModal();
      if (pendingCircleToJoin) {
        showToast(`Welcome ${state.user.name}! Joined "${pendingCircleToJoin}" circle squad! 🚀`);
        pendingCircleToJoin = null;
      } else {
        showToast(`Welcome to SkillMate, ${state.user.name}! Your student ID is verified ✨`);
      }

      const dest = pendingNavigationTarget || 'join-circle';
      pendingNavigationTarget = null;
      switchStudentTab(dest);
    });
  }

  // ==========================================================================
  // EDIT STUDENT PROFILE MODAL CONTROLLER
  // ==========================================================================
  const editProfileModal = document.getElementById('edit-profile-modal');
  const btnOpenEditProfile = document.getElementById('btn-open-edit-profile');
  const btnProfilePill = document.getElementById('btn-profile-pill');
  const closeEditProfileModalBtn = document.getElementById('close-edit-profile-modal');
  const btnCancelEditProfile = document.getElementById('btn-cancel-edit-profile');
  const editProfileForm = document.getElementById('edit-profile-form');

  function openEditProfileModal() {
    if (!state.user) {
      openAuthModal();
      return;
    }
    const nameInput = document.getElementById('edit-profile-name');
    const emailInput = document.getElementById('edit-profile-email');
    const batchInput = document.getElementById('edit-profile-batch');
    const hostelInput = document.getElementById('edit-profile-hostel');
    const bioInput = document.getElementById('edit-profile-bio');

    if (nameInput) nameInput.value = state.user.name || '';
    if (emailInput) emailInput.value = state.user.email || '';
    if (batchInput) batchInput.value = state.user.branch || state.user.role || '';
    if (hostelInput) hostelInput.value = state.user.hostel || '';
    if (bioInput) bioInput.value = state.user.bio || '';

    const userHobbies = state.user.hobbies || [];
    document.querySelectorAll('#edit-profile-hobbies-container .hobby-chip-btn').forEach(chip => {
      const hobbyKey = chip.getAttribute('data-hobby');
      if (userHobbies.includes(hobbyKey)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    if (editProfileModal) {
      editProfileModal.classList.add('open');
      lockBodyScroll();
    }
  }

  function closeEditProfileModal() {
    if (editProfileModal) {
      editProfileModal.classList.remove('open');
      unlockBodyScroll();
    }
  }

  if (btnOpenEditProfile) btnOpenEditProfile.addEventListener('click', openEditProfileModal);
  if (btnProfilePill) btnProfilePill.addEventListener('click', openEditProfileModal);
  if (closeEditProfileModalBtn) closeEditProfileModalBtn.addEventListener('click', closeEditProfileModal);
  if (btnCancelEditProfile) btnCancelEditProfile.addEventListener('click', closeEditProfileModal);
  if (editProfileModal) {
    editProfileModal.addEventListener('click', (e) => {
      if (e.target === editProfileModal) closeEditProfileModal();
    });
  }

  document.querySelectorAll('#edit-profile-hobbies-container .hobby-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
    });
  });

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('edit-profile-name').value.trim();
      const newEmail = document.getElementById('edit-profile-email').value.trim();
      const newBatch = document.getElementById('edit-profile-batch').value.trim();
      const newHostel = document.getElementById('edit-profile-hostel').value.trim();
      const newBio = document.getElementById('edit-profile-bio').value.trim();
      const newHobbies = Array.from(document.querySelectorAll('#edit-profile-hobbies-container .hobby-chip-btn.active'))
        .map(b => b.getAttribute('data-hobby'));
      const newInitials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

      state.user = {
        ...state.user,
        name: newName,
        email: newEmail,
        initials: newInitials,
        branch: newBatch,
        role: newBatch || state.user.role || 'Verified Student ✓',
        hostel: newHostel,
        bio: newBio,
        hobbies: newHobbies
      };

    // In-memory session only: clean fresh state guaranteed on reload
      updateAuthUI();
      closeEditProfileModal();
      showToast('Profile updated successfully! ✨');
    });
  }

  // Student Logout Action
  if (btnStudentLogout) {
    btnStudentLogout.addEventListener('click', (e) => {
      e.preventDefault();
      state.user = null;
    // In-memory session only
      updateAuthUI();
      showToast('Signed out of student session.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // STUDENT APP TAB ROUTER (CREATE, JOIN, AI VENUES, CHAT, MEMORIES)
  // ==========================================================================
  function switchStudentTab(tabId) {
    if (!tabId) return;

    // Normalizing legacy target page IDs if passed
    if (tabId.startsWith('page-')) {
      if (tabId === 'page-create-circle') tabId = 'create-circle';
      else if (tabId === 'page-ai-venues') tabId = 'ai-venues';
      else if (tabId === 'page-chat') tabId = 'chat';
      else if (tabId === 'page-memories') tabId = 'memories';
      else if (tabId === 'page-explore' || tabId === 'page-landing') tabId = 'join-circle';
    }

    // Update active tab button
    document.querySelectorAll('.student-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-app-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide all tab panes, show target pane
    document.querySelectorAll('.student-tab-pane').forEach(pane => {
      pane.style.display = 'none';
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`app-tab-${tabId}`);
    if (targetPane) {
      targetPane.style.display = 'block';
      targetPane.classList.add('active');
      // Ensure any inner subview container is visible
      targetPane.querySelectorAll('.app-page-view').forEach(inner => {
        inner.style.display = 'block';
      });
    }

    if (tabId === 'memories' && typeof applyMemoriesPrivacyFilter === 'function') {
      applyMemoriesPrivacyFilter();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Attach click events on student tab buttons
  document.querySelectorAll('.student-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.getAttribute('data-app-tab');
      if (tabId) {
        switchStudentTab(tabId);
      }
    });
  });

  // Backward compatibility router for legacy references
  function navigateToPage(pageId) {
    if (!state.user && pageId !== 'page-landing') {
      openAuthModal(pageId);
      return;
    }
    if (state.user) {
      switchStudentTab(pageId);
    }
  }

  // ==========================================================================
  // STUDENT APP QUICK CONTROLS (THEME, LANGUAGE & AMBIENT MUSIC)
  // Allows student to change theme and language even after signing in!
  // ==========================================================================
  const studentThemeBtn = document.getElementById('student-theme-btn');
  const studentThemePanel = document.getElementById('student-theme-panel');
  const studentLangBtn = document.getElementById('student-lang-btn');
  const studentLangPanel = document.getElementById('student-lang-panel');
  const studentMusicBtn = document.getElementById('student-music-btn');

  if (studentThemeBtn && studentThemePanel) {
    studentThemeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (studentLangPanel) studentLangPanel.classList.remove('open', 'show');
      const willOpen = !studentThemePanel.classList.contains('open');
      studentThemePanel.classList.toggle('open', willOpen);
      studentThemePanel.classList.toggle('show', willOpen);
      if (willOpen) alignDropdownInViewport(studentThemePanel, studentThemeBtn);
    });

    studentThemePanel.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeChoice = btn.getAttribute('data-theme-choice');
        applyTheme(themeChoice);
        studentThemePanel.classList.remove('open', 'show');
        studentThemePanel.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  if (studentLangBtn && studentLangPanel) {
    studentLangBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (studentThemePanel) studentThemePanel.classList.remove('open', 'show');
      const willOpen = !studentLangPanel.classList.contains('open');
      studentLangPanel.classList.toggle('open', willOpen);
      studentLangPanel.classList.toggle('show', willOpen);
      if (willOpen) alignDropdownInViewport(studentLangPanel, studentLangBtn);
    });

    studentLangPanel.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const langCode = btn.getAttribute('data-lang');
        applyLanguage(langCode);
        const studentLangLabel = document.getElementById('student-lang-label');
        if (studentLangLabel) studentLangLabel.textContent = langCode.toUpperCase();
        studentLangPanel.classList.remove('open', 'show');
        studentLangPanel.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Close student dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (studentThemePanel && !studentThemePanel.contains(e.target) && e.target !== studentThemeBtn) {
      studentThemePanel.classList.remove('open', 'show');
    }
    if (studentLangPanel && !studentLangPanel.contains(e.target) && e.target !== studentLangBtn) {
      studentLangPanel.classList.remove('open', 'show');
    }
  });

  window.addEventListener('resize', () => {
    if (studentThemePanel && studentThemePanel.classList.contains('open')) alignDropdownInViewport(studentThemePanel, studentThemeBtn);
    if (studentLangPanel && studentLangPanel.classList.contains('open')) alignDropdownInViewport(studentLangPanel, studentLangBtn);
  }, { passive: true });

  if (studentMusicBtn) {
    studentMusicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userGestureRegistered = true;
      const playing = musicEngine.toggle();
      if (playing) {
        studentMusicBtn.classList.add('playing', 'active');
        showToast('Ambient Music: Playing 🎵');
      } else {
        studentMusicBtn.classList.remove('playing', 'active');
        showToast('Ambient Music: Paused 🔇');
      }
    });
  }

  // ==========================================================================
  // HOBBY-MATCHED AI VENUE RECOMMENDATIONS & CATEGORY IMAGES
  // Strictly tailored recommendations per hobby category
  // ==========================================================================
  const CATEGORY_IMAGES = {
    outdoors: 'assets/images/cycling-indian.jpg',
    sports: 'assets/images/football-indian.jpg',
    reading: 'assets/images/reading-indian.jpg',
    music: 'assets/images/music-indian.jpg',
    tech: 'assets/images/coding-indian.jpg',
    fitness: 'assets/images/fitness-indian.jpg'
  };

  const VENUE_CATALOG = {
    outdoors: [
      {
        name: 'Gomti Riverfront Promenade Dedicated Cycle Track',
        distance: '3.2 km',
        desc: '16 km paved loop, CCTV monitored, sunrise hydration points',
        safety: '🛡️ 9.9/10 Safe Track'
      },
      {
        name: 'Janeshwar Mishra Park 10 km Cycle Velodrome',
        distance: '4.1 km',
        desc: "Asia's largest park cycling loop, solar lighting & SOS booths",
        safety: '🛡️ 9.8/10 Vetted Loop'
      },
      {
        name: '1090 Crossing to Marine Drive Cycle Strip',
        distance: '2.5 km',
        desc: 'Smooth asphalt tarmac, student morning peloton route',
        safety: '🛡️ 9.7/10 Verified Strip'
      },
      {
        name: 'Kukrail Reserve Forest Eco-Biking Trail',
        distance: '6.0 km',
        desc: 'Green canopy woodland trail, forest ranger checkpoint',
        safety: '🛡️ 9.6/10 Eco Loop'
      }
    ],
    sports: [
      {
        name: 'Campus Main Sports Complex Floodlit Astroturf',
        distance: '0.8 km',
        desc: 'FIFA-standard 5v5/7v7 turf, student ID access, stadium floodlights',
        safety: '🛡️ 9.9/10 Campus Vetted'
      },
      {
        name: 'Decathlon Activity Arena Football Turf',
        distance: '3.5 km',
        desc: 'High-tension safety netting, first-aid station, changing rooms & lockers',
        safety: '🛡️ 9.8/10 Pro Turf'
      },
      {
        name: 'Strike Force 24x7 Floodlit Sports Arena',
        distance: '2.2 km',
        desc: 'Synthetic grass turf, digital scoreboard, CCTV & parking security',
        safety: '🛡️ 9.7/10 Verified Arena'
      },
      {
        name: 'Kishan Indoor Badminton & Multi-Sport Arena',
        distance: '1.4 km',
        desc: 'Wooden court flooring, campus bus stop adjacent, RO water dispenser',
        safety: '🛡️ 9.8/10 Indoor Court'
      }
    ],
    reading: [
      {
        name: 'Roastery Coffee House Garden Library',
        distance: '1.8 km',
        desc: 'Quiet open garden nook, high-speed campus Wi-Fi, specialty manual brews',
        safety: '🛡️ 9.9/10 Student Vetted'
      },
      {
        name: 'College Central Library Silent Reading Hall',
        distance: '0.3 km',
        desc: 'Air-conditioned silent zone, power sockets at each desk, librarian supervised',
        safety: '🛡️ 10/10 On-Campus Safe'
      },
      {
        name: 'Cafe Repertwahr Book Cafe & Reading Lawn',
        distance: '2.6 km',
        desc: 'In-house library with 3,000+ titles, peaceful study alcoves, organic teas',
        safety: '🛡️ 9.8/10 Literary Nook'
      },
      {
        name: 'The Hazelnut Factory Study Lounge',
        distance: '1.5 km',
        desc: 'Cozy acoustic booths, student discount with college ID, well-lit tables',
        safety: '🛡️ 9.6/10 Study Cafe'
      }
    ],
    music: [
      {
        name: 'Campus Open Amphitheater Steps',
        distance: '0.5 km',
        desc: 'Natural acoustic sound bowl, shaded stone tiers, campus guard stationed',
        safety: '🛡️ 10/10 On-Campus'
      },
      {
        name: 'Music & Cultural Club Soundproof Jam Room',
        distance: '0.4 km',
        desc: 'Studio monitors, drum kit & amp setups, keycard verified student access',
        safety: '🛡️ 9.9/10 Studio Safe'
      },
      {
        name: 'Gomti Riverside Sunset Gazebo Lawn',
        distance: '3.0 km',
        desc: 'Peaceful evening river breeze, open circle seating, evening campus security',
        safety: '🛡️ 9.7/10 Open Air Jam'
      },
      {
        name: 'Kala Mandir Performing Arts Acoustic Hall',
        distance: '1.9 km',
        desc: 'Reverb-treated studio, wooden stage floor, acoustic instrument stands',
        safety: '🛡️ 9.8/10 Vetted Hall'
      }
    ],
    tech: [
      {
        name: 'College Innovation & Robotics Lab (C-Block 3rd Fl)',
        distance: '0.2 km',
        desc: '1 Gbps fiber LAN, dual 4K monitors, mentor desk, 24/7 during hackathons',
        safety: '🛡️ 10/10 Campus Lab'
      },
      {
        name: 'Campus Incubator Coworking Arena',
        distance: '0.6 km',
        desc: 'Whiteboard brainstorming walls, ergonomic chairs, unlimited espresso & chai',
        safety: '🛡️ 9.9/10 Coworking Hub'
      },
      {
        name: 'WeWork / Regus Student Tech Hub',
        distance: '3.8 km',
        desc: 'Dedicated meeting pods, presentation screens, biometric security gates',
        safety: '🛡️ 9.8/10 Verified Tech Hub'
      },
      {
        name: 'Central Library Digital Collaboration Room',
        distance: '0.4 km',
        desc: 'Sound-insulated team booth, projector & smart board, verified card swipe',
        safety: '🛡️ 9.8/10 Digital Room'
      }
    ],
    fitness: [
      {
        name: 'Campus Student Gymnasium & Strength Center',
        distance: '0.3 km',
        desc: 'Olympic barbells, certified campus trainers, biometric turnstile entry',
        safety: '🛡️ 9.9/10 Campus Gym'
      },
      {
        name: 'Janeshwar Outdoor Calisthenics & Fitness Park',
        distance: '4.0 km',
        desc: 'Pull-up bars, parallel dips, rubberized track, morning fitness community',
        safety: '🛡️ 9.8/10 Outdoor Rig'
      },
      {
        name: 'Cult.Fit / Gold’s Gym Student Center',
        distance: '2.1 km',
        desc: 'Functional training zone, lockers & showers, certified coaches & CCTV',
        safety: '🛡️ 9.7/10 Verified Fitness'
      },
      {
        name: 'Campus Running Track & Cross-Training Field',
        distance: '0.7 km',
        desc: '400m synthetic running track, floodlights, hydration station',
        safety: '🛡️ 9.8/10 Athletic Track'
      }
    ]
  };

  const btnSuggestPlaces = document.getElementById('btn-suggest-places');
  const aiVenueDrawer = document.getElementById('ai-venue-drawer');
  const btnCloseAiDrawer = document.getElementById('btn-close-ai-drawer');

  function renderAIVenues(selectedCat) {
    const studioCatSelect = document.getElementById('studio-circle-cat');
    const cat = selectedCat || (studioCatSelect ? studioCatSelect.value : 'outdoors');
    const places = VENUE_CATALOG[cat] || VENUE_CATALOG.outdoors;
    const placesGrid = document.querySelector('.ai-quick-places-grid');
    const drawerBadge = document.querySelector('.ai-filter-pill');

    const catBadgeTitles = {
      outdoors: '🚲 Dedicated Safe Cycling Tracks',
      sports: '⚽ Floodlit Safe Football Turfs',
      reading: '📚 Quiet Reading & Study Spaces',
      music: '🎸 Acoustic Jamming & Soundproof Rooms',
      tech: '💻 Tech Labs & Coworking Hubs',
      fitness: '🏋️ Campus Gyms & Calisthenics Tracks'
    };

    if (drawerBadge) {
      drawerBadge.textContent = catBadgeTitles[cat] || 'CCTV & Student Verified';
    }

    if (placesGrid) {
      placesGrid.innerHTML = places.map(p => `
        <div class="ai-place-chip-card" data-place-name="${p.name}" data-place-cat="${cat}">
          <div class="ai-place-top">
            <strong>${p.name}</strong>
            <span class="badge-safe">${p.safety}</span>
          </div>
          <span class="ai-place-sub">${p.distance} · ${p.desc}</span>
          <button type="button" class="btn-pick-place">Select This Place ✨</button>
        </div>
      `).join('');

      placesGrid.querySelectorAll('.ai-place-chip-card').forEach(card => {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          const placeName = card.getAttribute('data-place-name');
          const placeCat = card.getAttribute('data-place-cat');

          const studioVenueInput = document.getElementById('studio-circle-venue');
          const studioCatSelect = document.getElementById('studio-circle-cat');
          if (studioVenueInput && placeName) {
            studioVenueInput.value = placeName;
          }
          if (studioCatSelect && placeCat) {
            studioCatSelect.value = placeCat;
          }
          if (typeof updateStudioPreview === 'function') {
            updateStudioPreview();
          }
          if (aiVenueDrawer) {
            aiVenueDrawer.style.display = 'none';
          }
          showToast(`Selected "${placeName}" via AI Safety Engine ✨`);
        });
      });
    }
  }

  if (btnSuggestPlaces && aiVenueDrawer) {
    btnSuggestPlaces.addEventListener('click', (e) => {
      e.preventDefault();
      const isVisible = aiVenueDrawer.style.display === 'block';
      if (!isVisible) {
        const studioCatSelect = document.getElementById('studio-circle-cat');
        const cat = studioCatSelect ? studioCatSelect.value : 'outdoors';
        renderAIVenues(cat);
        aiVenueDrawer.style.display = 'block';
        showToast('AI safe venue recommendations loaded ✨');
      } else {
        aiVenueDrawer.style.display = 'none';
      }
    });
  }

  if (btnCloseAiDrawer && aiVenueDrawer) {
    btnCloseAiDrawer.addEventListener('click', (e) => {
      e.preventDefault();
      aiVenueDrawer.style.display = 'none';
    });
  }

  // Initial event binding for default place chips
  document.querySelectorAll('.ai-place-chip-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const placeName = card.getAttribute('data-place-name');
      const placeCat = card.getAttribute('data-place-cat');
      
      const studioVenueInput = document.getElementById('studio-circle-venue');
      const studioCatSelect = document.getElementById('studio-circle-cat');
      if (studioVenueInput && placeName) {
        studioVenueInput.value = placeName;
      }
      if (studioCatSelect && placeCat) {
        studioCatSelect.value = placeCat;
      }
      if (typeof updateStudioPreview === 'function') {
        updateStudioPreview();
      }
      if (aiVenueDrawer) {
        aiVenueDrawer.style.display = 'none';
      }
      showToast(`Selected "${placeName}" via AI Safety Engine ✨`);
    });
  });

  // ==========================================================================
  // CREATE CIRCLE STUDIO & REAL-TIME LIVE CARD PREVIEW
  // ==========================================================================
  const studioForm = document.getElementById('studio-create-form') || document.getElementById('full-create-circle-form');
  const studioName = document.getElementById('studio-circle-name');
  const studioCat = document.getElementById('studio-circle-cat');
  const studioVenue = document.getElementById('studio-circle-venue');
  const studioTime = document.getElementById('studio-circle-time');
  const studioDesc = document.getElementById('studio-circle-desc');
  const studioImg = document.getElementById('studio-circle-img-select');
  const studioWomenOnly = document.getElementById('studio-circle-women-only');

  const previewTitle = document.getElementById('preview-card-title');
  const previewTag = document.getElementById('preview-card-tag');
  const previewMeta = document.getElementById('preview-card-meta');
  const previewDesc = document.getElementById('preview-card-desc');
  const previewImg = document.getElementById('preview-card-img');

  function updateStudioPreview() {
    if (previewTitle && studioName) {
      previewTitle.textContent = studioName.value || 'Untitled Campus Circle';
    }
    if (previewTag && studioCat) {
      const catText = studioCat.options[studioCat.selectedIndex].text;
      const isWomenOnly = studioWomenOnly && studioWomenOnly.checked;
      previewTag.textContent = isWomenOnly ? `🔒 ${catText.toUpperCase()} (WOMEN-ONLY)` : catText.toUpperCase();
    }
    if (previewMeta) {
      const time = studioTime && studioTime.value ? studioTime.value : 'Weekend Morning';
      const venue = studioVenue && studioVenue.value ? studioVenue.value : 'Vetted Campus Venue';
      previewMeta.textContent = `${time} · ${venue}`;
    }
    if (previewDesc && studioDesc) {
      previewDesc.textContent = studioDesc.value || 'Your circle description will appear here in real-time.';
    }
    if (previewImg) {
      if (studioImg && studioImg.value) {
        previewImg.src = studioImg.value;
      } else if (studioCat && CATEGORY_IMAGES[studioCat.value]) {
        previewImg.src = CATEGORY_IMAGES[studioCat.value];
      }
    }
  }

  const studioCap = document.getElementById('studio-circle-cap');
  const studioProgressBar = document.getElementById('studio-progress-bar') || document.getElementById('studio-progress-fill');
  const studioStepIndicator = document.getElementById('studio-step-indicator');
  const studioPctIndicator = document.getElementById('studio-pct-indicator');

  let currentStudioStage = 1;

  function triggerFieldShake(el) {
    if (!el) return;
    el.classList.remove('field-error-shake');
    void el.offsetWidth; // Force reflow
    el.classList.add('field-error-shake');
    try { el.focus(); } catch (e) {}
    setTimeout(() => {
      el.classList.remove('field-error-shake');
    }, 1200);
  }

  // Stage 1 Validation: Category & Circle Title
  function validateStage1(showNotice = false) {
    const hasCat = !!(studioCat && studioCat.value);
    const hasName = !!(studioName && studioName.value.trim().length >= 3);

    if (!hasCat) {
      if (showNotice) {
        showToast('⚠️ Please select a hobby category for your circle.');
        const firstCard = document.querySelector('#studio-category-cards .cat-select-card');
        if (firstCard) triggerFieldShake(firstCard);
      }
      return false;
    }

    if (!hasName) {
      if (showNotice) {
        showToast('⚠️ Please enter a circle title (at least 3 characters).');
        if (studioName) triggerFieldShake(studioName);
      }
      return false;
    }

    return true;
  }

  // Stage 2 Validation: Schedule & Venue
  function validateStage2(showNotice = false) {
    if (!validateStage1(showNotice)) return false;

    const hasTime = !!(studioTime && studioTime.value.trim().length >= 3);
    const hasVenue = !!(studioVenue && studioVenue.value.trim().length >= 3);

    if (!hasTime) {
      if (showNotice) {
        showToast('⚠️ Please specify when the circle will meet (e.g. Sunday 6:00 AM).');
        if (studioTime) triggerFieldShake(studioTime);
      }
      return false;
    }

    if (!hasVenue) {
      if (showNotice) {
        showToast('⚠️ Please specify a public meetup venue.');
        if (studioVenue) triggerFieldShake(studioVenue);
      }
      return false;
    }

    return true;
  }

  // Stage 3 Validation: Capacity & Description
  function validateStage3(showNotice = false) {
    if (!validateStage2(showNotice)) return false;

    const capVal = studioCap ? parseInt(studioCap.value, 10) : 0;
    const hasCap = capVal >= 2 && capVal <= 100;
    const hasDesc = !!(studioDesc && studioDesc.value.trim().length >= 5);

    if (!hasCap) {
      if (showNotice) {
        showToast('⚠️ Please enter a squad capacity of at least 2 members.');
        if (studioCap) triggerFieldShake(studioCap);
      }
      return false;
    }

    if (!hasDesc) {
      if (showNotice) {
        showToast('⚠️ Please write a brief description of what the circle will do (at least 5 characters).');
        if (studioDesc) triggerFieldShake(studioDesc);
      }
      return false;
    }

    return true;
  }

  // Dynamic Rolling Progress Bar & Field Tracker
  function updateStudioProgress() {
    const f1_cat = (studioCat && studioCat.value) ? 1 : 0;
    const f2_name = (studioName && studioName.value.trim().length >= 3) ? 1 : 0;
    const f3_time = (studioTime && studioTime.value.trim().length >= 3) ? 1 : 0;
    const f4_venue = (studioVenue && studioVenue.value.trim().length >= 3) ? 1 : 0;
    const f5_cap = (studioCap && parseInt(studioCap.value, 10) >= 2) ? 1 : 0;
    const f6_desc = (studioDesc && studioDesc.value.trim().length >= 5) ? 1 : 0;

    const filledCount = f1_cat + f2_name + f3_time + f4_venue + f5_cap + f6_desc;
    const totalFields = 6;
    const remainingFields = Math.max(0, totalFields - filledCount);

    let percent = Math.round((filledCount / totalFields) * 75);
    if (currentStudioStage === 4) {
      percent = 100;
    }

    if (studioProgressBar) {
      studioProgressBar.style.width = `${percent}%`;
    }

    if (studioStepIndicator) {
      studioStepIndicator.textContent = `STAGE ${currentStudioStage} OF 4`;
    }

    if (studioPctIndicator) {
      if (currentStudioStage === 4) {
        studioPctIndicator.textContent = `100% (All Details Completed · Ready to Launch!)`;
      } else if (remainingFields === 0) {
        studioPctIndicator.textContent = `${percent}% (All Details Filled · Ready for Review)`;
      } else {
        studioPctIndicator.textContent = `${percent}% (${remainingFields} field${remainingFields === 1 ? '' : 's'} remaining)`;
      }
    }

    const step1Valid = f1_cat && f2_name;
    const step2Valid = step1Valid && f3_time && f4_venue;
    const step3Valid = step2Valid && f5_cap && f6_desc;

    const btnNext1 = document.getElementById('btn-studio-step1-next');
    const btnNext2 = document.getElementById('btn-studio-step2-next');
    const btnNext3 = document.getElementById('btn-studio-step3-next');

    if (btnNext1) btnNext1.classList.toggle('disabled-stage', !step1Valid);
    if (btnNext2) btnNext2.classList.toggle('disabled-stage', !step2Valid);
    if (btnNext3) btnNext3.classList.toggle('disabled-stage', !step3Valid);

    // Update Stepper Navigation Dots (active, completed, locked)
    for (let s = 1; s <= 4; s++) {
      const dot = document.querySelector(`.stepper-dot[data-studio-step="${s}"]`);
      if (dot) {
        let isAccessible = false;
        if (s === 1) isAccessible = true;
        else if (s === 2) isAccessible = step1Valid;
        else if (s === 3) isAccessible = step2Valid;
        else if (s === 4) isAccessible = step3Valid;

        dot.classList.toggle('locked', !isAccessible);
        if (!isAccessible) {
          dot.setAttribute('title', 'Fill previous information to unlock');
        } else {
          dot.removeAttribute('title');
        }

        if (s === currentStudioStage) {
          dot.classList.add('active');
          dot.classList.remove('completed');
        } else if (s < currentStudioStage) {
          dot.classList.remove('active');
          dot.classList.add('completed');
        } else {
          dot.classList.remove('active');
          dot.classList.remove('completed');
        }
      }
    }
  }

  // Listeners to recalculate progress live on every keystroke/change
  if (studioName) {
    studioName.addEventListener('input', () => {
      updateStudioPreview();
      updateStudioProgress();
    });
  }
  if (studioCat) {
    studioCat.addEventListener('change', () => {
      if (studioImg && CATEGORY_IMAGES[studioCat.value]) {
        studioImg.value = CATEGORY_IMAGES[studioCat.value];
      }
      updateStudioPreview();
      updateStudioProgress();
      if (aiVenueDrawer && aiVenueDrawer.style.display === 'block') {
        renderAIVenues(studioCat.value);
      }
    });
  }
  if (studioVenue) {
    studioVenue.addEventListener('input', () => {
      updateStudioPreview();
      updateStudioProgress();
    });
  }
  if (studioTime) {
    studioTime.addEventListener('input', () => {
      updateStudioPreview();
      updateStudioProgress();
    });
  }
  if (studioDesc) {
    studioDesc.addEventListener('input', () => {
      updateStudioPreview();
      updateStudioProgress();
    });
  }
  if (studioCap) {
    studioCap.addEventListener('input', () => {
      updateStudioPreview();
      updateStudioProgress();
    });
  }
  if (studioImg) studioImg.addEventListener('change', updateStudioPreview);
  if (studioWomenOnly) studioWomenOnly.addEventListener('change', updateStudioPreview);

  // ==========================================================================
  // PROGRESSIVE DISCLOSURE CREATE CIRCLE STUDIO STEPPER (4 STAGES)
  // ==========================================================================
  function goToStudioStage(stage) {
    // Gatekeeper: sequential enforcement
    if (stage === 2 && !validateStage1(true)) return;
    if (stage === 3 && !validateStage2(true)) return;
    if (stage === 4 && !validateStage3(true)) return;

    currentStudioStage = stage;

    for (let s = 1; s <= 4; s++) {
      const panel = document.getElementById(`studio-stage-${s}`);
      if (panel) {
        panel.style.display = s === stage ? 'block' : 'none';
        if (s === stage) panel.classList.add('active');
        else panel.classList.remove('active');
      }
    }

    updateStudioProgress();
  }

  // Interactive Category Cards in Studio
  document.querySelectorAll('#studio-category-cards .cat-select-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#studio-category-cards .cat-select-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const catVal = card.getAttribute('data-cat-val');
      if (studioCat && catVal) {
        studioCat.value = catVal;
        studioCat.dispatchEvent(new Event('change'));
      }
      updateStudioProgress();
    });
  });

  const btnStudioStep1Next = document.getElementById('btn-studio-step1-next');
  const btnStudioStep2Back = document.getElementById('btn-studio-step2-back');
  const btnStudioStep2Next = document.getElementById('btn-studio-step2-next');
  const btnStudioStep3Back = document.getElementById('btn-studio-step3-back');
  const btnStudioStep3Next = document.getElementById('btn-studio-step3-next');
  const btnStudioStep4Back = document.getElementById('btn-studio-step4-back');

  if (btnStudioStep1Next) {
    btnStudioStep1Next.addEventListener('click', () => {
      if (validateStage1(true)) {
        goToStudioStage(2);
      }
    });
  }

  if (btnStudioStep2Back) btnStudioStep2Back.addEventListener('click', () => goToStudioStage(1));

  if (btnStudioStep2Next) {
    btnStudioStep2Next.addEventListener('click', () => {
      if (validateStage2(true)) {
        goToStudioStage(3);
      }
    });
  }

  if (btnStudioStep3Back) btnStudioStep3Back.addEventListener('click', () => goToStudioStage(2));
  if (btnStudioStep3Next) {
    btnStudioStep3Next.addEventListener('click', () => {
      if (validateStage3(true)) {
        goToStudioStage(4);
      }
    });
  }
  if (btnStudioStep4Back) btnStudioStep4Back.addEventListener('click', () => goToStudioStage(3));

  document.querySelectorAll('.stepper-dot[data-studio-step]').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetStep = parseInt(dot.getAttribute('data-studio-step'), 10);
      if (targetStep === currentStudioStage) return;

      if (targetStep < currentStudioStage) {
        goToStudioStage(targetStep);
        return;
      }

      if (targetStep === 2) {
        if (validateStage1(true)) goToStudioStage(2);
      } else if (targetStep === 3) {
        if (!validateStage1(true)) return;
        if (validateStage2(true)) goToStudioStage(3);
      } else if (targetStep === 4) {
        if (!validateStage1(true)) return;
        if (!validateStage2(true)) return;
        if (validateStage3(true)) goToStudioStage(4);
      }
    });
  });

  // Initial calculation of studio progress
  updateStudioProgress();

  if (studioForm) {
    studioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = studioName ? studioName.value : 'New Hobby Circle';
      const category = studioCat ? studioCat.value : 'outdoors';
      const categoryLabel = studioCat ? studioCat.options[studioCat.selectedIndex].text : 'Craft';
      const venue = studioVenue ? studioVenue.value : 'Campus Venue';
      const time = studioTime ? studioTime.value : 'Weekend';
      const desc = studioDesc ? studioDesc.value : '';
      const img = (studioImg && studioImg.value) || (CATEGORY_IMAGES && CATEGORY_IMAGES[category]) || 'assets/images/cycling-indian.jpg';
      const isWomenOnly = studioWomenOnly ? studioWomenOnly.checked : false;
      const hostName = state.user ? state.user.name : 'You';
      const initials = state.user ? state.user.initials : 'YOU';

      // 1. Add new card to Join a Circle grid
      const circlesGrid = document.getElementById('circles-grid') || document.getElementById('circles-explore-grid');
      if (circlesGrid) {
        const newCard = document.createElement('div');
        newCard.className = 'circle-card';
        newCard.setAttribute('data-category', category);
        newCard.setAttribute('data-circle-title', title);
        newCard.setAttribute('data-circle-category', categoryLabel);
        newCard.setAttribute('data-circle-meta', `${time} · ${venue}`);
        newCard.setAttribute('data-circle-desc', desc);
        newCard.setAttribute('data-circle-img', img);
        newCard.setAttribute('data-circle-venue', venue);
        newCard.setAttribute('data-circle-host', hostName);

        newCard.innerHTML = `
          <div class="card-media-wrap">
            <img src="${img}" alt="${title}" class="circle-card-thumb" loading="lazy">
            <div class="card-hover-action-overlay">
              <span class="preview-pill">Quick Intel 👁️</span>
            </div>
          </div>
          <div class="circle-card-body">
            <div class="circle-tag-row">
              <span class="craft-tag">${isWomenOnly ? '🔒 ' : ''}${categoryLabel}</span>
              <span class="spots-badge">Newly Hosted · 12 Spots Left</span>
            </div>
            <h4 class="circle-card-title">${title}</h4>
            <div class="circle-card-meta">${time} · ${venue}</div>
            <p class="circle-card-desc">${desc}</p>
            <div class="circle-card-footer">
              <div class="host-info">
                <div class="host-avatar" style="background:var(--accent-primary);">${initials}</div>
                <span>Hosted by ${hostName}</span>
              </div>
              <button class="btn-join-circle joined">Joined! ✓</button>
            </div>
          </div>
        `;
        circlesGrid.prepend(newCard);
      }

      // 2. Add new channel to group chat sidebar
      const channelsList = document.querySelector('.chat-channels-list');
      if (channelsList) {
        const newChannel = document.createElement('div');
        newChannel.className = 'chat-channel-item';
        newChannel.setAttribute('data-channel', category);
        newChannel.innerHTML = `
          <span class="channel-emoji">✨</span>
          <div class="channel-meta-info">
            <div class="channel-top">
              <strong class="channel-name">${title}</strong>
              <span class="channel-time">Just now</span>
            </div>
            <span class="channel-snippet">${hostName}: Circle launched! Welcome squad 🎉</span>
          </div>
        `;
        channelsList.prepend(newChannel);
        bindChatChannelItem(newChannel, title, venue, '✨');
      }

      showToast(`Circle "${title}" published live to campus feed! 🚀`);
      if (studioForm) studioForm.reset();
      updateStudioPreview();
      goToStudioStage(1);
      updateStudioProgress();
      switchStudentTab('join-circle');
    });
  }

  // ==========================================================================
  // CAMPUS MEMORIES FEED & UPLOAD MODAL
  // ==========================================================================
  const uploadMemModal = document.getElementById('upload-memory-modal');
  const openMemModalBtn = document.getElementById('btn-open-memory-modal');
  const closeMemModalBtn = document.getElementById('close-upload-memory-modal');
  const cancelMemBtn = document.getElementById('cancel-upload-memory');
  const uploadMemForm = document.getElementById('upload-memory-form');
  const memoriesGrid = document.getElementById('memories-feed-grid');

  if (openMemModalBtn) {
    openMemModalBtn.addEventListener('click', () => {
      if (!state.user) {
        showToast('🔒 Please Sign In to upload circle memories.');
        openAuthModal('page-memories');
        return;
      }
      if (uploadMemModal) {
        uploadMemModal.classList.add('open');
        lockBodyScroll();
      }
    });
  }

  function closeMemoryModal() {
    if (uploadMemModal) {
      uploadMemModal.classList.remove('open');
      unlockBodyScroll();
    }
  }

  if (closeMemModalBtn) closeMemModalBtn.addEventListener('click', closeMemoryModal);
  if (cancelMemBtn) cancelMemBtn.addEventListener('click', closeMemoryModal);
  if (uploadMemModal) {
    uploadMemModal.addEventListener('click', (e) => {
      if (e.target === uploadMemModal) closeMemoryModal();
    });
  }

  // Real Photo Upload & Dropzone Handling with Preview
  const memPhotoDropzone = document.getElementById('mem-photo-dropzone');
  const memPhotoFile = document.getElementById('mem-photo-file');
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const memPreviewImg = document.getElementById('mem-preview-img');
  const memPresetSelect = document.getElementById('mem-photo-preset');
  let currentUploadedPhotoUrl = '';

  function handleMemoryPhotoFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('⚠️ Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentUploadedPhotoUrl = e.target.result;
      if (memPreviewImg) {
        memPreviewImg.src = currentUploadedPhotoUrl;
        memPreviewImg.style.display = 'block';
      }
      if (dropzonePrompt) {
        dropzonePrompt.style.display = 'none';
      }
      showToast('Photo uploaded! Preview ready 📸');
    };
    reader.readAsDataURL(file);
  }

  if (memPhotoDropzone && memPhotoFile) {
    memPhotoDropzone.addEventListener('click', () => {
      memPhotoFile.click();
    });

    memPhotoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      memPhotoDropzone.classList.add('drag-over');
    });

    memPhotoDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      memPhotoDropzone.classList.remove('drag-over');
    });

    memPhotoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      memPhotoDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleMemoryPhotoFile(e.dataTransfer.files[0]);
      }
    });

    memPhotoFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleMemoryPhotoFile(e.target.files[0]);
      }
    });
  }

  if (memPresetSelect) {
    memPresetSelect.addEventListener('change', () => {
      if (memPresetSelect.value) {
        currentUploadedPhotoUrl = memPresetSelect.value;
        if (memPreviewImg) {
          memPreviewImg.src = currentUploadedPhotoUrl;
          memPreviewImg.style.display = 'block';
        }
        if (dropzonePrompt) {
          dropzonePrompt.style.display = 'none';
        }
      }
    });
  }

  // Memory Visibility Modal Radio Switcher (Public vs Private)
  const memVisOptPublic = document.getElementById('mem-vis-opt-public');
  const memVisOptPrivate = document.getElementById('mem-vis-opt-private');
  if (memVisOptPublic && memVisOptPrivate) {
    memVisOptPublic.addEventListener('click', () => {
      memVisOptPublic.classList.add('active');
      memVisOptPrivate.classList.remove('active');
      const rad = memVisOptPublic.querySelector('input');
      if (rad) rad.checked = true;
    });
    memVisOptPrivate.addEventListener('click', () => {
      memVisOptPrivate.classList.add('active');
      memVisOptPublic.classList.remove('active');
      const rad = memVisOptPrivate.querySelector('input');
      if (rad) rad.checked = true;
    });
  }

  // Like Button Toggle: Rule "i should not be able to like my own memory"
  function bindLikeButtons() {
    document.querySelectorAll('.btn-memory-like').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const card = btn.closest('.memory-card');
        const author = (card?.getAttribute('data-author-name') || '').trim();
        const currentUserName = (state.user && state.user.name) ? state.user.name.trim() : '';

        // Prevent liking own memory
        if (currentUserName && currentUserName.toLowerCase() === author.toLowerCase()) {
          showToast('You cannot like your own memory moment! 😊');
          return;
        }

        const liked = btn.getAttribute('data-liked') === 'true';
        const countSpan = btn.querySelector('.like-count');
        const heartSpan = btn.querySelector('.heart-icon');
        let count = parseInt(countSpan.textContent, 10) || 0;

        if (!liked) {
          btn.setAttribute('data-liked', 'true');
          countSpan.textContent = count + 1;
          heartSpan.textContent = '❤️';
          showToast('Liked memory moment! ❤️');
        } else {
          btn.setAttribute('data-liked', 'false');
          countSpan.textContent = Math.max(0, count - 1);
          heartSpan.textContent = '🤍';
        }
      };
    });
  }

  // Interactive Comments: Rule "i should be able to comment on other peoples memories"
  function bindCommentInteractions() {
    // Open/Close comment drawer
    document.querySelectorAll('.btn-memory-comment').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const card = btn.closest('.memory-card');
        const drawer = card ? card.querySelector('.memory-comments-drawer') : null;
        if (drawer) {
          const isClosed = (drawer.style.display === 'none' || !drawer.style.display);
          drawer.style.display = isClosed ? 'flex' : 'none';
          if (isClosed) {
            const input = drawer.querySelector('.memory-comment-input');
            if (input) input.focus();
          }
        }
      };
    });

    // Post comment to memory
    document.querySelectorAll('.memory-comment-form').forEach(form => {
      form.onsubmit = (e) => {
        e.preventDefault();
        if (!state.user) {
          showToast('🔒 Please sign in to comment on circle memories.');
          openAuthModal('page-memories');
          return;
        }
        const input = form.querySelector('.memory-comment-input');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        const card = form.closest('.memory-card');
        const list = card ? card.querySelector('.memory-comments-list') : null;
        if (list) {
          const item = document.createElement('div');
          item.className = 'memory-comment-item';
          item.innerHTML = `
            <div class="comment-avatar">${state.user.initials || 'ME'}</div>
            <div class="comment-bubble">
              <div class="comment-meta">
                <span class="comment-author-name">${state.user.name}</span>
                <span class="comment-time">Just now</span>
              </div>
              <p class="comment-text">${text}</p>
            </div>
          `;
          list.appendChild(item);
          input.value = '';

          const countSpan = card.querySelector('.btn-memory-comment .comment-count');
          if (countSpan) {
            const currentCount = parseInt(countSpan.textContent, 10) || 0;
            countSpan.textContent = currentCount + 1;
          }
          list.scrollTop = list.scrollHeight;
          showToast('Comment posted! 💬✨');
        }
      };
    });
  }

  // Privacy & Common Circle Visibility Engine
  // Rule: "private memories should be visible to the user only and public to all other people whom i am in a common group with"
  window.applyMemoriesPrivacyFilter = function() {
    const activeChip = document.querySelector('.memories-filter-chips .cat-pill-btn.active');
    const filter = activeChip ? activeChip.getAttribute('data-mem-filter') : 'all';
    const currentUserName = (state.user && state.user.name) ? state.user.name.trim() : '';
    const userCircles = getUserJoinedCircles();

    let visibleCount = 0;
    const allCards = document.querySelectorAll('.memories-feed-grid .memory-card');

    allCards.forEach(card => {
      const author = (card.getAttribute('data-author-name') || '').trim();
      const isOwn = Boolean(currentUserName && currentUserName.toLowerCase() === author.toLowerCase());
      const visibility = card.getAttribute('data-visibility') || 'public';
      const cat = card.getAttribute('data-category') || 'cycling';
      const sharesCommonGroup = userCircles.includes(cat);

      // Rule 1: Private memories visible to user only
      // Rule 2: Public memories visible to author AND students who share a common group
      let allowedToSee = false;
      if (visibility === 'private') {
        allowedToSee = isOwn;
      } else {
        allowedToSee = isOwn || sharesCommonGroup;
      }

      // Filter chip matching
      let matchesFilter = false;
      if (filter === 'all') {
        matchesFilter = true;
      } else if (filter === 'my-private') {
        matchesFilter = (visibility === 'private' && isOwn);
      } else {
        matchesFilter = (cat === filter);
      }

      if (allowedToSee && matchesFilter) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }

      // Rule: cannot like own memory - mark like button
      const likeBtn = card.querySelector('.btn-memory-like');
      if (likeBtn) {
        if (isOwn) {
          likeBtn.classList.add('is-own-post');
          likeBtn.setAttribute('title', 'You cannot like your own memory');
          if (!likeBtn.querySelector('.own-post-tag')) {
            const tag = document.createElement('span');
            tag.className = 'own-post-tag';
            tag.textContent = '(Yours)';
            likeBtn.appendChild(tag);
          }
        } else {
          likeBtn.classList.remove('is-own-post');
          likeBtn.removeAttribute('title');
          const tag = likeBtn.querySelector('.own-post-tag');
          if (tag) tag.remove();
        }
      }
    });

    // Empty State notification
    let emptyState = document.getElementById('memories-empty-state');
    if (visibleCount === 0) {
      if (!emptyState && memoriesGrid) {
        emptyState = document.createElement('div');
        emptyState.className = 'memories-empty-state';
        emptyState.id = 'memories-empty-state';
        memoriesGrid.appendChild(emptyState);
      }
      if (emptyState) {
        emptyState.style.display = 'flex';
        if (filter === 'my-private') {
          emptyState.innerHTML = `
            <span class="empty-icon">🔒</span>
            <h4>Your Private Vault is Empty</h4>
            <p>You haven't uploaded any private memories yet. Use "+ Upload Circle Memory" and select "Private (Only You)" to save personal moments here.</p>
          `;
        } else {
          emptyState.innerHTML = `
            <span class="empty-icon">🤝</span>
            <h4>Common Circle Protected</h4>
            <p>Memories in this circle are visible only to students sharing a common circle group. Join this circle under "Join a Circle" to unlock moments shared with members!</p>
          `;
        }
      }
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
  };

  // Filter memories chips
  document.querySelectorAll('.memories-filter-chips [data-mem-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.memories-filter-chips [data-mem-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyMemoriesPrivacyFilter();
    });
  });

  // Submit new Memory with Public/Private option & Zero Tags/Mentions
  if (uploadMemForm) {
    uploadMemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const circleSelect = document.getElementById('mem-circle-select');
      const circleCategory = circleSelect.value;
      const circleText = circleSelect.options[circleSelect.selectedIndex].text;
      const photoUrl = currentUploadedPhotoUrl || (memPresetSelect ? memPresetSelect.value : '') || (CATEGORY_IMAGES && CATEGORY_IMAGES[circleCategory]) || 'assets/images/cycling-indian.jpg';
      const caption = document.getElementById('mem-caption').value;
      const author = state.user ? state.user.name : 'Campus Peer';
      const initials = state.user ? state.user.initials : 'CP';

      // Read Visibility Choice: Public vs Private
      const visRadio = document.querySelector('input[name="mem-visibility"]:checked');
      const visibility = visRadio ? visRadio.value : 'public';
      const memId = `mem-user-${Date.now()}`;

      if (memoriesGrid) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.id = `card-${memId}`;
        card.setAttribute('data-category', circleCategory);
        card.setAttribute('data-author-name', author);
        card.setAttribute('data-visibility', visibility);

        const privacyBadge = visibility === 'private'
          ? '<span class="mem-privacy-badge private">🔒 Private (Only You)</span>'
          : `<span class="mem-privacy-badge public">🌐 Circle Members · ${circleText.split('·')[0].trim()}</span>`;

        card.innerHTML = `
          <div class="memory-card-header">
            <div class="memory-author-avatar">${initials}</div>
            <div>
              <strong class="memory-author-name">${author}</strong>
              <span class="memory-circle-label">${circleText}</span>
              ${privacyBadge}
            </div>
            <span class="memory-time-ago">Just now</span>
          </div>
          <img src="${photoUrl}" alt="Meetup Memory" class="memory-photo" loading="lazy">
          <div class="memory-card-body">
            <p class="memory-caption">${caption}</p>
            <div class="memory-actions-row">
              <button class="btn-memory-like is-own-post" data-liked="false" title="You cannot like your own memory">
                <span class="heart-icon">🤍</span>
                <span class="like-count">0</span> Likes
                <span class="own-post-tag">(Yours)</span>
              </button>
              <button type="button" class="btn-memory-comment" data-mem-id="${memId}">
                💬 <span class="comment-count">0</span> Comments
              </button>
            </div>
          </div>
          <div class="memory-comments-drawer" id="mem-comments-${memId}" style="display:none;">
            <div class="memory-comments-list"></div>
            <form class="memory-comment-form" data-mem-id="${memId}">
              <input type="text" class="memory-comment-input" placeholder="Add a comment as your student persona..." required>
              <button type="submit" class="memory-comment-post-btn">Post 💬</button>
            </form>
          </div>
        `;
        memoriesGrid.prepend(card);
        bindLikeButtons();
        bindCommentInteractions();
        applyMemoriesPrivacyFilter();
      }

      closeMemoryModal();
      uploadMemForm.reset();
      currentUploadedPhotoUrl = '';
      if (memPreviewImg) {
        memPreviewImg.src = '';
        memPreviewImg.style.display = 'none';
      }
      if (dropzonePrompt) {
        dropzonePrompt.style.display = 'block';
      }
      if (memPhotoFile) memPhotoFile.value = '';
      showToast(visibility === 'private' ? 'Private memory saved to your vault! 🔒✨' : 'Memory uploaded & shared with circle squad! 🌐📸');
    });
  }

  // Initialize Memory Bindings on Load
  bindLikeButtons();
  bindCommentInteractions();
  applyMemoriesPrivacyFilter();

  // ==========================================================================
  // GROUP CHAT SQUAD MESSENGER & LIVE SIMULATED REPLIES
  // ==========================================================================
  const chatStream = document.getElementById('chat-messages-stream');
  const chatForm = document.getElementById('chat-send-form');
  const chatInput = document.getElementById('chat-input-text');
  const chatTitle = document.getElementById('chat-room-title');
  const chatVenue = document.getElementById('chat-room-venue');
  const chatIcon = document.getElementById('chat-room-icon');

  const channelData = {
    cycling: {
      title: 'Sunday Sunrise Cycling & Chai',
      venue: '📍 Gomti Riverfront Promenade',
      icon: '🚲',
      messages: [
        { sender: 'Kishan Shrivastava', role: 'Host', isHost: true, text: 'Welcome to Sunday Sunrise Cycling! Check tire pressures and bring a headlight if you have one. 🚴✨', time: '3 days ago, 6:00 PM' },
        { sender: 'Sneha Sen', role: '', isHost: false, text: 'Super excited! Is the route paved all the way along Gomti Riverfront?', time: '2 days ago, 11:20 AM' },
        { sender: 'Kishan Shrivastava', role: 'Host', isHost: true, text: 'Yes Sneha, 100% asphalt cycling track with dedicated safety barriers and street lamps. 🛣️', time: '2 days ago, 1:15 PM' },
        { sender: 'Dev Sharma', role: '', isHost: false, text: 'Can I join with an MTB or is a hybrid recommended?', time: 'Yesterday, 4:30 PM' },
        { sender: 'Kishan Shrivastava', role: 'Host', isHost: true, text: 'MTB, hybrid, or road bike — all work great! Our pace is a conversational 18-20 km/h. 🤙', time: 'Yesterday, 5:00 PM' },
        { sender: 'Aarav Patel', role: '', isHost: false, text: 'Awesome! Anyone starting from Hostel Block B? We can ride together to the entrance gate.', time: 'Yesterday, 8:22 PM' },
        { sender: 'Riya Verma', role: '', isHost: false, text: 'Yes Aarav! I am leaving from Block B at 5:45 AM. I have also packed a portable tire inflator just in case. ✨', time: 'Yesterday, 8:26 PM' },
        { sender: 'Kishan Shrivastava', role: 'Host', isHost: true, text: 'Perfect teamwork! Meet at the Riverfront Main Arch at 6:00 AM sharp. Kulhad chai on me after the 18 km finish line! ☕🔥', time: 'Yesterday, 8:30 PM' },
        { sender: 'Kunal Singh', role: '', isHost: false, text: 'Alarm set for 5:15 AM! Bringing the campus GoPro for aerial group shots. 📸', time: 'Yesterday, 10:15 PM' }
      ]
    },
    football: {
      title: 'Friday Night 5v5 Turf Football',
      venue: '📍 Gomti Nagar Floodlit Arena',
      icon: '⚽',
      messages: [
        { sender: 'Kunal Singh', role: 'Host', isHost: true, text: 'Friday Night 5v5 under the floodlights booked at Gomti Arena! Let us confirm squad count. ⚽🔥', time: '3 days ago, 7:00 PM' },
        { sender: 'Arjun Nair', role: '', isHost: false, text: 'Count me in! Are we playing with size 5 match balls?', time: '2 days ago, 3:30 PM' },
        { sender: 'Kunal Singh', role: 'Host', isHost: true, text: 'Yes, FIFA-standard synthetic grass match balls and neon bibs ready. 👟', time: '2 days ago, 5:00 PM' },
        { sender: 'Siddharth S.', role: '', isHost: false, text: 'I am bringing 2 extra pairs of goalkeeper gloves if anyone needs them.', time: 'Yesterday, 5:10 PM' },
        { sender: 'Kunal Singh', role: 'Host', isHost: true, text: 'Awesome Siddharth! Turf booked for 2 full hours. Let us play clean and fast.', time: 'Yesterday, 6:00 PM' },
        { sender: 'Rohan Gupta', role: '', isHost: false, text: 'Will there be water dispensers at the dugout?', time: 'Yesterday, 7:15 PM' },
        { sender: 'Kunal Singh', role: 'Host', isHost: true, text: 'Yes, RO chilled water on site. Just bring your own water sippers. See you on the turf!', time: 'Yesterday, 8:00 PM' }
      ]
    },
    reading: {
      title: 'Sunday Book Circle & Coffee',
      venue: '📍 Roastery Coffee House, Vibhuti Khand',
      icon: '📚',
      messages: [
        { sender: 'Ilma Islam', role: 'Host', isHost: true, text: 'Welcome bookworms! We are discussing chapters 4 & 5 of speculative fiction this weekend. ☕📖', time: 'Wednesday, 4:00 PM' },
        { sender: 'Meera Joshi', role: '', isHost: false, text: 'The world-building in chapter 3 was mind-bending! Can not wait to hear everyone theories.', time: 'Thursday, 11:00 AM' },
        { sender: 'Aarav Patel', role: '', isHost: false, text: 'Got the physical copy yesterday, absolutely hooked on the world-building!', time: 'Yesterday, 2:15 PM' },
        { sender: 'Tanmay Roy', role: '', isHost: false, text: 'I have bookmarked 3 passages on character arcs I would love to read out loud.', time: 'Yesterday, 6:40 PM' },
        { sender: 'Ilma Islam', role: 'Host', isHost: true, text: 'Table reserved at Roastery near the garden patio. See you all at 4:30 PM! ☕✨', time: 'Yesterday, 9:10 PM' }
      ]
    },
    coding: {
      title: 'Midnight AI Hack Lab',
      venue: '📍 Campus Innovation Lab / Discord',
      icon: '💻',
      messages: [
        { sender: 'Team Spark', role: 'Host', isHost: true, text: 'Flutter app skeleton pushed to GitHub repo. API keys configured for Gemini! 💻🚀', time: 'Wed, 11:30 PM' },
        { sender: 'Priyanshu M.', role: '', isHost: false, text: 'Cloned and ran on local Android emulator. Dependencies resolved cleanly.', time: 'Thu, 10:15 AM' },
        { sender: 'Riya Verma', role: '', isHost: false, text: 'Reviewed PR #3 for UI transitions, looks super smooth on mobile.', time: 'Yesterday, 1:40 PM' },
        { sender: 'Aman Saxena', role: '', isHost: false, text: 'Setting up the WebSocket relay for real-time multiplayer cursor tracking.', time: 'Yesterday, 4:50 PM' },
        { sender: 'Team Spark', role: 'Host', isHost: true, text: 'Awesome! Discord voice room open tonight for debug marathon from 10 PM. ☕💻', time: 'Yesterday, 8:00 PM' }
      ]
    }
  };

  let currentActiveChannel = 'cycling';

  function renderChannelMessages(channelKey) {
    currentActiveChannel = channelKey;
    const data = channelData[channelKey];
    if (!data || !chatStream) return;

    if (chatTitle) chatTitle.textContent = data.title;
    if (chatVenue) chatVenue.textContent = data.venue;
    if (chatIcon) chatIcon.textContent = data.icon;

    // Check if group meetup has concluded
    if (data.isEnded) {
      setCircleEndedState(true, channelKey, true);
      return;
    } else {
      setCircleEndedState(false, channelKey, true);
    }

    chatStream.innerHTML = '';
    data.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-message-bubble incoming';
      const initials = msg.sender.split(' ').map(s => s[0]).join('').substring(0, 2);
      bubble.innerHTML = `
        <div class="msg-avatar">${initials}</div>
        <div class="msg-bubble-content">
          <div class="msg-sender-name">${msg.sender} ${msg.isHost ? '<span class="badge-host">Host</span>' : ''}</div>
          <div class="msg-text">${msg.text}</div>
          <div class="msg-time">${msg.time}</div>
        </div>
      `;
      chatStream.appendChild(bubble);
    });
    chatStream.scrollTop = chatStream.scrollHeight;
  }

  const chatPortalLayout = document.getElementById('chat-portal-layout');
  const btnChatBack = document.getElementById('btn-chat-back-to-channels');

  if (btnChatBack && chatPortalLayout) {
    btnChatBack.addEventListener('click', () => {
      chatPortalLayout.classList.remove('thread-active');
    });
  }

  function bindChatChannelItem(item, title, venue, icon) {
    item.addEventListener('click', () => {
      document.querySelectorAll('.chat-channel-item').forEach(c => c.classList.remove('active'));
      item.classList.add('active');
      if (chatPortalLayout) chatPortalLayout.classList.add('thread-active');
      const channelKey = item.getAttribute('data-channel');
      if (channelData[channelKey]) {
        renderChannelMessages(channelKey);
      } else {
        currentActiveChannel = channelKey;
        if (chatTitle) chatTitle.textContent = title;
        if (chatVenue) chatVenue.textContent = `📍 ${venue}`;
        if (chatIcon) chatIcon.textContent = icon;
        if (chatStream) {
          chatStream.innerHTML = `
            <div class="chat-message-bubble incoming">
              <div class="msg-avatar">SM</div>
              <div class="msg-bubble-content">
                <div class="msg-sender-name">SkillMate Privacy Bot</div>
                <div class="msg-text">Circle channel active! Group chats only last while this meetup is active and will be deleted afterwards for member privacy. 🛡️</div>
                <div class="msg-time">Just now</div>
              </div>
            </div>
          `;
        }
      }
    });
  }

  document.querySelectorAll('.chat-channel-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.chat-channel-item').forEach(c => c.classList.remove('active'));
      item.classList.add('active');
      if (chatPortalLayout) chatPortalLayout.classList.add('thread-active');
      const channelKey = item.getAttribute('data-channel');
      renderChannelMessages(channelKey);
    });
  });

  // Quick Emoji Chips in Chat
  document.querySelectorAll('.btn-quick-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      if (chatInput && !chatInput.disabled) {
        chatInput.value += ` ${emoji} `;
        chatInput.focus();
      }
    });
  });

  // End Circle & Reopen Circle Meetup Lifecycle Controller
  // Rule: "group chats should only last till the group is active and deleted afterwords for privacy"
  const btnEndCircle = document.getElementById('btn-end-circle');
  const btnReopenCircle = document.getElementById('btn-reopen-circle');
  const chatCircleStatus = document.getElementById('chat-circle-status');
  const chatArchivedBanner = document.getElementById('chat-archived-banner');

  function setCircleEndedState(ended, channelKey = currentActiveChannel, isPassive = false) {
    const sendBtn = chatForm ? chatForm.querySelector('.chat-send-btn') : null;
    const chan = channelData[channelKey];

    if (ended) {
      // 1. Permanently delete all chat messages for privacy
      if (chan) {
        chan.isEnded = true;
        chan.messages = []; // ERASED for student privacy
      }

      // 2. Update UI status indicator
      if (chatCircleStatus) {
        chatCircleStatus.textContent = '🛑 Concluded · Chat Deleted';
        chatCircleStatus.classList.remove('active');
        chatCircleStatus.classList.add('ended');
      }

      if (chatArchivedBanner) chatArchivedBanner.style.display = 'flex';
      if (btnReopenCircle) btnReopenCircle.style.display = 'inline-flex';
      if (btnEndCircle) btnEndCircle.style.display = 'none';

      // 3. Disable input & send button
      if (chatInput) {
        chatInput.disabled = true;
        chatInput.placeholder = 'Meetup ended. Chat history permanently deleted for privacy.';
        chatInput.value = '';
      }
      if (sendBtn) sendBtn.disabled = true;

      // 4. Update sidebar snippet for privacy reflection
      const chanSnippet = document.querySelector(`.chat-channel-item[data-channel="${channelKey}"] .channel-snippet`);
      if (chanSnippet) {
        chanSnippet.textContent = '🔒 Chat history deleted for privacy';
      }

      // 5. Render dedicated privacy purged banner
      if (chatStream) {
        chatStream.innerHTML = `
          <div class="chat-privacy-purged-view">
            <div class="purged-shield-icon">🛡️</div>
            <h4>Group Meetup Concluded · Chat History Deleted</h4>
            <p>In accordance with SkillMate student privacy policy, this circle meetup has ended and all squad messages, media, and chat records have been permanently erased.</p>
            <div class="privacy-badges-row">
              <span>🔒 0 Stored Messages</span>
              <span>🗑️ Permanently Purged</span>
              <span>🛡️ Member Privacy Guaranteed</span>
            </div>
            <button type="button" class="btn-start-fresh-meetup" id="btn-reopen-circle-inline">+ Start New Meetup Session 🔄</button>
          </div>
        `;
        const inlineReopen = document.getElementById('btn-reopen-circle-inline');
        if (inlineReopen) {
          inlineReopen.onclick = () => setCircleEndedState(false, channelKey);
        }
      }

      if (!isPassive) {
        showToast('Circle meetup concluded. Group chat permanently deleted for privacy. 🛡️');
      }
    } else {
      // Reopening / starting a fresh active session
      if (chan) {
        chan.isEnded = false;
        // Do not resurrect erased messages: starts clean!
      }

      if (chatCircleStatus) {
        chatCircleStatus.textContent = '🟢 Active Meetup · Chat Active';
        chatCircleStatus.classList.remove('ended');
        chatCircleStatus.classList.add('active');
      }

      if (chatArchivedBanner) chatArchivedBanner.style.display = 'none';
      if (btnReopenCircle) btnReopenCircle.style.display = 'none';
      if (btnEndCircle) btnEndCircle.style.display = 'inline-flex';

      if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = 'Type a message to the circle squad...';
      }
      if (sendBtn) sendBtn.disabled = false;

      const chanSnippet = document.querySelector(`.chat-channel-item[data-channel="${channelKey}"] .channel-snippet`);
      if (chanSnippet) {
        chanSnippet.textContent = 'Live squad session active';
      }

      if (!isPassive && chatStream) {
        chatStream.innerHTML = `
          <div class="chat-message-bubble incoming system-notice">
            <div class="msg-avatar" style="background:var(--accent-primary);">🟢</div>
            <div class="msg-bubble-content" style="border-left:3px solid var(--accent-primary);">
              <div class="msg-sender-name" style="color:var(--accent-primary);">SkillMate Privacy Guard</div>
              <div class="msg-text">New meetup session started! Live chats are active and will be permanently deleted once this session concludes.</div>
              <div class="msg-time">Just now</div>
            </div>
          </div>
        `;
        showToast('New meetup session started! Fresh ephemeral chat ready.');
      }
    }
  }

  if (btnEndCircle) {
    btnEndCircle.addEventListener('click', (e) => {
      e.preventDefault();
      setCircleEndedState(true);
    });
  }

  if (btnReopenCircle) {
    btnReopenCircle.addEventListener('click', (e) => {
      e.preventDefault();
      setCircleEndedState(false);
    });
  }

  // Sending Chat Message with Simulated Peer Reply
  if (chatForm && chatInput && chatStream) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (chatInput.disabled) return;
      const text = chatInput.value.trim();
      if (!text) return;

      const userName = state.user ? state.user.name : 'You';
      const initials = state.user ? state.user.initials : 'ME';
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Append Outgoing Bubble
      const outBubble = document.createElement('div');
      outBubble.className = 'chat-message-bubble outgoing';
      outBubble.innerHTML = `
        <div class="msg-avatar" style="background:var(--accent-secondary);">${initials}</div>
        <div class="msg-bubble-content">
          <div class="msg-sender-name">${userName}</div>
          <div class="msg-text">${text}</div>
          <div class="msg-time">${nowTime}</div>
        </div>
      `;
      chatStream.appendChild(outBubble);
      chatInput.value = '';
      chatStream.scrollTop = chatStream.scrollHeight;

      // Realistic automated reply from active campus peer after 1.2s
      setTimeout(() => {
        const sampleReplies = [
          "Got it! Looking forward to this session! 🔥",
          "Noted! Will reach the spot 10 minutes early. 👍",
          "Sounds like a plan! Everyone get your gear ready. ✨",
          "Awesome coordination! See you all there at the venue. 🚀",
          "Count me in, this circle meetup is going to be great! ☕"
        ];
        const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-message-bubble incoming';
        replyBubble.innerHTML = `
          <div class="msg-avatar" style="background:var(--accent-tertiary);">RV</div>
          <div class="msg-bubble-content">
            <div class="msg-sender-name">Riya Verma</div>
            <div class="msg-text">${randomReply}</div>
            <div class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `;
        chatStream.appendChild(replyBubble);
        chatStream.scrollTop = chatStream.scrollHeight;
      }, 1200);
    });
  }


  // ==========================================================================
  // CINEMATIC STORYTELLING & SCROLL ANIMATION ENGINE
  // Inspired by Locomotive, Cula.earth, Penumbra & Apple AirPods Pro
  // ==========================================================================
  function initCinematicScrollEngine() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenisInstance = null;

    // 1. Lenis Smooth Scrolling
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
      try {
        lenisInstance = new Lenis({
          lerp: 0.08,
          wheelMultiplier: 0.9,
          smoothWheel: true,
          touchMultiplier: 1.5,
          virtualScroll: (t) => {
            // Completely bypass Lenis whenever the student app is active so all student pages scroll natively
            if (state.user || (viewStudentApp && viewStudentApp.style.display !== 'none')) {
              return false;
            }
            return true;
          },
          prevent: (node) => {
            if (!node || !(node instanceof HTMLElement)) return false;
            // Prevent Lenis from intercepting any modals, dropdowns, chat, or inner scrollables
            return !!node.closest(
              '[data-lenis-prevent], .modal-backdrop, .modal-content-box, #auth-modal, #circle-detail-modal, #google-account-chooser-modal, #edit-profile-modal, #upload-memory-modal, .dropdown-panel, .chat-messages-container, #chat-messages-stream, .chat-channels-list'
            );
          }
        });
        window.__skillmateLenis = lenisInstance;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          lenisInstance.on('scroll', ScrollTrigger.update);
          gsap.ticker.add((time) => {
            lenisInstance.raf(time * 1000);
          });
          gsap.ticker.lagSmoothing(0);
        } else {
          function raf(time) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
        }
      } catch (err) {
        console.warn('Lenis smooth scrolling fallback:', err);
      }
    }

    // 2. GSAP & ScrollTrigger Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      try {
        gsap.registerPlugin(ScrollTrigger);

        // Chapter 1: First Viewport Entrance & Scroll Dynamics
        const heroBadge = document.querySelector('.hero-badge-pill');
        if (heroBadge) {
          const heroTl = gsap.timeline({ delay: 0.1 });
          heroTl
            .from('.hero-badge-pill', { y: -16, opacity: 0, duration: 0.6, ease: 'power2.out' })
            .from('.hero-title', { y: 22, opacity: 0, duration: 0.75, ease: 'power2.out' }, '-=0.35')
            .from('.hero-subtitle', { y: 18, opacity: 0, duration: 0.65, ease: 'power2.out' }, '-=0.35')
            .from('.hero-cta-cluster', { y: 18, opacity: 0, duration: 0.65, ease: 'power2.out' }, '-=0.35')
            .from('.hero-social-proof', { y: 15, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
            .from('.hero-metrics-row', { y: 15, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
            .from('.visual-card-main', { scale: 0.94, opacity: 0, duration: 0.85, ease: 'back.out(1.2)' }, '-=0.6')
            .from('.visual-sat-card', { scale: 0.88, opacity: 0, stagger: 0.14, duration: 0.75, ease: 'power2.out' }, '-=0.5')
            .from('.visual-live-pill, .visual-safe-pill', { scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.35');

          // Subtle scroll exit into Chapter 2 (Locomotive / Apple style)
          gsap.to('.hero-visual-stage', {
            y: 45,
            opacity: 0.85,
            ease: 'none',
            scrollTrigger: {
              trigger: '#chapter-hook',
              start: 'top top',
              end: 'bottom 40%',
              scrub: 1,
            }
          });
          gsap.to('.hero-content-col', {
            y: -30,
            opacity: 0.85,
            ease: 'none',
            scrollTrigger: {
              trigger: '#chapter-hook',
              start: 'top top',
              end: 'bottom 50%',
              scrub: 1,
            }
          });
        }

        // Chapter 2: The Problem (Sticky Visual Window & Friction Cards Reveal)
        const frictionCards = document.querySelectorAll('.friction-card');
        frictionCards.forEach((card, idx) => {
          gsap.from(card, {
            opacity: 0.25,
            y: 35,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 50%',
              scrub: 0.8,
            }
          });
        });

        // Chapter 4: Connection Convergence (Opposing cards locking into center)
        const cardLeft = document.getElementById('card-converge-left');
        const cardRight = document.getElementById('card-converge-right');
        const sparkCenter = document.getElementById('convergence-spark-center');

        if (cardLeft && cardRight && sparkCenter) {
          gsap.from(cardLeft, {
            x: -80,
            opacity: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#convergence-arena',
              start: 'top 75%',
              end: 'center center',
              scrub: 1,
            }
          });

          gsap.from(cardRight, {
            x: 80,
            opacity: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#convergence-arena',
              start: 'top 75%',
              end: 'center center',
              scrub: 1,
            }
          });

          gsap.from(sparkCenter, {
            scale: 0.75,
            opacity: 0.2,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: '#convergence-arena',
              start: 'top 65%',
              end: 'center center',
              scrub: 1,
            }
          });
        }

        // Chapter 5: 4-Stage Experience Stepper (Cula.earth style synchronizing phone mockup)
        const stageSteps = document.querySelectorAll('.journey-stage-step');
        stageSteps.forEach((step, idx) => {
          ScrollTrigger.create({
            trigger: step,
            start: 'top 60%',
            end: 'bottom 60%',
            onEnter: () => {
              stageSteps.forEach(s => s.classList.remove('active'));
              step.classList.add('active');
              // Automatically switch phone mockup view to match narrative
              if (idx === 0 || idx === 1) {
                const feedBtn = document.querySelector('[data-phone-tab="feed"]');
                if (feedBtn) feedBtn.click();
              } else if (idx === 2) {
                const radarBtn = document.querySelector('[data-phone-tab="radar"]');
                if (radarBtn) radarBtn.click();
              } else if (idx === 3) {
                const squadBtn = document.querySelector('[data-phone-tab="squad"]');
                if (squadBtn) squadBtn.click();
              }
            },
            onEnterBack: () => {
              stageSteps.forEach(s => s.classList.remove('active'));
              step.classList.add('active');
            }
          });
        });

        // Chapter 6: Testimonials Stagger
        const testCards = document.querySelectorAll('.testimonial-editorial-card');
        if (testCards.length > 0) {
          gsap.from(testCards, {
            y: 45,
            opacity: 0,
            stagger: 0.16,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.testimonials-masonry-grid',
              start: 'top 80%',
            }
          });
        }

        // Chapter 7: CTA Emblem & Headline Reveal
        const ctaStage = document.querySelector('.cta-cinematic-stage');
        if (ctaStage) {
          gsap.from(ctaStage, {
            scale: 0.94,
            opacity: 0.7,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaStage,
              start: 'top 85%',
              end: 'top 50%',
              scrub: 1,
            }
          });
        }

        // Floating Narrative HUD Chapter Tracker
        const hudChapterText = document.getElementById('hud-chapter-text');
        const hudProgressFill = document.getElementById('hud-progress-fill');
        const narrativeChapters = [
          { id: 'chapter-hook', label: 'Chapter 01 · Community' },
          { id: 'chapter-problem', label: 'Chapter 02 · Why SkillMate' },
          { id: 'chapter-discovery', label: 'Chapter 03 · Explore Circles' },
          { id: 'chapter-connection', label: 'Chapter 04 · Micro-Proximity' },
          { id: 'chapter-experience', label: 'Chapter 05 · How It Works' },
          { id: 'chapter-community', label: 'Chapter 06 · Campus Voices' },
          { id: 'chapter-cta', label: 'Chapter 07 · Step Inside' },
        ];

        narrativeChapters.forEach(ch => {
          const el = document.getElementById(ch.id);
          if (el) {
            ScrollTrigger.create({
              trigger: el,
              start: 'top center',
              end: 'bottom center',
              onEnter: () => { if (hudChapterText) hudChapterText.textContent = ch.label; },
              onEnterBack: () => { if (hudChapterText) hudChapterText.textContent = ch.label; }
            });
          }
        });

        // Real-time HUD scroll progress fill
        window.addEventListener('scroll', () => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
          if (hudProgressFill) hudProgressFill.style.width = `${Math.min(pct, 100)}%`;
        }, { passive: true });

      } catch (e) {
        console.warn('ScrollTrigger choreography setup:', e);
      }
    }

    // 3. Horizontal Discovery Scroll Gallery Interaction
    // Natural vertical two-finger scroll moves the page up/down; sideways trackpad gestures scroll the gallery horizontally
    const horizContainer = document.getElementById('horizontal-scroll-container');

    // 4. Craft Filter Toolbar in Discovery Section
    const craftFilterBtns = document.querySelectorAll('.craft-filter-pill');
    const hobbyCards = document.querySelectorAll('.hobby-exhibit-card');
    craftFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        craftFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        hobbyCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 5. Interactive Micro-Radius Scanner Slider (Chapter 4)
    const radarSlider = document.getElementById('radar-range-slider');
    const radarDisplay = document.getElementById('radar-slider-display');
    const radarCountText = document.getElementById('radar-count-text');

    if (radarSlider && radarDisplay && radarCountText) {
      radarSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        radarDisplay.textContent = `${val.toFixed(1)} km`;
        const estCircles = Math.min(Math.round(val * 4.2 + 2), 65);
        const estPeers = Math.min(Math.round(val * 11 + 6), 190);
        radarCountText.textContent = `Within ${val.toFixed(1)} km: ${estCircles} Active Circles · ${estPeers} Campus Peers Active Tonight`;
      });
    }

    // 6. FAQ Accordion Handler (Chapter 7)
    const faqItems = document.querySelectorAll('.faq-accordion-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-accordion-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) item.classList.add('open');
        });
      }
    });


    // Horizontal Gallery Prev/Next Button Controls
    const prevBtn = document.getElementById('horiz-prev-btn');
    const nextBtn = document.getElementById('horiz-next-btn');
    if (prevBtn && nextBtn && horizContainer) {
      prevBtn.addEventListener('click', () => {
        horizContainer.scrollBy({ left: -420, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        horizContainer.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }

    // Step clicks in Chapter 5
    document.querySelectorAll('.journey-stage-step').forEach((step, idx) => {
      step.style.cursor = 'pointer';
      step.addEventListener('click', () => {
        document.querySelectorAll('.journey-stage-step').forEach(s => s.classList.remove('active'));
        step.classList.add('active');
        if (idx === 0 || idx === 1) {
          const feedBtn = document.querySelector('[data-phone-tab="feed"]');
          if (feedBtn) feedBtn.click();
        } else if (idx === 2) {
          const radarBtn = document.querySelector('[data-phone-tab="radar"]');
          if (radarBtn) radarBtn.click();
        } else if (idx === 3) {
          const squadBtn = document.querySelector('[data-phone-tab="squad"]');
          if (squadBtn) squadBtn.click();
        }
      });
    });

    // Recalibrate ScrollTrigger when all fonts & images finish loading
    window.addEventListener('load', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });

    // 7. Locomotive-Style Magnetic Button Hover Interaction
    if (!prefersReducedMotion) {
      document.querySelectorAll('.btn-cinematic-primary, #btn-hook-get-started, #btn-final-cta-get-started').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }

    // 8. Multi-Layer Cursor Parallax on First Viewport Orbit Cards
    if (!prefersReducedMotion) {
      const heroViewport = document.getElementById('chapter-hook');
      if (heroViewport) {
        heroViewport.addEventListener('mousemove', (e) => {
          if (window.innerWidth < 992) return;
          const rect = heroViewport.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const deltaX = (e.clientX - rect.left - centerX) / centerX;
          const deltaY = (e.clientY - rect.top - centerY) / centerY;

          heroViewport.querySelectorAll('[data-depth]').forEach(el => {
            const depth = parseFloat(el.getAttribute('data-depth')) || 0.05;
            const moveX = (deltaX * depth * 42).toFixed(2);
            const moveY = (deltaY * depth * 42).toFixed(2);
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
          });
        });

        heroViewport.addEventListener('mouseleave', () => {
          heroViewport.querySelectorAll('[data-depth]').forEach(el => {
            el.style.transform = '';
          });
        });
      }
    }
  }

  // ==========================================================================
  // UNIVERSAL TOUCHPAD & WHEEL SCROLL ASSURANCE
  // Enables smooth two-finger touchpad scrolling, mouse wheels, and touch gestures
  // across group chat stream, channels list, all popups/modals, dropdowns & tabs
  // ==========================================================================
  function initUniversalScrollSupport() {
    // Only inner overflow sub-containers should have overscroll-behavior contain & local wheel capture
    const innerScrollContainers = [
      '#chat-messages-stream',
      '.chat-messages-container',
      '.chat-channels-list',
      '#chat-channels-list',
      '.modal-content-box',
      '.dropdown-panel'
    ];

    function applyInnerScroll(el) {
      if (!el) return;
      el.setAttribute('data-lenis-prevent', 'true');
      el.setAttribute('data-lenis-prevent-wheel', 'true');
      el.setAttribute('data-lenis-prevent-touch', 'true');
      el.style.overscrollBehavior = 'contain';
      el.style.touchAction = 'pan-y';

      // Keep wheel events inside the scrollable container when it has room to scroll
      el.addEventListener('wheel', (e) => {
        if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
          e.stopPropagation();
        }
      }, { passive: true });
    }

    document.querySelectorAll(innerScrollContainers.join(', ')).forEach(applyInnerScroll);
  }

  // ==========================================================================
  // TOPBAR SCROLLSPY & DYNAMIC SECTION TRACKER
  // Keeps the topbar active indicator synchronized with the currently viewed section
  // ==========================================================================
  function initNavScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-box-links .nav-link-pill');
    if (!navLinks.length) return;

    const sections = [
      { id: 'chapter-discovery', selector: 'a[href="#chapter-discovery"]' },
      { id: 'chapter-experience', selector: 'a[href="#chapter-experience"]' },
      { id: 'safety', selector: 'a[href="#safety"]' },
      { id: 'faq', selector: 'a[href="#faq"]' },
      { id: 'about', selector: 'a[href="#about"]' }
    ];

    function updateActiveLink() {
      // If at top of page (hero), clear active highlight
      if (window.scrollY < 300) {
        navLinks.forEach(l => l.classList.remove('active'));
        return;
      }

      // If at the very bottom of page, activate 'About' (last link)
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= docHeight - 80) {
        navLinks.forEach(l => l.classList.remove('active'));
        const aboutLink = document.querySelector('.nav-box-links a[href="#about"]');
        if (aboutLink) aboutLink.classList.add('active');
        return;
      }

      const headerOffset = 140;
      let activeSelector = null;

      // Find section currently occupying the top reading viewport
      for (let i = 0; i < sections.length; i++) {
        const sec = document.getElementById(sections[i].id);
        if (sec) {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= headerOffset && rect.bottom > headerOffset) {
            activeSelector = sections[i].selector;
            break;
          }
        }
      }

      // If between sections, fallback to the latest section scrolled past
      if (!activeSelector) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const sec = document.getElementById(sections[i].id);
          if (sec) {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= headerOffset + 60) {
              activeSelector = sections[i].selector;
              break;
            }
          }
        }
      }

      navLinks.forEach(l => l.classList.remove('active'));
      if (activeSelector) {
        const activeLink = document.querySelector(`.nav-box-links ${activeSelector}`);
        if (activeLink) activeLink.classList.add('active');
      }
    }

    // Attach smooth scrolling and click handler for nav links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            if (window.__skillmateLenis) {
              window.__skillmateLenis.scrollTo(target, { offset: -70, duration: 1.0 });
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    });

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    if (window.__skillmateLenis) {
      window.__skillmateLenis.on('scroll', updateActiveLink);
    }

    // Initial check
    setTimeout(updateActiveLink, 100);
  }

  // Initialize Cinematic Scroll Engine & Nav ScrollSpy
  initCinematicScrollEngine();
  initUniversalScrollSupport();
  initNavScrollSpy();

  // Initial State Check
  updateAuthUI();
  if (state.currentTheme !== 'skillmate-calm') {
    applyTheme(state.currentTheme);
  }
  applyLanguage(state.currentLang);
});
