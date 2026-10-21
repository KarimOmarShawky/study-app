// Visuals for the notes: animated versions of a lecture's own diagrams and small hands-on versions of its examples.
// A note section names one with fig: '<name>'. Worked examples are accompanied by explanatory study guides and explicit model assumptions.
// build.mjs copies this file to data/figs.js; app.js loads it only when a lecture with a visual is opened.
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const html = htm.bind(React.createElement);
  const calm = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const CSS = `
.fig{ margin:14px 0 20px; border:1px solid var(--line); border-radius:var(--radius-sm); background:var(--paper); overflow:hidden; }
.fig-stage{ padding:16px 12px 10px; background:var(--paper-2); }
.fig-stage svg{ width:100%; height:auto; display:block; margin:0 auto; max-width:560px; font-family:var(--body); }
.fig svg text{ fill:var(--ink); }
.fig-cap{ padding:10px 14px 12px; font-size:.95rem; line-height:1.5; color:var(--ink); min-height:3.2em; }
.fig-cap .ar{ display:block; direction:rtl; text-align:right; color:var(--graphite); margin-top:4px; font-family:"IBM Plex Sans Arabic", var(--body); }
.fig-bar{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; padding:0 14px 12px; }
.fig-bar .grow{ flex:1; }
.fig-dots{ display:flex; gap:6px; } .fig-dots i{ width:8px; height:8px; border-radius:50%; background:var(--line); } .fig-dots i.on{ background:var(--fig-k, var(--k-hci)); }
.fig-btn{ font:inherit; font-size:.88rem; padding:6px 12px; border-radius:99px; border:1px solid var(--line); background:var(--paper); color:var(--ink); cursor:pointer; min-height:32px; }
.fig-btn:hover{ border-color:var(--fig-k, var(--k-hci)); } .fig-btn.solid{ background:var(--fig-s, var(--s-hci)); color:#fff; border-color:transparent; }
.fig .pop{ transition:opacity .5s ease, transform .5s ease; } .fig .pop.off{ opacity:0; transform:translateY(6px); }
.fig .fade{ transition:opacity .9s ease; }
.fig .flow{ stroke-dasharray:6 7; animation:figflow 1.1s linear infinite; }
@keyframes figflow{ to{ stroke-dashoffset:-26; } }
.fig .tap{ animation:figtap 1.4s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
@keyframes figtap{ 0%,100%{ transform:translateY(-10px); } 45%,60%{ transform:translateY(0); } }
.fig-elev{ display:grid; gap:10px; padding:12px; border-radius:8px; background:#1b1d22; max-width:520px; margin:0 auto; }
.fig-elev .row{ display:grid; grid-template-columns:repeat(8, 1fr); gap:6px; align-items:center; }
.fig-elev .top{ grid-template-columns:repeat(6, 1fr); }
.fig-elev button{ aspect-ratio:1; border-radius:5px; border:0; cursor:pointer; font:600 .62rem/1.1 var(--body); color:#fff; padding:2px; min-width:0; }
.fig-elev .btn{ background:linear-gradient(145deg,#e9eef3,#aeb7c0); box-shadow:inset 0 0 0 3px #7d8790; }
.fig-elev .lbl{ background:#1f5fbf; } .fig-elev .dark{ background:#2a2d33; }
.fig-elev .num{ background:transparent; color:#fff; font-size:1.2rem; cursor:default; }
.fig-elev button.hit{ outline:3px solid #f87171; outline-offset:2px; } .fig-elev button.good{ outline:3px solid #4ade80; outline-offset:2px; }
.fig-steps{ display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:560px; margin:0 auto; }
.fig-step{ border:1px solid var(--line); border-radius:10px; background:var(--paper); padding:10px; text-align:center; font-size:.92rem; line-height:1.35; opacity:.55; transition:opacity .4s, background .4s; }
.fig-step b{ display:block; color:var(--pen); font-size:.85rem; margin-bottom:2px; } .fig-step.on{ opacity:1; background:color-mix(in srgb, var(--k-hci) 18%, var(--paper)); }
.fig-reader{ text-align:center; margin:10px 0 0; font-size:.9rem; color:var(--graphite); } .fig-reader i{ display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--faint); margin-right:6px; vertical-align:middle; } .fig-reader i.on{ background:var(--ok); }
@media (max-width:420px){ .fig-steps{ grid-template-columns:1fr; } }
.fig-umb{ display:grid; grid-template-columns:1fr auto auto auto 1fr; gap:8px; align-items:center; }
.fig-umb .grp{ border:1px solid var(--line); border-radius:10px; background:var(--paper); padding:8px 10px; font-size:.86rem; line-height:1.45; }
.fig-umb .grp b{ display:block; font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:var(--k-hci); margin-bottom:4px; }
.fig-umb .id{ width:118px; height:118px; border-radius:50%; display:grid; place-items:center; text-align:center; background:var(--s-hci); color:#fff; font-weight:600; font-size:.95rem; line-height:1.2; padding:8px; }
.fig-umb .arr{ font-size:1.5rem; color:var(--k-hci); text-align:center; } .fig-umb .arr .v{ display:none; }
.fig-umb .bottom{ grid-column:1 / -1; }
@media (max-width:620px){ .fig-umb{ grid-template-columns:1fr; } .fig-umb .id{ margin:0 auto; } .fig-umb .arr .h{ display:none; } .fig-umb .arr .v{ display:inline; } }
@media (prefers-reduced-motion: reduce){ .fig .flow, .fig .tap{ animation:none; } .fig .pop, .fig .fade{ transition:none; } }`;
  if (!document.getElementById('fig-css')) { const s = document.createElement('style'); s.id = 'fig-css'; s.textContent = CSS; document.head.appendChild(s); }

  // steps: [{ en, ar }]; returns [step, controls]
  function useSteps(n, ms) {
    const [i, setI] = useState(calm() ? n - 1 : 0), [play, setPlay] = useState(!calm());
    useEffect(() => { if (!play) return; if (i >= n - 1) { setPlay(false); return; } const t = setTimeout(() => setI(x => x + 1), ms); return () => clearTimeout(t); }, [i, play]);
    return [i, { replay: () => { setI(0); setPlay(!calm()); }, go: j => { setPlay(false); setI(j); } }];
  }
  const Cap = ({ en, ar, showAr }) => html`<div className="fig-cap" aria-live="polite"><span dangerouslySetInnerHTML=${{ __html: en }}></span>${showAr && ar && html`<span className="ar" dangerouslySetInnerHTML=${{ __html: ar }}></span>`}</div>`;
  const Bar = ({ steps, i, ctl }) => html`<div className="fig-bar">
    <div className="fig-dots" aria-hidden="true">${steps.map((_, j) => html`<i key=${j} className=${j <= i ? 'on' : ''}></i>`)}</div>
    <span className="grow"></span>
    <button className="fig-btn" onClick=${() => ctl.go(Math.max(0, i - 1))} disabled=${i === 0} aria-label="Previous step">‹ Back</button>
    <button className="fig-btn" onClick=${() => ctl.go(Math.min(steps.length - 1, i + 1))} disabled=${i === steps.length - 1} aria-label="Next step">Next ›</button>
    <button className="fig-btn" onClick=${ctl.replay}>↻ Replay</button>
  </div>`;
  const pop = on => 'pop' + (on ? '' : ' off');

  /* ── L1 slide 5: the three parts of HCI ── */
  function HciParts({ ar }) {
    const steps = [
      { en: 'HCI is drawn as a pie with three parts.', ar: 'الـ HCI مترسوم كـ pie فيها 3 أجزاء.' },
      { en: '<b>Human</b>: Communication theory, Industrial design, Social science, Cognitive psychology, Human factors.', ar: '<b>Human</b>: Communication theory و Industrial design و Social science و Cognitive psychology و Human factors.' },
      { en: '<b>Computer</b>: Computer graphic, Operating system, Programming language.', ar: '<b>Computer</b>: Computer graphic و Operating system و Programming language.' },
      { en: '<b>Interaction</b>: Interaction design.', ar: '<b>Interaction</b>: Interaction design.' }
    ];
    const [i, ctl] = useSteps(steps.length, 1800);
    const cx = 210, cy = 175, r = 160, P = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const arc = (a, b) => { const [x1, y1] = P(a), [x2, y2] = P(b); return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z`; };
    const part = (d, fill, on) => html`<path d=${d} fill=${fill} stroke="var(--paper)" strokeWidth="3" className="fade" style=${{ opacity: on ? 1 : .18 }} />`;
    const lines = (x, y, head, items, on) => html`<g className=${pop(on)}><text x=${x} y=${y} textAnchor="middle" fontSize="19" fontWeight="700">${head}</text>${items.map((t, j) => html`<text key=${j} x=${x} y=${y + 21 + j * 18} textAnchor="middle" fontSize="14">${t}</text>`)}</g>`;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 420 345" role="img" aria-label="The three parts of HCI: Human, Computer and Interaction">
        ${part(arc(150, 270), 'color-mix(in srgb, var(--k-hci) 22%, var(--paper))', i >= 1)}
        ${part(arc(270, 390), 'color-mix(in srgb, var(--k-compiler) 20%, var(--paper))', i >= 2)}
        ${part(arc(30, 150), 'color-mix(in srgb, var(--k-mm) 18%, var(--paper))', i >= 3)}
        ${lines(116, 100, 'Human', ['Communication theory', 'Industrial design', 'Social science', 'Cognitive psychology', 'Human factors'], i >= 1)}
        ${lines(304, 108, 'Computer', ['Computer graphic', 'Operating system', 'Programming language'], i >= 2)}
        ${lines(210, 262, 'Interaction', ['Interaction design'], i >= 3)}
      </svg></div>
      <${Cap} ...${steps[i]} showAr=${ar} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── L1 slide 8: the invisible interface ── */
  function Invisible({ ar }) {
    const steps = [
      { en: 'The user reaches the task <b>through the interface</b>.', ar: 'الـ user بيوصل للـ task <b>عن طريق الـ interface</b>.' },
      { en: 'Goal: make the interface <b>as invisible as possible</b>, so users spend little time on it and focus on the task.', ar: 'الهدف: نخلي الـ interface <b>مخفية على قد ما نقدر</b>، فالـ users ميضيعوش وقت عليها ويركزوا على الـ task.' },
      { en: 'The interface <b>vanishes</b> in the middle of the interaction: the user feels they are working directly with the task.', ar: 'الـ interface <b>بتختفي</b> في نص التفاعل: الـ user يحس إنه بيتعامل مع الـ task على طول.' },
      { en: 'The user should think about <b>the task</b>, not about the tool.', ar: 'الـ user المفروض يفكر في <b>الـ task</b> مش في الأداة.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2300);
    const ui = i >= 2 ? .12 : i === 1 ? .55 : 1;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 520 205" role="img" aria-label="User, interface and task">
        <g><circle cx="70" cy="80" r="24" fill="var(--k-hci)" /><path d="M30 150 q40 -50 80 0 z" fill="var(--k-hci)" /><text x="70" y="182" textAnchor="middle" fontSize="19" fontWeight="700">USER</text></g>
        <g className="fade" style=${{ opacity: ui }}>
          <rect x="205" y="58" width="110" height="74" rx="8" fill="var(--paper)" stroke="var(--graphite)" strokeWidth="3" />
          <rect x="248" y="132" width="24" height="14" fill="var(--graphite)" /><rect x="228" y="146" width="64" height="6" rx="3" fill="var(--graphite)" />
          <text x="260" y="182" textAnchor="middle" fontSize="19" fontWeight="700" fill="var(--pen)">INTERFACE</text>
        </g>
        <path d="M110 86 H470" stroke="var(--k-hci)" strokeWidth="3" fill="none" className=${calm() ? '' : 'flow'} />
        <path d="M470 108 H110" stroke="var(--k-mm)" strokeWidth="3" fill="none" className=${calm() ? '' : 'flow'} />
        <g><rect x="440" y="52" width="58" height="76" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" /><rect x="456" y="46" width="26" height="12" rx="3" fill="var(--ink)" />
          <path d="M455 92 l10 10 l20 -22" stroke="var(--ok)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <text x="469" y="182" textAnchor="middle" fontSize="19" fontWeight="700">TASK</text></g>
        <text x="290" y="30" textAnchor="middle" fontSize="18" fontWeight="600" className=${pop(i >= 3)}>think about the task, not the tool</text>
      </svg></div>
      <${Cap} ...${steps[i]} showAr=${ar} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── L1 slide 9: elevator controls, try it ── */
  function Elevator({ ar }) {
    const [msg, setMsg] = useState(null), [hit, setHit] = useState(null), [tries, setTries] = useState(0);
    const say = (k, en, a, bad) => { setHit([k, bad]); setMsg({ en, ar: a }); setTries(t => t + 1); };
    const label = 'Wrong: that is the <b>DOOR OPEN label</b>, not a button. On the bottom row the labels and the control buttons all look the same, so it is easy to push a label by mistake instead of a control button.';
    const labelAr = 'غلط: ده <b>الـ label بتاع DOOR OPEN</b> مش زرار. في الصف اللي تحت الـ labels وزراير التحكم شكلهم كلهم واحد، فسهل تدوس على label بالغلط بدل الزرار.';
    const B = (k, cls, txt, en, a, bad) => html`<button key=${k} className=${cls + (hit && hit[0] === k ? (hit[1] ? ' hit' : ' good') : '')} onClick=${() => say(k, en, a, bad)} aria-label=${txt.replace(/<[^>]+>/g, '') || 'button'} dangerouslySetInnerHTML=${{ __html: txt }}></button>`;
    const intro = { en: '<b>Try it:</b> press the button that opens the elevator door. (Picture from the slide, www.baddesigns.com.)', ar: '<b>جرّب:</b> دوس على الزرار اللي بيفتح باب الأسانسير. (الصورة من الـ slide.)' };
    const m = msg || intro;
    return html`<figure className="fig"><div className="fig-stage">
      <div className="fig-elev">
        <div className="row top">
          <button className="num" tabIndex="-1" aria-hidden="true">★1</button>${B('f1', 'btn', '', 'That is the button for floor 1.', 'ده زرار الدور 1.', false)}
          <button className="num" tabIndex="-1" aria-hidden="true">2</button>${B('f2', 'btn', '', 'That is the button for floor 2.', 'ده زرار الدور 2.', false)}
          <button className="num" tabIndex="-1" aria-hidden="true">3</button>${B('f3', 'btn', '', 'That is the button for floor 3.', 'ده زرار الدور 3.', false)}
        </div>
        <div className="row">
          ${B('ol', 'lbl', 'DOOR<br>◁▷<br>OPEN', label, labelAr, true)}
          ${B('ob', 'btn', '', 'Right: this is the <b>door-open button</b>, next to its label.', 'صح: ده <b>زرار فتح الباب</b>، جنب الـ label بتاعه.', false)}
          ${B('x', 'dark', '✕', 'That is the ✕ control on the bottom row.', 'ده الـ ✕ في الصف اللي تحت.', false)}
          ${B('sr', 'dark', 'STOP<br>▬<br>RUN', 'That is the STOP / RUN switch.', 'ده مفتاح الـ STOP / RUN.', false)}
          ${B('bell', 'dark', '🔔', 'That is the bell.', 'ده الجرس.', false)}
          ${B('b2', 'btn', '', 'That is a control button, but not the door-open one.', 'ده زرار تحكم، بس مش بتاع فتح الباب.', false)}
          ${B('cl', 'lbl', 'DOOR<br>▷◁<br>CLOSE', 'That is the <b>DOOR CLOSE label</b>, not a button: on the bottom row labels and buttons look the same.', 'ده <b>الـ label بتاع DOOR CLOSE</b> مش زرار: في الصف اللي تحت الـ labels والزراير شكلهم واحد.', true)}
          ${B('cb', 'btn', '', 'That is the door-close button.', 'ده زرار قفل الباب.', false)}
        </div>
      </div></div>
      <${Cap} en=${m.en} ar=${m.ar} showAr=${ar} />
      <div className="fig-bar"><span className="muted small">The slide asks: people do not make the same mistake on the top row. Why not? (for discussion)</span><span className="grow"></span>
        ${tries > 0 && html`<button className="fig-btn" onClick=${() => { setMsg(null); setHit(null); setTries(0); }}>↻ Try again</button>`}</div></figure>`;
  }

  /* ── L1 slide 10: the vending machine, try it ── */
  function Vending({ ar }) {
    const [st, setSt] = useState(0); // 0 idle, 1 reader active, 2 bill in
    const [msg, setMsg] = useState({ en: '<b>Try it the usual way:</b> you want to pay and choose. What do you do first?', ar: '<b>جرّبها بالطريقة المعتادة:</b> عايز تدفع وتختار. هتعمل إيه الأول؟' });
    const insert = () => {
      if (st === 0) setMsg({ en: 'Nothing happens: on this machine you <b>need to push a button first to activate the reader</b>. Normally you insert the bill first before making a selection, so this machine <b>contravenes a well known convention</b>.', ar: 'مفيش حاجة حصلت: في المكنة دي <b>لازم تدوس زرار الأول عشان الـ reader يشتغل</b>. عادةً بتحط الفلوس الأول قبل ما تختار، فالمكنة دي <b>بتخالف convention معروف</b>.' });
      else if (st === 1) { setSt(2); setMsg({ en: 'Bill accepted. Then <b>STEP 2</b>: follow directions on display, and <b>STEP 3</b>: take receipt, place on dash.', ar: 'الفلوس اتقبلت. بعد كده <b>STEP 2</b>: اتبع التعليمات على الشاشة، و<b>STEP 3</b>: خد الإيصال وحطه على الـ dash.' }); }
    };
    const push = () => { if (st === 0) { setSt(1); setMsg({ en: '<b>STEP 1: Push any button to start unit.</b> Now the reader is active and you can insert the bill.', ar: '<b>STEP 1: دوس أي زرار عشان المكنة تشتغل.</b> دلوقتي الـ reader شغال وتقدر تحط الفلوس.' }); } };
    const reset = () => { setSt(0); setMsg({ en: '<b>Try it the usual way:</b> you want to pay and choose. What do you do first?', ar: '<b>جرّبها بالطريقة المعتادة:</b> عايز تدفع وتختار. هتعمل إيه الأول؟' }); };
    return html`<figure className="fig"><div className="fig-stage">
      <div className="fig-steps">${[['STEP 1', 'Push any button to start unit'], ['STEP 2', 'Follow directions on display'], ['STEP 3', 'Take receipt, place on dash']].map((t, j) => html`<div key=${j} className=${'fig-step' + (st === 2 || (st === 1 && j === 0) ? ' on' : '')}><b>${t[0]}</b>${t[1]}</div>`)}</div>
      <p className="fig-reader"><i className=${st === 0 ? '' : 'on'}></i>Bill reader: ${st === 0 ? 'off' : st === 1 ? 'ready' : 'bill accepted'}</p></div>
      <${Cap} en=${msg.en} ar=${msg.ar} showAr=${ar} />
      <div className="fig-bar">
        <button className="fig-btn solid" onClick=${insert} disabled=${st === 2}>Insert the bill</button>
        <button className="fig-btn" onClick=${push} disabled=${st !== 0}>Push a button</button>
        <span className="grow"></span><button className="fig-btn" onClick=${reset}>↻ Start over</button></div></figure>`;
  }

  /* ── L1 slide 14: the Qualcomm device for truckers ── */
  function Truckers({ ar }) {
    const steps = [
      { en: 'The <b>early version</b> of the Qualcomm device for truckers had <b>small buttons</b>.', ar: 'الـ <b>نسخة الأولى</b> من جهاز Qualcomm لسواقين التريلات كان فيها <b>زراير صغيرة</b>.' },
      { en: 'User research found that truckers often have <b>big hands</b> and often <b>wear gloves</b>.', ar: 'الـ user research لقى إن السواقين غالباً <b>إيديهم كبيرة</b> وغالباً <b>لابسين جوانتي</b>.' },
      { en: 'Better design: a <b>large touch screen</b> and a <b>stylus pen</b>.', ar: 'الـ design الأحسن: <b>touch screen كبيرة</b> و<b>stylus pen</b>.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2600);
    const small = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) small.push([40 + c * 30, 50 + r * 26]);
    const under = (x, y) => i === 1 && Math.hypot(x + 11 - 120, y + 9 - 100) < 40;
    return html`<figure className="fig"><div className="fig-stage">
      <svg viewBox="0 0 520 220" role="img" aria-label="Small buttons versus a large touch screen">
        <g className="fade" style=${{ opacity: i < 2 ? 1 : .25 }}>
          <rect x="24" y="30" width="200" height="140" rx="12" fill="var(--paper)" stroke="var(--graphite)" strokeWidth="3" />
          ${small.map(([x, y], j) => html`<rect key=${j} x=${x} y=${y} width="22" height="18" rx="3" fill=${under(x, y) ? 'var(--pen)' : 'var(--paper-2)'} stroke="var(--faint)" />`)}
          <text x="124" y="200" textAnchor="middle" fontSize="17" fontWeight="700">Small buttons</text>
          <g className=${i === 1 && !calm() ? 'tap' : ''} style=${{ opacity: i === 1 ? 1 : 0 }}>
            <ellipse cx="120" cy="96" rx="34" ry="30" fill="#8a6a4a" opacity=".92" /><rect x="96" y="96" width="48" height="70" rx="18" fill="#8a6a4a" opacity=".92" />
            <text x="120" y="102" textAnchor="middle" fontSize="14" fill="#fff" style=${{ fill: '#fff' }}>glove</text></g>
        </g>
        <g className=${pop(i >= 2)}>
          <rect x="290" y="30" width="200" height="140" rx="12" fill="var(--paper)" stroke="var(--k-hci)" strokeWidth="3" />
          <rect x="304" y="44" width="172" height="112" rx="6" fill="color-mix(in srgb, var(--k-hci) 16%, var(--paper))" />
          <rect x="324" y="64" width="62" height="34" rx="6" fill="var(--paper)" stroke="var(--k-hci)" /><rect x="396" y="64" width="62" height="34" rx="6" fill="var(--paper)" stroke="var(--k-hci)" />
          <rect x="324" y="106" width="134" height="34" rx="6" fill="var(--paper)" stroke="var(--k-hci)" />
          <g className=${i >= 2 && !calm() ? 'tap' : ''}><path d="M418 8 L452 70" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round" /><path d="M449 64 L456 80 L443 72 Z" fill="var(--ink)" /><path d="M418 8 L424 19" stroke="var(--k-hci)" strokeWidth="9" strokeLinecap="round" /></g>
          <text x="390" y="200" textAnchor="middle" fontSize="17" fontWeight="700">Large touch screen + stylus</text>
        </g>
      </svg></div>
      <${Cap} ...${steps[i]} showAr=${ar} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }

  /* ── L1 slide 22: interaction design and the fields around it ── */
  function Umbrella({ ar }) {
    const steps = [
      { en: '<b>Interaction design</b> sits in the middle of many fields.', ar: 'الـ <b>Interaction design</b> في النص بين مجالات كتير.' },
      { en: '<b>Academic disciplines</b> feed into interaction design.', ar: 'الـ <b>Academic disciplines</b> بتغذي الـ interaction design.' },
      { en: '<b>Design practices</b> feed into interaction design.', ar: 'الـ <b>Design practices</b> بتغذي الـ interaction design.' },
      { en: '<b>Interdisciplinary fields</b> work with interaction design both ways.', ar: 'الـ <b>Interdisciplinary fields</b> بتشتغل مع الـ interaction design في الاتجاهين.' }
    ];
    const [i, ctl] = useSteps(steps.length, 2000);
    const G = (title, items, on, cls) => html`<div className=${'grp ' + (cls || '') + ' ' + pop(on)}><b>${title}</b>${items.join(' · ')}</div>`;
    return html`<figure className="fig"><div className="fig-stage"><div className="fig-umb">
      ${G('Academic disciplines', ['Ergonomics', 'Psychology / Cognitive Science', 'Informatics', 'Engineering', 'Computer Science / Software Engineering', 'Social Sciences (e.g. Sociology, Anthropology)'], i >= 1)}
      <div className=${'arr ' + pop(i >= 1)}><span className="h">→</span><span className="v">↓</span></div>
      <div className="id">Interaction<br />Design</div>
      <div className=${'arr ' + pop(i >= 2)}><span className="h">←</span><span className="v">↑</span></div>
      ${G('Design practices', ['Graphic Design', 'Product Design', 'Artist-Design', 'Industrial Design', 'Film Industry'], i >= 2)}
      <div className=${'bottom ' + pop(i >= 3)}><div className="arr">⇅</div>${G('Interdisciplinary fields', ['Human Factors (HF)', 'Cognitive Engineering', 'Human-Computer Interaction (HCI)', 'Cognitive Ergonomics', 'Computer-Supported Cooperative Work (CSCW)', 'Information Systems'], true)}</div>
    </div></div>
      <${Cap} ...${steps[i]} showAr=${ar} /><${Bar} steps=${steps} i=${i} ctl=${ctl} /></figure>`;
  }


  /* ── OS Interactive CPU Scheduling & Gantt Chart Simulator ── */
  function solveCpu(procs, alg, quantum, cs) {
    const list = procs.map((p, idx) => ({ id: p.id, idx, at: Math.max(0, +p.at || 0), bt: Math.max(1, +p.bt || 1), rem: Math.max(1, +p.bt || 1), pr: +p.pr || 1, ct: 0 }));
    const n = list.length;
    const gantt = [];
    const pushSeg = (id, s, e) => {
      if (e <= s) return;
      if (gantt.length && gantt[gantt.length - 1].id === id && gantt[gantt.length - 1].e === s) gantt[gantt.length - 1].e = e;
      else gantt.push({ id, s, e });
    };
    let t = 0, done = 0, lastId = null;
    if (alg === 'RR') {
      const q = Math.max(1, +quantum || 2);
      const sorted = list.slice().sort((a, b) => a.at - b.at || a.idx - b.idx);
      const queue = [];
      let pIdx = 0;
      while (pIdx < n && sorted[pIdx].at <= t) queue.push(sorted[pIdx++]);
      while (done < n) {
        if (!queue.length) {
          const nextAt = sorted[pIdx].at;
          pushSeg('IDLE', t, nextAt);
          t = nextAt;
          while (pIdx < n && sorted[pIdx].at <= t) queue.push(sorted[pIdx++]);
          continue;
        }
        const cur = queue.shift();
        if (cs > 0 && lastId && lastId !== 'IDLE' && lastId !== cur.id) {
          pushSeg('CS', t, t + cs);
          t += cs;
          while (pIdx < n && sorted[pIdx].at <= t) queue.push(sorted[pIdx++]);
        }
        const run = Math.min(q, cur.rem);
        pushSeg(cur.id, t, t + run);
        t += run;
        cur.rem -= run;
        lastId = cur.id;
        while (pIdx < n && sorted[pIdx].at <= t) queue.push(sorted[pIdx++]);
        if (cur.rem > 0) queue.push(cur);
        else { cur.ct = t; done++; }
      }
    } else if (alg === 'SRTF') {
      while (done < n) {
        const avail = list.filter(p => p.rem > 0 && p.at <= t);
        if (!avail.length) {
          const nextAt = Math.min(...list.filter(p => p.rem > 0).map(p => p.at));
          pushSeg('IDLE', t, nextAt);
          t = nextAt;
          continue;
        }
        avail.sort((a, b) => a.rem - b.rem || a.at - b.at || a.idx - b.idx);
        const cur = avail[0];
        if (cs > 0 && lastId && lastId !== 'IDLE' && lastId !== cur.id) {
          pushSeg('CS', t, t + cs);
          t += cs;
        }
        pushSeg(cur.id, t, t + 1);
        t += 1;
        cur.rem -= 1;
        lastId = cur.id;
        if (cur.rem === 0) { cur.ct = t; done++; }
      }
    } else {
      while (done < n) {
        const avail = list.filter(p => p.rem > 0 && p.at <= t);
        if (!avail.length) {
          const nextAt = Math.min(...list.filter(p => p.rem > 0).map(p => p.at));
          pushSeg('IDLE', t, nextAt);
          t = nextAt;
          continue;
        }
        if (alg === 'FCFS') avail.sort((a, b) => a.at - b.at || a.idx - b.idx);
        else if (alg === 'SJF') avail.sort((a, b) => a.bt - b.bt || a.at - b.at || a.idx - b.idx);
        else if (alg === 'PRIO') avail.sort((a, b) => a.pr - b.pr || a.at - b.at || a.idx - b.idx);
        const cur = avail[0];
        if (cs > 0 && lastId && lastId !== 'IDLE' && lastId !== cur.id) {
          pushSeg('CS', t, t + cs);
          t += cs;
        }
        pushSeg(cur.id, t, t + cur.rem);
        t += cur.rem;
        cur.rem = 0;
        cur.ct = t;
        lastId = cur.id;
        done++;
      }
    }
    const rows = list.map(p => {
      const tat = p.ct - p.at;
      const wt = tat - p.bt;
      return Object.assign({}, p, { tat, wt });
    });
    const avgTat = (rows.reduce((a, r) => a + r.tat, 0) / n).toFixed(2);
    const avgWt = (rows.reduce((a, r) => a + r.wt, 0) / n).toFixed(2);
    return { gantt, rows, avgTat, avgWt, totalTime: t };
  }

  function solvePages(str, fCount, alg) {
    const refs = str.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    const frames = Array(fCount).fill(null);
    const refBits = Array(fCount).fill(0);
    const loadedAt = Array(fCount).fill(0);
    const lastUsed = Array(fCount).fill(0);
    let ptr = 0, faults = 0, replacements = 0;
    const steps = [];
    refs.forEach((p, t) => {
      const hitIdx = frames.indexOf(p);
      if (hitIdx !== -1) {
        lastUsed[hitIdx] = t;
        refBits[hitIdx] = 1;
        steps.push({ p, hit: true, frames: frames.slice(), victim: null });
        return;
      }
      faults++;
      const emptyIdx = frames.indexOf(null);
      if (emptyIdx !== -1) {
        frames[emptyIdx] = p;
        loadedAt[emptyIdx] = t;
        lastUsed[emptyIdx] = t;
        refBits[emptyIdx] = 1;
        steps.push({ p, hit: false, frames: frames.slice(), victim: null });
        return;
      }
      replacements++;
      let vic = 0;
      if (alg === 'FIFO') {
        vic = loadedAt.indexOf(Math.min(...loadedAt));
      } else if (alg === 'LRU') {
        vic = lastUsed.indexOf(Math.min(...lastUsed));
      } else if (alg === 'OPT') {
        let farthest = -1;
        for (let i = 0; i < fCount; i++) {
          const nextUse = refs.slice(t + 1).indexOf(frames[i]);
          if (nextUse === -1) { vic = i; break; }
          if (nextUse > farthest) { farthest = nextUse; vic = i; }
        }
      } else if (alg === 'CLOCK') {
        while (true) {
          if (refBits[ptr] === 0) { vic = ptr; ptr = (ptr + 1) % fCount; break; }
          refBits[ptr] = 0;
          ptr = (ptr + 1) % fCount;
        }
      }
      const victimPage = frames[vic];
      frames[vic] = p;
      loadedAt[vic] = t;
      lastUsed[vic] = t;
      refBits[vic] = 1;
      steps.push({ p, hit: false, frames: frames.slice(), victim: victimPage });
    });
    return { refs, steps, faults, replacements, hits: refs.length - faults };
  }

  const ALGO_CSS = `
.avz{ border:1px solid var(--line); border-radius:12px; background:var(--paper); margin:16px 0 22px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.04); }
.avz-head{ padding:12px 16px; background:var(--paper-2); border-bottom:1px solid var(--line); display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }
.avz-title{ font-weight:700; font-size:1rem; color:var(--ink); display:flex; align-items:center; gap:8px; }
.avz-badge{ font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:3px 8px; border-radius:99px; background:color-mix(in srgb, var(--k-compiler, #7c3aed) 16%, var(--paper)); color:var(--k-compiler, #7c3aed); border:1px solid color-mix(in srgb, var(--k-compiler, #7c3aed) 35%, transparent); }
.avz-bar{ padding:10px 16px; background:var(--paper); border-bottom:1px solid var(--line); display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.avz{ min-width:0; }
.avz button:focus-visible,.lab-guide summary:focus-visible{ outline:2px solid var(--c); outline-offset:3px; }
.avz button:disabled{ opacity:.45; cursor:not-allowed; }
.avz-title{ flex-wrap:wrap; }
.avz-head select{ max-width:100%; white-space:normal; }
.avz .fig-btn.solid{ background:var(--s); color:var(--on-s); }
.avz-grid{ display:grid; grid-template-columns:1.35fr 1fr; gap:12px; padding:14px 16px; background:var(--paper); }
@media (max-width:780px){ .avz-grid{ grid-template-columns:1fr; } }
.avz-card{ border:1px solid var(--line); border-radius:10px; background:var(--paper-2); padding:12px; min-width:0; }
.avz-card h4{ margin:0 0 8px; font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:var(--graphite); display:flex; justify-content:space-between; align-items:center; }
.avz-code{ font-family:var(--mono, monospace); font-size:.79rem; line-height:1.5; margin:0; padding:8px; border-radius:8px; background:var(--paper); border:1px solid var(--line); overflow-x:auto; }
.avz-line{ display:flex; justify-content:space-between; padding:1px 6px; border-radius:4px; white-space:pre; }
.avz-line.on{ background:color-mix(in srgb, #f59e0b 24%, var(--paper)); font-weight:700; color:var(--ink); border-left:3px solid #d97706; }
.avz-cnt{ font-size:.7rem; color:var(--graphite); margin-left:12px; padding:0 5px; border-radius:99px; background:var(--paper-2); }
.avz-explain{ margin:0 16px 14px; padding:11px 14px; border-radius:10px; background:color-mix(in srgb, var(--k-compiler, #7c3aed) 9%, var(--paper)); border-left:4px solid var(--k-compiler, #7c3aed); font-size:.9rem; line-height:1.5; color:var(--ink); }
.avz-metrics{ display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.avz-metric{ padding:4px 10px; border-radius:8px; background:var(--paper); border:1px solid var(--line); font-size:.8rem; }
.avz-metric b{ color:var(--k-compiler, #7c3aed); font-family:var(--mono, monospace); }
.avz-cells{ display:flex; flex-wrap:wrap; gap:6px; align-items:flex-end; justify-content:center; padding:12px 4px; }
.avz-cell{ width:48px; border-radius:8px; border:2px solid var(--line); background:var(--paper); text-align:center; padding:6px 2px; transition:all .25s ease; position:relative; }
.avz-cell .v{ font-weight:700; font-size:1.02rem; font-family:var(--mono, monospace); display:block; }
.avz-cell .idx{ font-size:.68rem; color:var(--graphite); display:block; margin-top:2px; }
.avz-cell .tag{ font-size:.64rem; font-weight:700; padding:1px 4px; border-radius:4px; display:inline-block; margin-top:3px; }
.avz-cell.sorted{ border-color:#16a34a; background:color-mix(in srgb, #16a34a 12%, var(--paper)); }
.avz-cell.active{ border-color:#d97706; background:color-mix(in srgb, #f59e0b 22%, var(--paper)); transform:translateY(-4px); }
.avz-cell.pivot{ border-color:#7c3aed; background:color-mix(in srgb, #7c3aed 18%, var(--paper)); }
.avz-cell.greater{ border-color:#ea580c; background:color-mix(in srgb, #ea580c 12%, var(--paper)); }
.avz-cell.dim{ opacity:.38; }
.lab-guide{ border:1px solid var(--line); border-radius:12px; background:var(--paper); margin:12px 0 24px; padding:16px; }
.lab-guide summary{ cursor:pointer; font-weight:700; font-size:.92rem; line-height:1.6; }
.lab-goal{ font-size:.9rem; color:var(--graphite); line-height:1.7; }
.lab-guide-grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.lab-guide-grid section{ padding:14px; background:var(--paper-2); border-radius:10px; border:1px solid var(--rule); }
.lab-guide h4{ margin:0 0 6px; color:var(--c); font-size:.82rem; }
.lab-guide p{ margin:6px 0; line-height:1.7; font-size:.86rem; }
.lab-exercise{ margin-top:14px; padding:12px 14px; border-left:3px solid var(--c); background:var(--paper-2); border-radius:6px; }
.lab-exercise>b{ font-size:.82rem; color:var(--c); }
.sort-legend{ display:flex; flex-wrap:wrap; gap:6px; font-size:.7rem; margin:8px 0; }
.sort-legend span{ padding:3px 6px; border:1px solid var(--line); border-radius:5px; }
.sort-bars{ display:flex; gap:6px; align-items:flex-end; justify-content:center; min-height:125px; padding:8px 0; }
.sort-bar{ flex:1; max-width:48px; min-width:0; display:flex; flex-direction:column; align-items:center; gap:3px; font: .72rem var(--mono); }
.sort-bar i{ width:80%; height:var(--bar-height); background:var(--line); border-radius:4px 4px 0 0; border:1px solid var(--graphite); }
.sort-bar.sorted i,.sort-legend .sorted{ background:color-mix(in srgb,#16a34a 22%,var(--paper)); }
.sort-bar.active i,.sort-legend .active{ background:color-mix(in srgb,#f59e0b 35%,var(--paper)); }
.sort-bar.pivot i,.sort-legend .pivot{ background:color-mix(in srgb,#7c3aed 30%,var(--paper)); }
.sort-bar.greater i,.sort-legend .greater{ background:color-mix(in srgb,#ea580c 25%,var(--paper)); }
.sort-bar.dim{ opacity:.4; }
.sort-diff{ border-top:1px solid var(--line); padding-top:10px; font-size:.8rem; line-height:1.6; }
.sort-diff p{ margin:5px 0; font-family:var(--mono); }
.lab-speed{ display:flex; align-items:center; gap:5px; font-size:.8rem; }
@media(max-width:600px){ .lab-guide-grid{ grid-template-columns:1fr; } .avz-head,.avz-bar{ padding:10px; } .avz-grid{ padding:10px; } .sort-bars{ gap:3px; } }

`;
  if (!document.getElementById('algo-viz-css')) {
    const st = document.createElement('style');
    st.id = 'algo-viz-css';
    st.textContent = ALGO_CSS;
    document.head.appendChild(st);
  }

  // Shared sorting trace model, consumed by topic visualizations.
  function parseSortInput(str, alg) {
    const tokens = str.trim().split(/[\s,]+/).filter(Boolean);
    if (!tokens.length || tokens.length > 12) throw new Error('Enter 1 to 12 integers, separated by commas or spaces.');
    const values = tokens.map(Number);
    if (tokens.some(t => !/^-?\d+$/.test(t)) || values.some(v => !Number.isSafeInteger(v) || Math.abs(v) > 999))
      throw new Error('Use whole numbers between −999 and 999. No values are silently changed.');
    if (alg === 'counting' && values.some(v => v < 0 || v > 30)) throw new Error('Counting Sort accepts keys from 0 to 30, including duplicates.');
    return values;
  }

  function buildSortTrace(alg, str, targetRank) {
    const raw = parseSortInput(str, alg);
    const A = raw.slice();
    const n = A.length;
    const steps = [];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    let comps = 0, swaps = 0, calls = 0;
    const snap = (line, desc, inv, roles, ptrs, extra) => {
      if (line >= 0 && line < counts.length) counts[line]++;
      steps.push({
        arr: A.slice(), line, desc, inv,
        roles: Object.assign({}, roles),
        ptrs: Object.assign({}, ptrs),
        counts: counts.slice(),
        comps, swaps, calls,
        extra: extra || null
      });
    };

    if (alg === 'insertion') {
      snap(0, `Initial array A[1..${n}] = [${A.join(', ')}]. Subarray A[1..1] = [${A[0]}] is trivially sorted.`, 'Loop Invariant: A[1..j-1] is sorted at the start of each outer pass j.', { 0: 'sorted' }, { 0: 'sorted' });
      for (let j = 1; j < n; j++) {
        const key = A[j];
        let i = j - 1;
        const r0 = {}; for (let k = 0; k < j; k++) r0[k] = 'sorted'; r0[j] = 'pivot';
        snap(1, `Start outer pass j = ${j + 1}; sorted prefix has ${j} elements.`, `A[1..${j}] is sorted before the pass.`, r0, { [j]: `j=${j+1}` });
        snap(2, `Outer loop j = ${j + 1}: Select key = A[${j + 1}] = ${key} to insert into sorted prefix A[1..${j}].`, `A[1..${j}] = [${A.slice(0, j).join(', ')}] is currently sorted.`, r0, { [j]: `j=${j+1} (key=${key})`, [i]: `i=${i+1}` }, { heldKey: key, hole: j });
        while (i >= 0) {
          comps++;
          snap(3, `Compare A[${i + 1}] (${A[i]}) > key (${key})? ${A[i] > key ? 'YES → shift right' : 'NO → stop shifting'}.`, `Testing index i = ${i + 1} against key = ${key}.`, Object.assign({}, r0, { [i]: 'active' }), { [i]: `i=${i+1}`, [j]: `j=${j+1}` }, { heldKey: key, hole: i + 1 });
          if (A[i] > key) {
            A[i + 1] = A[i];
            swaps++;
            const rShift = {}; for (let k = 0; k <= j; k++) rShift[k] = 'sorted'; rShift[i + 1] = 'active'; rShift[i] = 'pivot';
            snap(4, `Shift A[${i + 1}] (${A[i]}) right to A[${i + 2}], and decrement i to ${i}.`, `Hole for key = ${key} moves left to index ${i + 1}.`, rShift, { [i]: `hole (key=${key})` }, { heldKey: key, hole: i });
            i--;
          } else break;
        }
        A[i + 1] = key;
        const rDone = {}; for (let k = 0; k <= j; k++) rDone[k] = 'sorted';
        snap(5, `Place key = ${key} at A[${i + 2}]. Prefix A[1..${j + 1}] = [${A.slice(0, j + 1).join(', ')}] is now sorted!`, `Maintenance holds: A[1..${j + 1}] contains the original first ${j + 1} elements in sorted order.`, rDone, { [i + 1]: `placed ${key}` });
      }
    } else if (alg === 'merge') {
      const stack = [];
      const msort = (l, r, depth) => {
        calls++;
        stack.push(`MERGE-SORT(1..${n}: [${l+1}..${r+1}])`);
        const rSub = {}; for (let k = 0; k < n; k++) rSub[k] = (k >= l && k <= r) ? 'active' : 'dim';
        snap(1, `Call MERGE-SORT(A, ${l + 1}, ${r + 1}) at recursion depth ${depth} (subarray [${A.slice(l, r + 1).join(', ')}]).`, `Call stack depth = ${stack.length}; subproblem size = ${r - l + 1}.`, rSub, { [l]: `l=${l+1}`, [r]: `r=${r+1}` }, { stack: stack.slice() });
        if (l >= r) { stack.pop(); return; }
        const mid = Math.floor((l + r) / 2);
        snap(2, `Divide at mid = ⌊(${l + 1} + ${r + 1})/2⌋ = ${mid + 1}: Left [${l + 1}..${mid + 1}], Right [${mid + 2}..${r + 1}].`, `Splitting size ${r - l + 1} into ${mid - l + 1} and ${r - mid}.`, rSub, { [mid]: `mid=${mid+1}` }, { stack: stack.slice() });
        msort(l, mid, depth + 1);
        msort(mid + 1, r, depth + 1);
        const L = A.slice(l, mid + 1), R = A.slice(mid + 1, r + 1);
        let i = 0, j = 0, k = l;
        const mergeState = () => ({ stack: stack.slice(), L: L.slice(), R: R.slice(), li: i, ri: j, dest: k });
        while (i < L.length && j < R.length) {
          comps++;
          snap(3, `Compare left buffer ${L[i]} and right buffer ${R[j]}. Take the smaller; ties go left.`, 'Both input buffers are sorted; the output prefix contains the smallest values seen so far.', rSub, { [k]: `write next` }, mergeState());
          const fromLeft = L[i] <= R[j], value = fromLeft ? L[i++] : R[j++];
          A[k] = value; swaps++;
          snap(5, `Write ${value} from the ${fromLeft ? 'left' : 'right'} buffer into A[${k + 1}].`, 'The next output position receives the smallest unconsumed value.', { ...rSub, [k]: 'sorted' }, { [k]: 'written' }, mergeState());
          k++;
        }
        while (i < L.length) {
          A[k] = L[i++]; swaps++;
          snap(5, `Right buffer empty. Copy ${A[k]} from the left buffer into A[${k + 1}].`, 'No comparison is necessary when only one buffer has values left.', { ...rSub, [k]: 'sorted' }, { [k]: 'written' }, mergeState()); k++;
        }
        while (j < R.length) {
          A[k] = R[j++]; swaps++;
          snap(5, `Left buffer empty. Copy ${A[k]} from the right buffer into A[${k + 1}].`, 'No comparison is necessary when only one buffer has values left.', { ...rSub, [k]: 'sorted' }, { [k]: 'written' }, mergeState()); k++;
        }
        const rMerged = {}; for (let idx = 0; idx < n; idx++) rMerged[idx] = (idx >= l && idx <= r) ? 'sorted' : 'dim';
        snap(5, `MERGE(A, ${l + 1}, ${mid + 1}, ${r + 1}): Merged L=[${L.join(', ')}] and R=[${R.join(', ')}] → [${A.slice(l, r + 1).join(', ')}].`, `Two-finger merge took ${L.length + R.length} writes in Θ(n) time.`, rMerged, { [l]: `merged [${l+1}..${r+1}]` }, { stack: stack.slice(), L, R });
        stack.pop();
      };
      msort(0, n - 1, 0);
    } else if (alg === 'quick') {
      const fixed = new Set();
      const qsort = (p, q) => {
        if (p > q) return;
        calls++;
        if (p === q) {
          fixed.add(p);
          const rf = {}; fixed.forEach(idx => rf[idx] = 'sorted');
          snap(1, `Base case p = q = ${p + 1}: Single element A[${p + 1}] = ${A[p]} is in its final sorted position.`, `Subarray of length 1 is trivially sorted.`, rf, { [p]: `fixed` });
          return;
        }
        const x = A[p];
        let i = p;
        const rInit = {}; fixed.forEach(idx => rInit[idx] = 'sorted'); rInit[p] = 'pivot';
        snap(1, `PARTITION(A, ${p + 1}, ${q + 1}): Choose pivot x = A[${p + 1}] = ${x}, initialize i = ${p + 1}.`, `Invariant: A[${p+2}..i] ≤ ${x} and A[i+1..j-1] > ${x}.`, rInit, { [p]: `pivot=${x}, i=${p+1}` });
        for (let j = p + 1; j <= q; j++) {
          comps++;
          const rLoop = {};
          fixed.forEach(idx => rLoop[idx] = 'sorted');
          for (let k = 0; k < n; k++) if (k < p || k > q) rLoop[k] = rLoop[k] || 'dim';
          rLoop[p] = 'pivot';
          for (let k = p + 1; k <= i; k++) rLoop[k] = 'sorted';
          for (let k = i + 1; k < j; k++) rLoop[k] = 'greater';
          rLoop[j] = 'active';
          if (A[j] <= x) {
            i++; swaps++;
            const tmp = A[i]; A[i] = A[j]; A[j] = tmp;
            rLoop[i] = 'sorted';
            snap(4, `j = ${j + 1}: A[${j + 1}] (${A[i]}) ≤ pivot (${x}) → increment i to ${i + 1} and swap A[${i + 1}] ↔ A[${j + 1}].`, `≤ pivot region A[${p+2}..${i+1}] = [${A.slice(p+1, i+1).join(', ')}]; > pivot region = [${A.slice(i+1, j+1).join(', ')}].`, rLoop, { [p]: `piv=${x}`, [i]: `i=${i+1}`, [j]: `j=${j+1}` });
          } else {
            rLoop[j] = 'greater';
            snap(3, `j = ${j + 1}: A[${j + 1}] (${A[j]}) > pivot (${x}) → no swap; ${A[j]} stays in the > pivot region.`, `≤ pivot region A[${p+2}..${i+1}] = [${A.slice(p+1, i+1).join(', ')}]; > pivot region = [${A.slice(i+1, j+1).join(', ')}].`, rLoop, { [p]: `piv=${x}`, [i]: `i=${i+1}`, [j]: `j=${j+1}` });
          }
        }
        const tmp = A[p]; A[p] = A[i]; A[i] = tmp; swaps++;
        fixed.add(i);
        const rPivotDone = {}; fixed.forEach(idx => rPivotDone[idx] = 'sorted'); rPivotDone[i] = 'pivot';
        snap(5, `Swap pivot A[${p + 1}] (${x}) ↔ A[${i + 1}] (${A[p]}). Pivot ${x} is now permanently locked at index ${i + 1}!`, `All elements in A[${p+1}..${i}] are ≤ ${x}, and all elements in A[${i+2}..${q+1}] are > ${x}.`, rPivotDone, { [i]: `pivot ${x} @ ${i+1}` });
        qsort(p, i - 1);
        qsort(i + 1, q);
      };
      qsort(0, n - 1);
    } else if (alg === 'counting') {
      const kMax = Math.max(...A, 4) + 1;
      const Occ = Array(kMax).fill(0);
      const B = Array(n).fill('–');
      snap(1, `Initialize C[0..${kMax - 1}] = 0 for input A = [${A.join(', ')}] (n = ${n}, k = ${kMax - 1}).`, `Counting sort uses zero element-to-element comparisons!`, {}, {}, { kMax, Occ: Occ.slice(), Acc: Array(kMax).fill('–'), Fin: Array(kMax).fill('–'), B: B.slice() });
      for (let j = 0; j < n; j++) {
        Occ[A[j]]++;
        swaps++;
        snap(2, `Loop 2 (Occurrence, j = ${j + 1}): Increment C[A[${j + 1}]] = C[${A[j]}] to ${Occ[A[j]]}.`, `C[i] counts how many times key i appears in A.`, { [j]: 'active' }, { [j]: `j=${j+1}` }, { kMax, Occ: Occ.slice(), Acc: Array(kMax).fill('–'), Fin: Array(kMax).fill('–'), B: B.slice() });
      }
      const Acc = Occ.slice();
      for (let i = 1; i < kMax; i++) {
        const old = Acc[i]; Acc[i] += Acc[i - 1];
        snap(3, `Prefix key ${i}: C[${i}] = ${old} + C[${i - 1}] (${Acc[i - 1]}) = ${Acc[i]}.`, `C[0..${i}] now counts keys ≤ each index; larger cells still hold frequencies.`, {}, {}, { kMax, Occ: Occ.slice(), Acc: Acc.slice(), Fin: Array(kMax).fill('–'), B: B.slice() });
      }
      snap(3, `Loop 3 (Accumulation C'): Compute prefix sums C'[i] = C'[i] + C'[i-1] → [${Acc.join(', ')}].`, `C'[i] = |{key ≤ i}| gives the exact final 1-based index in B for key i!`, {}, {}, { kMax, Occ: Occ.slice(), Acc: Acc.slice(), Fin: Acc.slice(), B: B.slice() });
      const Fin = Acc.slice();
      for (let j = n - 1; j >= 0; j--) {
        const val = A[j], pos = Fin[val] - 1;
        B[pos] = val;
        Fin[val]--;
        swaps++;
        snap(5, `Loop 4 (j = ${j + 1} downto 1): Place A[${j + 1}] = ${val} into B[C[${val}]] = B[${pos + 1}], then decrement C[${val}] to ${Fin[val]}.`, `Scanning backwards from n downto 1 preserves input order of duplicate keys (Stable Sort!).`, { [j]: 'pivot' }, { [j]: `j=${j+1} → B[${pos+1}]` }, { kMax, Occ: Occ.slice(), Acc: Acc.slice(), Fin: Fin.slice(), B: B.slice(), hiB: pos });
      }
    } else if (alg === 'select') {
      if (!Number.isInteger(targetRank) || targetRank < 1 || targetRank > n) throw new Error('Choose a rank from 1 to ' + n + '. Duplicates count separately.');
      const target = targetRank;
      const rsel = (p, q, iRank) => {
        calls++;
        if (p === q) {
          const rf = {}; for (let k = 0; k < n; k++) rf[k] = k === p ? 'sorted' : 'dim';
          snap(1, `Base case p = q = ${p + 1}: Found target order statistic = A[${p + 1}] = ${A[p]}!`, `Target rank found in Θ(n) expected time.`, rf, { [p]: `FOUND ${A[p]}` });
          return;
        }
        const x = A[p];
        let i = p;
        for (let j = p + 1; j <= q; j++) {
          comps++;
          if (A[j] <= x) { i++; swaps++; const t = A[i]; A[i] = A[j]; A[j] = t; }
        }
        const t = A[p]; A[p] = A[i]; A[i] = t; swaps++;
        const kRank = i - p + 1;
        const rPart = {};
        for (let idx = 0; idx < n; idx++) {
          if (idx < p || idx > q) rPart[idx] = 'dim';
          else if (idx === i) rPart[idx] = 'pivot';
          else if (idx < i) rPart[idx] = 'sorted';
          else rPart[idx] = 'greater';
        }
        snap(3, `SELECT(A, ${p + 1}, ${q + 1}, i=${iRank}): Partitioned around pivot ${x} at r = ${i + 1} (relative rank k = ${kRank}).`, `Seeking rank i = ${iRank} vs. pivot relative rank k = ${kRank}.`, rPart, { [i]: `k=${kRank} (piv=${x})` });
        if (iRank === kRank) {
          snap(4, `i (${iRank}) == k (${kRank})! Pivot A[${i + 1}] = ${x} IS the ${target}-th smallest element!`, `SELECT terminates immediately without sorting the remaining partitions.`, { [i]: 'sorted' }, { [i]: `ANSWER = ${x}` });
        } else if (iRank < kRank) {
          snap(5, `Since i (${iRank}) < k (${kRank}), discard right side and recurse ONLY on left subarray A[${p + 1}..${i}] for rank ${iRank}.`, `Prunes ${q - i} elements in one step!`, rPart, { [p]: `recurse left` });
          rsel(p, i - 1, iRank);
        } else {
          snap(6, `Since i (${iRank}) > k (${kRank}), discard left ${kRank} elements and recurse ONLY on right subarray A[${i + 2}..${q + 1}] for rank i - k = ${iRank - kRank}.`, `Prunes ${kRank} elements in one step!`, rPart, { [i + 1]: `recurse right (rank ${iRank - kRank})` });
          rsel(i + 1, q, iRank - kRank);
        }
      };
      rsel(0, n - 1, target);
    }
    return steps;
  }

  function buildRbtSnapshots(keysStr) {
    const keys = keysStr.split(/[\s,]+/).map(Number).filter(x => !Number.isNaN(x)).slice(0, 12);
    let root = null;
    const snaps = [];
    const cloneTree = n => n ? { k: n.k, c: n.c, l: cloneTree(n.l), r: cloneTree(n.r) } : null;
    const annotate = n => {
      if (!n) return { bh: 1, sz: 0, h: 0 };
      const L = annotate(n.l), R = annotate(n.r);
      n.sz = L.sz + R.sz + 1;
      n.bh = L.bh;
      n.h = Math.max(L.h, R.h) + 1;
      return { bh: L.bh + (n.c === 'B' ? 1 : 0), sz: n.sz, h: n.h };
    };
    const record = (title, detail, focusKey) => {
      const copy = cloneTree(root);
      annotate(copy);
      snaps.push({ tree: copy, title, detail, focusKey });
    };

    const rotL = x => {
      const y = x.r; x.r = y.l; if (y.l) y.l.p = x;
      y.p = x.p;
      if (!x.p) root = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y;
      y.l = x; x.p = y;
    };
    const rotR = y => {
      const x = y.l; y.l = x.r; if (x.r) x.r.p = y;
      x.p = y.p;
      if (!y.p) root = x; else if (y === y.p.l) y.p.l = x; else y.p.r = x;
      x.r = y; y.p = x;
    };

    keys.forEach(val => {
      const z = { k: val, c: 'R', l: null, r: null, p: null };
      let y = null, x = root;
      while (x) { y = x; if (val === x.k) return; x = val < x.k ? x.l : x.r; }
      z.p = y;
      if (!y) {
        root = z; root.c = 'B';
        record(`Insert ${val} (Root)`, `Tree was empty: insert ${val} and color it BLACK (Property 2: Root is always black).`, val);
        return;
      }
      if (val < y.k) y.l = z; else y.r = z;
      record(`BST-Insert ${val} as RED child of ${y.k}`, `Inserted ${val} as a RED leaf under ${y.k}(${y.c}). ${y.c === 'R' ? 'VIOLATION of Property 3: Red node ' + val + ' has Red parent ' + y.k + '!' : 'Parent ' + y.k + ' is BLACK → all 5 Red-Black properties hold!'}`, val);

      let cur = z;
      while (cur !== root && cur.p && cur.p.c === 'R') {
        const p = cur.p, g = p.p;
        if (!g) break;
        if (p === g.l) {
          const u = g.r;
          if (u && u.c === 'R') {
            p.c = 'B'; u.c = 'B'; g.c = 'R';
            cur = g;
            record(`Fixup Case 1 (Uncle ${u.k} is RED) → Recolor`, `Parent ${p.k} and Uncle ${u.k} are both RED: recolor ${p.k} and ${u.k} BLACK, recolor grandparent ${g.k} RED, and move pointer up to ${g.k}.`, g.k);
          } else {
            if (cur === p.r) {
              cur = p; rotL(cur);
              record(`Fixup Case 2 (Zig-Zag Triangle) → Left-Rotate ${cur.k}`, `Uncle is BLACK and node is a right child of left parent ${cur.k}: Left-Rotate(${cur.k}) to straighten into Case 3.`, cur.p.k);
            }
            cur.p.c = 'B'; g.c = 'R'; rotR(g);
            record(`Fixup Case 3 (Straight Line) → Recolor & Right-Rotate ${g.k}`, `Recolor ${cur.p.k} BLACK, ${g.k} RED, and Right-Rotate(${g.k}). Property 3 violation is completely resolved!`, cur.p.k);
          }
        } else {
          const u = g.l;
          if (u && u.c === 'R') {
            p.c = 'B'; u.c = 'B'; g.c = 'R';
            cur = g;
            record(`Fixup Case 1 (Uncle ${u.k} is RED) → Recolor`, `Parent ${p.k} and Uncle ${u.k} are both RED: recolor ${p.k} and ${u.k} BLACK, recolor grandparent ${g.k} RED, and move pointer up to ${g.k}.`, g.k);
          } else {
            if (cur === p.l) {
              cur = p; rotR(cur);
              record(`Fixup Case 2 (Zig-Zag Triangle) → Right-Rotate ${cur.k}`, `Uncle is BLACK and node is a left child of right parent ${cur.k}: Right-Rotate(${cur.k}) to straighten into Case 3.`, cur.p.k);
            }
            cur.p.c = 'B'; g.c = 'R'; rotL(g);
            record(`Fixup Case 3 (Straight Line) → Recolor & Left-Rotate ${g.k}`, `Recolor ${cur.p.k} BLACK, ${g.k} RED, and Left-Rotate(${g.k}). Property 3 violation is completely resolved!`, cur.p.k);
          }
        }
      }
      if (root.c === 'R') {
        root.c = 'B';
        record(`Restore Root BLACK (${root.k})`, `Color root ${root.k} BLACK to satisfy Property 2 (increasing overall tree black-height by 1).`, root.k);
      }
    });
    return snaps;
  }

  /* Missing OS laboratories: concrete models with inspectable, computed traces. */
  function OsRag() {
    const [blocked, setBlocked] = useState(true);
    const [step, setStep] = useState(0);
    const descriptions = blocked ? [
      'R1 is allocated to P1; R2 is allocated to P2. Each resource has exactly one instance. Allocation arrows point resource → process.',
      'P1 requests R2, currently held by P2. The request arrow points P1 → R2. P1 must wait; P2 could still run if it requested nothing else.',
      'P2 requests R1, held by P1. Follow P1 → R2 → P2 → R1 → P1: a directed cycle. Neither process can release its held resource while waiting.',
      'Deadlock: mutual exclusion, hold-and-wait, no preemption, and circular wait all hold. With ONE instance per resource, the cycle is sufficient to prove deadlock.'
    ] : [
      'R1 is allocated to P1; R2 is allocated to P2. There is one instance of each resource.',
      'P1 requests R2 and waits for P2. P2 has no outstanding request, so there is no circular wait.',
      'P2 finishes and releases R2. The system can grant R2 to P1, allowing P1 to complete.',
      'Safe completion order: P2, then P1. Waiting alone is not deadlock; a request can be satisfied when another process completes.'
    ];
    return html`<div className="avz">
      <div className="avz-head"><b>Resource-allocation graph · when does a cycle mean deadlock?</b><select className="fig-btn" aria-label="Deadlock scenario" value=${blocked ? 'deadlock' : 'safe'} onChange=${e => { setBlocked(e.target.value === 'deadlock'); setStep(0); }}><option value="deadlock">Circular wait / deadlock</option><option value="safe">Waiting but safe</option></select></div>
      <div className="avz-grid"><div className="avz-card"><h4>Single-instance resource model</h4>
        <svg viewBox="0 0 460 245" role="img" aria-label=${descriptions[step]} style=${{ width: '100%', maxHeight: '280px' }}>
          <defs><marker id="rag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--c)"/></marker></defs>
          <g fill="none" stroke="var(--c)" strokeWidth="2" markerEnd="url(#rag-arrow)">
            <path d="M110 62 L185 62"/>${(blocked || step < 2) && html`<path d="M350 183 L275 183"/>`}
            ${step >= 1 && (blocked || step < 2) && html`<path d="M245 80 L335 165"/>`}
            ${step >= 2 && blocked && html`<path d="M215 165 L110 80"/>`}
            ${step >= 2 && !blocked && html`<path d="M350 165 L245 80"/>`}
          </g>
          <rect x="50" y="35" width="60" height="54" rx="5" fill="var(--paper)" stroke="var(--graphite)"/><rect x="350" y="156" width="60" height="54" rx="5" fill="var(--paper)" stroke="var(--graphite)"/>
          <circle cx="215" cy="62" r="30" fill="var(--paper)" stroke="var(--c)"/><circle cx="245" cy="183" r="30" fill="var(--paper)" stroke="var(--c)"/>
          <g fill="var(--ink)" fontSize="16" textAnchor="middle"><text x="80" y="67">R1 · 1</text><text x="380" y="188">R2 · 1</text><text x="215" y="68">P1</text><text x="245" y="189">P2</text></g>
          <text x="230" y="233" textAnchor="middle" fill="var(--graphite)" fontSize="12">Square = resource · circle = process · arrow = allocation/request</text>
        </svg>
      </div><div className="avz-card"><h4>Reasoning checkpoint ${step + 1} / 4</h4><p style=${{ lineHeight: 1.8 }}>${descriptions[step]}</p><p><b>Important boundary:</b> with multiple instances per resource type, a cycle is necessary but not sufficient for deadlock. This diagram intentionally models one instance.</p></div></div>
      <div className="avz-bar"><button className="fig-btn" disabled=${step === 0} onClick=${() => setStep(s => s - 1)}>← Previous</button><input aria-label="Resource graph reasoning step" type="range" min="0" max="3" value=${step} onInput=${e => setStep(+e.target.value)}/><button className="fig-btn" disabled=${step === 3} onClick=${() => setStep(s => s + 1)}>Next →</button></div>
    </div>`;
  }

  function solveMemory(holes, requests, method) {
    let blocks = holes.map((size, i) => ({ id: 'H' + (i + 1), size, free: true }));
    const frames = [{ blocks: blocks.map(b => ({ ...b })), detail: 'Initial free partitions, in address order. Select an allocation rule, then step through each request.' }];
    requests.forEach((size, ri) => {
      const candidates = blocks.map((b, i) => ({ ...b, i })).filter(b => b.free && b.size >= size);
      if (method === 'best') candidates.sort((a, b) => a.size - b.size || a.i - b.i);
      if (method === 'worst') candidates.sort((a, b) => b.size - a.size || a.i - b.i);
      const chosen = candidates[0];
      let detail;
      if (!chosen) detail = `P${ri + 1} requests ${size} KB: no contiguous hole fits. Free total = ${blocks.filter(b => b.free).reduce((s, b) => s + b.size, 0)} KB. The allocation fails even if the total free space is sufficient (external fragmentation).`;
      else {
        const remaining = chosen.size - size;
        const replacement = [{ id: 'P' + (ri + 1), size, free: false }];
        if (remaining) replacement.push({ id: chosen.id, size: remaining, free: true });
        blocks.splice(chosen.i, 1, ...replacement);
        detail = `P${ri + 1} requests ${size} KB. ${method === 'first' ? 'First fitting hole in address order' : method === 'best' ? 'Smallest fitting hole' : 'Largest fitting hole'}: ${chosen.id}, ${chosen.size} KB. Allocate ${size} KB; ${remaining} KB remains in that hole.`;
      }
      frames.push({ blocks: blocks.map(b => ({ ...b })), detail });
    });
    return frames;
  }
  function OsMemoryFit() {
    const [method, setMethod] = useState('first');
    const [step, setStep] = useState(0);
    const frames = useMemo(() => solveMemory([100, 500, 200, 300, 600], [212, 417, 112, 426], method), [method]);
    const f = frames[step];
    const free = f.blocks.filter(b => b.free);
    return html`<div className="avz"><div className="avz-head"><b>Contiguous memory placement · splitting holes & fragmentation</b><select className="fig-btn" aria-label="Memory placement rule" value=${method} onChange=${e => { setMethod(e.target.value); setStep(0); }}><option value="first">First fit</option><option value="best">Best fit</option><option value="worst">Worst fit</option></select></div>
      <div className="avz-bar">Initial holes: 100, 500, 200, 300, 600 KB · Requests: 212, 417, 112, 426 KB</div>
      <div className="avz-grid"><div className="avz-card"><h4>Memory map · address order (not to scale)</h4><div className="avz-cells">${f.blocks.map((b, i) => html`<div className=${'avz-cell ' + (b.free ? '' : 'sorted')} style=${{ width: 'auto', minWidth: '62px', padding: '8px' }} key=${i}><b>${b.id}</b><span className="v">${b.size}</span><span className="idx">KB · ${b.free ? 'free' : 'allocated'}</span></div>`)}</div><div className="avz-metrics"><span className="avz-metric">Free total <b>${free.reduce((s, b) => s + b.size, 0)} KB</b></span><span className="avz-metric">Largest hole <b>${Math.max(0, ...free.map(b => b.size))} KB</b></span></div></div>
      <div className="avz-card"><h4>Allocation ${step} / ${frames.length - 1}</h4><p style=${{ lineHeight: 1.8 }}>${f.detail}</p><p><b>Model:</b> variable-size allocation splits a hole exactly. There is no internal fragmentation in this simplified model. Free space between allocated blocks is external fragmentation. No deallocation or compaction is performed.</p><p><b>Cost:</b> a simple unsorted list requires O(h) search per request for h holes; first fit can stop early.</p></div></div>
      <div className="avz-bar"><button className="fig-btn" disabled=${step === 0} onClick=${() => setStep(s => s - 1)}>← Previous</button><input aria-label="Memory allocation step" type="range" min="0" max=${frames.length - 1} value=${step} onInput=${e => setStep(+e.target.value)}/><button className="fig-btn" disabled=${step === frames.length - 1} onClick=${() => setStep(s => s + 1)}>Next request →</button></div>
    </div>`;
  }

  function solveDisk(str, head, alg, direction) {
    const tokens = str.trim().split(/[\s,]+/).filter(Boolean);
    const queue = tokens.map(Number);
    if (!queue.length || queue.length > 16 || tokens.some(t => !/^\d+$/.test(t)) || queue.some(v => !Number.isInteger(v) || v < 0 || v > 199) || !Number.isInteger(head) || head < 0 || head > 199)
      throw new Error('Use 1 to 16 requests and a starting head in cylinders 0–199.');
    let route = [];
    if (alg === 'FCFS') route = queue.slice();
    else if (alg === 'SSTF') {
      const todo = queue.slice(); let cur = head;
      while (todo.length) { let best = 0; todo.forEach((v, i) => { if (Math.abs(v - cur) < Math.abs(todo[best] - cur)) best = i; }); cur = todo.splice(best, 1)[0]; route.push(cur); }
    } else {
      // Equality is serviced immediately; duplicate requests are preserved.
      const equal = queue.filter(v => v === head);
      const first = queue.filter(v => direction === 'up' ? v > head : v < head).sort((a, b) => direction === 'up' ? a - b : b - a);
      const second = queue.filter(v => direction === 'up' ? v < head : v > head).sort((a, b) => direction === 'up' ? b - a : a - b);
      route = equal.concat(first);
      if (second.length) {
        if (alg === 'SCAN' || alg === 'C-SCAN') route.push(direction === 'up' ? 199 : 0);
        if (alg === 'C-SCAN') route.push(direction === 'up' ? 0 : 199);
        route.push(...(alg === 'C-SCAN' || alg === 'C-LOOK' ? second.reverse() : second));
      }
    }
    let position = head, total = 0;
    const pending = queue.slice();
    const frames = [{ pos: head, move: 0, total: 0, detail: `Start at cylinder ${head}. ${queue.length} requests pending.` }];
    route.forEach(pos => {
      const move = Math.abs(pos - position); total += move;
      const idx = pending.indexOf(pos), service = idx >= 0;
      if (service) pending.splice(idx, 1);
      frames.push({ pos, move, total, detail: `${position} → ${pos}: |${pos} − ${position}| = ${move} cylinders. ${service ? 'Service request.' : 'Travel to boundary / wrap endpoint.'} ${pending.length} requests remain.` });
      position = pos;
    });
    return frames;
  }
  function OsDiskArm() {
    const [str, setStr] = useState('98, 183, 37, 122, 14, 124, 65, 67');
    const [head, setHead] = useState(53);
    const [alg, setAlg] = useState('FCFS');
    const [direction, setDirection] = useState('up');
    const [step, setStep] = useState(0);
    const res = useMemo(() => { try { return { frames: solveDisk(str, head, alg, direction) }; } catch (e) { return { frames: [], error: e.message }; } }, [str, head, alg, direction]);
    useEffect(() => setStep(0), [str, head, alg, direction]);
    const idx = Math.min(step, res.frames.length - 1), f = res.frames[idx];
    const points = res.frames.slice(0, idx + 1).map((r, i) => `${35 + r.pos / 199 * 490},${35 + i * 24}`).join(' ');
    return html`<div className="avz"><div className="avz-head"><b>Disk scheduling · head movement & service order</b></div><div className="avz-bar"><label>Policy <select className="fig-btn" aria-label="Disk scheduling policy" value=${alg} onChange=${e => setAlg(e.target.value)}>${['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'].map(a => html`<option key=${a}>${a}</option>`)}</select></label><label>Head <input aria-label="Initial disk head" type="number" min="0" max="199" value=${Number.isFinite(head) ? head : ''} onInput=${e => setHead(e.target.value === '' ? NaN : +e.target.value)} style=${{ width: '70px' }}/></label><label>Direction <select className="fig-btn" value=${direction} onChange=${e => setDirection(e.target.value)}><option value="up">Increasing ↑</option><option value="down">Decreasing ↓</option></select></label></div>
      <div className="avz-bar"><label style=${{ width: '100%' }}>Request queue (0–199)<input aria-label="Disk request queue" type="text" value=${str} onInput=${e => setStr(e.target.value)} style=${{ width: '100%', background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px' }}/></label></div>
      ${res.error ? html`<p className="vz-errmsg" role="alert">${res.error}</p>` : html`<div className="avz-grid"><div className="avz-card"><h4>Cylinder position → · time ↓</h4><svg viewBox=${`0 0 560 ${65 + res.frames.length * 24}`} role="img" aria-label=${f.detail} style=${{ width: '100%' }}><g stroke="var(--line)" fill="var(--graphite)" fontSize="11">${[0, 50, 100, 150, 199].map(v => html`<g key=${v}><line x1=${35 + v / 199 * 490} x2=${35 + v / 199 * 490} y1="25" y2=${45 + res.frames.length * 24}/><text x=${35 + v / 199 * 490} y="16" textAnchor="middle">${v}</text></g>`)}</g><polyline points=${points} fill="none" stroke="var(--c)" strokeWidth="2.5"/>${res.frames.slice(0, idx + 1).map((r, i) => html`<g key=${i}><circle cx=${35 + r.pos / 199 * 490} cy=${35 + i * 24} r="4" fill="var(--c)"/><text x=${43 + r.pos / 199 * 490} y=${39 + i * 24} fill="var(--ink)" fontSize="11">${r.pos}</text></g>`)}</svg></div><div className="avz-card"><h4>Move ${idx} / ${res.frames.length - 1}</h4><p>${f.detail}</p><div className="avz-metrics"><span className="avz-metric">Moved so far <b>${f.total}</b></span><span className="avz-metric">Final movement <b>${res.frames[res.frames.length - 1].total}</b></span></div><p><b>Accounting:</b> every physical move counts, including circular wrap travel. SCAN visits a boundary only when it must reverse to service remaining requests. LOOK reverses at the last pending request instead.</p><p><b>Assumptions:</b> all requests arrive at time zero; cylinders are 0–199; transfer time and rotational latency are excluded. SSTF ties follow original queue order. Direction affects scan policies only.</p><p><b>Trade-off:</b> FCFS preserves arrival order; SSTF can starve far requests under continuous arrivals; SCAN-style policies provide more regular sweeps.</p></div></div><div className="avz-bar"><button className="fig-btn" disabled=${idx === 0} onClick=${() => setStep(s => s - 1)}>← Previous</button><input aria-label="Disk head movement step" type="range" min="0" max=${res.frames.length - 1} value=${idx} onInput=${e => setStep(+e.target.value)}/><button className="fig-btn" disabled=${idx === res.frames.length - 1} onClick=${() => setStep(s => Math.min(res.frames.length - 1, s + 1))}>Next move →</button></div>`}
    </div>`;
  }

  window.STUDY_SIM = { buildSortTrace, parseSortInput, buildRbtSnapshots, solveCpu, solvePages, solveMemory, solveDisk };
  // Embedded figures reuse the same concept models as the standalone laboratory.
  const concept = id => () => html`<${window.TOPICS.Embed} id=${id}/>`;
  // a timer for timed activities, and a ref that shrinks its element's text until it fits the width (wide tables on phones)
  function useClock() {
    const [t0, setT0] = useState(null), [now, setNow] = useState(0);
    useEffect(() => { if (t0 == null) return; const id = setInterval(() => setNow(performance.now()), 100); return () => clearInterval(id); }, [t0]);
    return { start: () => { const t = performance.now(); setT0(t); setNow(t); }, stop: () => { const s = (performance.now() - t0) / 1000; setT0(null); return s; }, running: t0 != null, secs: t0 == null ? 0 : (now - t0) / 1000 };
  }
  const sec = x => x.toFixed(1) + ' s';
  function useFit(dep) {
    const ref = useRef(null);
    React.useLayoutEffect(() => { const el = ref.current; if (!el) return; el.style.fontSize = ''; let fs = parseFloat(getComputedStyle(el).fontSize); while (el.scrollWidth > el.clientWidth + 1 && fs > 7) { fs -= .5; el.style.fontSize = fs + 'px'; } }, [dep]);
    return ref;
  }
  // the toolkit the per-course visuals files (figs-ag.js) build on
  window.FIGKIT = { html, useSteps, Cap, Bar, pop, calm, useClock, useFit, sec };
  window.FIGS = Object.assign(window.FIGS || {}, {
    'hci-parts': HciParts, 'invisible-interface': Invisible, elevator: Elevator,
    vending: Vending, truckers: Truckers, 'id-umbrella': Umbrella,
    'os-rag': OsRag, 'os-mem-fit': OsMemoryFit, 'os-disk-arm': OsDiskArm,
    'os-cpu-sim': concept('cpu'), 'os-page-sim': concept('pages'),
    'algo-sort-sim': concept('sort'), 'algo-rec-sim': concept('rec'),
    'algo-hash-sim': concept('hash'), 'algo-rbt-sim': concept('trees'),
    'algo-dp-sim': concept('dp'), 'algo-graph-sim': concept('paths'),
    'algo-np-sim': concept('reduction'), 'algo-bit-sim': concept('bits'),
    'algo-studio': () => html`<${window.TOPICS.Studio}/>`
  });
})();
