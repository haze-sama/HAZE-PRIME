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
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(255, 255, 255, 0.8)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.2) this.size -= 0.01;
        if (this.size <= 0.2) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }
      }

      draw() {
        ctx.fillStyle = this.color;
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
              targetElement.scrollIntoView({
                  behavior: 'smooth'
              });
          }
          if(menuToggle && menuToggle.checked) {
              menuToggle.checked = false;
          }
      });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!menu || !menuToggle) return;
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnToggle = document.querySelector(`label[for=${menuToggle.id}]`).contains(event.target);

    if (!isClickInsideMenu && !isClickOnToggle && menuToggle.checked) {
      menuToggle.checked = false;
    }
  });


  // --- GSAP Scroll Animations ---
  gsap.from('#home h1', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#home', start: 'top 80%' } });
  gsap.from('#home p', { y: 50, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '#home', start: 'top 75%' } });
  gsap.from('#home a', { y: 50, opacity: 0, duration: 1, delay: 0.4, ease: 'power3.out', scrollTrigger: { trigger: '#home', start: 'top 70%' } });
  
  document.querySelectorAll('.card').forEach(card => {
    gsap.from(card, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
        }
    });
  });

  // --- Form Submission ---
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    openPopup('success-message');
    e.target.reset();
  });
  
  // --- Initial State for Pagination Buttons ---
  document.getElementById('blog-prev-btn').disabled = true;
  document.getElementById('portfolio-web-prev-btn').disabled = true;
  document.getElementById('portfolio-uiux-prev-btn').disabled = true;
  document.getElementById('portfolio-graphic-prev-btn').disabled = true;

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
    if(activeLink) activeLink.classList.add('active');

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
    // Reset page to 1 when switching tabs
    const state = pageStates[portfolioId];
    if (state && state.currentPage !== 1) {
        // This calculates the direction to get back to page 1
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

function handlePageChange(section, direction, animate = true) {
    const state = pageStates[section];
    if (!state) return;
    
    const newPage = state.currentPage + direction;

    if (newPage < 1 || newPage > state.totalPages) {
        return;
    }

    const oldPageEl = document.getElementById(`${section}-page-${state.currentPage}`);
    const newPageEl = document.getElementById(`${section}-page-${newPage}`);

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
    
    document.getElementById(`${section}-prev-btn`).disabled = state.currentPage === 1;
    document.getElementById(`${section}-next-btn`).disabled = state.currentPage === state.totalPages;
}

// --- Dynamic Blog Setup ---
const blogData = [
    { id: 1, title: "5 Trucos para un Sitio Web Rápido", desc: "Optimiza con Lighthouse.", img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 2, title: "Guía Básica de SEO", desc: "Estrategias para Google.", img: "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 3, title: "Errores UI a Evitar", desc: "Consejos para interfaces.", img: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 4, title: "Tendencias de Diseño Web", desc: "Lo nuevo para el próximo año.", img: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 5, title: "Optimización Mobile", desc: "Mejora la experiencia móvil.", img: "https://images.unsplash.com/photo-1605152276897-4f61878926c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 6, title: "Estrategias Redes Sociales", desc: "Conecta con tu audiencia.", img: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 7, title: "Claves para un Branding Exitoso", desc: "Construye una marca memorable.", img: "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 8, title: "IA en el Desarrollo Web", desc: "Cómo la IA está cambiando el juego.", img: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 9, title: "Ciberseguridad para Principiantes", desc: "Protege tu sitio web de ataques.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 10, title: "Tips para tu E-Commerce", desc: "Aumenta tus ventas online.", img: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 11, title: "El Mundo del Freelance", desc: "Consejos para empezar con éxito.", img: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 12, title: "Accesibilidad Web Importa", desc: "Crea una web inclusiva para todos.", img: "https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 13, title: "Métricas Clave en Marketing", desc: "Mide lo que realmente importa.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 14, title: "Headless CMS: El Futuro", desc: "¿Por qué deberías considerarlo?", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 15, title: "Herramientas para Freelancers", desc: "Optimiza tu flujo de trabajo.", img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 16, title: "El Poder del Email Marketing", desc: "No lo subestimes en tu estrategia.", img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 17, title: "Cómo Escribir un Buen Brief", desc: "La clave para un proyecto exitoso.", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 18, title: "Psicología de Precios", desc: "Define tus tarifas como un pro.", img: "https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 19, title: "JavaScript Frameworks en 2025", desc: "React vs. Vue vs. Svelte.", img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 20, title: "Psicología del Color en Diseño", desc: "Comunica con los colores correctos.", img: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 21, title: "El Video es el Rey del Contenido", desc: "Por qué debes invertir en video.", img: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 22, title: "Importancia del SEO Local", desc: "Atrae clientes de tu área.", img: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 23, title: "Cómo Gestionar Clientes", desc: "Construye relaciones duraderas.", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
    { id: 24, title: "Fotografía para tu Web", desc: "El impacto de las imágenes de calidad.", img: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60" },
];

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
                            <p
