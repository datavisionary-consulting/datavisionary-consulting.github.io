import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SolutionCardBody from './SolutionCardBody';

function shortLabel(tag) {
  return (tag || '').split('/')[0].trim();
}

export default function StackedCards({ cards, onOpenProject }) {
  const [active, setActive] = useState(0);

  return (
    <div className="card-deck">
      <div className="deck-shadow deck-shadow-2" />
      <div className="deck-shadow deck-shadow-1" />

      <div className="deck-tabs">
        {cards.map((c, idx) => (
          <button
            key={c.title}
            type="button"
            className={`deck-tab ${idx === active ? 'active' : ''}`}
            onClick={() => setActive(idx)}
          >
            {shortLabel(c.tag)}
          </button>
        ))}
      </div>

      <motion.div layout className="deck-stage">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={cards[active].title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            <SolutionCardBody s={cards[active]} onOpenProject={onOpenProject} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
