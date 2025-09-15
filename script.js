document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- Particle Animation ---
  function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    const particles = [];
    const particleCount = 100; // un poco menos para rendimiento

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulseDirection = 1;
        this.pulseSpeed = Math.random() * 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.opacity >= 0.8) this.pulseDirection = -1;
        if (this.opacity <= 0.1) this.pulseDirection = 1;
        this.opacity += this.pulseDirection * this.pulseSpeed;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function createParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    }

    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
  }

  initParticles('header-particles');
  initParticles('particles');
  initParticles('services-particles');
  initParticles('contact-particles');

  // --- Smooth Scroll & Menu Logic ---
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
      if (menuToggle && menuToggle.checked) {
        menuToggle.checked = false;
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (event) {
    if (!menu || !menuToggle) return;
    const isClickInsideMenu = menu.contains(event.target);
    const label = document.querySelector(`label[for=${menuToggle.id}]`);
    const isClickOnToggle = label ? label.contains(event.target) : false;

    if (!isClickInsideMenu && !isClickOnToggle && menuToggle.checked) {
      menuToggle.checked = false;
    }
  });

  // --- GSAP Scroll Animations ---
  gsap.from(['#home h1', '#home p', '#home a'], {
    y: 40,
    opacity: 0,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#home',
      start: 'top 80%',
    }
  });

  gsap.utils.toArray('.card').forEach(card => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // --- Form Submission ---
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      openPopup('success-message');
      e.target.reset();
    });
  }

  // --- Initial State for Pagination Buttons ---
  const safeDisable = (id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  };
  safeDisable('blog-prev-btn');
  safeDisable('portfolio-web-prev-btn');
  safeDisable('portfolio-uiux-prev-btn');
  safeDisable('portfolio-graphic-prev-btn');

  // --- Setup Dynamic Content ---
  setupBlog();
  setupPopups();
});

// --- Tab Navigation Logic ---
function showSection(sectionPrefix, sectionId, event) {
  if (event) event.preventDefault();

  const navLinks = document.querySelectorAll(`.${sectionPrefix}-nav a`);
  navLinks.forEach(link => link.classList.remove('active'));

  const activeLink = document.querySelector(`.${sectionPrefix}-nav a[href="#${sectionId}"]`);
  if (activeLink) activeLink.classList.add('active');

  const sections = document.querySelectorAll(`.${sectionPrefix}-section`);
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });
}

function showService(serviceId, event) {
  showSection('service', serviceId, event);
}

function showPortfolio(portfolioId, event) {
  showSection('portfolio', portfolioId, event);
  const state = pageStates[portfolioId];
  if (state && state.currentPage !== 1) {
    handlePageChange(portfolioId, 1 - state.currentPage, false);
  }
}

// --- Pagination Logic ---
const pageStates = {
  blog: { currentPage: 1, totalPages: 6 },
  'portfolio-web': { currentPage: 1, totalPages: 2 },
  'portfolio-uiux': { currentPage: 1, totalPages: 2 },
  'portfolio-graphic': { currentPage: 1, totalPages: 2 }
};

function scrollPortfolio(category, direction) {
  handlePageChange(`portfolio-${category}`, direction, true);
}

function handlePageChange(sectionKey, direction, animate = true) {
  const state = pageStates[sectionKey];
  if (!state) return;

  const newPage = state.currentPage + direction;
  if (newPage < 1 || newPage > state.totalPages) return;

  const oldPageEl = document.getElementById(`${sectionKey}-page-${state.currentPage}`);
  const newPageEl = document.getElementById(`${sectionKey}-page-${newPage}`);
  if (!oldPageEl || !newPageEl) return;

  if (animate) {
    gsap.to(oldPageEl, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        oldPageEl.classList.add('hidden');
        newPageEl.classList.remove('hidden');
        gsap.fromTo(newPageEl, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }
    });
  } else {
    oldPageEl.classList.add('hidden');
    newPageEl.classList.remove('hidden');
  }

  state.currentPage = newPage;

  const prevBtn = document.getElementById(`${sectionKey}-prev-btn`);
  const nextBtn = document.getElementById(`${sectionKey}-next-btn`);
  if (prevBtn) prevBtn.disabled = state.currentPage === 1;
  if (nextBtn) nextBtn.disabled = state.currentPage === state.totalPages;
}

// --- Dynamic Blog Setup ---
const blogData = [/* ...tu data de blog... */];

function setupBlog() {
  const container = document.querySelector('#blog .blog-container');
  if (!container) return;

  const cardsPerPage = 4;
  const numPages = Math.ceil(blogData.length / cardsPerPage);
  pageStates.blog.totalPages = numPages;

  let allCardsHTML = '';
  for (let i = 0; i < numPages; i++) {
    const pageCards = blogData.slice(i * cardsPerPage, (i + 1) * cardsPerPage);
    let pageHTML = `<div class="blog-page ${i !== 0 ? 'hidden' : ''}" id="blog-page-${i + 1}">`;

    pageCards.forEach(card => {
      pageHTML += `
        <div class="card p-6">
          <div class="card-content">
            <img src="${card.img}" alt="${card.title}" class="w-full h-40 object-cover rounded-lg mb-4">
            <div class="flex-grow">
              <h3 class="text-xl font-semibold mb-2 text-indigo-600">${card.title}</h3>
              <p class="text-gray-600">${card.desc}</p>
            </div>
            <div class="mt-auto pt-4">
              <button class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:from-indigo-500 hover:to-purple-500 transition neon-blue" onclick="openPopup('blog-${card.id}')">Ver Más</button>
            </div>
          </div>
        </div>
      `;
    });

    pageHTML += `</div>`;
    allCardsHTML += pageHTML;
  }
  container.innerHTML = allCardsHTML;

  const prevBtn = document.getElementById('blog-prev-btn');
  const nextBtn = document.getElementById('blog-next-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => handlePageChange('blog', -1, true));
  if (nextBtn) nextBtn.addEventListener('click', () => handlePageChange('blog', 1, true));
}

// --- Dynamic Popup Setup ---
function setupPopups() {
  const popupContainer = document.getElementById('popup-container');
  if (!popupContainer) return;

  const popupsData = [/* ...tu data de popups... */];
  // Generación dinámica igual que en tu código original
  }
