import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiCheck,
  FiBookOpen, FiCheckSquare, FiTarget,
  FiClock, FiBarChart2, FiZap, FiSend
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import './LandingPage.css';

/* ── STUDEAID logo image ─ */
const StudeaidLogo = ({ size = 36 }) => (
  <img
    src="/studeaid-logo-removebg-preview.png"
    alt="STUDEAID"
    style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
  />
);

/* ================================================================
   SMART STUDY PLANNER — Landing Page (Light Theme)
   ================================================================ */
export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const statsRef  = useRef(null);
  const countedRef = useRef(false);

  /* Redirect authenticated users to dashboard */
  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, loading, navigate]);

  /* Scroll-reveal via IntersectionObserver */
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const io  = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Count-up animation */
  const animateCounters = useCallback(() => {
    if (countedRef.current) return;
    countedRef.current = true;
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = target / 80;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.round(cur).toLocaleString() + suffix;
        if (cur >= target) clearInterval(timer);
      }, 25);
    });
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) animateCounters(); },
      { threshold: 0.4 }
    );
    io.observe(statsRef.current);
    return () => io.disconnect();
  }, [animateCounters]);

  return (
    <div className="lp">

      {/* ═══ NAVBAR ═══════════════════════════════════════════ */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="lp-logo">
            <StudeaidLogo size={38} />
            <span className="lp-logo-name">STUDEAID</span>
          </Link>

          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#howitworks">How It Works</a>
            <a href="#ai">AI Assistant</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className="lp-nav-btns">
            <Link to="/login" className="lp-btn-ghost-sm">Sign In</Link>
            <Link to="/login" state={{ tab: 'register' }} className="lp-btn-blue-sm">
              Get Started Free
            </Link>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lp-mobile-menu">
          <a href="#features"   onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#howitworks" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#ai"         onClick={() => setMenuOpen(false)}>AI Assistant</a>
          <Link to="/login" state={{ tab: 'register' }} className="lp-btn-blue-sm"
            style={{ width: '100%', textAlign: 'center', marginTop: 8 }}>
            Get Started Free
          </Link>
        </div>
      )}

      {/* ═══ HERO ═════════════════════════════════════════════ */}
      <section
        className="lp-hero"
        style={{ '--hero-bg-img': `url(${process.env.PUBLIC_URL}/studeaidimage.jpeg)` }}
      >
        <div className="lp-wrap lp-hero-inner">

          {/* Left — copy */}
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">AI-Powered Study Platform</div>
            <h1 className="lp-h1">
              The Ultimate Study<br />
              <span>Planner for Students</span>
            </h1>
            <div className="lp-h1-underline" />
            <p className="lp-hero-sub">
              Manage your subjects, tasks, notes, goals, and Pomodoro
              sessions — all in one place. With a built-in AI assistant
              powered by Google Gemini.
            </p>
            <div className="lp-hero-cta">
              <Link to="/login" state={{ tab: 'register' }} className="lp-btn-blue">
                Get Started Free — It's Free
              </Link>
              <a href="#howitworks" className="lp-btn-ghost">
                See How It Works →
              </a>
            </div>
            {/* Trust row */}
            <div className="lp-trust">
              <div className="lp-trust-avs">
                {[['#2563EB','S'],['#1D4ED8','A'],['#3B82F6','R'],['#60A5FA','M'],['#93C5FD','P']].map(([bg,l],i)=>(
                  <div key={i} className="lp-trust-av" style={{ background: bg }}>{l}</div>
                ))}
              </div>
              <div>
                <div className="lp-trust-txt">2,400+ students already studying smarter</div>
                <div className="lp-trust-stars">★★★★★</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ STATS BAR ════════════════════════════════════════ */}
      <section className="lp-stats-bar" ref={statsRef}>
        <div className="lp-wrap">
          <div className="lp-stats-inner">
            {[
              { target: 10,   suffix: '+',  label: 'Study Modules'   },
              null,
              { target: 2400, suffix: '+',  label: 'Active Students' },
              null,
              { target: 98,   suffix: '%',  label: 'Satisfaction Rate' },
              null,
              { target: 24,   suffix: '/7', label: 'AI Assistant'    },
            ].map((item, i) =>
              item === null
                ? <div key={i} className="lp-stat-div" />
                : (
                  <div key={i} className="lp-stat">
                    <span
                      className="lp-stat-num"
                      data-target={item.target}
                      data-suffix={item.suffix}
                    >
                      {item.target}{item.suffix}
                    </span>
                    <div className="lp-stat-lbl">{item.label}</div>
                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═════════════════════════════════════════ */}
      <section className="lp-features" id="features">
        <div className="lp-wrap">
          <div className="lp-sec-hd lp-reveal">
            <div className="lp-eyebrow-sm">EVERYTHING YOU NEED</div>
            <h2 className="lp-h2">One platform to rule your studies</h2>
            <p className="lp-sec-sub">
              Stop juggling 5 different apps. STUDEAID brings everything into one beautiful, intelligent workspace.
            </p>
          </div>

          <div className="lp-feat-grid">
            {[
              { Icon: FiBookOpen,    title: 'Subject Management',    border: '#2563EB', desc: 'Organize all your subjects with custom colors. Track hours studied, tasks linked, and notes per subject — all in one view.' },
              { Icon: FiCheckSquare, title: 'Smart Task Tracking',   border: '#D97706', desc: 'Create tasks with priorities, due dates, and subject links. Filter by status and never miss a deadline again.' },
              { Icon: FiZap,         title: 'AI Study Assistant',    border: '#7C3AED', desc: 'Powered by Google Gemini. Get study plans, topic explanations, and personalized guidance — available 24/7.', ai: true },
              { Icon: FiClock,       title: 'Pomodoro Focus Timer',  border: '#DC2626', desc: 'Built-in focus timer with session history. Stay in the zone with 25-minute deep work blocks and tracked breaks.' },
              { Icon: FiBarChart2,   title: 'Progress & Analytics',  border: '#0891B2', desc: 'Visualize your study hours, subject performance, and goal completion with beautiful interactive charts.' },
              { Icon: FiTarget,      title: 'Goal Tracking',         border: '#16A34A', desc: 'Set academic goals with target dates. Watch your progress bar fill as you hit milestones and complete tasks.' },
            ].map(({ Icon, title, border, desc, ai }) => (
              <div key={title} className="lp-feat-card lp-reveal" style={{ '--fc-border': border }}>
                <div className="lp-feat-icon" style={{ color: border }}>
                  <Icon size={20} />
                </div>
                <div className="lp-feat-title">
                  {title}
                  {ai && <span className="lp-ai-badge">Gemini AI</span>}
                </div>
                <div className="lp-feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═════════════════════════════════════ */}
      <section className="lp-how" id="howitworks">
        <div className="lp-wrap">
          <div className="lp-sec-hd lp-reveal">
            <h2 className="lp-h2">Up and running in 3 steps</h2>
            <p className="lp-sec-sub">No tutorial needed. Just sign up and start studying smarter.</p>
          </div>

          <div className="lp-steps">
            {[
              { num: '01', icon: '✨', label: 'STEP 1', title: 'Create your account',    desc: 'Sign up free with your email, Google, or Facebook. Complete profile setup in under 60 seconds.' },
              { num: '02', icon: '📋', label: 'STEP 2', title: 'Add subjects & tasks',   desc: 'Create your subjects with colors, then add tasks, notes, and goals linked to each one.' },
              { num: '03', icon: '🚀', label: 'STEP 3', title: 'Let AI guide you',        desc: 'Your AI assistant gives personalized suggestions and study plans based on your schedule.' },
            ].map((step, i) => (
              <>
                {i > 0 && <div key={`conn-${i}`} className="lp-step-conn" />}
                <div key={step.num} className="lp-step lp-reveal">
                  <div className="lp-step-num">{step.num}</div>
                  <div className="lp-step-icon">{step.icon}</div>
                  <div className="lp-step-label">{step.label}</div>
                  <div className="lp-step-title">{step.title}</div>
                  <div className="lp-step-desc">{step.desc}</div>
                </div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI SHOWCASE ══════════════════════════════════════ */}
      <section className="lp-ai-sec" id="ai">
        <div className="lp-wrap lp-ai-inner">

          {/* Left — copy */}
          <div className="lp-ai-copy lp-reveal">
            <div className="lp-eyebrow-sm">AI POWERED</div>
            <h2 className="lp-h2 lp-h2-left">Your personal study assistant, available 24/7</h2>
            <p className="lp-ai-sub">
              Ask it to explain a tough topic, build a revision schedule, or motivate you when you're stuck. Powered by Google Gemini.
            </p>
            <div className="lp-ai-checks">
              {[
                'Explains any topic in simple language',
                'Creates personalized study plans instantly',
                'Available anytime — even at 2am before exams',
              ].map(c => (
                <div key={c} className="lp-ai-check">
                  <FiCheck size={15} color="var(--blue-primary)" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <Link to="/login" className="lp-btn-outline-blue">
              Try AI Assistant →
            </Link>
          </div>

          {/* Right — chat mockup */}
          <div className="lp-chat-card lp-reveal">
            <div className="lp-chat-hdr">
              <div className="lp-chat-av">🤖</div>
              <div>
                <div className="lp-chat-name">AI Study Assistant</div>
                <div className="lp-chat-status"><span />Online</div>
              </div>
            </div>
            <div className="lp-chat-body">
              <div className="lp-msg lp-msg-user">
                I have a chemistry exam in 3 days. Help me make a revision schedule.
              </div>
              <div className="lp-msg lp-msg-ai">
                📅 <strong>Your 3-Day Chemistry Plan:</strong><br /><br />
                Day 1: Organic Chemistry (3h)<br />
                → Hydrocarbons + Functional Groups<br />
                Day 2: Physical Chemistry (2.5h)<br />
                → Thermodynamics + Equilibrium<br />
                Day 3: Practice Tests (2h)<br />
                → 2 mock papers + full revision<br /><br />
                Want me to add these as tasks? ✨
              </div>
              <div className="lp-chat-typing">
                <span /><span /><span />
              </div>
            </div>
            <div className="lp-chat-inp">
              <input disabled placeholder="Ask anything..." />
              <button className="lp-chat-send" tabIndex={-1}><FiSend size={14} /></button>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════ */}
      <section className="lp-testimonials" id="testimonials">
        <div className="lp-wrap">
          <div className="lp-sec-hd lp-reveal">
            <div className="lp-eyebrow-sm">STUDENT STORIES</div>
            <h2 className="lp-h2">Loved by students everywhere</h2>
            <p className="lp-sec-sub">Real feedback from students who transformed their study habits with STUDEAID.</p>
          </div>
          <div className="lp-testi-grid">
            {[
              {
                name: 'Arjun Sharma',
                role: 'Engineering Student, IIT Delhi',
                avatar: 'AS',
                color: '#2563EB',
                quote: 'STUDEAID completely changed how I prepare for exams. The AI creates a revision plan in seconds — it used to take me an hour to plan my entire week.',
              },
              {
                name: 'Priya Mehta',
                role: 'Medical Student, AIIMS Mumbai',
                avatar: 'PM',
                color: '#7C3AED',
                quote: 'The Pomodoro timer combined with subject tracking is unreal. I went from scattered sessions to 6 productive hours daily. My scores improved by 18%.',
              },
              {
                name: 'Rahul Verma',
                role: 'Commerce Student, DU',
                avatar: 'RV',
                color: '#0891B2',
                quote: 'I was juggling 4 different apps before. Now tasks, notes, goals, and timetable are all in one place. I finally feel in control of my studies.',
              },
            ].map(({ name, role, avatar, color, quote }) => (
              <div key={name} className="lp-testi-card lp-reveal">
                <div className="lp-testi-stars">★★★★★</div>
                <p className="lp-testi-quote">"{quote}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-av" style={{ background: color }}>{avatar}</div>
                  <div>
                    <div className="lp-testi-name">{name}</div>
                    <div className="lp-testi-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══════════════════════════════════════ */}
      <section className="lp-cta" id="pricing">
        <div className="lp-wrap">
          <h2 className="lp-cta-h2">Ready to take control of your studies?</h2>
          <p className="lp-cta-sub">
            Join thousands of students who've already transformed how they study.
            Free forever. No credit card needed.
          </p>
          <Link to="/login" state={{ tab: 'register' }} className="lp-cta-btn">
            Get Started Free →
          </Link>
          <div className="lp-cta-trust">
            <span>✓ Free forever</span>
            <span>✓ No credit card</span>
            <span>✓ Setup in 60 seconds</span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div className="lp-logo">
            <StudeaidLogo size={38} />
            <span className="lp-logo-name lp-logo-name-white">STUDEAID</span>
          </div>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#howitworks">How It Works</a>
            <a href="#ai">AI</a>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="lp-footer-copy">
            © {new Date().getFullYear()} STUDEAID · Final Year Project
          </div>
        </div>
      </footer>

    </div>
  );
}
