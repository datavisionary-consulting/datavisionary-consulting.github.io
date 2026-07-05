/* =========================
   DATA-DRIVEN RENDERER
   Reads content.json / content.es.json and renders all sections.
   To update content: edit those JSON files only.
========================= */

const UI_STRINGS = {
  en: {
    workWithUs: 'Work with us →',
    caseStudy: 'Case Study',
    viewDashboard: 'View Dashboard',
    viewLinkedin: 'View LinkedIn →',
    downloadCvLabel: 'Download CV',
    cvEnLabel: 'English',
    cvEsLabel: 'Español',
    aboutTag: 'About',
    sectionServices: 'Services',
    sectionSolutions: 'Industry Solutions',
    waPrefill: "Hi Alexander, I found your site and I'd like to discuss a data project.",
    whatsappNote: 'Or just message on WhatsApp — same response time.',
    formNameLabel: 'Your name',
    formCompanyLabel: 'Company',
    formChallengeLabel: 'Data challenge',
    formChallengePlaceholder: 'We have data scattered across 3 systems and no unified view...',
    formWaMsg: (name, company, challenge) =>
      `Hi Alexander, I found your site.\n\nName: ${name}\nCompany: ${company || '—'}\n\nChallenge: ${challenge}`,
    langToggleLabel: 'ES',
    footer: '© 2026 Data Visionary — Data Consulting',
    nav: { services: 'Services', solutions: 'Solutions', impact: 'Impact', approach: 'Approach', about: 'About', contact: 'Contact', training: 'Training Lab' }
  },
  es: {
    workWithUs: 'Trabajemos juntos →',
    caseStudy: 'Caso de Estudio',
    viewDashboard: 'Ver Dashboard',
    viewLinkedin: 'Ver LinkedIn →',
    downloadCvLabel: 'Descargar CV',
    cvEnLabel: 'English',
    cvEsLabel: 'Español',
    aboutTag: 'Sobre mí',
    sectionServices: 'Servicios',
    sectionSolutions: 'Soluciones por Industria',
    waPrefill: 'Hola Alexander, encontré tu web y me gustaría conversar sobre un proyecto de datos.',
    whatsappNote: 'O simplemente escríbeme por WhatsApp — mismo tiempo de respuesta.',
    formNameLabel: 'Tu nombre',
    formCompanyLabel: 'Empresa',
    formChallengeLabel: 'Desafío de datos',
    formChallengePlaceholder: 'Tenemos datos dispersos en 3 sistemas y ninguna vista unificada...',
    formWaMsg: (name, company, challenge) =>
      `Hola Alexander, encontré tu web.\n\nNombre: ${name}\nEmpresa: ${company || '—'}\n\nDesafío: ${challenge}`,
    langToggleLabel: 'EN',
    footer: '© 2026 Data Visionary — Consultoría de Datos',
    nav: { services: 'Servicios', solutions: 'Soluciones', impact: 'Impacto', approach: 'Enfoque', about: 'Sobre mí', contact: 'Contacto', training: 'Training Lab' }
  }
};

let currentLang = localStorage.getItem('site_lang') || 'en';

const fetchContent = async (lang) => {
  const file = lang === 'es' ? 'data/content.es.json' : 'data/content.json';
  const res = await fetch(file);
  if (!res.ok) {
    console.error("Error al cargar el JSON. Ruta probada: " + file);
    throw new Error('Could not load ' + file);
  }
  const data = await res.json();
  return data;
};

/* ── Renderers ─────────────────────────────────── */

