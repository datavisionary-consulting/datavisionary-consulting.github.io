export const scrollToId = (id) => {
  const target = document.getElementById(id);
  if (!target) return;
  window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
};
