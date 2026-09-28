import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Landing.css';

/* ================================================================
   LANDING PAGE — Smart Study Planner  (Premium Redesign)
   ================================================================ */
export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const statsRef   = useRef(null);
  const countedRef = useRef(false);

  /* Redirect authenticated users */
  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, loading, navigate]);

  /* Scroll-reveal */
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const io  = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Counter animation */
  const animateCounters = useCallback(() => {
    if (countedRef.current) return;
    countedRef.current = true;
    const targets = [
      { id: 'cnt-students', end: 2400, suffix: '+' },
      { id: 'cnt-tasks',    end: 48,   suffix: 'K+' },
      { id: 'cnt-score',    end: 98,   suffix: '%' },
      { id: 'cnt-ai',       end: 24,   suffix: '/7' },
    ];
    targets.forEach(({ id, end, suffix }) => {
      const el = document.getElementById(id);
      if (!el) return;
      let cur = 0;
      const step = end / 60;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = Math.round(cur).toLocaleString() + suffix;
        if (cur >= end) clearInterval(timer);
      }, 22);
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

  const toLogin    = () => navigate('/login');
  const toRegister = () => navigate('/login', { state: { tab: 'register' } });

  return (
    <div className="lp-root">

      {/* 3 FLOATING ORBS — signature visual element */}
      <div className="lp-orbs" aria-hidden="true">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />
      </div>

      {/* ═══════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════ */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <div className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="lp-logo-sq">S</div>
            <span className="lp-logo-name">StudyPlanner</span>
          </div>

          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#ai">AI Assistant</a>
            <a href="#reviews">Reviews</a>
          </div>

          <div className="lp-nav-btns">
            <button className="lp-btn-ghost"  onClick={toLogin}>Sign In</button>
            <button className="lp-btn-filled" onClick={toRegister}>Get Started Free</button>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen
              ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
              : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </nav>

      <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how"      onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#ai"       onClick={() => setMenuOpen(false)}>AI Assistant</a>
        <a href="#reviews"  onClick={() => setMenuOpen(false)}>Reviews</a>
        <button className="lp-btn-filled" style={{ width: '100%', marginTop: 8 }}
          onClick={() => { setMenuOpen(false); toRegister(); }}>
          Get Started Free
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-wrap">
          <div className="lp-hero-inner">

            {/* Copy */}
            <div className="lp-hero-left">
              <div className="lp-eyebrow">
                <span>✨</span>&nbsp;Powered by AI · Built for Students
              </div>

              <h1 className="lp-h1">
                Study Smarter,<br />
                <span className="lp-grad-text">Score Higher.</span>
              </h1>

              <p className="lp-hero-sub">
                Your all-in-one AI study companion. Manage tasks, track subjects,
                plan your schedule and get instant AI help — all in one beautiful place.
              </p>

              <div className="lp-hero-cta">
                <button className="lp-btn-primary" onClick={toRegister}>
                  Start for Free
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                <button className="lp-btn-outline" onClick={toLogin}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/>
                  </svg>
                  Sign In
                </button>
              </div>

              {/* Social proof */}
              <div className="lp-proof">
                <div className="lp-proof-avs">
                  {[
                    ['linear-gradient(135deg,#7C3AED,#DB2777)', 'R'],
                    ['linear-gradient(135deg,#2563EB,#7C3AED)', 'A'],
                    ['linear-gradient(135deg,#DB2777,#F59E0B)', 'S'],
                    ['linear-gradient(135deg,#10B981,#2563EB)', 'M'],
                  ].map(([bg, l], i) => (
                    <div key={i} className="lp-proof-av" style={{ background: bg }}>{l}</div>
                  ))}
                </div>
                <div className="lp-proof-txt">
                  <div><strong>2,400+ students</strong> already studying smarter</div>
                  <div className="lp-proof-stars">★★★★★&nbsp; 4.9 / 5 average rating</div>
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="lp-hero-right">
              <div className="lp-mock-outer">
                <div className="lp-fbadge lp-fbadge-1">🤖 AI Active</div>
                <div className="lp-fbadge lp-fbadge-2">🔥 7-day streak</div>
                <div className="lp-fbadge lp-fbadge-3">⏱ Pomodoro: 22:14</div>

                <div className="lp-mock-wrap">
                  {/* Browser bar */}
                  <div className="lp-mock-bar">
                    <div className="lp-dot lp-dot-r" />
                    <div className="lp-dot lp-dot-y" />
                    <div className="lp-dot lp-dot-g" />
                    <span className="lp-mock-url">localhost:5173/dashboard</span>
                  </div>

                  {/* App body */}
                  <div className="lp-mock-body">
                    <div className="lp-mock-greeting">👋 Good morning, Alex!</div>

                    <div className="lp-mock-stats">
                      {[
                        { val: '6',   lbl: 'Tasks Today',  col: '#7C3AED' },
                        { val: '85%', lbl: 'Progress',     col: '#2563EB' },
                        { val: '4',   lbl: 'Subjects',     col: '#10B981' },
                        { val: '22m', lbl: 'Study Time',   col: '#F59E0B' },
                      ].map(({ val, lbl, col }) => (
                        <div key={lbl} className="lp-ms" style={{ '--ms-col': col }}>
                          <div className="lp-ms-val">{val}</div>
                          <div className="lp-ms-lbl">{lbl}</div>
                        </div>
                      ))}
                    </div>

                    <div className="lp-mock-ttl">Today's Tasks</div>
                    <div className="lp-mock-tasks">
                      {[
                        { text: 'Complete Math Chapter 5',    done: true,  badge: 'Done',     bc: 'low' },
                        { text: 'Review Physics notes',       done: true,  badge: 'Done',     bc: 'low' },
                        { text: 'Write Chemistry lab report', done: false, badge: 'Due Soon', bc: 'high' },
                        { text: 'Prepare CS assignment',      done: false, badge: 'Medium',   bc: 'med' },
                      ].map(({ text, done, badge, bc }) => (
                        <div key={text} className="lp-mt">
                          <div className={`lp-mt-check ${done ? 'lp-mt-check-done' : 'lp-mt-check-empty'}`}>
                            {done ? '✓' : ''}
                          </div>
                          <span className={`lp-mt-text${done ? ' done' : ''}`}>{text}</span>
                          <span className={`lp-mbadge lp-mbadge-${bc}`}>{badge}</span>
                        </div>
                      ))}
                    </div>

                    <div className="lp-mock-ai">
                      🤖 <strong>AI Tip:</strong> Best time to study Chemistry today is 4–6 PM. You have 2 free slots.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════ */}
      <section className="lp-stats" ref={statsRef}>
        <div className="lp-wrap">
          <div className="lp-stats-inner">
            {[
              { id: 'cnt-students', init: '2400+', lbl: 'Active Students' },
              null,
              { id: 'cnt-tasks',    init: '48K+',  lbl: 'Tasks Completed' },
              null,
              { id: 'cnt-score',    init: '98%',   lbl: 'Satisfaction Rate' },
              null,
              { id: 'cnt-ai',       init: '24/7',  lbl: 'AI Availability' },
            ].map((item, i) =>
              item === null
                ? <div key={i} className="lp-stat-div" />
                : (
                  <div key={item.id} className="lp-stat-item">
                    <span className="lp-stat-num lp-grad-num" id={item.id}>{item.init}</span>
                    <div className="lp-stat-lbl">{item.lbl}</div>
                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════ */}
      <section className="lp-features" id="features">
        <div className="lp-wrap">
          <div className="lp-center lp-reveal">
            <div className="lp-sec-eyebrow">Everything You Need</div>
            <h2 className="lp-sec-h2">One App. Every Study Need.</h2>
            <p className="lp-sec-sub">
              From task management to AI tutoring — Smart Study Planner has every tool a serious student needs to excel.
            </p>
          </div>

          <div className="lp-feat-grid">
            {[
              { icon: '📋', title: 'Smart Task Manager',      col: '#7C3AED', iconBg: 'rgba(124,58,237,0.12)',  tag: 'Core Feature',  desc: 'Organize assignments by subject, priority, and due date. Smart reminders ensure you never miss a deadline.' },
              { icon: '📚', title: 'Subject Tracker',         col: '#2563EB', iconBg: 'rgba(37,99,235,0.12)',   tag: 'Organized',     desc: 'Track all your subjects, grades, and study hours. See exactly which area needs more attention.' },
              { icon: '🗓️', title: 'Study Planner',           col: '#10B981', iconBg: 'rgba(16,185,129,0.12)', tag: 'Planning',      desc: 'Build a personalized weekly schedule. Block study time, set goals, and stay consistent every week.' },
              { icon: '🤖', title: 'AI Study Assistant',      col: '#DB2777', iconBg: 'rgba(219,39,119,0.12)', tag: 'AI Powered',    desc: 'Ask questions, get explanations, generate summaries and quizzes. Your personal tutor — 24/7.' },
              { icon: '⏱️', title: 'Pomodoro Timer',          col: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)', tag: 'Productivity',  desc: 'Built-in focus timer using the Pomodoro technique. Maximize productivity with smart work-break cycles.' },
              { icon: '📊', title: 'Progress Analytics',      col: '#06B6D4', iconBg: 'rgba(6,182,212,0.12)',  tag: 'Insights',      desc: 'Beautiful charts that visualize your study habits. Discover peak hours and track week-over-week improvement.' },
            ].map(({ icon, title, col, iconBg, tag, desc }) => (
              <div key={title} className="lp-feat-card lp-reveal"
                style={{ '--lp-ac': col, '--lp-ac-glow': col + '18', '--lp-icon-bg': iconBg }}>
                <div className="lp-feat-icon">{icon}</div>
                <div className="lp-feat-title">{title}</div>
                <div className="lp-feat-desc">{desc}</div>
                <div className="lp-feat-tag">{tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════ */}
      <section className="lp-how" id="how">
        <div className="lp-wrap">
          <div className="lp-center lp-reveal">
            <div className="lp-sec-eyebrow">Simple Process</div>
            <h2 className="lp-sec-h2">Get Started in 3 Easy Steps</h2>
            <p className="lp-sec-sub">
              No complicated setup. Sign up and start studying smarter within minutes.
            </p>
          </div>

          <div className="lp-steps">
            <div className="lp-step lp-reveal">
              <div className="lp-step-num" style={{ '--lp-step-col': '#7C3AED55', '--lp-step-bg': 'rgba(124,58,237,0.10)' }}>🚀</div>
              <div className="lp-step-title">Create Your Account</div>
              <div className="lp-step-desc">Sign up free in 30 seconds. No credit card needed. Get a clean, personalized dashboard instantly.</div>
            </div>
            <div className="lp-step-conn"><div className="lp-step-line" /></div>
            <div className="lp-step lp-reveal">
              <div className="lp-step-num" style={{ '--lp-step-col': '#2563EB55', '--lp-step-bg': 'rgba(37,99,235,0.10)' }}>⚙️</div>
              <div className="lp-step-title">Set Up Your Subjects</div>
              <div className="lp-step-desc">Add your subjects, goals, and timetable. The AI will suggest an optimal study plan tailored to you.</div>
            </div>
            <div className="lp-step-conn"><div className="lp-step-line" /></div>
            <div className="lp-step lp-reveal">
              <div className="lp-step-num" style={{ '--lp-step-col': '#10B98155', '--lp-step-bg': 'rgba(16,185,129,0.10)' }}>🎯</div>
              <div className="lp-step-title">Study & Track Progress</div>
              <div className="lp-step-desc">Complete tasks, ask the AI assistant, and watch your analytics improve week after week.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          AI SHOWCASE
      ═══════════════════════════════════════════════ */}
      <section className="lp-ai" id="ai">
        <div className="lp-wrap">
          <div className="lp-ai-inner">

            <div className="lp-reveal">
              <div className="lp-sec-eyebrow">AI-Powered Learning</div>
              <h2 className="lp-sec-h2">Your Personal AI<br />Study Assistant</h2>
              <div className="lp-ai-checks">
                {[
                  'Explain complex topics in simple language',
                  'Generate practice questions & mock tests',
                  'Summarize long chapters into key points',
                  'Create personalized study schedules',
                  'Answer doubts instantly, any time',
                ].map(c => (
                  <div key={c} className="lp-ai-check">
                    <div className="lp-ai-check-mark">✓</div>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <button className="lp-ai-btn" onClick={toRegister}>
                Try AI Assistant Free
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="lp-reveal">
              <div className="lp-chat-card">
                <div className="lp-chat-hdr">
                  <div className="lp-chat-av">🤖</div>
                  <div>
                    <div className="lp-chat-name">StudyAI Assistant</div>
                    <div className="lp-chat-online">Online · Ready to help</div>
                  </div>
                </div>
                <div className="lp-chat-msgs">
                  <div className="lp-msg-u">
                    Explain Newton's Second Law and give me 3 practice questions.
                  </div>
                  <div className="lp-msg-ai">
                    <strong>Newton's Second Law:</strong> Force equals mass × acceleration — <strong>F = ma</strong>.<br /><br />
                    Practice Questions:<br />
                    1. A 5 kg object accelerates at 3 m/s². Find the force.<br />
                    2. A 120 N force acts on a 6 kg object. Find acceleration.<br />
                    3. What mass requires 25 N to accelerate at 5 m/s²?
                  </div>
                  <div className="lp-msg-u">
                    Can you summarize this for my notes?
                  </div>
                  <div className="lp-typing">
                    <div className="lp-tdot" /><div className="lp-tdot" /><div className="lp-tdot" />
                  </div>
                </div>
                <div className="lp-chat-inp">
                  <span>Ask anything about your studies…</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section className="lp-testi" id="reviews">
        <div className="lp-wrap">
          <div className="lp-center lp-reveal">
            <div className="lp-sec-eyebrow">Student Reviews</div>
            <h2 className="lp-sec-h2">Loved by Students Everywhere</h2>
            <p className="lp-sec-sub">
              Thousands of students have transformed their study habits with Smart Study Planner.
            </p>
          </div>

          <div className="lp-testi-grid">
            {[
              {
                stars: '★★★★★', letter: 'R', color: '#7C3AED',
                name: 'Rahul Sharma', role: 'Engineering Student, Delhi',
                text: 'The AI assistant is incredible. I was struggling with Calculus for weeks — after using StudyPlanner for 3 days I finally understood derivatives. My grades went from C to B+ in just one month!',
              },
              {
                stars: '★★★★★', letter: 'A', color: '#2563EB',
                name: 'Aisha Malik', role: 'Medical Student, Lahore',
                text: 'The Pomodoro timer and task manager changed how I study. I used to procrastinate all day. Now I finish all work before 8 PM and still have time for hobbies. Absolute game changer.',
              },
              {
                stars: '★★★★★', letter: 'S', color: '#DB2777',
                name: 'Sana Raza', role: 'Class 12 Student, Karachi',
                text: 'The subject tracker showed me exactly where I was weak. I focused my revision there and scored 94% in board exams. I recommended this app to my entire class!',
              },
            ].map(({ stars, letter, color, name, role, text }) => (
              <div key={name} className="lp-testi-card lp-reveal">
                <div className="lp-testi-stars">{stars}</div>
                <div className="lp-testi-text">{text}</div>
                <div className="lp-testi-author">
                  <div className="lp-testi-av" style={{ background: `linear-gradient(135deg,${color},${color}88)` }}>
                    {letter}
                  </div>
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

      {/* ═══════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════ */}
      <div className="lp-cta-section">
        <div className="lp-cta-inner lp-reveal">
          <h2 className="lp-cta-h2">
            Ready to Transform<br />
            <span className="lp-grad-text">Your Study Life?</span>
          </h2>
          <p className="lp-cta-sub">
            Join 2,400+ students who are studying smarter. Free forever — no credit card required.
          </p>
          <button className="lp-cta-btn" onClick={toRegister}>
            Create Free Account
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="lp-cta-checks">
            <span>Free forever plan</span>
            <span>No credit card needed</span>
            <span>Set up in 30 seconds</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-row1">
            <div className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
              <div className="lp-logo-sq">S</div>
              <span className="lp-logo-name">StudyPlanner</span>
            </div>
            <div className="lp-footer-links">
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#ai">AI</a>
              <a href="#reviews">Reviews</a>
              <a style={{ cursor: 'pointer' }} onClick={toLogin}>Sign In</a>
            </div>
            <div className="lp-footer-love">
              Built with <span style={{ color: '#EC4899' }}>♥</span> for Students
            </div>
          </div>
          <div className="lp-footer-copy">
            © {new Date().getFullYear()} Smart Study Planner · All rights reserved
          </div>
        </div>
      </footer>

    </div>
  );
}
