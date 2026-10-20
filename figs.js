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


  /* ══════════════════════════════════════════════════════════════════════════
     ALGORITHMS COURSE — DETAILED INTERACTIVE EXECUTION & TRACE STUDIO (8 ENGINES)
     ══════════════════════════════════════════════════════════════════════════ */

  const ALGO_CSS = `
.avz{ border:1px solid var(--line); border-radius:12px; background:var(--paper); margin:16px 0 22px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.04); }
.avz-head{ padding:12px 16px; background:var(--paper-2); border-bottom:1px solid var(--line); display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }
.avz-title{ font-weight:700; font-size:1rem; color:var(--ink); display:flex; align-items:center; gap:8px; }
.avz-badge{ font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:3px 8px; border-radius:99px; background:color-mix(in srgb, var(--k-compiler, #7c3aed) 16%, var(--paper)); color:var(--k-compiler, #7c3aed); border:1px solid color-mix(in srgb, var(--k-compiler, #7c3aed) 35%, transparent); }
.avz-bar{ padding:10px 16px; background:var(--paper); border-bottom:1px solid var(--line); display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
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
`;
  if (!document.getElementById('algo-viz-css')) {
    const st = document.createElement('style');
    st.id = 'algo-viz-css';
    st.textContent = ALGO_CSS;
    document.head.appendChild(st);
  }

  /* ── 1. Detailed Sorting, Partitioning, Counting Sort & Quickselect Trace Engine ── */
  const SORT_PRESETS = [
    { name: 'Lec 1 Slide 1.8: Insertion Sort [8, 2, 4, 9, 3, 6]', alg: 'insertion', arr: '8, 2, 4, 9, 3, 6', k: 3 },
    { name: 'Lec 1 Slide 1.26: Merge Sort [20, 12, 13, 11, 7, 9, 2, 1]', alg: 'merge', arr: '20, 12, 13, 11, 7, 9, 2, 1', k: 3 },
    { name: 'Lec 5 Slide 5.5: Quicksort Partition [6, 10, 13, 5, 8, 3, 2, 11]', alg: 'quick', arr: '6, 10, 13, 5, 8, 3, 2, 11', k: 4 },
    { name: 'Midterm Exam Q1: Quicksort [5, 2, 4, 8, 0, 3, 1, 7]', alg: 'quick', arr: '5, 2, 4, 8, 0, 3, 1, 7', k: 4 },
    { name: 'Midterm 2019 Q6 & Final Q3: Counting Sort [8, 5, 7, 3, 6, 1, 2]', alg: 'counting', arr: '8, 5, 7, 3, 6, 1, 2', k: 4 },
    { name: 'Midterm 2020 Q1: Counting Sort [1, 1, 2, 2, 3, 3, 4]', alg: 'counting', arr: '1, 1, 2, 2, 3, 3, 4', k: 4 },
    { name: 'Lec 7 Slide 7.4: Quickselect RAND-SELECT (7th smallest)', alg: 'select', arr: '6, 10, 13, 5, 8, 3, 2, 11', k: 7 }
  ];

  const SORT_PSEUDOCODE = {
    insertion: [
      'INSERTION-SORT(A, n)',
      '1  for j ← 2 to n',
      '2    key ← A[j]; i ← j - 1',
      '3    while i > 0 and A[i] > key',
      '4      A[i + 1] ← A[i]; i ← i - 1',
      '5    A[i + 1] ← key'
    ],
    merge: [
      'MERGE-SORT(A, l, r)',
      '1  if l >= r then return',
      '2  mid ← ⌊(l + r) / 2⌋',
      '3  MERGE-SORT(A, l, mid)',
      '4  MERGE-SORT(A, mid + 1, r)',
      '5  MERGE(A, l, mid, r)  // Two-finger linear merge'
    ],
    quick: [
      'QUICKSORT(A, p, q) & PARTITION(A, p, q)',
      '1  x ← A[p]; i ← p          // pivot = A[p]',
      '2  for j ← p + 1 to q',
      '3    if A[j] ≤ x',
      '4      i ← i + 1; swap A[i] ↔ A[j]',
      '5  swap A[p] ↔ A[i]; return i'
    ],
    counting: [
      'COUNTING-SORT(A, B, k)',
      '1  for i ← 1 to k: C[i] ← 0',
      '2  for j ← 1 to n: C[A[j]]++        // Occurrence',
      '3  for i ← 2 to k: C[i] += C[i-1]   // Accumulation C\'',
      '4  for j ← n downto 1:              // Stable backwards loop',
      '5    B[C[A[j]]] ← A[j]; C[A[j]]--   // Final C & Output B'
    ],
    select: [
      'RAND-SELECT(A, p, q, i)',
      '1  if p == q then return A[p]',
      '2  r ← PARTITION(A, p, q)',
      '3  k ← r - p + 1   // relative rank of pivot',
      '4  if i == k then return A[r]',
      '5  if i < k return RAND-SELECT(A, p, r-1, i)',
      '6  else return RAND-SELECT(A, r+1, q, i-k)'
    ]
  };

  function buildSortTrace(alg, str, targetRank) {
    const raw = str.split(/[\s,]+/).map(Number).filter(x => !Number.isNaN(x)).slice(0, 12);
    const A = raw.length >= 2 ? raw.slice() : [8, 2, 4, 9, 3, 6];
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
        snap(1, `Outer loop j = ${j + 1}: Select key = A[${j + 1}] = ${key} to insert into sorted prefix A[1..${j}].`, `A[1..${j}] = [${A.slice(0, j).join(', ')}] is currently sorted.`, r0, { [j]: `j=${j+1} (key=${key})`, [i]: `i=${i+1}` });
        while (i >= 0) {
          comps++;
          snap(3, `Compare A[${i + 1}] (${A[i]}) > key (${key})? ${A[i] > key ? 'YES → shift right' : 'NO → stop shifting'}.`, `Testing index i = ${i + 1} against key = ${key}.`, Object.assign({}, r0, { [i]: 'active' }), { [i]: `i=${i+1}`, [j]: `j=${j+1}` });
          if (A[i] > key) {
            A[i + 1] = A[i];
            swaps++;
            const rShift = {}; for (let k = 0; k <= j; k++) rShift[k] = 'sorted'; rShift[i + 1] = 'active'; rShift[i] = 'pivot';
            snap(4, `Shift A[${i + 1}] (${A[i]}) right to A[${i + 2}], and decrement i to ${i}.`, `Hole for key = ${key} moves left to index ${i + 1}.`, rShift, { [i]: `hole (key=${key})` });
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
        while (i < L.length && j < R.length) {
          comps++; swaps++;
          if (L[i] <= R[j]) { A[k++] = L[i++]; }
          else { A[k++] = R[j++]; }
        }
        while (i < L.length) { swaps++; A[k++] = L[i++]; }
        while (j < R.length) { swaps++; A[k++] = R[j++]; }
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
      const kMax = Math.max(...A.map(v => Math.max(1, Math.min(12, v))), 4);
      for (let i = 0; i < n; i++) A[i] = Math.max(1, Math.min(12, A[i]));
      const Occ = Array(kMax).fill(0);
      const B = Array(n).fill('–');
      snap(1, `Initialize C[1..${kMax}] = 0 for input A = [${A.join(', ')}] (n = ${n}, k = ${kMax}).`, `Counting sort uses zero element-to-element comparisons!`, {}, {}, { kMax, Occ: Occ.slice(), Acc: Array(kMax).fill('–'), Fin: Array(kMax).fill('–'), B: B.slice() });
      for (let j = 0; j < n; j++) {
        Occ[A[j] - 1]++;
        swaps++;
        snap(2, `Loop 2 (Occurrence, j = ${j + 1}): Increment C[A[${j + 1}]] = C[${A[j]}] to ${Occ[A[j] - 1]}.`, `C[i] counts how many times key i appears in A.`, { [j]: 'active' }, { [j]: `j=${j+1}` }, { kMax, Occ: Occ.slice(), Acc: Array(kMax).fill('–'), Fin: Array(kMax).fill('–'), B: B.slice() });
      }
      const Acc = Occ.slice();
      for (let i = 1; i < kMax; i++) Acc[i] += Acc[i - 1];
      snap(3, `Loop 3 (Accumulation C'): Compute prefix sums C'[i] = C'[i] + C'[i-1] → [${Acc.join(', ')}].`, `C'[i] = |{key ≤ i}| gives the exact final 1-based index in B for key i!`, {}, {}, { kMax, Occ: Occ.slice(), Acc: Acc.slice(), Fin: Acc.slice(), B: B.slice() });
      const Fin = Acc.slice();
      for (let j = n - 1; j >= 0; j--) {
        const val = A[j], pos = Fin[val - 1] - 1;
        B[pos] = val;
        Fin[val - 1]--;
        swaps++;
        snap(5, `Loop 4 (j = ${j + 1} downto 1): Place A[${j + 1}] = ${val} into B[C[${val}]] = B[${pos + 1}], then decrement C[${val}] to ${Fin[val - 1]}.`, `Scanning backwards from n downto 1 preserves input order of duplicate keys (Stable Sort!).`, { [j]: 'pivot' }, { [j]: `j=${j+1} → B[${pos+1}]` }, { kMax, Occ: Occ.slice(), Acc: Acc.slice(), Fin: Fin.slice(), B: B.slice(), hiB: pos });
      }
    } else if (alg === 'select') {
      const target = Math.max(1, Math.min(n, Number(targetRank) || 4));
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
        snap(3, `RAND-SELECT(A, ${p + 1}, ${q + 1}, i=${iRank}): Partitioned around pivot ${x} at r = ${i + 1} (relative rank k = ${kRank}).`, `Seeking rank i = ${iRank} vs. pivot relative rank k = ${kRank}.`, rPart, { [i]: `k=${kRank} (piv=${x})` });
        if (iRank === kRank) {
          snap(4, `i (${iRank}) == k (${kRank})! Pivot A[${i + 1}] = ${x} IS the ${target}-th smallest element!`, `RAND-SELECT terminates immediately without sorting the remaining partitions.`, { [i]: 'sorted' }, { [i]: `ANSWER = ${x}` });
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

  function AlgoSortSim() {
    const [alg, setAlg] = useState('insertion');
    const [arrStr, setArrStr] = useState(SORT_PRESETS[0].arr);
    const [rankK, setRankK] = useState(4);
    const [stepIdx, setStepIdx] = useState(0);
    const [playing, setPlaying] = useState(false);

    const steps = useMemo(() => buildSortTrace(alg, arrStr, rankK), [alg, arrStr, rankK]);
    const safeIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
    const cur = steps[safeIdx] || steps[0];
    const codeLines = SORT_PSEUDOCODE[alg] || [];

    useEffect(() => { setStepIdx(0); setPlaying(false); }, [alg, arrStr, rankK]);
    useEffect(() => {
      if (!playing) return;
      if (safeIdx >= steps.length - 1) { setPlaying(false); return; }
      const t = setTimeout(() => setStepIdx(s => Math.min(steps.length - 1, s + 1)), 900);
      return () => clearTimeout(t);
    }, [playing, safeIdx, steps.length]);

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 1</span>Sorting, Partitioning, Counting Sort & Quickselect Inspector</div>
        <select className="fig-btn" onChange=${e => { const p = SORT_PRESETS[+e.target.value]; if (p) { setAlg(p.alg); setArrStr(p.arr); setRankK(p.k); } }}>
          ${SORT_PRESETS.map((p, i) => html`<option key=${i} value=${i}>Preset: ${p.name}</option>`)}
        </select>
      </div>
      <div className="avz-bar">
        ${[['insertion', 'Insertion Sort'], ['merge', 'Merge Sort'], ['quick', 'Quicksort'], ['counting', 'Counting Sort (Exam Table)'], ['select', 'Quickselect (RAND-SELECT)']].map(([id, label]) =>
          html`<button key=${id} className=${'fig-btn' + (alg === id ? ' solid' : '')} onClick=${() => setAlg(id)}>${label}</button>`)}
        <input type="text" value=${arrStr} onInput=${e => setArrStr(e.target.value)} aria-label="Input array" style=${{ flex: 1, minWidth: '150px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: '.82rem', background: 'var(--paper)' }} />
        ${alg === 'select' && html`<label style=${{ fontSize: '.82rem' }}>Rank i: <input type="number" min="1" max="12" value=${rankK} onInput=${e => setRankK(+e.target.value || 1)} style=${{ width: '48px', padding: '4px', borderRadius: '6px', border: '1px solid var(--line)' }} /></label>`}
      </div>
      <div className="avz-bar" style=${{ background: 'var(--paper-2)' }}>
        <button className="fig-btn" onClick=${() => { setPlaying(false); setStepIdx(0); }} disabled=${safeIdx === 0}>⏮ First</button>
        <button className="fig-btn" onClick=${() => { setPlaying(false); setStepIdx(Math.max(0, safeIdx - 1)); }} disabled=${safeIdx === 0}>‹ Step Back</button>
        <button className="fig-btn solid" onClick=${() => { if (safeIdx >= steps.length - 1) { setStepIdx(0); setPlaying(true); } else setPlaying(p => !p); }}>${playing ? '⏸ Pause' : safeIdx >= steps.length - 1 ? '↻ Replay' : '▶ Play Trace'}</button>
        <button className="fig-btn" onClick=${() => { setPlaying(false); setStepIdx(Math.min(steps.length - 1, safeIdx + 1)); }} disabled=${safeIdx >= steps.length - 1}>Step Next ›</button>
        <button className="fig-btn" onClick=${() => { setPlaying(false); setStepIdx(steps.length - 1); }} disabled=${safeIdx >= steps.length - 1}>Last ⏭</button>
        <input type="range" min="0" max=${Math.max(0, steps.length - 1)} value=${safeIdx} onInput=${e => { setPlaying(false); setStepIdx(+e.target.value); }} style=${{ flex: 1, minWidth: '90px' }} />
        <span style=${{ fontSize: '.82rem', fontFamily: 'var(--mono)', fontWeight: 700 }}>Step ${safeIdx + 1} / ${steps.length}</span>
      </div>
      <div className="avz-grid">
        <div className="avz-card">
          <h4><span>Array Memory State & Pointers (1-Based CLRS Indexing)</span><span>n = ${cur.arr.length}</span></h4>
          <div className="avz-cells">
            ${cur.arr.map((v, idx) => html`<div key=${idx} className=${'avz-cell ' + (cur.roles[idx] || '')}>
              <span className="v">${v}</span>
              <span className="idx">A[${idx + 1}]</span>
              ${cur.ptrs[idx] && html`<span className="tag" style=${{ background: '#7c3aed', color: '#fff' }}>${cur.ptrs[idx]}</span>`}
            </div>`)}
          </div>
          ${cur.extra && cur.extra.stack && html`<div style=${{ marginTop: '8px', padding: '8px', borderRadius: '6px', background: 'var(--paper)', border: '1px solid var(--line)', fontSize: '.78rem', fontFamily: 'var(--mono)' }}>
            <b>Active Call Stack (${cur.extra.stack.length} frames):</b> ${cur.extra.stack.join(' → ')}
          </div>`}
          ${cur.extra && cur.extra.kMax && html`<div className="tbl" style=${{ marginTop: '10px', marginBottom: 0 }}>
            <table>
              <thead><tr><th>Dr. Basheer Table</th>${Array.from({ length: cur.extra.kMax }).map((_, i) => html`<th key=${i}>${i + 1}</th>`)}</tr></thead>
              <tbody>
                <tr><td><b>Occurrence C</b></td>${cur.extra.Occ.map((x, i) => html`<td key=${i}>${x}</td>`)}</tr>
                <tr><td><b>Accumulation C'</b></td>${cur.extra.Acc.map((x, i) => html`<td key=${i}><b>${x}</b></td>`)}</tr>
                <tr><td><b>Final C</b></td>${cur.extra.Fin.map((x, i) => html`<td key=${i}>${x}</td>`)}</tr>
              </tbody>
            </table>
            <div style=${{ marginTop: '6px', fontSize: '.82rem', fontFamily: 'var(--mono)' }}><b>Output B[1..${cur.arr.length}]:</b> [ ${cur.extra.B.join(' , ')} ]</div>
          </div>`}
          <div className="avz-metrics">
            <span className="avz-metric">Comparisons: <b>${cur.comps}</b></span>
            <span className="avz-metric">Moves / Swaps: <b>${cur.swaps}</b></span>
            ${cur.calls > 0 && html`<span className="avz-metric">Recursive Calls: <b>${cur.calls}</b></span>`}
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Synchronized Pseudocode & Line Hit Counts</span><span>CLRS 3rd Ed.</span></h4>
          <div className="avz-code">
            ${codeLines.map((ln, li) => html`<div key=${li} className=${'avz-line' + (cur.line === li ? ' on' : '')}>
              <span>${cur.line === li ? '▶ ' : '  '}${ln}</span>
              <span className="avz-cnt">${cur.counts[li] || 0}×</span>
            </div>`)}
          </div>
          <div style=${{ marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--paper)', border: '1px solid var(--line)', fontSize: '.81rem' }}>
            <b>Invariant Check:</b> ${cur.inv}
          </div>
        </div>
      </div>
      <div className="avz-explain">
        <b>Step ${safeIdx + 1} Execution Detail:</b> ${cur.desc}
      </div>
    </div>`;
  }

  /* ── 2. Recurrence Tree, Master Theorem & Fibonacci Matrix Squaring Analyzer ── */
  const REC_PRESETS = [
    { name: 'Merge Sort / Max Subarray: T(n) = 2T(n/2) + n → Θ(n lg n)', a: 2, b: 2, k: 1, p: 0, mode: 'master' },
    { name: 'Midterm Exam Q3.A: T(n) = 4T(n/2) + n → Θ(n²) (Case 1)', a: 4, b: 2, k: 1, p: 0, mode: 'master' },
    { name: 'Midterm Exam Q3.B: T(n) = 4T(n/2) + n² → Θ(n² lg n) (Case 2)', a: 4, b: 2, k: 2, p: 0, mode: 'master' },
    { name: 'Midterm Exam Q3.C: T(n) = 4T(n/2) + n³ → Θ(n³) (Case 3)', a: 4, b: 2, k: 3, p: 0, mode: 'master' },
    { name: 'Strassen Matrix Mult: T(n) = 7T(n/2) + n² → Θ(n^2.81) (Case 1)', a: 7, b: 2, k: 2, p: 0, mode: 'master' },
    { name: 'Midterm 2021 Q4: T(n) = 2T(n/4) + √n → Θ(√n lg n) (Case 2)', a: 2, b: 4, k: 0.5, p: 0, mode: 'master' },
    { name: 'Lec 3 Slide 30 Gap Case: T(n) = 2T(n/2) + n lg n → Θ(n lg² n)', a: 2, b: 2, k: 1, p: 1, mode: 'master' },
    { name: 'Midterm 2024/2025 Q4: Fibonacci F(16) in 4 Matrix Squaring Steps', a: 1, b: 2, k: 0, p: 0, mode: 'fib16' }
  ];

  function AlgoRecSim() {
    const [mode, setMode] = useState('master');
    const [a, setA] = useState(4);
    const [b, setB] = useState(2);
    const [k, setK] = useState(1);
    const [p, setP] = useState(0);
    const [fibN, setFibN] = useState(16);

    const logba = Math.log(a) / Math.log(b);
    const logbaStr = Math.abs(logba - Math.round(logba)) < 1e-6 ? String(Math.round(logba)) : logba.toFixed(3);
    const diff = k - logba;
    let verdict = '', caseNum = '', sol = '', dom = '';
    if (Math.abs(diff) < 1e-5) {
      caseNum = p === 0 ? 'Master Theorem Case 2 (k = 0)' : `Extended Master Case 2 (lg^${p} n factor)`;
      sol = `Θ(n^(${logbaStr}) · lg${p + 1 > 1 ? '^' + (p + 1) : ''} n)`;
      verdict = `Watershed n^(log_${b} ${a}) = n^(${logbaStr}) matches the polynomial part of f(n) = n^(${k})${p ? ' lg^' + p + ' n' : ''}. Every level of the recursion tree performs equal asymptotic work, multiplying by an extra lg n factor.`;
      dom = 'Balanced Work Across All Levels';
    } else if (diff < 0) {
      caseNum = `Master Theorem Case 1 (ε ≈ ${Math.abs(diff).toFixed(2)} > 0)`;
      sol = `Θ(n^(${logbaStr}))`;
      verdict = `f(n) = O(n^(${logbaStr} − ε)) is polynomially smaller than the watershed n^(log_${b} ${a}) = n^(${logbaStr}). Work per level grows geometrically down the tree, so the ${a}^(log_${b} n) = n^(${logbaStr}) LEAVES dominate!`;
      dom = 'Leaf-Dominated (Geometric Increase Down Tree)';
    } else {
      const ratio = a / Math.pow(b, k);
      caseNum = `Master Theorem Case 3 (ε ≈ ${diff.toFixed(2)} > 0, regularity a/b^k = ${ratio.toFixed(3)} < 1)`;
      sol = `Θ(n^(${k})${p ? ' lg^' + p + ' n' : ''})`;
      verdict = `f(n) = Ω(n^(${logbaStr} + ε)) is polynomially larger than n^(log_${b} ${a}) = n^(${logbaStr}), and regularity holds: ${a}·f(n/${b}) = (${a}/${Math.pow(b, k).toFixed(1)}) f(n) = ${ratio.toFixed(3)} f(n) ≤ c·f(n) for c = ${ratio.toFixed(3)} < 1. Work shrinks geometrically down the tree, so the ROOT dominates!`;
      dom = 'Root-Dominated (Geometric Decay Down Tree)';
    }

    const matMul = (M1, M2) => [
      [M1[0][0]*M2[0][0] + M1[0][1]*M2[1][0], M1[0][0]*M2[0][1] + M1[0][1]*M2[1][1]],
      [M1[1][0]*M2[0][0] + M1[1][1]*M2[1][0], M1[1][0]*M2[0][1] + M1[1][1]*M2[1][1]]
    ];
    const fibSteps = useMemo(() => {
      const out = [];
      let curPow = 1, M = [[1, 1], [1, 0]];
      out.push({ step: 0, pow: 1, M: [[1, 1], [1, 0]], label: 'Base Matrix M¹ = [[F₂, F₁], [F₁, F₀]]' });
      for (let s = 1; s <= 4; s++) {
        M = matMul(M, M);
        curPow *= 2;
        out.push({ step: s, pow: curPow, M, label: `Squaring Step ${s}: M^${curPow} = (M^${curPow/2})² → F(${curPow}) = ${M[0][1]}` });
      }
      return out;
    }, [fibN]);

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 2</span>Recurrence Tree, Master Theorem & Matrix Squaring Analyzer</div>
        <select className="fig-btn" onChange=${e => { const pr = REC_PRESETS[+e.target.value]; if (pr) { setMode(pr.mode); setA(pr.a); setB(pr.b); setK(pr.k); setP(pr.p); } }}>
          ${REC_PRESETS.map((pr, i) => html`<option key=${i} value=${i}>${pr.name}</option>`)}
        </select>
      </div>
      <div className="avz-bar">
        <button className=${'fig-btn' + (mode === 'master' ? ' solid' : '')} onClick=${() => setMode('master')}>Recursion Tree & Master Theorem</button>
        <button className=${'fig-btn' + (mode === 'fib16' ? ' solid' : '')} onClick=${() => setMode('fib16')}>Fibonacci Matrix Squaring (F(16) in 4 Steps)</button>
        ${mode === 'master' && html`<span style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '.83rem' }}>
          <label>a (branches): <input type="number" min="1" max="16" value=${a} onInput=${e => setA(Math.max(1, +e.target.value || 1))} style=${{ width: '48px', padding: '3px 6px' }} /></label>
          <label>b (divisor): <input type="number" min="2" max="16" value=${b} onInput=${e => setB(Math.max(2, +e.target.value || 2))} style=${{ width: '48px', padding: '3px 6px' }} /></label>
          <label>f(n) = n^k · lg^p n → k: <input type="number" step="0.5" min="0" max="5" value=${k} onInput=${e => setK(Math.max(0, +e.target.value || 0))} style=${{ width: '52px', padding: '3px 6px' }} /></label>
          <label>p: <select value=${p} onChange=${e => setP(+e.target.value)}><option value="0">0 (no lg)</option><option value="1">1 (× lg n)</option></select></label>
        </span>`}
      </div>
      ${mode === 'master' ? html`<div className="avz-grid">
        <div className="avz-card">
          <h4><span>Level-by-Level Recursion Tree Breakdown</span><span>Height h = log_${b}(n)</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Depth d</th><th># Nodes (a^d)</th><th>Subproblem Size</th><th>Work per Node</th><th>Level Total Work</th></tr></thead>
              <tbody>
                ${[0, 1, 2].map(d => {
                  const nodes = Math.pow(a, d), div = Math.pow(b, d);
                  const factor = (nodes / Math.pow(div, k)).toFixed(2);
                  return html`<tr key=${d}>
                    <td><b>Level ${d}${d === 0 ? ' (Root)' : ''}</b></td>
                    <td>${nodes}</td>
                    <td>n / ${div}</td>
                    <td>(n/${div})^${k}</td>
                    <td><b>${factor} · n^${k}${p ? ' lg n' : ''}</b></td>
                  </tr>`;
                })}
                <tr><td><b>Level d</b></td><td>${a}^d</td><td>n / ${b}^d</td><td>(n/${b}^d)^${k}</td><td><b>(${a}/${ Math.pow(b, k).toFixed(1) })^d · n^${k}</b></td></tr>
                <tr><td><b>Leaves (d = log_${b} n)</b></td><td><b>n^(${logbaStr})</b></td><td>1</td><td>Θ(1)</td><td><b>Θ(n^(${logbaStr}))</b></td></tr>
              </tbody>
            </table>
          </div>
          <div className="avz-metrics">
            <span className="avz-metric">Watershed n^(log_b a): <b>n^(${logbaStr})</b></span>
            <span className="avz-metric">Driving f(n): <b>n^(${k})${p ? ' lg n' : ''}</b></span>
            <span className="avz-metric">Profile: <b>${dom}</b></span>
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Complete Mathematical Verdict & Derivation</span><span>${caseNum}</span></h4>
          <div style=${{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--k-compiler, #7c3aed)', marginBottom: '8px', fontFamily: 'var(--mono)' }}>
            T(n) = ${a}T(n/${b}) + n^(${k})${p ? ' lg n' : ''}  ⇒  ${sol}
          </div>
          <p style=${{ fontSize: '.86rem', lineHeight: 1.55, margin: '0 0 10px' }}>${verdict}</p>
          <div style=${{ padding: '8px 10px', borderRadius: '8px', background: 'var(--paper)', border: '1px solid var(--line)', fontSize: '.8rem', fontFamily: 'var(--mono)' }}>
            <b>Midterm Exact Recurrence Check:</b><br/>
            For T(1) = 50, T(n) = 4T(n/8) + 2n at n = 64:<br/>
            • T(8) = 4·T(1) + 2(8) = 4(50) + 16 = 216<br/>
            • T(64) = 4·T(8) + 2(64) = 4(216) + 128 = <b>992</b>
          </div>
        </div>
      </div>` : html`<div style=${{ padding: '14px 16px' }}>
        <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
          ${fibSteps.map(st => html`<div key=${st.step} className="avz-card" style=${{ borderColor: st.step === 4 ? '#16a34a' : 'var(--line)' }}>
            <h4><span>Step ${st.step} (Power n = ${st.pow})</span><span>F(${st.pow}) = ${st.M[0][1]}</span></h4>
            <div style=${{ fontFamily: 'var(--mono)', fontSize: '.92rem', textAlign: 'center', padding: '8px', background: 'var(--paper)', borderRadius: '8px', border: '1px solid var(--line)' }}>
              [ <b>${st.M[0][0]}</b> , <b style=${{ color: '#16a34a' }}>${st.M[0][1]}</b> ]<br/>
              [ <b style=${{ color: '#16a34a' }}>${st.M[1][0]}</b> , <b>${st.M[1][1]}</b> ]
            </div>
            <div style=${{ fontSize: '.78rem', color: 'var(--graphite)', marginTop: '6px' }}>${st.label}</div>
          </div>`)}
        </div>
      </div>`}
    </div>`;
  }

  /* ── 3. Hashing, Probing Sequences & Dynamic Table Doubling Amortized Simulator ── */
  const HASH_PRESETS = [
    { name: 'Midterm 2021 Q1: m = 10, h₂(k) = 5 − (k mod 5) [Key 55 Cycles!]', m: 10, R: 5, keys: '0, 30, 1, 55, 16, 28, 13, 9, 26' },
    { name: 'Midterm 2022 Q1: m = 11 (Prime), h₂(k) = 7 − (k mod 7) [All Succeed]', m: 11, R: 7, keys: '0, 30, 1, 55, 16, 28, 13, 9, 26' },
    { name: 'Midterm 2023 Credit Q4: m = 10, Keys [4371, 1323, 6173, 4199, 4344, 9679, 1989]', m: 10, R: 7, keys: '4371, 1323, 6173, 4199, 4344, 9679, 1989' },
    { name: 'Final 2 Q16: m = 10 Linear Probing Order [46, 34, 42, 23, 52, 33]', m: 10, R: 7, keys: '46, 34, 42, 23, 52, 33' }
  ];

  function solveAllHash(keysStr, m, R) {
    const keys = keysStr.split(/[\s,]+/).map(Number).filter(x => !Number.isNaN(x)).slice(0, 12);
    const lin = Array(m).fill('–'), quad = Array(m).fill('–'), dbl = Array(m).fill('–'), chain = Array.from({ length: m }, () => []);
    const logs = [];
    keys.forEach(k => {
      const h1 = ((k % m) + m) % m;
      const h2 = R - (k % R);
      chain[h1].push(k);
      let lSlot = 'FAIL', lPath = [];
      for (let i = 0; i < m; i++) { const s = (h1 + i) % m; lPath.push(s); if (lin[s] === '–') { lin[s] = k; lSlot = s; break; } }
      let qSlot = 'FAIL', qPath = [];
      for (let i = 0; i < m; i++) { const s = (h1 + i * i) % m; qPath.push(s); if (quad[s] === '–') { quad[s] = k; qSlot = s; break; } }
      let dSlot = 'CANNOT INSERT (Cycle!)', dPath = [];
      for (let i = 0; i < m; i++) { const s = (h1 + i * h2) % m; dPath.push(s); if (dbl[s] === '–') { dbl[s] = k; dSlot = s; break; } }
      logs.push({ k, h1, h2, lSlot, lPath: lPath.join('→'), qSlot, qPath: qPath.join('→'), dSlot, dPath: dPath.slice(0, 5).join('→') });
    });
    return { lin, quad, dbl, chain, logs };
  }

  function AlgoHashSim() {
    const [tab, setTab] = useState('probing');
    const [m, setM] = useState(10);
    const [R, setR] = useState(5);
    const [keysStr, setKeysStr] = useState(HASH_PRESETS[0].keys);
    const res = useMemo(() => solveAllHash(keysStr, m, R), [keysStr, m, R]);

    const amortRows = useMemo(() => {
      const rows = [];
      let cap = 1, bank = 0, totalActual = 0;
      for (let i = 1; i <= 10; i++) {
        const overflow = (i - 1) === cap && i > 1;
        const copyCost = overflow ? cap : 0;
        if (overflow) cap *= 2;
        const actual = copyCost + 1;
        totalActual += actual;
        bank = bank + 3 - actual;
        const phi = 2 * i - cap;
        rows.push({ i, cap, copyCost, actual, totalActual, bank, phi });
      }
      return rows;
    }, []);

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 3</span>Hashing Collision Resolution & Amortized Table Doubling Studio</div>
        <select className="fig-btn" onChange=${e => { const p = HASH_PRESETS[+e.target.value]; if (p) { setM(p.m); setR(p.R); setKeysStr(p.keys); setTab('probing'); } }}>
          ${HASH_PRESETS.map((p, i) => html`<option key=${i} value=${i}>${p.name}</option>`)}
        </select>
      </div>
      <div className="avz-bar">
        <button className=${'fig-btn' + (tab === 'probing' ? ' solid' : '')} onClick=${() => setTab('probing')}>4-Method Probing & Chaining Matrix</button>
        <button className=${'fig-btn' + (tab === 'amortized' ? ' solid' : '')} onClick=${() => setTab('amortized')}>Dynamic Table Doubling Amortized Analysis (1, 2, 4, 8, 16)</button>
        ${tab === 'probing' && html`<span style=${{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
          <label style=${{ fontSize: '.82rem' }}>Size m: <input type="number" min="5" max="17" value=${m} onInput=${e => setM(Math.max(5, Math.min(17, +e.target.value || 10)))} style=${{ width: '48px', padding: '4px' }} /></label>
          <label style=${{ fontSize: '.82rem' }}>Prime R (for h₂): <input type="number" min="3" max="13" value=${R} onInput=${e => setR(Math.max(3, +e.target.value || 5))} style=${{ width: '48px', padding: '4px' }} /></label>
          <input type="text" value=${keysStr} onInput=${e => setKeysStr(e.target.value)} style=${{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
        </span>`}
      </div>
      ${tab === 'probing' ? html`<div className="avz-grid">
        <div className="avz-card">
          <h4><span>Side-by-Side Final Hash Tables (m = ${m})</span><span>Load α = ${(res.logs.length / m).toFixed(2)}</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Slot</th><th>Linear (h+i)</th><th>Quadratic (h+i²)</th><th>Double (h₁+i·h₂)</th><th>Separate Chaining</th></tr></thead>
              <tbody>
                ${Array.from({ length: m }).map((_, s) => html`<tr key=${s}>
                  <td><b>[${s}]</b></td>
                  <td>${res.lin[s]}</td>
                  <td>${res.quad[s]}</td>
                  <td style=${{ fontWeight: 700 }}>${res.dbl[s]}</td>
                  <td>${res.chain[s].length ? res.chain[s].join(' → ') : '–'}</td>
                </tr>`)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Key-by-Key Probe Sequence Trace</span><span>h₂(k) = ${R} − (k mod ${R})</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Key k</th><th>h₁</th><th>h₂</th><th>Linear Probes</th><th>Quadratic Probes</th><th>Double Hashing</th></tr></thead>
              <tbody>
                ${res.logs.map((lg, i) => html`<tr key=${i}>
                  <td><b>${lg.k}</b></td><td>${lg.h1}</td><td>${lg.h2}</td>
                  <td>${lg.lPath} (<b>@${lg.lSlot}</b>)</td>
                  <td>${lg.qPath} (<b>@${lg.qSlot}</b>)</td>
                  <td style=${{ color: String(lg.dSlot).includes('CANNOT') ? 'var(--pen)' : 'inherit' }}>${lg.dPath} (<b>${lg.dSlot}</b>)</td>
                </tr>`)}
              </tbody>
            </table>
          </div>
        </div>
      </div>` : html`<div style=${{ padding: '14px 16px' }}>
        <div className="tbl" style=${{ margin: 0 }}>
          <table>
            <thead><tr><th>Insert # (i)</th><th>Table Size (size_i)</th><th>Rehash Copy Cost</th><th>Actual Cost (c_i)</th><th>Cumulative Cost (∑c_i &lt; 3i)</th><th>Bank Balance ($3/op)</th><th>Potential Φ = 2·i − size_i</th></tr></thead>
            <tbody>
              ${amortRows.map(r => html`<tr key=${r.i} style=${{ background: r.copyCost > 0 ? 'color-mix(in srgb, #f59e0b 14%, var(--paper))' : 'transparent' }}>
                <td><b>#${r.i}</b></td><td>${r.cap}</td><td>${r.copyCost ? r.copyCost + ' copies (Doubled!)' : '0'}</td>
                <td><b>${r.actual}</b></td><td>${r.totalActual} (≤ ${3 * r.i})</td>
                <td style=${{ color: '#16a34a', fontWeight: 700 }}>$${r.bank}</td><td>Φ = ${r.phi}</td>
              </tr>`)}
            </tbody>
          </table>
        </div>
      </div>`}
    </div>`;
  }

  /* ── 4. Red-Black Tree & Order-Statistic Tree Step-by-Step Visualizer ── */
  const RBT_PRESETS = [
    { name: 'Final 2016 Q4 & Final 5 Q4: Insert [2, 1, 4, 5, 9, 3, 6, 7]', keys: '2, 1, 4, 5, 9, 3, 6, 7' },
    { name: 'Final 2018 Q4 & Exam Examples Q7: Insert [5, 1, 4, 10, 9, 20, 6, 7]', keys: '5, 1, 4, 10, 9, 20, 6, 7' },
    { name: 'Lec 11 Slide 1: Insert [47, 32, 71, 93, 65, 82, 87]', keys: '47, 32, 71, 93, 65, 82, 87' },
    { name: 'Final Summer Q29: Insert [1, 2, 3, 4]', keys: '1, 2, 3, 4' },
    { name: 'Midterm 2023 Credit Q5: Insert [2, 1, 4, 5, 9]', keys: '2, 1, 4, 5, 9' }
  ];

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

  function AlgoRbtSim() {
    const [keysStr, setKeysStr] = useState(RBT_PRESETS[0].keys);
    const [step, setStep] = useState(0);
    const [selRank, setSelRank] = useState(3);
    const snaps = useMemo(() => buildRbtSnapshots(keysStr), [keysStr]);
    const idx = Math.min(step, Math.max(0, snaps.length - 1));
    const cur = snaps[idx] || { tree: null, title: 'Empty', detail: '' };

    useEffect(() => { setStep(Math.max(0, snaps.length - 1)); }, [keysStr]);

    const nodes = [], edges = [];
    const layout = (n, d, x0, x1) => {
      if (!n) return null;
      const x = (x0 + x1) / 2, y = 32 + d * 62;
      const me = { k: n.k, c: n.c, bh: n.bh, sz: n.sz, x, y };
      nodes.push(me);
      if (n.l) { const ch = layout(n.l, d + 1, x0, x); edges.push({ x1: x, y1: y, x2: ch.x, y2: ch.y }); }
      if (n.r) { const ch = layout(n.r, d + 1, x, x1); edges.push({ x1: x, y1: y, x2: ch.x, y2: ch.y }); }
      return me;
    };
    if (cur.tree) layout(cur.tree, 0, 20, 500);

    const osTrace = [];
    let osCur = cur.tree, remI = Math.max(1, Math.min(cur.tree ? cur.tree.sz : 1, selRank));
    while (osCur) {
      const leftSz = osCur.l ? osCur.l.sz : 0;
      const k = leftSz + 1;
      if (remI === k) { osTrace.push(`${osCur.k}(k=${k}==i → FOUND!)`); break; }
      else if (remI < k) { osTrace.push(`${osCur.k}(k=${k}>${remI} → Left)`); osCur = osCur.l; }
      else { osTrace.push(`${osCur.k}(k=${k}<${remI} → Right, i←${remI - k})`); remI -= k; osCur = osCur.r; }
    }

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 4</span>Red-Black Tree (Rotations, Color Fixup & Black-Height) + Order-Statistic Tree</div>
        <select className="fig-btn" onChange=${e => { const p = RBT_PRESETS[+e.target.value]; if (p) setKeysStr(p.keys); }}>
          ${RBT_PRESETS.map((p, i) => html`<option key=${i} value=${i}>${p.name}</option>`)}
        </select>
      </div>
      <div className="avz-bar">
        <input type="text" value=${keysStr} onInput=${e => setKeysStr(e.target.value)} style=${{ flex: 1, padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
        <button className="fig-btn" onClick=${() => setStep(0)} disabled=${idx === 0}>⏮ First</button>
        <button className="fig-btn" onClick=${() => setStep(Math.max(0, idx - 1))} disabled=${idx === 0}>‹ Prev Step</button>
        <button className="fig-btn" onClick=${() => setStep(Math.min(snaps.length - 1, idx + 1))} disabled=${idx >= snaps.length - 1}>Next Step ›</button>
        <button className="fig-btn solid" onClick=${() => setStep(snaps.length - 1)} disabled=${idx >= snaps.length - 1}>Final Tree ⏭</button>
        <span style=${{ fontSize: '.82rem', fontFamily: 'var(--mono)', fontWeight: 700 }}>Step ${idx + 1} / ${snaps.length}</span>
      </div>
      <div className="avz-grid">
        <div className="avz-card">
          <h4><span>${cur.title}</span><span>Each node shows: Key | bh | size</span></h4>
          <svg viewBox="0 0 520 270" style=${{ width: '100%', height: 'auto', background: 'var(--paper)', borderRadius: '8px', border: '1px solid var(--line)' }}>
            ${edges.map((e, i) => html`<line key=${i} x1=${e.x1} y1=${e.y1} x2=${e.x2} y2=${e.y2} stroke="var(--graphite)" strokeWidth="2" />`)}
            ${nodes.map(n => html`<g key=${n.k} transform=${`translate(${n.x},${n.y})`}>
              <circle r="20" fill=${n.c === 'R' ? '#dc2626' : '#1e293b'} stroke=${n.k === cur.focusKey ? '#f59e0b' : '#fff'} strokeWidth=${n.k === cur.focusKey ? '4' : '2'} />
              <text y="-2" textAnchor="middle" fill="#fff" fontWeight="700" fontSize="13">${n.k}</text>
              <text y="11" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">bh:${n.bh} sz:${n.sz}</text>
            </g>`)}
          </svg>
        </div>
        <div className="avz-card">
          <h4><span>Red-Black Invariants & Order-Statistic Tree Inspector</span><span>h ≤ 2 lg(n+1)</span></h4>
          <div style=${{ fontSize: '.83rem', lineHeight: 1.55, marginBottom: '10px' }}>
            <div>• <b>Nodes (n):</b> ${cur.tree ? cur.tree.sz : 0}  |  <b>Tree Height (h):</b> ${cur.tree ? cur.tree.h : 0}  |  <b>Max Bound 2 lg(n+1):</b> ${cur.tree ? (2 * Math.log2(cur.tree.sz + 1)).toFixed(2) : 0}</div>
            <div>• <b>Root Color:</b> ${cur.tree ? (cur.tree.c === 'B' ? 'BLACK ✓' : 'RED ✗') : '–'}  |  <b>Root Black-Height bh(root):</b> ${cur.tree ? cur.tree.bh : 0}</div>
          </div>
          <div style=${{ padding: '10px', borderRadius: '8px', background: 'var(--paper)', border: '1px solid var(--line)', fontSize: '.82rem' }}>
            <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <b>Lec 12 Dynamic Order Statistics: OS-SELECT(root, i)</b>
              <input type="number" min="1" max=${cur.tree ? cur.tree.sz : 1} value=${selRank} onInput=${e => setSelRank(+e.target.value || 1)} style=${{ width: '48px', padding: '2px 5px' }} />
            </div>
            <div style=${{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--k-compiler, #7c3aed)' }}>
              Path for i = ${selRank}: ${osTrace.join(' → ')}
            </div>
          </div>
        </div>
      </div>
      <div className="avz-explain"><b>Step ${idx + 1}:</b> ${cur.detail}</div>
    </div>`;
  }

  /* ── 5. Dynamic Programming Table & Optimal Backtrace Studio ── */
  const DP_PRESETS = [
    { name: 'Final 1 Q2: 0/1 vs Greedy Knapsack (W=5, Items: (1,9), (2,14), (3,13), (1,11))', mode: 'knap', W: 5, items: '1:9, 2:14, 3:13, 1:11' },
    { name: 'Final 2019 Credit Q6: 0/1 vs Greedy Knapsack (W=5, Items: (1,10), (2,15), (3,14), (1,12))', mode: 'knap', W: 5, items: '1:10, 2:15, 3:14, 1:12' },
    { name: 'Lec 14 Slide 32: 0/1 Knapsack (W=5, Items: (2,12), (1,10), (3,20), (2,15))', mode: 'knap', W: 5, items: '2:12, 1:10, 3:20, 2:15' },
    { name: 'Final 2016 Q5 & Lec 14: LCS ("ALGORITHM" vs "ALIGNMENT")', mode: 'lcs', s1: 'ALGORITHM', s2: 'ALIGNMENT' },
    { name: 'Lec 14 Slide 21: LCS ("PRESIDENT" vs "PROVIDENCE")', mode: 'lcs', s1: 'PRESIDENT', s2: 'PROVIDENCE' },
    { name: 'Lec 14 Slide 9 & Exam Examples Q9: Coin-Row [5, 1, 2, 10, 6, 2]', mode: 'coinrow', coins: '5, 1, 2, 10, 6, 2' }
  ];

  function AlgoDpSim() {
    const [mode, setMode] = useState('knap');
    const [W, setW] = useState(5);
    const [itemsStr, setItemsStr] = useState(DP_PRESETS[0].items);
    const [s1, setS1] = useState('ALGORITHM');
    const [s2, setS2] = useState('ALIGNMENT');
    const [coinsStr, setCoinsStr] = useState('5, 1, 2, 10, 6, 2');
    const [selCell, setSelCell] = useState([4, 5]);

    const knapData = useMemo(() => {
      const its = itemsStr.split(/[\s,]+/).map((p, idx) => { const [w, v] = p.split(':').map(Number); return { id: idx + 1, w: w || 1, v: v || 1 }; });
      const n = its.length;
      const V = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
      for (let i = 1; i <= n; i++) {
        const { w, v } = its[i - 1];
        for (let j = 0; j <= W; j++) {
          V[i][j] = j < w ? V[i - 1][j] : Math.max(V[i - 1][j], v + V[i - 1][j - w]);
        }
      }
      const chosen = new Set(), chosenIds = [];
      let cw = W;
      for (let i = n; i >= 1; i--) {
        chosen.add(i + ':' + cw);
        if (V[i][cw] !== V[i - 1][cw]) { chosenIds.unshift(its[i - 1].id); cw -= its[i - 1].w; }
      }
      chosen.add('0:' + cw);
      const greedySorted = its.slice().sort((a, b) => b.v - a.v);
      let gw = 0, gv = 0, gIds = [];
      greedySorted.forEach(it => { if (gw + it.w <= W) { gw += it.w; gv += it.v; gIds.push(it.id); } });
      return { its, V, chosen, chosenIds, dpMax: V[n][W], gv, gIds };
    }, [itemsStr, W]);

    const lcsData = useMemo(() => {
      const A = (s1 || 'ALGORITHM').toUpperCase().slice(0, 12), B = (s2 || 'ALIGNMENT').toUpperCase().slice(0, 12);
      const m = A.length, n = B.length;
      const L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
      const dir = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''));
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (A[i - 1] === B[j - 1]) { L[i][j] = L[i - 1][j - 1] + 1; dir[i][j] = '↖'; }
          else if (L[i - 1][j] >= L[i][j - 1]) { L[i][j] = L[i - 1][j]; dir[i][j] = '↑'; }
          else { L[i][j] = L[i][j - 1]; dir[i][j] = '←'; }
        }
      }
      const path = new Set();
      let i = m, j = n, seq = '';
      while (i > 0 && j > 0) {
        path.add(i + ':' + j);
        if (A[i - 1] === B[j - 1]) { seq = A[i - 1] + seq; i--; j--; }
        else if (L[i - 1][j] >= L[i][j - 1]) i--;
        else j--;
      }
      return { A, B, L, dir, path, seq };
    }, [s1, s2]);

    const coinData = useMemo(() => {
      const C = coinsStr.split(/[\s,]+/).map(Number).filter(x => !Number.isNaN(x));
      const F = Array(C.length + 1).fill(0);
      if (C.length) F[1] = C[0];
      for (let i = 2; i <= C.length; i++) F[i] = Math.max(C[i - 1] + F[i - 2], F[i - 1]);
      const picked = [];
      let i = C.length;
      while (i >= 1) {
        if (i === 1 || C[i - 1] + F[i - 2] > F[i - 1]) { picked.unshift(`c_${i}=${C[i - 1]}`); i -= 2; }
        else i--;
      }
      return { C, F, picked };
    }, [coinsStr]);

    const [ri, rj] = selCell;
    const safeI = Math.min(ri, knapData.its.length), safeJ = Math.min(rj, W);
    const curIt = safeI >= 1 ? knapData.its[safeI - 1] : null;

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 5</span>Dynamic Programming Table & Backtrace Studio (Knapsack, LCS & Coin-Row)</div>
        <select className="fig-btn" onChange=${e => {
          const p = DP_PRESETS[+e.target.value];
          if (!p) return;
          setMode(p.mode);
          if (p.W) setW(p.W);
          if (p.items) setItemsStr(p.items);
          if (p.s1) { setS1(p.s1); setS2(p.s2); }
          if (p.coins) setCoinsStr(p.coins);
        }}>
          ${DP_PRESETS.map((p, i) => html`<option key=${i} value=${i}>${p.name}</option>`)}
        </select>
      </div>
      <div className="avz-bar">
        ${[['knap', '0/1 Knapsack vs. Greedy'], ['lcs', 'Longest Common Subsequence (LCS)'], ['coinrow', 'Coin-Row Problem']].map(([id, label]) =>
          html`<button key=${id} className=${'fig-btn' + (mode === id ? ' solid' : '')} onClick=${() => setMode(id)}>${label}</button>`)}
        ${mode === 'knap' && html`<span style=${{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
          <label style=${{ fontSize: '.82rem' }}>W: <input type="number" min="3" max="10" value=${W} onInput=${e => setW(Math.max(3, Math.min(10, +e.target.value || 5)))} style=${{ width: '48px', padding: '4px' }} /></label>
          <input type="text" value=${itemsStr} onInput=${e => setItemsStr(e.target.value)} style=${{ flex: 1, padding: '4px 8px', fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
        </span>`}
        ${mode === 'lcs' && html`<span style=${{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
          <input type="text" value=${s1} onInput=${e => setS1(e.target.value)} style=${{ width: '130px', padding: '4px 8px', fontFamily: 'var(--mono)' }} />
          <input type="text" value=${s2} onInput=${e => setS2(e.target.value)} style=${{ width: '130px', padding: '4px 8px', fontFamily: 'var(--mono)' }} />
        </span>`}
      </div>
      ${mode === 'knap' && html`<div className="avz-grid">
        <div className="avz-card">
          <h4><span>0/1 Knapsack DP Table V[i, w] (Click any cell to inspect recurrence!)</span><span>Gold = Backtrace Path</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Item / w</th>${Array.from({ length: W + 1 }).map((_, w) => html`<th key=${w}>w=${w}</th>`)}</tr></thead>
              <tbody>
                ${knapData.V.map((row, i) => html`<tr key=${i}>
                  <td><b>${i === 0 ? 'i=0 (∅)' : `i=${i} (w=${knapData.its[i-1].w}, v=${knapData.its[i-1].v})`}</b></td>
                  ${row.map((val, w) => {
                    const isSel = i === safeI && w === safeJ;
                    const isBack = knapData.chosen.has(i + ':' + w);
                    return html`<td key=${w} onClick=${() => setSelCell([i, w])} style=${{
                      cursor: 'pointer', fontWeight: isSel || isBack ? 700 : 400,
                      background: isSel ? 'color-mix(in srgb, #7c3aed 26%, var(--paper))' : isBack ? 'color-mix(in srgb, #f59e0b 24%, var(--paper))' : 'transparent'
                    }}>${val}</td>`;
                  })}
                </tr>`)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Selected Cell Recurrence & Exam Comparison</span><span>Cell V[${safeI}, ${safeJ}] = ${knapData.V[safeI][safeJ]}</span></h4>
          <div style=${{ padding: '10px', borderRadius: '8px', background: 'var(--paper)', border: '1px solid var(--line)', fontSize: '.84rem', fontFamily: 'var(--mono)', marginBottom: '10px' }}>
            ${safeI === 0 ? 'Base Case: V[0, w] = 0 (0 items).' : safeJ < curIt.w
              ? `Since w (${safeJ}) < w_${safeI} (${curIt.w}), item ${safeI} cannot fit:\nV[${safeI}, ${safeJ}] = V[${safeI-1}, ${safeJ}] = ${knapData.V[safeI][safeJ]}`
              : `V[${safeI}, ${safeJ}] = max( V[${safeI-1}, ${safeJ}], v_${safeI} + V[${safeI-1}, ${safeJ}-${curIt.w}] )\n= max( ${knapData.V[safeI-1][safeJ]}, ${curIt.v} + ${knapData.V[safeI-1][safeJ - curIt.w]} ) = ${knapData.V[safeI][safeJ]}`}
          </div>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Method (Final Exam Fill-in Format)</th><th>Items Picked</th><th>Max Value</th><th>Time Complexity</th></tr></thead>
              <tbody>
                <tr><td><b>Dynamic Programming (Optimal)</b></td><td><b>{ ${knapData.chosenIds.join(', ')} }</b></td><td><b style=${{ color: '#16a34a' }}>${knapData.dpMax}</b></td><td>Θ(n·W)</td></tr>
                <tr><td><b>Greedy (by Max Value)</b></td><td>{ ${knapData.gIds.join(', ')} }</td><td>${knapData.gv}</td><td>Θ(n log n)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`}
      ${mode === 'lcs' && html`<div style=${{ padding: '14px 16px' }}>
        <div style=${{ marginBottom: '8px', fontSize: '.9rem' }}><b>LCS("${lcsData.A}", "${lcsData.B}") = "${lcsData.seq}" (Length = ${lcsData.seq.length})</b> — Highlighted cells trace the optimal backtrace path from (${lcsData.A.length}, ${lcsData.B.length}) to (0, 0).</div>
        <div className="tbl" style=${{ margin: 0, overflowX: 'auto' }}>
          <table>
            <thead><tr><th>i \\ j</th><th>0</th>${lcsData.B.split('').map((ch, j) => html`<th key=${j}>${j+1}:${ch}</th>`)}</tr></thead>
            <tbody>
              ${lcsData.L.map((row, i) => html`<tr key=${i}>
                <td><b>${i === 0 ? '0' : `${i}:${lcsData.A[i-1]}`}</b></td>
                ${row.map((v, j) => html`<td key=${j} style=${{
                  background: lcsData.path.has(i + ':' + j) ? 'color-mix(in srgb, #f59e0b 26%, var(--paper))' : 'transparent',
                  fontWeight: lcsData.path.has(i + ':' + j) ? 700 : 400
                }}>${lcsData.dir[i][j]}${v}</td>`)}
              </tr>`)}
            </tbody>
          </table>
        </div>
      </div>`}
      ${mode === 'coinrow' && html`<div style=${{ padding: '14px 16px' }}>
        <div style=${{ marginBottom: '8px' }}>
          <label style=${{ fontSize: '.85rem' }}>Coins c₁..cₙ: <input type="text" value=${coinsStr} onInput=${e => setCoinsStr(e.target.value)} style=${{ width: '260px', padding: '4px 8px', fontFamily: 'var(--mono)' }} /></label>
        </div>
        <div className="tbl" style=${{ margin: 0 }}>
          <table>
            <thead><tr><th>Index i</th><th>0</th>${coinData.C.map((_, i) => html`<th key=${i}>${i + 1}</th>`)}</tr></thead>
            <tbody>
              <tr><td><b>Coin Value c_i</b></td><td>–</td>${coinData.C.map((c, i) => html`<td key=${i}>${c}</td>`)}</tr>
              <tr><td><b>DP F(i) = max(c_i + F(i−2), F(i−1))</b></td>${coinData.F.map((f, i) => html`<td key=${i}><b>${f}</b></td>`)}</tr>
            </tbody>
          </table>
        </div>
        <div style=${{ marginTop: '10px', fontSize: '.9rem' }}><b>Optimal Selection (No Adjacent Coins):</b> { ${coinData.picked.join(', ')} } → <b>Maximum Total = ${coinData.F[coinData.C.length]}</b></div>
      </div>`}
    </div>`;
  }

  /* ── 6. Greedy & Graph Studio: Dr. Basheer's Dijkstra Table, Prim, Kruskal & Huffman ── */
  function AlgoGraphSim() {
    const [mode, setMode] = useState('dijkstra19');
    const [step, setStep] = useState(6);

    const lec19Rows = [
      { s: 'Init (Start A)', u: 'A(0)', vals: ['0', '-', '-', '-', '-', '-', '-'], par: ['–', '–', '–', '–', '–', '–', '–'], note: 'Initialize d[A] = 0 and all other vertices to ∞ (-).' },
      { s: 'Step 1: Extract A(0)', u: 'C(3)', vals: ['', '5', '3', '-', '-', '-', '-'], par: ['–', 'A', 'A', '–', '–', '–', '–'], note: 'Relax A→B (d[B]=5, p=A) and A→C (d[C]=3, p=A). Next min is C(3).' },
      { s: 'Step 2: Extract C(3)', u: 'B(5)', vals: ['', '5', '', '10', '10', '-', '-'], par: ['–', 'A', 'A', 'C', 'C', '–', '–'], note: 'Relax C→D (d[D]=3+7=10, p=C) and C→E (d[E]=3+7=10, p=C). Next min is B(5).' },
      { s: 'Step 3: Extract B(5)', u: 'G(6)', vals: ['', '', '', '10', '8', '-', '6'], par: ['–', 'A', 'A', 'C', 'B', '–', 'B'], note: 'Relax B→G (d[G]=5+1=6, p=B) and B→E (improves d[E] from 10 to 5+3=8, p=B!). Next min is G(6).' },
      { s: 'Step 4: Extract G(6)', u: 'E(7)', vals: ['', '', '', '10', '7', '-', ''], par: ['–', 'A', 'A', 'C', 'G', '–', 'B'], note: 'Relax G→E (improves d[E] from 8 to 6+1=7, p=G!). Next min is E(7).' },
      { s: 'Step 5: Extract E(7)', u: 'F(8)', vals: ['', '', '', '9', '', '8', ''], par: ['–', 'A', 'A', 'E', 'G', 'E', 'B'], note: 'Relax E→D (improves d[D] from 10 to 7+2=9, p=E!) and E→F (d[F]=7+1=8, p=E). Next min is F(8).' },
      { s: 'Step 6: Extract F(8) & D(9)', u: 'Done', vals: ['', '', '', '9', '', '', ''], par: ['–', 'A', 'A', 'E', 'G', 'E', 'B'], note: 'All vertices settled! Final paths: AC=3, AB=5, ABG=6, ABGE=7, ABGEF=8, ABGED=9.' }
    ];

    const idx = Math.min(step, lec19Rows.length - 1);
    const cur = lec19Rows[idx];

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 6</span>Graph & Greedy Studio: Dr. Basheer's Dijkstra Table, Prim vs. Kruskal MST & Huffman</div>
      </div>
      <div className="avz-bar">
        <button className=${'fig-btn' + (mode === 'dijkstra19' ? ' solid' : '')} onClick=${() => setMode('dijkstra19')}>Lec 19 & Final 2019: Dr. Basheer's Dijkstra Table</button>
        <button className=${'fig-btn' + (mode === 'mid2023' ? ' solid' : '')} onClick=${() => setMode('mid2023')}>Midterm 2023: Prim's MST & Dijkstra 16-Question Table</button>
        <button className=${'fig-btn' + (mode === 'mst2021' ? ' solid' : '')} onClick=${() => setMode('mst2021')}>Final 2021 Q17–18: Prim vs. Kruskal + Huffman</button>
      </div>
      ${mode === 'dijkstra19' && html`<div style=${{ padding: '14px 16px' }}>
        <div style=${{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          <button className="fig-btn" onClick=${() => setStep(Math.max(0, idx - 1))} disabled=${idx === 0}>‹ Previous Row</button>
          <button className="fig-btn solid" onClick=${() => setStep(Math.min(lec19Rows.length - 1, idx + 1))} disabled=${idx >= lec19Rows.length - 1}>Next Relaxation Row ›</button>
          <button className="fig-btn" onClick=${() => setStep(lec19Rows.length - 1)}>Show Full Exam Table</button>
          <span style=${{ fontFamily: 'var(--mono)', fontSize: '.82rem', fontWeight: 700 }}>Row ${idx + 1} / ${lec19Rows.length}</span>
        </div>
        <div className="tbl" style=${{ margin: 0 }}>
          <table>
            <thead>
              <tr style=${{ background: 'color-mix(in srgb, #2563eb 18%, var(--paper))' }}>
                <th>PARENT</th><th>(Source)</th>${['B', 'C', 'D', 'E', 'F', 'G'].map((v, i) => html`<th key=${v}>${cur.par[i + 1]}</th>`)}
              </tr>
              <tr><th>Step #</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th></tr>
            </thead>
            <tbody>
              ${lec19Rows.slice(0, idx + 1).map((r, ri) => html`<tr key=${ri} style=${{ background: ri === idx ? 'color-mix(in srgb, #f59e0b 18%, var(--paper))' : 'transparent' }}>
                <td><b>${r.s}</b></td>
                ${r.vals.map((v, vi) => html`<td key=${vi}><b>${v}</b></td>`)}
              </tr>`)}
            </tbody>
          </table>
        </div>
        <div className="avz-explain" style=${{ margin: '12px 0 0' }}>
          <b>${cur.s}:</b> ${cur.note}
        </div>
      </div>`}
      ${mode === 'mid2023' && html`<div className="avz-grid">
        <div className="avz-card">
          <h4><span>Midterm 2023 Qa: Prim's MST from Node 2 (Q1–Q8)</span><span>Undirected</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Step</th><th>Set S</th><th>Active d[i] (i ∉ S)</th><th>∑ d[i]</th><th>Active p[i] (i ∉ S)</th><th>∑ p[i]</th></tr></thead>
              <tbody>
                <tr><td>1st</td><td>{2}</td><td>d[0]=7, d[1]=8, d[3]=5, d[5]=10</td><td>30</td><td>p[0]=2, p[1]=2, p[3]=2, p[5]=2</td><td>8</td></tr>
                <tr><td><b>2nd (Q1–2)</b></td><td>{2,3}</td><td>d[0]=7, d[1]=2, d[4]=4, d[5]=1</td><td><b>14 (C)</b></td><td>p[0]=2, p[1]=3, p[4]=3, p[5]=3</td><td><b>11 (D)</b></td></tr>
                <tr><td><b>3rd (Q3–4)</b></td><td>{2,3,5}</td><td>d[0]=7, d[1]=2, d[4]=4</td><td><b>13 (B)</b></td><td>p[0]=2, p[1]=3, p[4]=3</td><td><b>8 (B)</b></td></tr>
                <tr><td><b>4th (Q5–6)</b></td><td>{2,3,5,1}</td><td>d[0]=3, d[4]=4</td><td><b>7 (A)</b></td><td>p[0]=1, p[4]=3</td><td><b>4 (B)</b></td></tr>
                <tr><td><b>5th (Q7–8)</b></td><td>{2,3,5,1,0}</td><td>d[4]=4</td><td><b>4 (B)</b></td><td>p[4]=3</td><td><b>3 (C)</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Midterm 2023 Qb: Dijkstra from Node 2 (Q9–Q16)</span><span>Directed</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Step</th><th>Set S</th><th>Active d[i] (i ∉ S)</th><th>∑ d[i]</th><th>Active p[i] (i ∉ S)</th><th>∑ p[i]</th></tr></thead>
              <tbody>
                <tr><td>1st</td><td>{2}</td><td>d[0]=4, d[1]=8, d[3]=5, d[5]=2</td><td>19</td><td>p[0]=2, p[1]=2, p[3]=2, p[5]=2</td><td>8</td></tr>
                <tr><td><b>2nd (Q9–10)</b></td><td>{2,5}</td><td>d[0]=4, d[1]=8, d[3]=3, d[4]=7</td><td><b>22 (D)</b></td><td>p[0]=2, p[1]=2, p[3]=5, p[4]=5</td><td><b>14 (D)</b></td></tr>
                <tr><td><b>3rd (Q11–12)</b></td><td>{2,5,3}</td><td>d[0]=4, d[1]=5, d[4]=7</td><td><b>16 (D)</b></td><td>p[0]=2, p[1]=3, p[4]=5</td><td><b>10 (E)</b></td></tr>
                <tr><td><b>4th (Q13–14)</b></td><td>{2,5,3,0}</td><td>d[1]=5, d[4]=7</td><td><b>12 (E)</b></td><td>p[1]=3, p[4]=5</td><td><b>8 (E)</b></td></tr>
                <tr><td><b>5th (Q15–16)</b></td><td>{2,5,3,0,1}</td><td>d[4]=6</td><td><b>6 (D)</b></td><td>p[4]=1</td><td><b>1 (B)</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`}
      ${mode === 'mst2021' && html`<div className="avz-grid">
        <div className="avz-card">
          <h4><span>Final 2021 Q17–18: Prim's vs. Kruskal's Edge Order</span><span>Total MST Weight = 11</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Step</th><th>Prim's MST (Single Tree from A)</th><th>Kruskal's MST (Global Sorted Forest)</th></tr></thead>
              <tbody>
                <tr><td>1</td><td><b>(A, G)</b> weight 1  [S = {A,G}]</td><td><b>(A, G)</b> weight 1  [{A,G}]</td></tr>
                <tr><td>2</td><td><b>(A, B)</b> weight 2  [S = {A,G,B}]</td><td><b>(B, C)</b> weight 1  [{A,G}, {B,C}]</td></tr>
                <tr><td>3</td><td><b>(B, C)</b> weight 1  [S = {A,G,B,C}]</td><td><b>(E, F)</b> weight 1  [{A,G}, {B,C}, {E,F}]</td></tr>
                <tr><td>4</td><td><b>(A, D)</b> weight 3  [S = {A,G,B,C,D}]</td><td><b>(A, B)</b> weight 2  [{A,B,C,G}, {E,F}]</td></tr>
                <tr><td>5</td><td><b>(C, F)</b> weight 3  [S = {A,G,B,C,D,F}]</td><td><b>(C, F)</b> weight 3  [{A,B,C,E,F,G}]</td></tr>
                <tr><td>6</td><td><b>(F, E)</b> weight 1  [All 7 connected!]</td><td><b>(D, E) / (A, D)</b> weight 3–5</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Final 2018 Q5/Q8: Huffman Coding Tree (A=20..F=22)</span><span>Total Cost = 241 bits</span></h4>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Char</th><th>Freq</th><th>Codeword</th><th>Bits (f × d)</th><th>Merge Sequence</th></tr></thead>
              <tbody>
                <tr><td><b>A</b></td><td>20</td><td><code>00</code></td><td>20 × 2 = 40</td><td>1. D(5)+E(8) = DE(13)</td></tr>
                <tr><td><b>F</b></td><td>22</td><td><code>01</code></td><td>22 × 2 = 44</td><td>2. DE(13)+C(15) = DEC(28)</td></tr>
                <tr><td><b>B</b></td><td>30</td><td><code>11</code></td><td>30 × 2 = 60</td><td>3. A(20)+F(22) = AF(42)</td></tr>
                <tr><td><b>C</b></td><td>15</td><td><code>101</code></td><td>15 × 3 = 45</td><td>4. DEC(28)+B(30) = DECB(58)</td></tr>
                <tr><td><b>D</b></td><td>5</td><td><code>1000</code></td><td>5 × 4 = 20</td><td>5. AF(42)+DECB(58) = 100</td></tr>
                <tr><td><b>E</b></td><td>8</td><td><code>1001</code></td><td>8 × 4 = 32</td><td><b>Avg = 2.41 bits/char</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`}
    </div>`;
  }

  /* ── 7. P, NP, NP-Complete & 3-CNF SAT → CLIQUE Reduction Visualizer (Lec 20) ── */
  function AlgoNpSim() {
    const [x1, setX1] = useState(true);
    const [x2, setX2] = useState(false);
    const [x3, setX3] = useState(true);

    const clauses = [
      { id: 'C1', lits: [{ id: 'c1_0', label: 'x₁', val: x1, var: 'x1', neg: false, x: 90, y: 42 }, { id: 'c1_1', label: '¬x₂', val: !x2, var: 'x2', neg: true, x: 190, y: 30 }, { id: 'c1_2', label: 'x₃', val: x3, var: 'x3', neg: false, x: 290, y: 42 }] },
      { id: 'C2', lits: [{ id: 'c2_0', label: '¬x₁', val: !x1, var: 'x1', neg: true, x: 60, y: 145 }, { id: 'c2_1', label: 'x₂', val: x2, var: 'x2', neg: false, x: 60, y: 215 }] },
      { id: 'C3', lits: [{ id: 'c3_0', label: '¬x₂', val: !x2, var: 'x2', neg: true, x: 320, y: 145 }, { id: 'c3_1', label: 'x₃', val: x3, var: 'x3', neg: false, x: 320, y: 215 }] }
    ];

    const picked = clauses.map(c => c.lits.find(l => l.val) || null);
    const allSat = picked.every(Boolean);
    const pickedIds = new Set(picked.filter(Boolean).map(l => l.id));

    const edges = [];
    for (let i = 0; i < clauses.length; i++) {
      for (let j = i + 1; j < clauses.length; j++) {
        clauses[i].lits.forEach(u => {
          clauses[j].lits.forEach(v => {
            if (!(u.var === v.var && u.neg !== v.neg)) {
              const inClique = allSat && pickedIds.has(u.id) && pickedIds.has(v.id);
              edges.push({ u, v, inClique });
            }
          });
        });
      }
    }

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 7</span>Lecture 20: Polynomial-Time Reduction 3-CNF SAT ≤_P k-CLIQUE Visualizer</div>
      </div>
      <div className="avz-bar">
        <span style=${{ fontWeight: 700, fontSize: '.86rem' }}>Formula φ = (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂) ∧ (¬x₂ ∨ x₃):</span>
        <button className=${'fig-btn' + (x1 ? ' solid' : '')} onClick=${() => setX1(!x1)}>x₁ = ${x1 ? 'TRUE' : 'FALSE'}</button>
        <button className=${'fig-btn' + (x2 ? ' solid' : '')} onClick=${() => setX2(!x2)}>x₂ = ${x2 ? 'TRUE' : 'FALSE'}</button>
        <button className=${'fig-btn' + (x3 ? ' solid' : '')} onClick=${() => setX3(!x3)}>x₃ = ${x3 ? 'TRUE' : 'FALSE'}</button>
        <span className="avz-badge" style=${{ background: allSat ? '#16a34a' : '#dc2626', color: '#fff' }}>
          ${allSat ? '✓ φ = TRUE ⟺ 3-Clique Exists!' : '✗ Clause Unsatisfied (No 3-Clique)'}
        </span>
      </div>
      <div className="avz-grid">
        <div className="avz-card">
          <h4><span>Constructed Reduction Graph G (k = 3 Clauses)</span><span>Gold Triangle = 3-Clique</span></h4>
          <svg viewBox="0 0 380 255" style=${{ width: '100%', height: 'auto', background: 'var(--paper)', borderRadius: '8px', border: '1px solid var(--line)' }}>
            ${edges.map((e, i) => html`<line key=${i} x1=${e.u.x} y1=${e.u.y} x2=${e.v.x} y2=${e.v.y}
              stroke=${e.inClique ? '#f59e0b' : 'var(--line)'} strokeWidth=${e.inClique ? '3.5' : '1.2'} opacity=${e.inClique ? 1 : 0.65} />`)}
            ${clauses.flatMap(c => c.lits).map(l => html`<g key=${l.id} transform=${`translate(${l.x},${l.y})`}>
              <circle r="19" fill=${pickedIds.has(l.id) ? '#16a34a' : l.val ? '#0284c7' : '#64748b'} stroke=${pickedIds.has(l.id) ? '#f59e0b' : '#fff'} strokeWidth="3" />
              <text y="4" textAnchor="middle" fill="#fff" fontWeight="700" fontSize="12">${l.label}</text>
            </g>`)}
          </svg>
        </div>
        <div className="avz-card">
          <h4><span>Reduction Construction Rules (Slides 20.34–20.36)</span><span>O(k²) Time</span></h4>
          <ul style=${{ fontSize: '.84rem', lineHeight: 1.55, paddingLeft: '18px', margin: 0 }}>
            <li><b>Step 1 (Vertices)</b>: Each clause $C_1, C_2, C_3$ forms a vertex group (one vertex per literal).</li>
            <li><b>Step 2 (Non-Contradictory Inter-Clause Edges)</b>: Connect $u \in C_r$ and $v \in C_s$ ($r \ne s$) <b>iff they are NOT negations</b> ($u \ne \neg v$). For example, $x_1 \in C_1$ is NOT connected to $\neg x_1 \in C_2$.</li>
            <li><b>Step 3 (Equivalence Proof)</b>: When $\phi$ is satisfied, picking one TRUE literal from each of the $k=3$ clauses selects $3$ mutually consistent vertices across different clauses, which are all connected to each other—forming a <b>Clique of size $k=3$</b>!</li>
          </ul>
        </div>
      </div>
    </div>`;
  }

  /* ── 8. Bit Manipulation, Circular Rotate & Kernighan Popcount Visualizer (Labs 1 & 2) ── */
  function AlgoBitSim() {
    const [nVal, setNVal] = useState(41);
    const [dShift, setDShift] = useState(2);
    const [bitI, setBitI] = useState(3);

    const n6 = Math.max(0, Math.min(63, nVal));
    const bin6 = v => (v & 0x3F).toString(2).padStart(6, '0');
    const rShift = (n6 >> dShift) & 0x3F;
    const lComp = (n6 << (6 - dShift)) & 0x3F;
    const rotR = rShift | lComp;
    const lShift = (n6 << dShift) & 0x3F;
    const rComp = (n6 >> (6 - dShift)) & 0x3F;
    const rotL = lShift | rComp;

    const kernSteps = [];
    let tmp = n6;
    while (tmp > 0) {
      const prev = tmp, minus1 = tmp - 1, next = tmp & minus1;
      kernSteps.push({ prev: bin6(prev), minus1: bin6(minus1), next: bin6(next), decPrev: prev, decNext: next });
      tmp = next;
    }

    return html`<div className="avz">
      <div className="avz-head">
        <div className="avz-title"><span className="avz-badge">Deep Trace Engine 8</span>Labs 1 & 2: Bit Manipulation, Circular Rotate & Kernighan's n & (n − 1) Inspector</div>
      </div>
      <div className="avz-bar">
        <label style=${{ fontSize: '.84rem' }}>6-Bit Number N (0..63): <input type="number" min="0" max="63" value=${n6} onInput=${e => setNVal(+e.target.value || 0)} style=${{ width: '58px', padding: '4px' }} /></label>
        <label style=${{ fontSize: '.84rem' }}>Rotate d (1..5): <input type="number" min="1" max="5" value=${dShift} onInput=${e => setDShift(Math.max(1, Math.min(5, +e.target.value || 2)))} style=${{ width: '48px', padding: '4px' }} /></label>
        <label style=${{ fontSize: '.84rem' }}>Test Bit i (0..5): <input type="number" min="0" max="5" value=${bitI} onInput=${e => setBitI(Math.max(0, Math.min(5, +e.target.value || 0)))} style=${{ width: '48px', padding: '4px' }} /></label>
        <button className="fig-btn" onClick=${() => { setNVal(41); setDShift(2); }}>Lab 1 Preset: N = 41 (101001)₂, d = 2</button>
        <button className="fig-btn" onClick=${() => setNVal(16)}>Power-of-2 Preset: N = 16 (010000)₂</button>
      </div>
      <div className="avz-grid">
        <div className="avz-card">
          <h4><span>6-Bit Register & Circular Shifts (Lab 1 PDF pp. 2–3)</span><span>N = ${n6} = (${bin6(n6)})₂</span></h4>
          <div className="avz-cells" style=${{ padding: '6px 0' }}>
            ${bin6(n6).split('').map((b, idx) => {
              const bitPos = 5 - idx;
              return html`<div key=${idx} className=${'avz-cell ' + (b === '1' ? 'sorted' : '') + (bitPos === bitI ? ' active' : '')}>
                <span className="v">${b}</span>
                <span className="idx">2^${bitPos}</span>
              </div>`;
            })}
          </div>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Operation</th><th>Step 1</th><th>Step 2</th><th>OR Result (| )</th></tr></thead>
              <tbody>
                <tr><td><b>Circular Right (d=${dShift})</b></td><td>N &gt;&gt; ${dShift} = <code>${bin6(rShift)}</code></td><td>N &lt;&lt; ${6-dShift} = <code>${bin6(lComp)}</code></td><td><b><code>${bin6(rotR)}</code> (${rotR})</b></td></tr>
                <tr><td><b>Circular Left (d=${dShift})</b></td><td>N &lt;&lt; ${dShift} = <code>${bin6(lShift)}</code></td><td>N &gt;&gt; ${6-dShift} = <code>${bin6(rComp)}</code></td><td><b><code>${bin6(rotL)}</code> (${rotL})</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="avz-card">
          <h4><span>Kernighan's Popcount & Power-of-2 Inspector</span><span>Set Bits = ${kernSteps.length}</span></h4>
          <div style=${{ fontSize: '.83rem', marginBottom: '8px' }}>
            • <b>Power of 2 Check <code>N &amp;&amp; !(N &amp; (N-1))</code>:</b> <b style=${{ color: (n6 && !(n6 & (n6 - 1))) ? '#16a34a' : '#dc2626' }}>${(n6 && !(n6 & (n6 - 1))) ? 'TRUE (Exactly one 1-bit!)' : 'FALSE'}</b><br/>
            • <b>Check ${bitI}-th Bit <code>N &amp; (1 &lt;&lt; ${bitI})</code>:</b> <code>${bin6(n6)} &amp; ${bin6(1 << bitI)}</code> = <b>${(n6 & (1 << bitI)) ? '1 (SET)' : '0 (CLEAR)'}</b>
          </div>
          <div className="tbl" style=${{ margin: 0 }}>
            <table>
              <thead><tr><th>Iter</th><th>n</th><th>n − 1</th><th>n &amp; (n − 1) (Clears lowest 1)</th></tr></thead>
              <tbody>
                ${kernSteps.map((s, i) => html`<tr key=${i}>
                  <td><b>#${i + 1}</b></td><td><code>${s.prev}</code> (${s.decPrev})</td><td><code>${s.minus1}</code></td><td><b><code>${s.next}</code> (${s.decNext})</b></td>
                </tr>`)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ── 9. Unified Master Algorithm Visualizer Studio (All 8 Engines in One Workbench) ── */
  function AlgoMasterStudio() {
    const [engine, setEngine] = useState('sort');
    const ENGINES = [
      ['sort', '1. Sorting, Partitioning, Counting Sort & Quickselect'],
      ['rec', '2. Recursion Trees, Master Theorem & Matrix Squaring'],
      ['hash', '3. Hashing (4 Methods) & Amortized Table Doubling'],
      ['rbt', '4. Red-Black Trees & Dynamic Order Statistics'],
      ['dp', '5. Dynamic Programming (Knapsack, LCS, Coin-Row)'],
      ['graph', '6. Graph & Greedy (Dr. Basheer Dijkstra, Prim, Kruskal, Huffman)'],
      ['np', '7. P vs. NP & 3-CNF SAT → CLIQUE Reduction'],
      ['bit', '8. Bit Manipulation, Circular Shifts & Popcount']
    ];
    return html`<div>
      <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', padding: '12px', borderRadius: '12px', background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
        ${ENGINES.map(([id, label]) => html`<button key=${id} className=${'fig-btn' + (engine === id ? ' solid' : '')} onClick=${() => setEngine(id)}>${label}</button>`)}
      </div>
      ${engine === 'sort' && html`<${AlgoSortSim} />`}
      ${engine === 'rec' && html`<${AlgoRecSim} />`}
      ${engine === 'hash' && html`<${AlgoHashSim} />`}
      ${engine === 'rbt' && html`<${AlgoRbtSim} />`}
      ${engine === 'dp' && html`<${AlgoDpSim} />`}
      ${engine === 'graph' && html`<${AlgoGraphSim} />`}
      ${engine === 'np' && html`<${AlgoNpSim} />`}
      ${engine === 'bit' && html`<${AlgoBitSim} />`}
    </div>`;
  }

  window.FIGS = { 'hci-parts': HciParts, 'invisible-interface': Invisible, 'elevator': Elevator, 'vending': Vending, 'truckers': Truckers, 'id-umbrella': Umbrella, 'os-cpu-sim': OsCpuSim, 'os-page-sim': OsPageSim, 'algo-sort-sim': AlgoSortSim, 'algo-rec-sim': AlgoRecSim, 'algo-hash-sim': AlgoHashSim, 'algo-rbt-sim': AlgoRbtSim, 'algo-dp-sim': AlgoDpSim, 'algo-graph-sim': AlgoGraphSim, 'algo-np-sim': AlgoNpSim, 'algo-bit-sim': AlgoBitSim, 'algo-studio': AlgoMasterStudio };
})();
