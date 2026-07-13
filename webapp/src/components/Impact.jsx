import { motion } from 'framer-motion';
import { cardWrapperVariants } from '../motionVariants';

export default function Impact({ headline, metrics, capabilities }) {
  return (
    <section id="impact">
      <div className="section-title">{headline}</div>
      <div className="grid grid-4 metrics-grid">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardWrapperVariants}
          >
            <div className="result-card" style={{ height: '100%' }}>
              <div className="result-value">{m.value}</div>
              <div className="result-label">{m.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="trust-grid">
        {capabilities.map((c, i) => (
          <motion.div
            key={c.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardWrapperVariants}
          >
            <div className="trust-card" style={{ height: '100%' }}>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