const renderHero = ({ headline, headline_highlight, subheadline, cta, kpis }) => {
  const kpiHTML = kpis.map((k, i) => `
    ${i > 0 ? '<div class="hero-line"></div>' : ''}
    <div class="hero-mini">
      <span>${k.label}</span>
      <strong>${k.value}</strong>
    </div>
  `).join('');

  return `
    <section id="hero" class="hero fade-in">
      <div class="hero-container">
        <div class="hero-left">
          <h1>
            ${headline}<br>
            <span>${headline_highlight}</span>
          </h1>
          <p>${subheadline}</p>
          <a href="${cta.href}" class="btn">${cta.label}</a>
        </div>
        <div class="hero-right">
          <div class="hero-card">
            <div class="hero-kpi">${kpis[0].value}</div>
            <div class="hero-label">${kpis[0].label}</div>
            <div class="hero-line"></div>
            ${kpis.slice(1).map(k => `
              <div class="hero-mini">
                <span>${k.label}</span>
                <strong>${k.value}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
};

const renderServices = (services) => {
  const t = UI_STRINGS[currentLang];
  const cardsHTML = services.map(s => `
    <div class="card">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <div class="card-stack">
        ${s.stack.map(tag => `<span class="stack-tag">${tag}</span>`).join('')}
      </div>
      <a href="#contact" class="card-cta">${t.workWithUs}</a>
    </div>
  `).join('');

  return `
    <section id="services" class="fade-in">
      <div class="section-title">${t.sectionServices}</div>
      <div class="grid">${cardsHTML}</div>
    </section>
  `;
};

const renderSolutions = (solutions) => {
  if (!solutions || !Array.isArray(solutions)) return '';
  const t = UI_STRINGS[currentLang];

  const cards = solutions.map((s, index) => {
    // Eliminamos la variable githubBtn de aquí para la tarjeta principal

    const demoBtn = s.dashboard_url
      ? `<button onclick="openProject('${s.title}', '${s.description}', '${s.dashboard_url}', '${s.github_url}')" class="btn" style="padding: 10px 20px; font-size: 13px; cursor: pointer; border:none; width: 100%;">${t.viewDashboard}</button>`
      : (s.link_url
        ? `<a href="${s.link_url}" target="_blank" rel="noopener" class="btn" style="padding: 10px 20px; font-size: 13px; border:none; width: 100%; display:block; text-align:center; box-sizing:border-box;">${s.link_label || t.viewDashboard}</a>`
        : '');

    const techStack = s.stack 
      ? `<div class="card-stack" style="margin: 12px 0;">
          ${s.stack.map(t => `<span style="background: rgba(200, 148, 58, 0.1); color: #c8943a; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-right: 5px; text-transform: uppercase;">${t}</span>`).join('')}
         </div>` 
      : '';

    const projectImage = s.image_url 
      ? `<div class="card-image" style="width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:6px; margin-bottom:15px; border:1px solid #eee;">
           <img src="${s.image_url}" alt="${s.title}" style="width:100%; height:100%; object-fit:cover;">
         </div>`
      : '';

    return `
      <div class="card fade-in" style="display:flex; flex-direction:column; justify-content: space-between;">
        <div>
            ${projectImage}
            <div class="case-tag">${s.tag || t.caseStudy}</div>
            <h3>${s.title}</h3>
            <p>${s.description}</p>
            ${techStack}
        </div>
        <div class="card-actions" style="margin-top: 20px;">
          ${demoBtn}
        </div>
      </div>
    `;
}).join('');

  return `
    <section id="solutions" class="fade-in">
      <div class="section-title">${t.sectionSolutions}</div>
      <div class="grid">
        ${cards}
      </div>
    </section>
  `;
};

const renderProof = ({ headline, metrics, capabilities }) => {
  const metricsHTML = metrics.map(m => `
    <div class="result-card">
      <div class="result-value">${m.value}</div>
      <div class="result-label">${m.label}</div>
    </div>
  `).join('');

  const capHTML = capabilities.map(c => `
    <div class="trust-card">
      <h3>${c.title}</h3>
      <p>${c.description}</p>
    </div>
  `).join('');

  return `
    <section id="impact" class="fade-in">
      <div class="section-title">${headline}</div>
      <div class="grid grid-4 metrics-grid">
        ${metricsHTML}
      </div>
      <div class="trust-grid">${capHTML}</div>
    </section>
  `;
};

