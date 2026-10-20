// Visuals for the notes: animated versions of a lecture's own diagrams and small hands-on versions of its examples.
// A note section names one with fig: '<name>'. Every label and caption comes from that section's slide; nothing is added.
// build.mjs copies this file to data/figs.js; app.js loads it only when a lecture with a visual is opened.
(function () {
  const { useState, useEffect, useRef } = React;
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
.fig-dots{ display:flex; gap:6px; } .fig-dots i{ width:8px; height:8px; border-radius:50%; background:var(--line); } .fig-dots i.on{ background:var(--k-hci); }
.fig-btn{ font:inherit; font-size:.88rem; padding:6px 12px; border-radius:99px; border:1px solid var(--line); background:var(--paper); color:var(--ink); cursor:pointer; min-height:32px; }
.fig-btn:hover{ border-color:var(--k-hci); } .fig-btn.solid{ background:var(--s-hci); color:#fff; border-color:transparent; }
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
  const CPU_PRESETS = [
    { name: 'Slide 6.19/6.20 (SJF vs SRTF)', q: 2, cs: 0, procs: [{ id: 'P1', at: 0, bt: 7, pr: 2 }, { id: 'P2', at: 2, bt: 4, pr: 1 }, { id: 'P3', at: 4, bt: 1, pr: 3 }, { id: 'P4', at: 5, bt: 4, pr: 4 }] },
    { name: 'Slide 6.11 (FCFS Convoy)', q: 4, cs: 0, procs: [{ id: 'P1', at: 0, bt: 24, pr: 1 }, { id: 'P2', at: 0, bt: 3, pr: 2 }, { id: 'P3', at: 0, bt: 3, pr: 3 }] },
    { name: 'Slide 6.21 (SRTF Example)', q: 3, cs: 0, procs: [{ id: 'P1', at: 0, bt: 8, pr: 2 }, { id: 'P2', at: 1, bt: 4, pr: 1 }, { id: 'P3', at: 2, bt: 9, pr: 4 }, { id: 'P4', at: 3, bt: 5, pr: 3 }] },
    { name: 'Slide 6.23 (Priority)', q: 2, cs: 0, procs: [{ id: 'P1', at: 0, bt: 10, pr: 3 }, { id: 'P2', at: 0, bt: 1, pr: 1 }, { id: 'P3', at: 0, bt: 2, pr: 4 }, { id: 'P4', at: 0, bt: 1, pr: 5 }, { id: 'P5', at: 0, bt: 5, pr: 2 }] },
    { name: 'Final 2023/2024 (P1..P4)', q: 2, cs: 0, procs: [{ id: 'P1', at: 0, bt: 5, pr: 2 }, { id: 'P2', at: 1, bt: 3, pr: 1 }, { id: 'P3', at: 2, bt: 8, pr: 4 }, { id: 'P4', at: 3, bt: 6, pr: 3 }] },
    { name: 'Final 2018 (P1..P5, q=3)', q: 3, cs: 0, procs: [{ id: 'P1', at: 0, bt: 10, pr: 2 }, { id: 'P2', at: 1, bt: 29, pr: 3 }, { id: 'P3', at: 2, bt: 3, pr: 4 }, { id: 'P4', at: 3, bt: 7, pr: 3 }, { id: 'P5', at: 4, bt: 12, pr: 1 }] }
  ];

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

  function OsCpuSim() {
    const [presetIdx, setPresetIdx] = useState(0);
    const [alg, setAlg] = useState('SRTF');
    const [q, setQ] = useState(2);
    const [cs, setCs] = useState(0);
    const [procs, setProcs] = useState(CPU_PRESETS[0].procs);
    const pickPreset = idx => {
      const p = CPU_PRESETS[idx];
      setPresetIdx(idx);
      setQ(p.q);
      setCs(p.cs);
      setProcs(p.procs.map(x => Object.assign({}, x)));
    };
    const res = solveCpu(procs, alg, q, cs);
    const colors = { P1: '#6366f1', P2: '#10b981', P3: '#f59e0b', P4: '#ec4899', P5: '#3b82f6', CS: '#64748b', IDLE: '#94a3b8' };
    return html`<figure className="fig"><div className="fig-stage" style=${{ padding: '16px' }}>
      <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <strong style=${{ fontSize: '.9rem' }}>Interactive CPU Scheduling Simulator:</strong>
        <select className="fig-btn" value=${presetIdx} onChange=${e => pickPreset(+e.target.value)}>
          ${CPU_PRESETS.map((p, i) => html`<option key=${i} value=${i}>Preset: ${p.name}</option>`)}
        </select>
        ${['FCFS', 'SJF', 'SRTF', 'PRIO', 'RR'].map(a => html`<button key=${a} className=${'fig-btn' + (alg === a ? ' solid' : '')} onClick=${() => setAlg(a)}>${a}</button>`)}
        ${alg === 'RR' && html`<label style=${{ fontSize: '.85rem' }}>Quantum q = <input type="number" min="1" max="50" value=${q} onInput=${e => setQ(+e.target.value || 1)} style=${{ width: '48px', padding: '3px 6px' }} /></label>`}
        <label style=${{ fontSize: '.85rem' }}>Context Switch = <input type="number" min="0" max="5" value=${cs} onInput=${e => setCs(Math.max(0, +e.target.value || 0))} style=${{ width: '44px', padding: '3px 6px' }} /></label>
      </div>
      <div style=${{ marginBottom: '14px' }}>
        <div style=${{ fontSize: '.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--graphite)' }}>Gantt Chart (Total = ${res.totalTime} ms)</div>
        <div style=${{ display: 'flex', width: '100%', minHeight: '42px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)' }}>
          ${res.gantt.map((seg, i) => {
            const w = Math.max(4, ((seg.e - seg.s) / Math.max(1, res.totalTime)) * 100);
            return html`<div key=${i} style=${{ width: w + '%', background: colors[seg.id] || '#6366f1', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '.76rem', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,.3)', padding: '2px' }} title=${seg.id + ': ' + seg.s + ' → ' + seg.e}>
              <span>${seg.id}</span>
              <span style=${{ fontSize: '.66rem', opacity: .9 }}>${seg.s}–${seg.e}</span>
            </div>`;
          })}
        </div>
      </div>
      <div className="tbl" style=${{ margin: 0 }}>
        <table>
          <thead><tr><th>Process</th><th>Arrival (AT)</th><th>Burst (BT)</th><th>Priority</th><th>Finish (CT)</th><th>Turnaround (CT − AT)</th><th>Waiting (TAT − BT)</th></tr></thead>
          <tbody>
            ${res.rows.map(r => html`<tr key=${r.id}>
              <td><b>${r.id}</b></td><td>${r.at}</td><td>${r.bt}</td><td>${r.pr}</td><td>${r.ct}</td><td>${r.tat}</td><td><b>${r.wt}</b></td>
            </tr>`)}
            <tr><td colSpan="5"><b>Average</b></td><td><b>${res.avgTat} ms</b></td><td><b>${res.avgWt} ms</b></td></tr>
          </tbody>
        </table>
      </div>
    </div></figure>`;
  }

  /* ── OS Interactive Page Replacement Simulator (FIFO, OPT, LRU, Clock) ── */
  const PAGE_PRESETS = [
    { name: 'Slide 9.32 & Final 2023/2024 (22 refs, 3 frames)', frames: 3, str: '7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1' },
    { name: 'Slide 9.35 Belady Anomaly (12 refs, 3 vs 4 frames)', frames: 3, str: '1,2,3,4,1,2,5,1,2,3,4,5' },
    { name: 'Final 2019 (20 refs, 4 frames)', frames: 4, str: '1,2,3,4,7,6,3,2,1,2,3,6,2,1,5,6,2,1,2,3' },
    { name: 'Final 2016 (20 refs, 5 frames)', frames: 5, str: '1,2,3,4,2,1,5,6,2,1,2,3,7,6,3,2,1,2,3,6' }
  ];

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

  function OsPageSim() {
    const [alg, setAlg] = useState('LRU');
    const [fCount, setFCount] = useState(3);
    const [str, setStr] = useState(PAGE_PRESETS[0].str);
    const res = solvePages(str, fCount, alg);
    return html`<figure className="fig"><div className="fig-stage" style=${{ padding: '16px' }}>
      <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        <strong style=${{ fontSize: '.9rem' }}>Interactive Page Replacement Simulator:</strong>
        <select className="fig-btn" onChange=${e => { const p = PAGE_PRESETS[+e.target.value]; if (p) { setFCount(p.frames); setStr(p.str); } }}>
          ${PAGE_PRESETS.map((p, i) => html`<option key=${i} value=${i}>${p.name}</option>`)}
        </select>
        ${['FIFO', 'OPT', 'LRU', 'CLOCK'].map(a => html`<button key=${a} className=${'fig-btn' + (alg === a ? ' solid' : '')} onClick=${() => setAlg(a)}>${a}</button>`)}
        <label style=${{ fontSize: '.85rem' }}>Frames: <select className="fig-btn" value=${fCount} onChange=${e => setFCount(+e.target.value)}>${[2, 3, 4, 5, 6].map(n => html`<option key=${n} value=${n}>${n} frames</option>`)}</select></label>
      </div>
      <div style=${{ marginBottom: '10px' }}>
        <input type="text" value=${str} onInput=${e => setStr(e.target.value)} style=${{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: '.82rem', background: 'var(--paper)' }} />
      </div>
      <div style=${{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px', fontSize: '.88rem' }}>
        <span><b>Page Faults:</b> <span style=${{ color: 'var(--pen)', fontWeight: 700 }}>${res.faults}</span></span>
        <span><b>Page Replacements (Faults − Filled Frames):</b> <b>${res.replacements}</b></span>
        <span><b>Page Hits:</b> <span style=${{ color: 'var(--ok)', fontWeight: 700 }}>${res.hits}</span></span>
      </div>
      <div className="tbl" style=${{ margin: 0, overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Ref</th>${res.steps.map((s, i) => html`<th key=${i}>${s.p}</th>`)}</tr></thead>
          <tbody>
            ${Array.from({ length: fCount }).map((_, fi) => html`<tr key=${fi}><td><b>F${fi + 1}</b></td>${res.steps.map((s, i) => html`<td key=${i}>${s.frames[fi] == null ? '–' : s.frames[fi]}</td>`)}</tr>`)}
            <tr><td><b>Status</b></td>${res.steps.map((s, i) => html`<td key=${i} style=${{ color: s.hit ? 'var(--ok)' : 'var(--pen)', fontWeight: 700 }}>${s.hit ? '✓' : 'F'}</td>`)}</tr>
          </tbody>
        </table>
      </div>
    </div></figure>`;
  }

  window.FIGS = { 'hci-parts': HciParts, 'invisible-interface': Invisible, 'elevator': Elevator, 'vending': Vending, 'truckers': Truckers, 'id-umbrella': Umbrella, 'os-cpu-sim': OsCpuSim, 'os-page-sim': OsPageSim };
})();
