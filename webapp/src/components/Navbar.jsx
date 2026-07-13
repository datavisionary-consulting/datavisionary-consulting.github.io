import { useEffect, useState } from 'react';
import { useLang } from '../context/LangContext';
import { scrollToId } from '../utils/scroll';

export default function Navbar({ activeProject, onBack, activeId }) {
  const { toggleLang, t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navItems = [
    { id: 'services', label: t.nav.services },
    { id: 'solutions', label: t.nav.solutions },
    { id: 'impact', label: t.nav.impact },
    { id: 'approach', label: t.nav.approach },
    { id: 'about', label: t.nav.about },
  ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    scrollToId(id);
    history.pushState(null, null, `#${id}`);
    setMobileOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="logo">
          DATA <span>VISIONARY</span>
        </div>

        {activeProject && (
          <div id="back-button-container">
            <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 15px', cursor: 'pointer' }}>
              ← Volver al inicio
            </button>
          </div>
        )}

        {!activeProject && (
          <div id="main-nav-links" className={`nav-links${mobileOpen ? ' open' : ''}`}>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeId === item.id ? 'active' : ''}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className={`cta${activeId === 'contact' ? ' active' : ''}`}
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              {t.nav.contact}
            </a>
            <a
              href="https://datavisionary-consulting.github.io/vision-lab/"
              target="_blank"
              rel="noopener"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.training}
            </a>
          </div>
        )}

        <button id="lang-toggle" className="lang-toggle" onClick={toggleLang} title="Switch language">
          {t.langToggleLabel}
        </button>

        <button
          id="nav-toggle"
          className={`nav-toggle${mobileOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
