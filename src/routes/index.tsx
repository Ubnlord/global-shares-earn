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
  const card = cards[company] ?? cards[0];

  const stepCompany = (dir: number) => {
    if (!cards.length) return;
    setCompany((i) => (i + dir + cards.length) % cards.length);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
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





      {/* Customer testimonials: publish only approved, verified customer quotes. */}
      <section className="mt-16" aria-labelledby="testimonials-heading">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">CUSTOMER STORIES</div>
          <h2 id="testimonials-heading" className="mt-2 text-[28px] font-bold">Testimonials</h2>
          <p className="mx-auto mt-3 max-w-[680px] text-sm leading-6 text-muted">
            We value customer feedback. Testimonials are being verified and will be published here
            with permission; we do not invent reviews or promise investment outcomes.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { image: "gary-james.jpg", label: "Customer portrait 1" },
            { image: "kevin-gaines.jpg", label: "Customer portrait 2" },
            { image: "robert-hopkins.jpg", label: "Customer portrait 3" },
            { image: "steven-tacconi.jpg", label: "Customer portrait 4" },
            { image: "ted-shannon.jpg", label: "Customer portrait 5" },
          ].map((person) => (
            <article key={person.image} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
              <img
                src={`${import.meta.env.BASE_URL}testimonials/${person.image}`}
                alt={person.label}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-full border border-line object-cover"
              />
              <div>
                <div className="font-semibold text-fg">Customer feedback</div>
                <p className="mt-1 text-sm leading-5 text-subtle">
                  Verified customer comments will appear here after approval and consent.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="awards-heading">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-accent">RECOGNITION</div>
          <h2 id="awards-heading" className="mt-2 text-[28px] font-bold">Awards &amp; Recognition</h2>
          <p className="mx-auto mt-3 max-w-[680px] text-sm leading-6 text-muted">
            Browse the recognition materials available in our media library. Award names, issuers,
            dates, and any claim of an award being granted to GLOBAL SHARES EARN must be verified
            before being represented as an official achievement.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { image: "award-1.jpg", label: "Award image 1" },
            { image: "award-2.jpg", label: "Award image 2" },
            { image: "award-3.jpg", label: "Award image 3" },
            { image: "award-4.jpg", label: "Award image 4" },
          ].map((award) => (
            <figure key={award.image} className="overflow-hidden rounded-xl border border-line bg-surface p-3">
              <img
                src={`${import.meta.env.BASE_URL}awards/${award.image}`}
                alt={award.label}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-contain"
              />
              <figcaption className="mt-3 text-center text-xs leading-5 text-subtle">
                Recognition material — details pending verification
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