const renderApproach = ({ headline, steps }) => {
  const stepsHTML = steps.map(s => `
    <div class="card">
      <div class="approach-number">${s.number}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
  `).join('');

  return `
    <section id="approach" class="fade-in">
      <div class="section-title">${headline}</div>
      <div class="grid grid-4">
        ${stepsHTML}
      </div>
    </section>
  `;
};

const renderAbout = ({ name, role, photo, bio, highlights, stack, cv, linkedin }) => {
  const t = UI_STRINGS[currentLang];
  const highlightsHTML = highlights.map(h => `
    <li class="about-highlight">${h}</li>
  `).join('');
  const stackHTML = stack
    ? `<div class="card-stack">${stack.map(tag => `<span class="stack-tag">${tag}</span>`).join('')}</div>`
    : '';
  const cvHTML = cv
    ? `<div class="about-cv">
        <span class="about-cv-label">${t.downloadCvLabel}:</span>
        <a href="${cv.en}" download class="btn btn-outline about-cv-btn">${t.cvEnLabel}</a>
        <a href="${cv.es}" download class="btn btn-outline about-cv-btn">${t.cvEsLabel}</a>
       </div>`
    : '';

  return `
    <section id="about" class="fade-in">
      <div class="about-container">
        <div class="about-photo-wrap">
          <img src="${photo}" alt="${name}" class="about-photo">
        </div>
        <div class="about-text">
          <div class="case-tag">${t.aboutTag}</div>
          <h2 class="about-name">${name}</h2>
          <div class="about-role">${role}</div>
          <p>${bio}</p>
          <ul class="about-highlights">${highlightsHTML}</ul>
          ${stackHTML}
          ${cvHTML}
          <a href="${linkedin}" target="_blank" rel="noopener" class="btn btn-outline" style="margin-top: 20px; display: inline-block;">
            ${t.viewLinkedin}
          </a>
        </div>
      </div>
    </section>
  `;
};

