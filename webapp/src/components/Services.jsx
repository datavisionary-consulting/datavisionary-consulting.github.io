import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { cardWrapperVariants } from '../motionVariants';

export default function Services({ services }) {
  const { t } = useLang();

  return (
    <section id="services">
      <div className="section-title">{t.sectionServices}</div>
      <div className="grid">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardWrapperVariants}
          >
            <div className="card" style={{ height: '100%' }}>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <div className="card-stack">
                {s.stack.map((tag) => (
                  <span key={tag} className="stack-tag">{tag}</span>
                ))}
              </div>
              <motion.a
                href="#contact"
                className="card-cta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.workWithUs}
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
