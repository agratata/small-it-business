import { useState } from "react";
import "./LandingPage.css";

const BUSINESS = {
  name: "Get Studious",
  abn: "42 683 197 054",
  acn: "90 568 340 004",
  email: "admin@getstudious.com.au",
  phone: "+61 3 9000 4821",
  socialUrl: "https://x.com/getstudiouss",
  socialHandle: "@getstudiouss",
  paypalMe: "https://www.paypal.me/getstudiouss",
};


const SERVICES = [
  {
    title: "Course spaces",
    text: "A lecturer opens one space per subject. Everyone and everything for that subject lives inside it.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M3 9h18M8 9v11" />
      </>
    ),
  },
  {
    title: "Live group chat",
    text: "Messages appear straight away, so a question asked the night before a deadline still gets answered.",
    icon: (
      <>
        <path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 12.5h5" />
      </>
    ),
  },
  {
    title: "Join by course code",
    text: "Students type the code from the unit outline and they are in. No invite lists, no approvals.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M7.5 11v2M12 11v2M16.5 11v2" />
      </>
    ),
  },
  {
    title: "Lecturer announcements",
    text: "Room changes, extensions and exam notices. Posted once, seen by the whole cohort.",
    icon: (
      <>
        <path d="M4 10v4a1 1 0 0 0 1 1h3l5 4V5L8 9H5a1 1 0 0 0-1 1z" />
        <path d="M17.5 8.5a5 5 0 0 1 0 7" />
      </>
    ),
  },
  {
    title: "Shared resources",
    text: "Keep slides, readings and past papers at the top of the space instead of buried in the thread.",
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
      </>
    ),
  },
  {
    title: "Lecturer and student roles",
    text: "Email sign-in with separate permissions, so only teaching staff can create a space or post an announcement.",
    icon: (
      <>
        <path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6z" />
        <path d="M9.5 12l1.8 1.8 3.4-3.6" />
      </>
    ),
  },
];


const PLANS = [
  {
    id: "pilot",
    name: "One-semester pilot",
    price: "Free",
    unit: "one semester, no card",
    blurb: "For a single subject that wants to try it first.",
    features: [
      "Up to 3 course spaces",
      "Full group chat and announcements",
      "Ends on its own so there's nothing to cancel",
    ],
    action: "signup",
    cta: "Start a pilot",
  },
  {
    id: "annual",
    name: "Institution, annual",
    price: "$199",
    unit: "per year, AUD",
    blurb: "For one university, TAFE or college.",
    features: [
      "Unlimited teaching staff",
      "Unlimited students",
      "Unlimited course spaces",
      "Staff and students join with their institution email",
    ],
    action: "paypal",
    payAmount: "199AUD",
    cta: "Pay the annual invoice",
  },
  {
    id: "triennial",
    name: "Institution, 3 years",
    price: "$490",
    unit: "for 3 years, AUD",
    blurb: "The same subscription, locked in and cheaper.",
    features: [
      "Everything in the annual plan",
      "Works out at $163 a year",
      "Price held for the full 3 years",
      "One invoice instead of three",
    ],
    action: "paypal",
    payAmount: "490AUD",
    cta: "Pay for 3 years",
    featured: true,
    flag: "Save $107",
  },
];

const QUOTES = [
  {
    text: "I stopped answering the same question eleven times. One announcement, whole cohort, done.",
    name: "Dr Priya Raman",
    role: "Unit Chair, Data Structures",
  },
  {
    text: "Our subject used to be spread across four different apps. Now it is just the course space.",
    name: "Marcus Chen",
    role: "Third-year student",
  },
  {
    text: "Setup took about ten minutes. That is honestly the whole review.",
    name: "Elise Nguyen",
    role: "Tutor, Business Analytics",
  },
];


function ServiceIcon({ children }) {
  return (
    <svg
      className="gs-service-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="gs-x-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-5.9l-4.62-6.04L5.94 21H2.92l7.06-8.07L2.25 3h6.05l4.18 5.52zm-1.06 16.2h1.67L7.6 4.7H5.81z" />
    </svg>
  );
}

