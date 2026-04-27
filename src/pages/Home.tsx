import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';
import WeatherLocationSection from '../components/home/WeatherLocationSection';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Official website of your local government. Access government services, information, and resources."
        keywords="government, local government, services, public services, civic services"
      />
      <main className="flex-grow">
        <Hero />
        <ServicesSection />
        <WeatherLocationSection />
        {/* <GovernmentActivitySection /> */}
      </main>
    </>
  );
};

export default Home;
