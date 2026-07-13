import Hero from './Hero';
import Services from './Services';
import Solutions from './Solutions';
import Impact from './Impact';
import Approach from './Approach';
import About from './About';

export default function HomeView({ data, onOpenProject }) {
  return (
    <>
      <Hero {...data.hero} />
      <Services services={data.services} />
      <Solutions solutions={data.solutions} onOpenProject={onOpenProject} />
      <Impact {...data.proof} />
      <Approach {...data.approach} />
      <About {...data.about} />
    </>
  );
}
