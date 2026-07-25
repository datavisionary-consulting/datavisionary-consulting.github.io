import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { cardWrapperVariants } from '../motionVariants';
import SolutionCardBody from './SolutionCardBody';
import StackedCards from './StackedCards';

function groupSolutions(solutions) {
  const groups = {};
  const order = [];
  for (const s of solutions) {
    const key = s.stackGroup || s.title;
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(s);
  }
  return order.map((key) => groups[key]);
}

export default function Solutions({ solutions, onOpenProject }) {
  const { t } = useLang();
  if (!solutions || !Array.isArray(solutions)) return null;

  const units = groupSolutions(solutions);

  return (
    <section id="solutions">
      <div className="section-title">{t.sectionSolutions}</div>
      <div className="grid">
        {units.map((unit, i) => (
          <motion.div
            key={unit[0].title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardWrapperVariants}
            style={{ height: '100%' }}
          >
            {unit.length > 1 ? (
              <StackedCards cards={unit} onOpenProject={onOpenProject} />
            ) : (
              <SolutionCardBody s={unit[0]} onOpenProject={onOpenProject} />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
