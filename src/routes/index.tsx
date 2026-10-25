import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Shield, Zap } from "lucide-react";
import { GuestShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { PlanGrid } from "@/components/platform/plan-card";
import { toast } from "@/components/layout/toast";
import { usePlatform } from "@/lib/platform/store";
import { copy } from "@/lib/platform/i18n";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  return (
    <GuestShell>
      <Landing />
    </GuestShell>
  );
}

function Landing() {
  const navigate = useNavigate();
  const lang = usePlatform((s) => s.lang);
  const t = copy[lang];
  const cards = t.page.companyCards;
  const [company, setCompany] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const card = cards[company] ?? cards[0];

  const stepCompany = (dir: number) => {
    if (!cards.length) return;
    setCompany((i) => (i + dir + cards.length) % cards.length);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
      <section aria-label="Global Shares Earn brand banner" className="mt-5 overflow-hidden rounded-2xl border border-line bg-[#071426] shadow-sm sm:mt-8">
        <img src="/gse-banna.jpg" alt="Global Shares Earn investment platform banner" className="block max-h-[260px] w-full object-cover object-center sm:max-h-[340px]" fetchPriority="high" decoding="async" />
      </section>
      <div className="mt-8 grid items-start gap-8 sm:mt-12 md:grid-cols-2">
        <div className="rise">
          <h1 className="text-balance text-[28px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px] sm:leading-[0.95]">
            {t.page.heroTitle}
            <br />
            <span className="text-subtle">{t.page.heroSub}</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-sm text-muted">{t.page.heroLead}</p>
          <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
            <Button
              className="w-full min-[420px]:w-auto"
              onClick={() => {
                toast(t.page.openingAccount);
                void navigate({ to: "/register" });
              }}
            >
              {t.page.registerNow}
            </Button>
            <Button
              variant="secondary"
              className="w-full min-[420px]:w-auto"
              onClick={() => {
                toast(t.page.openingLogin);
                void navigate({ to: "/login" });
              }}
            >
              {t.explore}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="text-xs font-semibold tracking-[0.18em] text-accent">YOUR ACCOUNT, AT A GLANCE</div>
          <h2 className="mt-3 text-xl font-bold text-fg">A clearer way to manage your digital assets</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Keep your wallet, investment activity, and account settings together in one mobile-friendly dashboard.</p>
          <div className="mt-6 grid gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-line bg-elevated p-3">
              <Shield size={19} className="mt-0.5 shrink-0 text-accent" />
              <div><div className="text-sm font-semibold text-fg">Account protection</div><p className="mt-1 text-xs leading-5 text-subtle">Protected account access and server-verified financial records.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-line bg-elevated p-3">
              <Zap size={19} className="mt-0.5 shrink-0 text-accent" />
              <div><div className="text-sm font-semibold text-fg">Clear activity history</div><p className="mt-1 text-xs leading-5 text-subtle">Review deposits, withdrawals, and investment activity in one place.</p></div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">{t.page.conditionsCharges}</div>
        </div>
        <div className="mt-6 text-center">
          <Button
            onClick={() => {
              toast(t.page.openingAccount);
              void navigate({ to: "/register" });
            }}
          >
            {t.page.registerNow}
          </Button>
        </div>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">
            {t.page.conditions}
          </div>
          <h2 className="mt-2 text-[28px] font-bold">{t.page.trustTitle}</h2>
          <p className="mx-auto mt-3 max-w-[680px] text-sm text-muted">{t.page.platformsLead}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: t.page.safeTitle,
              desc: t.page.safeBody,
            },
            {
              icon: Zap,
              title: t.page.execTitle,
              desc: t.page.execBody,
            },
            {
              icon: Award,
              title: t.page.awardTitle,
              desc: t.page.awardBody,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-line bg-elevated p-5">
              <item.icon className="text-accent" size={20} />
              <div className="mt-3 font-semibold text-fg">{item.title}</div>
              <div className="mt-1 text-[13px] text-subtle">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>





      {/* Client testimonial carousel styled to match the supplied reference. */}
      <section className="mt-16" aria-labelledby="testimonials-heading">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">CLIENT STORIES</div>
          <h2 id="testimonials-heading" className="mt-2 text-[28px] font-bold">You're In Good Company!</h2>
        </div>
        {(() => {
          const testimonials = [
            {
              image: "steven-tacconi.jpg",
              name: "STEVEN TACCONI",
              quote: "As a satisfied client, I am just writing to tell of how much I have appreciated and enjoyed working with Global Shares Earn. I would personally rank Global Shares Earn at the top of the list when it comes to professionalism and overall knowledge of the futures business. Clearly, Global Shares Earn is interested in the continuing success of their clients. Their attention to personal service is outstanding. It is truly been a positive experience working with them.",
            },
            {
              image: "kevin-gaines.jpg",
              name: "KEVIN GAINES",
              quote: "Global Shares Earn exceeds expectations time after time. Their vast experience and knowledge of the global futures markets will save you time and money when it comes to execution, rolls and research. The entire staff/Traders put a great deal of effort into their relationship with clients, and I am truly appreciative of all they have done for me.",
            },
            {
              image: "gary-james.jpg",
              name: "GARY JAMES",
              quote: "I must say this platform is indeed amazing. it was a glimpse at first but today i can account for a real trade when it comes to Investing on Global Shares Earn.",
            },
            {
              image: "robert-hopkins.jpg",
              name: "ROBERT HOPKINS",
              quote: "I have been a client of Global Shares Earn for over the last year. I have found this company to be competent, capable, knowledgeable, and a vital component of building my Manufacturing business. I would highly recommend Global Shares Earn.",
            },
            {
              image: "ted-shannon.jpg",
              name: "TED & SHANNON",
              quote: "I absolutely love your service. I don’t know how you do it, but I am very, very happy that I found you, and I can’t thank you enough for helping me to realize my dream of achieving a supplemental income to my Administrative business, which I have been able to skyrocket to another level with the extra money I make by Investing with Global Shares Earn.",
            },
          ];
          const person = testimonials[testimonialIndex] ?? testimonials[0];
          const step = (direction: number) => setTestimonialIndex((index) => (index + direction + testimonials.length) % testimonials.length);
          return (
            <div className="relative mx-auto mt-8 max-w-[760px]">
              <button type="button" aria-label="Previous testimonial" onClick={() => step(-1)} className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-sm hover:text-accent sm:left-0 sm:-translate-x-1/2">‹</button>
              <article className="rounded-2xl border border-line bg-surface px-6 py-8 text-center sm:px-10 sm:py-10">
                <img
                  src={`${import.meta.env.BASE_URL}testimonials/${person.image}`}
                  alt={person.name}
                  loading="lazy"
                  className="mx-auto h-36 w-36 rounded-2xl border border-line object-cover sm:h-44 sm:w-44"
                />
                <blockquote className="mt-5 text-sm leading-7 text-subtle sm:text-base">“{person.quote}”</blockquote>
                <div className="mt-5 text-xs font-bold italic tracking-wider text-subtle">{person.name}</div>
              </article>
              <button type="button" aria-label="Next testimonial" onClick={() => step(1)} className="absolute right-0 top-1/2 z-10 flex h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-sm hover:text-accent sm:right-0 sm:translate-x-1/2">›</button>
              <div className="mt-4 flex justify-center gap-2" aria-label="Choose testimonial">
                {testimonials.map((item, index) => (
                  <button key={item.name} type="button" aria-label={`Show testimonial from ${item.name}`} aria-current={index === testimonialIndex ? "true" : undefined} onClick={() => setTestimonialIndex(index)} className={`h-2 w-2 rounded-full transition-colors ${index === testimonialIndex ? "bg-accent" : "bg-line"}`} />
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      <section className="mt-16" aria-labelledby="awards-heading">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">RECOGNITION</div>
          <h2 id="awards-heading" className="mt-2 text-[28px] font-bold">Awards &amp; Recognition</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { image: "award-1.jpg", label: "Best Mobile Trading Platform UAE 2022" },
            { image: "award-2.jpg", label: "Most Trusted Trading Platform Europe 2022" },
            { image: "award-3.jpg", label: "Most Innovative CFD Broker" },
            { image: "award-4.jpg", label: "Best Fixed Spread Broker" },
          ].map((award) => (
            <figure key={award.image} className="overflow-hidden rounded-xl border border-line bg-surface p-3">
              <img
                src={`${import.meta.env.BASE_URL}awards/${award.image}`}
                alt={award.label}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg bg-white object-contain"
              />
              <figcaption className="mt-3 text-center text-xs font-semibold leading-5 text-fg">
                {award.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">{t.how}</div>
          <h2 className="mt-2 text-[28px] font-bold">{t.howTitle}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: t.page.step1t, d: t.page.step1d },
            { n: "02", t: t.page.step2t, d: t.page.step2d },
            { n: "03", t: t.page.step3t, d: t.page.step3d },
          ].map((s) => (
            <div key={s.n} className="rounded-lg border border-line bg-surface p-5">
              <div className="text-xs font-bold tracking-widest text-accent">{s.n}</div>
              <div className="mt-2 font-semibold">{s.t}</div>
              <p className="mt-1 text-[13px] text-subtle">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">{t.plansTitle}</h2>
        <PlanGrid
          cta={t.openToInvest}
          onAction={() => {
            toast(t.page.openingAccount);
            void navigate({ to: "/register" });
          }}
        />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">{t.questions}</h2>
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {t.page.faqs.map((item) => (
            <details key={item.q} className="group p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-fg">
                {item.q}
              </summary>
              <p className="mt-2 text-[13px] text-subtle">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="global-shares-earn-difference" className="mt-20 border-t border-line pt-14">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center">
            <div className="text-xs font-semibold tracking-widest text-accent">GLOBAL SHARES EARN</div>
            <h2 className="mt-2 text-[28px] font-bold text-fg sm:text-[34px]">
              A simpler, clearer account experience
            </h2>
            <p className="mx-auto mt-3 max-w-[700px] text-sm leading-6 text-muted">
              Built around transparent market access, useful education, and tools designed to help
              traders make informed decisions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "We Want You to Succeed",
                body:
                  "Access educational resources, market information, and practical tools designed to help you understand the markets and make more informed decisions.",
              },
              {
                title: "We Believe in Endless Opportunities",
                body:
                  "Explore available markets and instruments from one place, with a mobile-friendly experience built for convenient access wherever you are.",
              },
              {
                title: "Great Investing Conditions",
                body:
                  "We focus on a clear trading experience, responsive interfaces, and reliable access to the tools and market information available on the platform.",
              },
              {
                title: "We Believe You Deserve the Best",
                body:
                  "Use the platform's portfolio, market, investment, and risk-information features to stay organised and make decisions based on your own goals and risk tolerance.",
              },
              {
                title: "We Love to Stay in Touch",
                body:
                  "Keep up with Global Shares Earn announcements, market updates, platform improvements, and other important information published through our official channels.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="text-[15px] font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-subtle">{item.body}</p>
              </div>
            ))}
          </div>

          <footer className="mt-12 border-t border-line pt-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs font-semibold tracking-widest text-accent">MARKETS</div>
                <div className="mt-3 grid gap-2 text-[13px]">
                  <Link to="/app/markets" hash="forex" className="text-subtle hover:text-accent">Forex</Link>
                  <Link to="/app/markets" hash="cryptos" className="text-subtle hover:text-accent">Cryptos</Link>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold tracking-widest text-accent">INVESTMENT</div>
                <div className="mt-3 grid gap-2 text-[13px]">
                  <Link to="/app/plans" className="text-subtle hover:text-accent">Pricing</Link>
                  <Link to="/app/support" hash="faq" className="text-subtle hover:text-accent">Help Centre / FAQ</Link>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold tracking-widest text-accent">COMPANY</div>
                <div className="mt-3 grid gap-2 text-[13px]">
                  <Link to="/" hash="global-shares-earn-difference" className="text-subtle hover:text-accent">Why us</Link>
                  <Link to="/app/support" className="text-subtle hover:text-accent">Support</Link>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold tracking-widest text-accent">ACCOUNT</div>
                <div className="mt-3 grid gap-2 text-[13px]">
                  <Link to="/login" className="text-subtle hover:text-accent">Login</Link>
                  <Link to="/register" className="text-subtle hover:text-accent">Sign Up</Link>
                </div>
              </div>
            </div>

            <section className="mt-8 border-t border-line pt-6" aria-labelledby="contact-address-title">
              <div id="contact-address-title" className="text-xs font-semibold tracking-widest text-accent">CONTACT &amp; SUPPORT</div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">For account-specific questions, use the support area after signing in. We will publish verified company contact details here once they are confirmed.</p>
              <div className="mt-4"><Link to="/app/support" className="text-sm font-semibold text-accent hover:underline">Open Support Centre →</Link></div>
            </section>

            <div className="mt-8 border-t border-line pt-6">
              <div className="text-xs font-semibold tracking-widest text-accent">LEGAL</div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
                <Link to="/legal" hash="privacy" className="text-subtle hover:text-accent">Privacy Policy</Link>
                <Link to="/legal" hash="terms" className="text-subtle hover:text-accent">Terms of Service</Link>
                <Link to="/legal" hash="risk" className="text-subtle hover:text-accent">Risk Disclosure</Link>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-[11px] leading-5 text-faint">
              <p>
                This website may be accessed worldwide. Information and services available through
                the platform may vary by jurisdiction and eligibility. Please review the applicable
                terms, disclosures, and legal information before using any trading or investment
                service.
              </p>
              <p>
                Forex, CFDs, and other leveraged products can result in significant losses and may
                not be suitable for every client. Prices can move rapidly against you and you may
                lose some or all of the funds committed. Make sure you understand the risks and
                consider seeking independent financial advice where appropriate.
              </p>
              <p className="pt-2 text-center">
                © 2026 GLOBAL SHARES EARN. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </section>

    </div>
  );
}