const renderContact = ({ headline, subheadline, email, whatsapp_number, whatsapp_label, linkedin, cta_label }) => {
  const t = UI_STRINGS[currentLang];
  const waUrl = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(t.waPrefill)}`;

  return `
    <section id="contact" class="contact fade-in">
      <div class="contact-grid">
        <div class="contact-left">
          <div class="section-title">${headline}</div>
          <p>${subheadline}</p>
          <div class="contact-channels">
            <a href="${waUrl}" target="_blank" rel="noopener" class="channel-btn channel-wa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              ${whatsapp_label}
            </a>
            <a href="mailto:${email}" class="channel-btn channel-email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
              ${email}
            </a>
            <a href="${linkedin}" target="_blank" rel="noopener" class="channel-btn channel-li">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
        <form class="contact-form" onsubmit="handleFormSubmit(event)">
          <div class="form-field">
            <label for="cf-name">${t.formNameLabel}</label>
            <input id="cf-name" name="name" type="text" placeholder="María García" required>
          </div>
          <div class="form-field">
            <label for="cf-company">${t.formCompanyLabel}</label>
            <input id="cf-company" name="company" type="text" placeholder="Acme Corp">
          </div>
          <div class="form-field">
            <label for="cf-challenge">${t.formChallengeLabel}</label>
            <textarea id="cf-challenge" name="challenge" rows="4" placeholder="${t.formChallengePlaceholder}" required></textarea>
          </div>
          <button type="submit" class="btn" style="width: 100%;">${cta_label}</button>
          <p class="form-note">${t.whatsappNote}</p>
        </form>
      </div>
    </section>
  `;
};

/* ── Animations ────────────────────────────────── */
const initAnimations = () => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
};

/* ── Active nav on scroll ──────────────────────── */
const initNav = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));

  // Last section fix: activate contact when user reaches the bottom of the page
  window.addEventListener('scroll', () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
    if (nearBottom) setActive('contact');
  }, { passive: true });
};

/* ── Smooth scroll ─────────────────────────────── */
const initSmoothScroll = () => {
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        history.pushState(null, null, this.getAttribute('href'));
      }
    });
  });

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }, 100);
    }
  }
};

/* ── Mobile nav ────────────────────────────────── */
const initMobileNav = () => {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('main-nav-links');
  if (!toggle || !links) return;

  const closeMenu = () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
};

/* ── Form handler ──────────────────────────────── */
window.handleFormSubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  const name      = form.name.value.trim();
  const company   = form.company.value.trim();
  const challenge = form.challenge.value.trim();
  const phone     = '51959942669';
  const msg = encodeURIComponent(UI_STRINGS[currentLang].formWaMsg(name, company, challenge));
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
};

/* ── Language toggle ──────────────────────────── */
const applyNavStrings = () => {
  const t = UI_STRINGS[currentLang].nav;
  document.querySelector('.nav-links a[href="#services"]').textContent = t.services;
  document.querySelector('.nav-links a[href="#solutions"]').textContent = t.solutions;
  document.querySelector('.nav-links a[href="#impact"]').textContent = t.impact;
  document.querySelector('.nav-links a[href="#approach"]').textContent = t.approach;
  document.querySelector('.nav-links a[href="#about"]').textContent = t.about;
  document.querySelector('.nav-links a.cta').textContent = t.contact;
  document.querySelector('.nav-links a[target="_blank"]').textContent = t.training;
  document.querySelector('footer').textContent = UI_STRINGS[currentLang].footer;
  document.documentElement.lang = currentLang;
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = UI_STRINGS[currentLang].langToggleLabel;
};

const renderAllSections = async () => {
  const data = await fetchContent(currentLang);
  document.getElementById('hero').innerHTML      = renderHero(data.hero);
  document.getElementById('services').innerHTML  = renderServices(data.services);
  document.getElementById('solutions').innerHTML = renderSolutions(data.solutions);
  document.getElementById('impact').innerHTML    = renderProof(data.proof);
  document.getElementById('approach').innerHTML  = renderApproach(data.approach);
  document.getElementById('about').innerHTML     = renderAbout(data.about);
  document.getElementById('contact').innerHTML   = renderContact(data.contact);
  applyNavStrings();
  initAnimations();
};

window.toggleLang = async () => {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  localStorage.setItem('site_lang', currentLang);
  await renderAllSections();
};

/* ── Init ──────────────────────────────────────── */
const init = async () => {
  try {
    await renderAllSections();
    initNav();
    initSmoothScroll();
    initMobileNav();
  } catch (err) {
    console.error('Data Visionary init error:', err);
  }
};

document.addEventListener('DOMContentLoaded', init);

// Función para mostrar el detalle del proyecto (Modo Enfoque)
window.openProject = (title, description, dbUrl, repoUrl) => {
    const home = document.getElementById('home-view');
    const project = document.getElementById('project-view');
    const navLinks = document.getElementById('main-nav-links');
    const backBtn = document.getElementById('back-button-container');

    if(home) home.style.display = 'none';
    if(project) project.style.display = 'block';
    if(navLinks) navLinks.style.display = 'none';
    if(backBtn) backBtn.style.display = 'block';

    project.innerHTML = `
        <div style="padding: 120px 20px 60px; max-width: 1100px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 50px;">
                <h1 style="font-size: 2.8rem; color: #1a1a1a; margin-bottom: 15px;">${title}</h1>
                <p style="font-size: 1.2rem; color: #666; max-width: 800px; margin: 0 auto; line-height: 1.6;">${description}</p>
            </div>

            <div style="background: #000; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); margin-bottom: 80px; height: 75vh;">
                <iframe src="${dbUrl}" width="100%" height="100%" frameborder="0" allowFullScreen="true"></iframe>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 80px;">
                <div>
                    <h2 style="color: #c8943a; margin-bottom: 20px; font-size: 1.8rem;">Technical Executive Summary</h2>
                    <p style="margin-bottom: 20px; line-height: 1.7;"><strong>The Challenge:</strong> Transforming raw market volatility into actionable indicators. Beyond simple extraction, this required normalizing heterogeneous data structures and real-time calculation of local minima.</p>
                    <p style="line-height: 1.7;"><strong>The Architecture:</strong> A modular Python ETL engine with rate-limiting handling and rolling window logic, enriched by statistical segmentation based on dynamic percentiles.</p>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #c8943a;">
                    <h3 style="margin-bottom: 15px; font-size: 1.2rem;">Data Pipeline Flow</h3>
                    <ul style="list-style: none; padding: 0; line-height: 2;">
                        <li>🔍 <strong>Ingestion:</strong> CoinGecko API w/ Time-Delay</li>
                        <li>⚙️ <strong>ETL Engine:</strong> Python Data Normalization</li>
                        <li>📈 <strong>Engineering:</strong> 7-day MA & Valley Detection</li>
                        <li>📊 <strong>Statistical Layer:</strong> Dynamic Percentiles</li>
                        <li>🚀 <strong>Visuals:</strong> Power BI Integration</li>
                    </ul>
                </div>
            </div>

            <div style="background: #1e1e1e; color: #d4d4d4; padding: 40px; border-radius: 15px; font-family: 'Courier New', Courier, monospace; position: relative;">
                <div style="position: absolute; top: 15px; right: 20px; color: #666; font-size: 0.8rem;">Python / Pandas</div>
                <h3 style="color: #c8943a; font-family: sans-serif; margin-bottom: 25px;">Engineering Code Spotlight</h3>
                <pre style="margin: 0; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.5;">
