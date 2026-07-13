import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { cardWrapperVariants } from '../motionVariants';

export default function Solutions({ solutions, onOpenProject }) {
  const { t } = useLang();
  if (!solutions || !Array.isArray(solutions)) return null;

  return (
    <section id="solutions">
      <div className="section-title">{t.sectionSolutions}</div>
      <div className="grid">
        {solutions.map((s, i) => (
          <motion.div
            key={s.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardWrapperVariants}
          >
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                {s.image_url && (
                  <div className="card-image" style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '6px', marginBottom: '15px', border: '1px solid #eee' }}>
                    <img src={s.image_url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="case-tag">{s.tag || t.caseStudy}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                {s.stack && (
                  <div className="card-stack" style={{ margin: '12px 0' }}>
                    {s.stack.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: 'rgba(200, 148, 58, 0.1)',
                          color: '#c8943a',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                          marginRight: '5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-actions" style={{ marginTop: '20px' }}>
                {s.dashboard_url ? (
                  <motion.button
                    onClick={() => onOpenProject(s)}
                    className="btn"
                    style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer', border: 'none', width: '100%' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t.viewDashboard}
                  </motion.button>
                ) : s.link_url ? (
                  <motion.a
                    href={s.link_url}
                    target="_blank"
                    rel="noopener"
                    className="btn"
                    style={{ padding: '10px 20px', fontSize: '13px', border: 'none', width: '100%', display: 'block', textAlign: 'center', boxSizing: 'border-box' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {s.link_label || t.viewDashboard}
                  </motion.a>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
