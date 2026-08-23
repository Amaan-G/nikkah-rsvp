import { Closing } from "./components/Closing";
import { EventDetails } from "./components/EventDetails";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Invitation } from "./components/Invitation";
import { RSVPSection } from "./components/RSVPSection";

function App() {
  return (
    <div className="relative">
      <a
        href="#rsvp"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-emerald-deep focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to RSVP
      </a>
      <main>
        <Hero />
        <Invitation />
        <EventDetails />
        <RSVPSection />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}

export default App;
