import { motion } from 'framer-motion';
import { cardWrapperVariants } from '../motionVariants';

export default function Approach({ headline, steps }) {
  return (
    <section id="approach">
      <div className="section-title">{headline}</div>
      <div className="grid grid-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.number}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardWrapperVariants}
          >
            <div className="card" style={{ height: '100%' }}>
              <div className="approach-number">{s.number}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
