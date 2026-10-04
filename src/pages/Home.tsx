import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';
import WeatherLocationSection from '../components/home/WeatherLocationSection';
import ContactSection from '../components/home/ContactSection';
import SEO from '../components/SEO';
import AdvisoryBanner from '../components/home/AdvisoryBanner';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="Home"
        description="BetterAparri.org makes Aparri public information, local government services, updates, transparency data, and civic resources easier to find."
        keywords="Aparri, Cagayan, local government, public services, transparency, citizen services"
        pageType="WebSite"
      />
      <main className="flex-grow">
        <AdvisoryBanner />
        <Hero />
        <ServicesSection />
        <WeatherLocationSection />
        <ContactSection />
        {/* <GovernmentActivitySection /> */}
      </main>
    </>
  );
};

export default Home;
