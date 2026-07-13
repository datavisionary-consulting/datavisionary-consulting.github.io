import { motion } from 'framer-motion';
import { heroContainerVariants, heroItemVariants } from '../motionVariants';

export default function Hero({ headline, headline_highlight, subheadline, cta }) {
  return (
    <motion.section
      id="hero"
      className="hero"
      initial="hidden"
      animate="visible"
      variants={heroContainerVariants}
    >
      <div className="hero-container hero-container--single">
        <div className="hero-left">
          <motion.h1 variants={heroItemVariants}>
            {headline}
            <br />
            <span>{headline_highlight}</span>
          </motion.h1>
          <motion.p variants={heroItemVariants}>{subheadline}</motion.p>
          <motion.div variants={heroItemVariants}>
            <motion.a href={cta.href} className="btn" whileTap={{ scale: 0.97 }}>
              {cta.label}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
