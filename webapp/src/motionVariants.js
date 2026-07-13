// Shared entrance variants. Applied to a plain wrapper div around each card
// (never on the card element itself) so the card's existing CSS :hover lift
// keeps working — Framer Motion leaves a resting inline transform after a
// whileInView animation completes, which would otherwise permanently override
// the CSS `:hover { transform: ... }` rules defined in styles.css.
export const cardWrapperVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05 },
  }),
};

export const heroContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
