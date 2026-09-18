import { eventConfig } from "../config/event";

export function Footer() {
  return (
    <footer className="border-t border-gold-light/15 bg-emerald-deep px-6 py-10 text-center text-ivory/50">
      <p className="text-xs tracking-wide">
        With love, the {eventConfig.contact.name}
      </p>
      <p className="mt-2 text-xs">
        Questions? Reach us at{" "}
        <a
          href={`mailto:${eventConfig.contact.email}`}
          className="underline decoration-gold-light/40 underline-offset-4 transition hover:text-gold-light"
        >
          {eventConfig.contact.email}
        </a>{" "}
        or {eventConfig.contact.phone}
      </p>
    </footer>
  );
}
