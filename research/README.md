# Case Study Standards

Ground rules for every case study in this folder, going forward. Written down after the Steam review case study so the pattern doesn't depend on memory.

## Lead with the money, the fear, or the optimization

A case study exists to get someone to hire this consultancy. Nobody hires a data consultant for a pretty chart. They hire one because a finding changes how much something costs, how much risk it carries, or how much money it makes or saves. Every case study's headline finding — the card description and the closing narrative block — has to answer one of these, explicitly, in plain language:

- **Money**: what does this let someone charge more for, spend less on, or stop losing?
- **Legal / reputational fear**: what does this catch before it becomes a lawsuit, a regulator's letter, or a PR problem?
- **Optimization that compounds**: what does this let a team do with the same headcount, or do at 10x the scale, that they couldn't before?

The methodology, the honest cross-checks, the AUC tables — all of that stays. It's what makes the business claim credible instead of a slogan. But it is not the lead. It's the evidence underneath the lead. See `steam-review-helpfulness-classification/README.md` for the template: the README opens with "The real finding" (a triage rule tied to legal/reputational risk and analyst headcount), *then* gets into AUC, method, and references.

## Never invent the number that makes the story land

The temptation is to write "this would save 30% of review time" when nothing in the data proves it. Don't. If the real dataset can't support a business claim — Steam has no VIP flag, no legal-risk field, no repeat-complainant ID — say so, and label the business rule as **practitioner judgment layered on top of the model**, not a data-derived finding. A claim like "known high-risk accounts should always escalate to a human, regardless of model score" is legitimate and valuable precisely because it's honest about where it came from: experience, not the training data. Overclaiming what the data shows is the one thing this portfolio can't afford to do once, anywhere.

## The audience is a non-technical decision-maker first

Assume the reader deciding whether to hire this consultancy does not know what AUC, TF-IDF, or a confusion matrix is, and never will. The card description and the final narrative block should be readable by that person with zero jargon. Save the vocabulary for the middle of the narrative and the README's Method section, where a technical reviewer (or a future engineer extending the work) is the audience instead.
