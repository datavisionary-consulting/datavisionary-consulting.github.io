import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from './context/LangContext';
import { useContent } from './hooks/useContent';
import { useActiveSection } from './hooks/useActiveSection';
import { scrollToId } from './utils/scroll';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ProjectView from './components/ProjectView';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppFab from './components/WhatsAppFab';

export default function App() {
  const { lang } = useLang();
  const { data } = useContent(lang);
  const [activeProject, setActiveProject] = useState(null);
  const activeId = useActiveSection(!!data && !activeProject);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    if (!data || initialScrollDone.current) return;
    initialScrollDone.current = true;
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => scrollToId(id), 100);
    }
  }, [data]);

  const handleOpenProject = (solution) => setActiveProject(solution);
  const handleBack = () => {
    setActiveProject(null);
    setTimeout(() => scrollToId('solutions'), 0);
  };

  if (!data) return null;

  return (
    <>
      <Navbar activeProject={activeProject} onBack={handleBack} activeId={activeId} />
      <main>
        <AnimatePresence>
          {activeProject ? (
            <motion.div key="project" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <ProjectView project={activeProject} />
            </motion.div>
          ) : (
            <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <HomeView data={data} onOpenProject={handleOpenProject} />
            </motion.div>
          )}
        </AnimatePresence>
        <Contact {...data.contact} />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