function PayPalIcon() {
  return (
    <svg className="gs-paypal-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.6 21H4.4l.5-3.1h3.2zM9.1 3h6.2c3.1 0 5 1.6 4.6 4.5-.5 3.3-2.8 4.9-6 4.9h-2l-.8 5.1H7.4zm2.5 2.6l-.6 4.2h1.6c1.6 0 2.6-.7 2.8-2.1.2-1.4-.5-2.1-2-2.1z" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg className="gs-tick" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}


export default function LandingPage({ onLogin = () => {}, onSignUp = () => {} }) {
  const [view, setView] = useState("home");

  function showHome(sectionId) {
    setView("home");
    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function showContact() {
    setView("contact");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <div className="gs-page">
      <header className="gs-nav" background = "">
        <button type="button" className="gs-wordmark" onClick={() => showHome()}>
          Get Studious
        </button>

        <nav className="gs-nav-actions">
          <button
            type="button"
            className="gs-nav-link gs-nav-link-desktop"
            onClick={() => showHome("services")}
          >
            Services
          </button>
          <button
            type="button"
            className="gs-nav-link gs-nav-link-desktop"
            onClick={() => showHome("pricing")}
          >
            Pricing
          </button>
          <button type="button" className="gs-nav-link" onClick={showContact}>
            Contact us
          </button>
          <a
            className="gs-nav-social"
            href={BUSINESS.socialUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Get Studious on X, ${BUSINESS.socialHandle}`}
          >
            <XIcon />
          </a>
          <button type="button" className="gs-btn gs-btn-ghost" onClick={onLogin}>
            Log in
          </button>
          <button type="button" className="gs-btn gs-btn-solid" onClick={onSignUp}>
            Create an account
          </button>
        </nav>
      </header>

      {view === "contact" ? (
        <ContactPage />
      ) : (
        <HomeView onLogin={onLogin} onSignUp={onSignUp} onContact={showContact} />
      )}

      <SiteFooter onNavigate={showHome} onContact={showContact} />
    </div>
  );
}

/* -------------------------------------------------------------- *
 * Home
 * -------------------------------------------------------------- */

function HomeView({ onLogin, onSignUp, onContact }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe() {
    if (!email.includes("@")) return;
    // To store these for real, add a `subscribers` table in Supabase and call:
    // await supabase.from("subscribers").insert({ email })
    setSubscribed(true);
    setEmail("");
  }

  return (
    <main id="top">
      {/* ---------- hero ---------- */}
      <section className="gs-hero">
        <div className="gs-hero-copy">
          <p className="gs-eyebrow">Course spaces + group chat</p>

          <h1 className="gs-h1">
            Every subject gets its own <span className="gs-highlight">room</span>.
          </h1>

          <p className="gs-lede">
            Lecturers create a course space. Students join with a code. Questions,
            announcements and study plans for that subject all stay in one thread
            instead of scattered across six group chats.
          </p>

          <div className="gs-cta-row">
            <button type="button" className="gs-btn gs-btn-solid gs-btn-lg" onClick={onSignUp}>
              Create an account
            </button>
            <button type="button" className="gs-btn gs-btn-outline gs-btn-lg" onClick={onLogin}>
              Log in
            </button>
          </div>

          <p className="gs-fineprint">
            Sign up with your email and pick lecturer or student when you do.
          </p>
        </div>

        <div className="gs-hero-demo" aria-hidden="true">
          <div className="gs-thread">
            <div className="gs-thread-head">
              <span className="gs-code">COMP10001</span>
              <span className="gs-thread-title">Foundations of Computing</span>
              <span className="gs-thread-count">48 joined</span>
            </div>

            <div className="gs-thread-body">
              <div className="gs-msg gs-msg-lecturer">
                <div className="gs-msg-meta">
                  <span className="gs-msg-name">Dr Nguyen</span>
                  <span className="gs-tag">Lecturer</span>
                </div>
                <p className="gs-bubble">
                  Week 4 slides are up. Bring your questions to the tutorial.
                </p>
              </div>

              <div className="gs-msg">
                <div className="gs-msg-meta">
                  <span className="gs-msg-name">Priya</span>
                </div>
                <p className="gs-bubble">Is the assignment due Friday or Sunday?</p>
              </div>

              <div className="gs-msg gs-msg-lecturer">
                <div className="gs-msg-meta">
                  <span className="gs-msg-name">Dr Nguyen</span>
                  <span className="gs-tag">Lecturer</span>
                </div>
                <p className="gs-bubble">Sunday, 11:59pm. Same as the LMS.</p>
              </div>

              <div className="gs-msg">
                <div className="gs-msg-meta">
                  <span className="gs-msg-name">Marcus</span>
                </div>
                <p className="gs-bubble">Anyone working through Q3 tonight?</p>
              </div>

              <div className="gs-typing">
                <span className="gs-dot" />
                <span className="gs-dot" />
                <span className="gs-dot" />
                <span className="gs-typing-label">Amara is typing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="gs-steps">
        <h2 className="gs-h2">How a course space starts</h2>

        <ol className="gs-step-list">
          <li className="gs-step">
            <span className="gs-step-num">01</span>
            <h3 className="gs-step-title">A lecturer creates the space</h3>
            <p className="gs-step-text">
              Name the subject, and Get Studious generates a join code for it.
            </p>
          </li>
          <li className="gs-step">
            <span className="gs-step-num">02</span>
            <h3 className="gs-step-title">The code gets shared</h3>
            <p className="gs-step-text">
              On a slide, in the LMS, or read out in the first lecture.
            </p>
          </li>
          <li className="gs-step">
            <span className="gs-step-num">03</span>
            <h3 className="gs-step-title">Students join</h3>
            <p className="gs-step-text">
              One code, one tap. No requests to approve, no invite lists to keep.
            </p>
          </li>
          <li className="gs-step">
            <span className="gs-step-num">04</span>
            <h3 className="gs-step-title">The subject talks in one place</h3>
            <p className="gs-step-text">
              Ask once, where everyone can see the answer (including the lecturer).
            </p>
          </li>
        </ol>
      </section>

      {/* ---------- services ---------- */}
      <section className="gs-services" id="services">
        <p className="gs-eyebrow">Our services</p>
        <h2 className="gs-h2 gs-h2-tight">Everything a subject needs</h2>
        <p className="gs-section-lede">
          Included for every lecturer and student once an institution subscribes.
        </p>

        <ul className="gs-service-list">
          {SERVICES.map((service) => (
            <li className="gs-service" key={service.title}>
              <span className="gs-service-badge">
                <ServiceIcon>{service.icon}</ServiceIcon>
              </span>
              <h3 className="gs-service-title">{service.title}</h3>
              <p className="gs-service-text">{service.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- promotion ---------- */}
      <section className="gs-promo" id="offer">
        <div className="gs-promo-inner">
          <span className="gs-promo-tag">Semester 2 offer</span>
          <h2 className="gs-promo-title">
            The first 10 institutions get <span className="gs-highlight" WebkitTextStroke= '2px black' >a free semester</span>
          </h2>
          <p className="gs-promo-text">
            Run a pilot across up to three subjects before 30 September. Nothing to pay
            and no invoice raised. If it works for your staff, the subscription starts
            next semester.
          </p>
          <div className="gs-cta-row gs-cta-row-flush">
            <button type="button" className="gs-btn gs-btn-invert gs-btn-lg" onClick={onSignUp}>
              Claim a space
            </button>
          </div>
        </div>
      </section>

      {/* ---------- testimonials ---------- */}
      <section className="gs-quotes-section">
        <h2 className="gs-h2">Used in tutorials, labs, and 2am panics</h2>
        <ul className="gs-quote-list">
          {QUOTES.map((quote) => (
            <li className="gs-quote" key={quote.name}>
              <blockquote className="gs-quote-text">{quote.text}</blockquote>
              <div className="gs-quote-person">
                <span className="gs-avatar">{quote.name.split(" ").slice(-1)[0][0]}</span>
                <span>
                  <span className="gs-quote-name">{quote.name}</span>
                  <span className="gs-quote-role">{quote.role}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- pricing + PayPal ---------- */}
      <section className="gs-pricing" id="pricing">
        <p className="gs-eyebrow">Pricing</p>
        <h2 className="gs-h2 gs-h2-tight">Billing to the University</h2>
        <p className="gs-section-lede">
          One subscription covers every lecturer and every student at your university.
          Staff and students sign in with their institution email.
        </p>

        <ul className="gs-plan-list">
          {PLANS.map((plan) => (
            <li className={`gs-plan ${plan.featured ? "gs-plan-featured" : ""}`} key={plan.id}>
              {plan.flag && <span className="gs-plan-flag">{plan.flag}</span>}
              <h3 className="gs-plan-name">{plan.name}</h3>
              <p className="gs-plan-blurb">{plan.blurb}</p>
              <p className="gs-plan-price">
                {plan.price}
                <span className="gs-plan-unit">{plan.unit}</span>
              </p>

              <ul className="gs-plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <TickIcon />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.action === "paypal" ? (
                <a
                  className="gs-btn gs-btn-paypal"
                  href={`${BUSINESS.paypalMe}/${plan.payAmount}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PayPalIcon />
                  {plan.cta}
                </a>
              ) : (
                <button type="button" className="gs-btn gs-btn-outline gs-btn-block" onClick={onSignUp}>
                  {plan.cta}
                </button>
              )}
            </li>
          ))}
        </ul>

        <p className="gs-pay-note">
          <PayPalIcon />
          Invoices are paid through PayPal. Get Studious never sees or stores your card
          details. Prices are in AUD and include GST.
        </p>

        <p className="gs-pay-note gs-pay-note-quiet">
          Not the person who signs the invoices?{" "}
          <button type="button" className="gs-inline-link" onClick={onContact}>
            Ask us to send a quote
          </button>{" "}
          and we will address it to your finance team.
        </p>
      </section>

      {/* ---------- newsletter ---------- */}
      <section className="gs-signup">
        <div className="gs-signup-copy">
          <h2 className="gs-h2 gs-h2-tight">One email a semester</h2>
          <p className="gs-section-lede gs-section-lede-tight">
            New features, tips from other unit chairs, and the occasional discount.
            Unsubscribe in one click.
          </p>
        </div>

        {subscribed ? (
          <p className="gs-signup-done">You are on the list. Check your inbox to confirm.</p>
        ) : (
          <div className="gs-signup-form">
            <label className="gs-sr-only" htmlFor="gs-subscribe">
              Email address
            </label>
            <input
              id="gs-subscribe"
              className="gs-input"
              type="email"
              placeholder="you@university.edu.au"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSubscribe()}
            />
            <button type="button" className="gs-btn gs-btn-solid" onClick={handleSubscribe}>
              Subscribe
            </button>
          </div>
        )}
      </section>

      {/* ---------- closer ---------- */}
      <section className="gs-closer">
        <h2 className="gs-closer-title">Start your first course space</h2>
        <p className="gs-closer-text">Takes an email address and about a minute.</p>
        <button type="button" className="gs-btn gs-btn-solid gs-btn-lg" onClick={onSignUp}>
          Create an account
        </button>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------- *
 * Contact page
 * -------------------------------------------------------------- */

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General enquiry",
    message: "",
  });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSend() {
    if (!form.name.trim()) {
      setError("Add your name so we know who is writing.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("That email address is missing an @.");
      return;
    }
    if (form.message.trim().length < 10) {
      setError("Tell us a bit more; at least a sentence.");
      return;
    }
    setError("");
    // To store these for real, add a `contact_messages` table in Supabase and call:
    // await supabase.from("contact_messages").insert(form)
    setSent(true);
  }

  return (
    <main id="top" className="gs-contact">
      <div className="gs-contact-head">
        <p className="gs-eyebrow">Contact us</p>
        <h1 className="gs-h1 gs-h1-sm">
          Ask us anything about <span className="gs-highlight">course spaces</span>
        </h1>
        <p className="gs-lede">
          We answer weekdays between 9am and 5pm AEST, usually within a few hours.
        </p>
      </div>

      <div className="gs-contact-grid">
        <div className="gs-form-card">
          {sent ? (
            <div className="gs-sent">
              <span className="gs-sent-mark">
                <TickIcon />
              </span>
              <h2 className="gs-sent-title">Message sent</h2>
              <p className="gs-sent-text">
                Thanks {form.name.split(" ")[0]} ! we will reply to {form.email} within one
                business day.
              </p>
              <button
                type="button"
                className="gs-btn gs-btn-outline"
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", topic: "General enquiry", message: "" });
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              <h2 className="gs-h2 gs-h2-tight">Send us a message</h2>

              <label className="gs-label" htmlFor="gs-name">
                Your name
              </label>
              <input
                id="gs-name"
                className="gs-input"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Tommy"
              />

              <label className="gs-label" htmlFor="gs-email">
                Email address
              </label>
              <input
                id="gs-email"
                className="gs-input"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="you@university.edu.au"
              />

              <label className="gs-label" htmlFor="gs-topic">
                What is it about?
              </label>
              <select
                id="gs-topic"
                className="gs-input"
                value={form.topic}
                onChange={(event) => update("topic", event.target.value)}
              >
                <option>General enquiry</option>
                <option>Setting up a course space</option>
                <option>Billing and PayPal</option>
                <option>Faculty plan for our school</option>
                <option>Report a problem</option>
              </select>

              <label className="gs-label" htmlFor="gs-message">
                Message
              </label>
              <textarea
                id="gs-message"
                className="gs-input gs-textarea"
                rows={5}
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                placeholder="Tell us what you need."
              />

              {error && <p className="gs-error">{error}</p>}

              <button type="button" className="gs-btn gs-btn-solid gs-btn-block gs-btn-lg" onClick={handleSend}>
                Send message
              </button>
              <p className="gs-form-note">
                We only use your details to answer this enquiry.
              </p>
            </>
          )}
        </div>

        <aside className="gs-details">
          <div className="gs-detail">
            <h3 className="gs-detail-label">Email</h3>
            <a className="gs-detail-link" href={`mailto:${BUSINESS.email}`}>
              {BUSINESS.email}
            </a>
          </div>

          <div className="gs-detail">
            <h3 className="gs-detail-label">Phone</h3>
            <a className="gs-detail-link" href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>
              {BUSINESS.phone}
            </a>
          </div>

          <div className="gs-detail">
            <h3 className="gs-detail-label">Office</h3>
            <p className="gs-detail-text">{BUSINESS.address}</p>
          </div>

          <div className="gs-detail">
            <h3 className="gs-detail-label">Hours</h3>
            <p className="gs-detail-text">Monday to Friday, 9am – 5pm AEST</p>
          </div>

          <div className="gs-detail">
            <h3 className="gs-detail-label">Follow us</h3>
            <a
              className="gs-detail-link gs-social-link"
              href={BUSINESS.socialUrl}
              target="_blank"
              rel="noreferrer"
            >
              <XIcon />
              {BUSINESS.socialHandle}
            </a>
          </div>

          <div className="gs-detail gs-detail-legal">
            <h3 className="gs-detail-label">Registered business</h3>
            <p className="gs-legal-line">
              <span>ABN</span> {BUSINESS.abn}
            </p>
            <p className="gs-legal-line">
              <span>ACN</span> {BUSINESS.acn}
            </p>
            <p className="gs-detail-note">{BUSINESS.name}, registered in Victoria, Australia.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------- *
 * Footer
 * -------------------------------------------------------------- */

function SiteFooter({ onNavigate, onContact }) {
  return (
    <footer className="gs-footer">
      <div className="gs-footer-grid">
        <div className="gs-footer-brand">
          <span className="gs-wordmark gs-wordmark-sm">Get Studious</span>
          <p className="gs-footer-blurb">
            One space per subject. Chat, files and announcements for Australian
            universities.
          </p>
          <a
            className="gs-social-link"
            href={BUSINESS.socialUrl}
            target="_blank"
            rel="noreferrer"
          >
            <XIcon />
            {BUSINESS.socialHandle}
          </a>
        </div>

        <div className="gs-footer-col">
          <h3 className="gs-footer-heading">Product</h3>
          <button type="button" onClick={() => onNavigate("services")}>Services</button>
          <button type="button" onClick={() => onNavigate("pricing")}>Pricing</button>
          <button type="button" onClick={() => onNavigate("offer")}>Current offer</button>
        </div>

        <div className="gs-footer-col">
          <h3 className="gs-footer-heading">Company</h3>
          <button type="button" onClick={onContact}>Contact us</button>
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>
        </div>

        <div className="gs-footer-col">
          <h3 className="gs-footer-heading">Registered business</h3>
          <p className="gs-legal-line">
            <span>ABN</span> {BUSINESS.abn}
          </p>
          <p className="gs-legal-line">
            <span>ACN</span> {BUSINESS.acn}
          </p>
          <p className="gs-footer-note">{BUSINESS.address}</p>
        </div>
      </div>

      <div className="gs-footer-bottom">
        <span className="gs-footer-note">
          © {new Date().getFullYear()} {BUSINESS.name} · ABN {BUSINESS.abn} · ACN {BUSINESS.acn}
        </span>
        <span className="gs-footer-note">
          Built as a university project. Business and payment details are placeholders.
        </span>
      </div>
    </footer>
  );
}