<span style="color: #6a9955;"># 1. Algorithmic 'Valley' Identification</span>
df[<span style="color: #ce9178;">'valley'</span>] = ((df[<span style="color: #ce9178;">'price'</span>] < df[<span style="color: #ce9178;">'price'</span>].shift(<span style="color: #b5cea8;">1</span>)) & 
                (df[<span style="color: #ce9178;">'price'</span>] < df[<span style="color: #ce9178;">'price'</span>].shift(-<span style="color: #b5cea8;">1</span>))).astype(<span style="color: #4ec9b0;">int</span>)

<span style="color: #6a9955;"># 2. Dynamic Categorization: Percentile-based segmentation</span>
percentiles = df[<span style="color: #ce9178;">'price'</span>].quantile([<span style="color: #b5cea8;">0.2</span>, <span style="color: #b5cea8;">0.4</span>, <span style="color: #b5cea8;">0.6</span>, <span style="color: #b5cea8;">0.8</span>]).values
bins = [df[<span style="color: #ce9178;">'price'</span>].min()] + percentiles.tolist() + [df[<span style="color: #ce9178;">'price'</span>].max()]
labels = [<span style="color: #ce9178;">'Very Low'</span>, <span style="color: #ce9178;">'Low'</span>, <span style="color: #ce9178;">'Medium'</span>, <span style="color: #ce9178;">'High'</span>, <span style="color: #ce9178;">'Very High'</span>]
df[<span style="color: #ce9178;">'price_category'</span>] = pd.cut(df[<span style="color: #ce9178;">'price'</span>], bins=bins, labels=labels)
                </pre>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${repoUrl}" target="_blank" class="btn" style="text-decoration: none; display: inline-block;">Explore Full Repository on GitHub</a>
                </div>
            </div>
        </div>
    `;
    
    window.scrollTo(0, 0);
};

// Función para volver a la Home
window.showHome = () => {
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('project-view').style.display = 'none';
    document.getElementById('main-nav-links').style.display = 'flex';
    document.getElementById('back-button-container').style.display = 'none';
    
    // Volver a la sección de soluciones
    document.getElementById('solutions').scrollIntoView();
};