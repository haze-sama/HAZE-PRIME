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
    
    document.getElementById('blog-prev-btn').addEventListener('click', () => handlePageChange('blog', -1, true));
    document.getElementById('blog-next-btn').addEventListener('click', () => handlePageChange('blog', 1, true));
}

// --- Dynamic Popup Setup ---
function setupPopups() {
    const popupContainer = document.getElementById('popup-container');
    const popupsData = [
        // Skill Popups
        { id: 'skill-web', title: 'Desarrollo Web de Vanguardia', content: 'Transformo ideas en realidades digitales funcionales y estéticamente impecables. Mi enfoque se centra en la arquitectura de software robusta, utilizando tecnologías de punta como React, Vue.js y Node.js para construir aplicaciones web rápidas, escalables y seguras. Cada línea de código está optimizada para el rendimiento, garantizando una experiencia de usuario fluida y tiempos de carga mínimos. Desde sitios corporativos hasta aplicaciones complejas, entrego soluciones a medida que impulsan el crecimiento del negocio.', img: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-cms', title: 'Gestión de Contenidos (CMS)', content: 'Empodero a mis clientes con la capacidad de gestionar su propio contenido de manera intuitiva y eficiente. Me especializo en la personalización de plataformas líderes como WordPress y Shopify, transformándolas en herramientas potentes y adaptadas a las necesidades específicas de cada proyecto. Mi trabajo va más allá de la instalación de un tema; desarrollo funcionalidades a medida, optimizo la velocidad de carga y aseguro que el panel de administración sea tan amigable que actualizar el sitio se convierta en una tarea sencilla y no en un obstáculo técnico.', img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-uiux', title: 'Diseño de Experiencia e Interfaz (UI/UX)', content: 'Creo interfaces que no solo se ven bien, sino que se sienten intuitivas y satisfactorias de usar. Mi proceso de diseño está centrado en el usuario, comenzando con una investigación profunda para entender sus necesidades y comportamientos. Utilizando herramientas como Figma, construyo flujos de usuario lógicos, wireframes detallados y prototipos interactivos que validan la experiencia antes del desarrollo. El resultado final es un diseño visualmente atractivo y altamente funcional que guía al usuario hacia sus objetivos y fortalece la conexión con la marca.', img: 'https://images.unsplash.com/photo-1559028006-44d08a09e088?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-graphic', title: 'Diseño Gráfico y Branding', content: 'Construyo identidades visuales memorables que comunican la esencia de una marca. Desde la creación de un logotipo impactante hasta el desarrollo de un sistema de branding completo, mi enfoque es estratégico y creativo. Utilizo principios de diseño fundamentales y herramientas como Illustrator y Photoshop para producir materiales gráficos cohesivos, desde papelería y redes sociales hasta motion graphics que capturan la atención. Cada elemento está diseñado para ser visualmente potente y reforzar el reconocimiento y la lealtad a la marca.', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-seo', title: 'Optimización para Motores de Búsqueda (SEO)', content: 'Aumento la visibilidad orgánica y atraigo tráfico cualificado a tu sitio web. Mi estrategia SEO es integral y basada en datos, abarcando desde la auditoría técnica y la optimización on-page hasta la investigación de palabras clave y la construcción de un perfil de backlinks de autoridad. Entiendo los algoritmos de búsqueda y me mantengo actualizado sobre las mejores prácticas para asegurar que tu sitio no solo clasifique alto en Google, sino que también ofrezca contenido de valor que responda a la intención de búsqueda del usuario, convirtiendo visitantes en clientes.', img: 'https://images.unsplash.com/photo-1560472354-b33ff08c84a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-content', title: 'Creación de Contenido Estratégico', content: 'El contenido es el pilar de la comunicación digital, y me especializo en crearlo de manera estratégica. Desarrollo contenido que no solo informa y entretiene, sino que también educa, establece autoridad y guía a la audiencia a través del embudo de conversión. Desde artículos de blog optimizados para SEO y guiones para videos, hasta copys persuasivos para redes sociales, cada pieza de contenido se crea con un propósito claro y una voz de marca consistente, diseñada para resonar con tu público objetivo y alcanzar tus metas de negocio.', img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-animations', title: 'Animaciones Web y Motion Graphics', content: 'Doy vida a las interfaces y a las historias a través del movimiento. Utilizo tecnologías como GSAP y animaciones CSS avanzadas para crear microinteracciones sutiles, transiciones fluidas y efectos visuales que mejoran la experiencia del usuario y hacen que un sitio web se sienta vivo y moderno. Mi objetivo es utilizar la animación de manera funcional y estética, para guiar la atención del usuario, proporcionar retroalimentación visual y añadir un toque de personalidad que diferencie a tu marca en el competitivo mundo digital.', img: 'https://images.unsplash.com/photo-1603468620905-8de7d86b781e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'skill-strategy', title: 'Estrategia Digital Integral', content: 'El éxito online no es casualidad, es el resultado de una estrategia bien definida. Analizo tu negocio, tu mercado y tu competencia para desarrollar un plan de marketing digital cohesivo que integre todas las piezas del rompecabezas: SEO, contenido, redes sociales, y más. Defino KPIs claros, establezco un roadmap de acciones y mido constantemente los resultados para optimizar el rendimiento. Mi visión estratégica asegura que cada esfuerzo invertido esté alineado con tus objetivos comerciales y contribuya a un crecimiento sostenible a largo plazo.', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        
        // Service Plan Popups
        { id: 'web-bronce', title: 'Sitio Web Estático Básico (Bronce)', content: 'Lanza tu presencia online con un sitio estático de 3-5 páginas, diseño responsivo, animaciones CSS y SEO inicial. Perfecto para startups.<br><br><strong>Entrega:</strong> Código en GitHub, despliegue en Netlify, video tutorial.<br><strong>Precio:</strong> $80 - $150.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'},
        { id: 'web-plata', title: 'Sitio Web Dinámico con CMS (Plata)', content: 'Impulsa tu marca con un sitio WordPress de 5-10 páginas, tema personalizado, SEO avanzado y animaciones GSAP. Ideal para blogs y negocios.<br><br><strong>Entrega:</strong> Acceso CMS, archivos en Google Drive, documentación PDF.<br><strong>Precio:</strong> $300 - $480.', img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80'},
        { id: 'web-oro', title: 'Aplicación Web Full-Stack (Oro)', content: 'Domina el mercado con una app React y Node.js, base de datos, autenticación JWT y soporte 30 días. Para proyectos ambiciosos.<br><br><strong>Entrega:</strong> Código en GitHub, despliegue en AWS, documentación API.<br><strong>Precio:</strong> $900 - $1,500.', img: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80'},
        { id: 'uiux-bronce', title: 'Wireframes UI/UX (Bronce)', content: 'Wireframes estáticos para 3-5 pantallas en Figma. Ideal para startups que planean su app.<br><br><strong>Entrega:</strong> Archivos Figma, exportaciones PNG/PDF.<br><strong>Precio:</strong> $40 - $80.', img: 'https://images.unsplash.com/photo-1589122823055-6c9b56f8a45e?auto=format&fit=crop&w=600&q=80'},
        { id: 'uiux-plata', title: 'Prototipo UI/UX (Plata)', content: 'Prototipo clickable de 5-10 pantallas con transiciones suaves. Perfecto para pruebas de usuario y validación.<br><br><strong>Entrega:</strong> Enlace Figma, exportaciones PNG/SVG, video explicativo.<br><strong>Precio:</strong> $150 - $250.', img: 'https://images.unsplash.com/photo-1558507652-2d9626c4e67a?auto=format&fit=crop&w=600&q=80'},
        { id: 'uiux-oro', title: 'Sistema de Diseño UI/UX (Oro)', content: 'Guía completa con componentes reutilizables, paleta de colores y pruebas de usuario. Ideal para proyectos escalables.<br><br><strong>Entrega:</strong> Archivos Figma, documentación PDF, soporte 15 días.<br><strong>Precio:</strong> $400 - $800.', img: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?auto=format&fit=crop&w=600&q=80'},
        { id: 'seo-bronce', title: 'Auditoría SEO (Bronce)', content: 'Análisis on-page detallado con recomendaciones accionables. Ideal para sitios nuevos o pequeños.<br><br><strong>Entrega:</strong> Informe PDF, lista de keywords, plan de acción.<br><strong>Precio:</strong> $50 - $75.', img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=600&q=80'},
        { id: 'seo-plata', title: 'Optimización SEO (Plata)', content: 'Optimización de 5 páginas con 10-20 keywords, incluyendo metaetiquetas y enlaces internos. Perfecto para negocios en crecimiento.<br><br><strong>Entrega:</strong> Informe PDF, optimización implementada, reporte inicial.<br><strong>Precio:</strong> $150 - $250.', img: 'https://images.unsplash.com/photo-1551288049-a94711e582A8?auto=format&fit=crop&w=600&q=80'},
        { id: 'seo-oro', title: 'Estrategia SEO Completa (Oro)', content: 'Estrategia avanzada con 20+ backlinks de calidad, auditoría completa y reportes mensuales. Para dominar tu nicho en Google.<br><br><strong>Entrega:</strong> Plan SEO, backlinks, reportes mensuales, soporte 30 días.<br><strong>Precio:</strong> $480 - $900.', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80'},
        { id: 'content-bronce', title: 'Artículos SEO (Bronce)', content: 'Artículos optimizados de 500-700 palabras con 1-2 imágenes. Ideal para blogs nuevos o redes sociales.<br><br><strong>Entrega:</strong> Documento Word, imágenes editadas, publicación opcional.<br><strong>Precio:</strong> $10 - $15.', img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80'},
        { id: 'content-plata', title: 'Contenido Multimedia (Plata)', content: 'Artículos de 1,000-1,500 palabras con infografías o gráficos personalizados. Perfecto para redes y blogs establecidos.<br><br><strong>Entrega:</strong> Documento Word, gráficos PNG/SVG, publicación opcional.<br><strong>Precio:</strong> $30 - $55.', img: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=600&q=80'},
        { id: 'content-oro', title: 'Contenido Premium (Oro)', content: 'E-books de 10-20 páginas o videos editados (3-5 min) con SEO avanzado. Ideal para campañas de alto impacto.<br><br><strong>Entrega:</strong> PDF o MP4, archivos fuente, publicación opcional.<br><strong>Precio:</strong> $150 - $250.', img: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=600&q=80'},
        { id: 'graphic-bronce', title: 'Gráficos para Redes (Bronce)', content: '5-7 gráficos optimizados para redes sociales (Instagram, Twitter). Ideal para campañas rápidas.<br><br><strong>Entrega:</strong> Archivos PNG/JPG, editable en Canva.<br><strong>Precio:</strong> $10 - $20.', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=60'},
        { id: 'graphic-plata', title: 'Branding Básico (Plata)', content: 'Logotipo, paleta de colores y plantillas para redes o presentaciones. Perfecto para startups en crecimiento.<br><br><strong>Entrega:</strong> Archivos AI/PNG, guía de marca PDF.<br><strong>Precio:</strong> $50 - $90.', img: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=600&q=60'},
        { id: 'graphic-oro', title: 'Ilustraciones y Animaciones (Oro)', content: 'Ilustraciones personalizadas o animaciones (30-60s) para campañas premium. Ideal para marcas establecidas.<br><br><strong>Entrega:</strong> Archivos AI/MP4, editable en After Effects, guía de uso.<br><strong>Precio:</strong> $330 - $759.', img: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?auto=format&fit=crop&w=600&q=80'},
        { id: 'video-bronce', title: 'Clips Sociales (Bronce)', content: 'Edición de 3-5 videos cortos (hasta 60s) para redes sociales.<br><br><strong>Entrega:</strong> Archivos MP4 optimizados para cada red.<br><strong>Precio:</strong> $12 - $25.', img: 'https://images.unsplash.com/photo-1574627051240-573577d48377?auto=format&fit=crop&w=600&q=60'},
        { id: 'video-plata', title: 'Video Promocional (Plata)', content: 'Video promocional de 1-2 minutos con música y gráficos básicos.<br><br><strong>Entrega:</strong> Archivo MP4 en alta resolución.<br><strong>Precio:</strong> $60 - $120.', img: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&w=600&q=60'},
        { id: 'video-oro', title: 'Producción Completa (Oro)', content: 'Video de marketing (2-5 min) con efectos avanzados y corrección de color.<br><br><strong>Entrega:</strong> Archivo MP4 en 4K, archivos del proyecto.<br><strong>Precio:</strong> $220 - $450.', img: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=600&q=60'},
        
        // Portfolio Popups
        { id: 'portfolio-web-1', title: 'Sitio Corporativo', content: 'Sitio WordPress para una empresa de consultoría, con SEO avanzado y diseño responsivo.<br><br><strong>Tecnologías:</strong> WordPress, Elementor, Yoast SEO.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-web-2', title: 'E-Commerce', content: 'Tienda Shopify personalizada con integración de pagos y optimización SEO.<br><br><strong>Tecnologías:</strong> Shopify, Oberlo, Google Analytics.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-web-3', title: 'App React', content: 'Aplicación full-stack con React, Node.js y MongoDB para gestión de proyectos.<br><br><strong>Tecnologías:</strong> React, Node.js, MongoDB, JWT.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-uiux-1', title: 'Prototipo App', content: 'Prototipo clickable en Figma para una app de fitness con transiciones suaves.<br><br><strong>Herramientas:</strong> Figma, Adobe XD.', img: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-uiux-2', title: 'Sistema de Diseño', content: 'Guía UI/UX completa con componentes reutilizables para una startup tech.<br><br><strong>Herramientas:</strong> Figma, Sketch.', img: 'https://images.unsplash.com/photo-1522125670776-3c7abb882bc2?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-uiux-3', title: 'Wireframes', content: 'Wireframes para un e-commerce con enfoque en usabilidad móvil.<br><br><strong>Herramientas:</strong> Figma, Balsamiq.', img: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-graphic-1', title: 'Branding Restaurante', content: 'Logotipo y gráficos para un restaurante moderno con estética minimalista.<br><br><strong>Herramientas:</strong> Illustrator, Photoshop.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-graphic-2', title: 'Animación', content: 'Video animado de 30 segundos para una campaña publicitaria.<br><br><strong>Herramientas:</strong> After Effects, Premiere Pro.', img: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&w=600&q=80' },
        { id: 'portfolio-graphic-3', title: 'Gráficos Sociales', content: 'Posters optimizados para Instagram y Twitter para una marca de moda.<br><br><strong>Herramientas:</strong> Canva, Photoshop.', img: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=600&q=80' },
    ];

    let popupHTML = '';
    
    // Add popups from the data object
    popupsData.forEach(p => {
        popupHTML += `
            <div id="${p.id}" class="popup-overlay">
                <div class="popup-content">
                    ${p.img ? `<img src="${p.img}" alt="${p.title}" class="w-full h-48 object-cover rounded-lg mb-4">` : ''}
                    <h3 class="text-2xl font-bold mb-4">${p.title}</h3>
                    <p class="text-gray-700">${p.content}</p>
                    <button class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-500 transition" onclick="this.closest('.popup-overlay').style.display='none'">Cerrar</button>
                </div>
            </div>
        `;
    });

    // Add blog popups from the blog data
    blogData.forEach(p => {
        popupHTML += `
            <div id="blog-${p.id}" class="popup-overlay">
                <div class="popup-content">
                    <img src="${p.img}" alt="${p.title}" class="w-full h-48 object-cover rounded-lg mb-4">
                    <h3 class="text-2xl font-bold mb-4">${p.title}</h3>
                    <p class="text-gray-700">Contenido detallado para "${p.title}" estaría aquí. Este es un texto de ejemplo para la ventana emergente.</p>
                    <button class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-500 transition" onclick="this.closest('.popup-overlay').style.display='none'">Cerrar</button>
                </div>
            </div>
        `;
    });


    popupContainer.innerHTML = popupHTML;
}


// --- Popup Functionality ---
function openPopup(popupId) {
  const popup = document.getElementById(popupId);
  if(!popup) {
    console.error("Popup with ID " + popupId + " not found.");
    return;
  }
  popup.style.display = 'flex';
  gsap.fromTo(popup.querySelector('.popup-content'), 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
  );
  
  // Add event listener for the new popup to close on overlay click
  popup.addEventListener('click', function(e) {
      if (e.target === this) {
          this.style.display = 'none';
      }
  });
}
