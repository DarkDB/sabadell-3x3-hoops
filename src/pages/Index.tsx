import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Leagues from "@/components/Leagues";
import Teams from "@/components/Teams";
import Matches from "@/components/Matches";
import Community from "@/components/Community";
import Registration from "@/components/Registration";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Leagues />
        <Teams />
        <Matches />
        <Community />
        <Registration />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
