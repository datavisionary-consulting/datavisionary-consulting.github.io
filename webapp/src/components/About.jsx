import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

export default function About({ name, role, photo, bio, highlights, stack, cv, linkedin }) {
  const { t } = useLang();

  return (
    <section id="about">
      <div className="about-container">
        <div className="about-photo-wrap">
          <img src={photo} alt={name} className="about-photo" />
        </div>
        <div className="about-text">
          <div className="case-tag">{t.aboutTag}</div>
          <h2 className="about-name">{name}</h2>
          <div className="about-role">{role}</div>
          <p>{bio}</p>
          <ul className="about-highlights">
            {highlights.map((h) => (
              <li key={h} className="about-highlight">{h}</li>
            ))}
          </ul>
          {stack && (
            <div className="card-stack">
              {stack.map((tag) => (
                <span key={tag} className="stack-tag">{tag}</span>
              ))}
            </div>
          )}
          {cv && (
            <div className="about-cv">
              <span className="about-cv-label">{t.downloadCvLabel}:</span>
              <motion.a href={cv.en} download className="btn btn-outline about-cv-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {t.cvEnLabel}
              </motion.a>
              <motion.a href={cv.es} download className="btn btn-outline about-cv-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {t.cvEsLabel}
              </motion.a>
            </div>
          )}
          <motion.a
            href={linkedin}
            target="_blank"
            rel="noopener"
            className="btn btn-outline"
            style={{ marginTop: '20px', display: 'inline-block' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.viewLinkedin}
          </motion.a>
        </div>
      </div>
    </section>
  );
}
