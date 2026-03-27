const CDN = 'https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2163692081/settings_images/';

const ROW1_IMGS = [
  '1a50f35-bf36-0c71-0b80-5a78eeb37b6_PORTADA_ALFONOS_Y_MONICA_01_english.jpg',
  '720ca8f-005c-3e60-d53a-a2ed1c3425_PORTADA_ALFONOS_Y_MONICA_02_english.jpg',
  '14a02c-f05-7bd-2d2-a7dbed84cb15_PORTADA_ALFONOS_Y_MONICA_03_english.jpg',
  '4c2ee72-3a68-d8bd-c433-6ef2afa62306_PORTADA_ALFONOS_Y_MONICA_04_english.jpg',
  '7f1350-d72f-0d68-b40f-b17be08c0753_PORTADA_ANNA_01_english.jpg',
  'c25fbfa-8bf7-4b5-d60f-eba3eeb58fa_PORTADA_ANNA_03_english.jpg',
  'dbbf31d-3b28-817b-6cd3-f425d23a6ec_PORTADA_ANNA_02_english.jpg',
  'ef2aa5f-133d-dec1-f6d1-762674648e4_PORTADA_ANNA_04.jpg',
  '552c6ed-db80-aef-a8b5-81348ffddf51_PORTADA_JOAQUIN_04.jpg',
];
const ROW2_IMGS = [
  '734626-4432-05cc-7d85-e2ed6f8ff54_PORTADA_JOAQUIN_03.jpg',
  'ab72fef-deb-1573-0d15-65522f4c408_PORTADA_JOAQUIN_02.jpg',
  '10013-2418-fe12-1e8-14df8f4e7d82_PORTADA_JOAQUIN_01.jpg',
  'fb0e488-64d-048d-d00b-27b84a586fb5_PORTADA_IDAIRA_Y_ENOCH_02_english.jpg',
  'ff118ad-086e-3528-b124-6f4e7f553b4_PORTADA_IDAIRA_Y_ENOCH_01_english.jpg',
  '2adc0d0-882-4887-acef-74503216c63d_PORTADA_IDAIRA_Y_ENOCH_03_english.jpg',
  'c2febde-f774-b1e3-efd0-f4b1d08b70c7_PORTADA_CHARLIE_Y_VERO_04_english.jpg',
  'e03c844-e110-844-eaf-31f23e0634_PORTADA_CHARLIE_Y_VERO_03_english.jpg',
  '1aea0a-b1d3-33ab-fc7b-71ec8d474ab_PORTADA_CHARLIE_Y_VERO_02_english.jpg',
];
const ROW3_IMGS = [
  '1b5c8f0-c6b2-f5d-65bd-c2a2046c5ea_PORTADA_CHARLIE_Y_VERO_01_english.jpg',
  'e5ff8ec-1535-66cd-7e4d-ae5d072a0cd_PORTADA_IDAIRA_04_english.jpg',
  '238aaf-5847-2d6-b1-8a6af26ce75_PORTADA_IDAIRA_03_english.jpg',
  '86b831a-74f0-5da-067e-e7777c56a23_PORTADA_IDAIRA_02_english.jpg',
  '61a6b07-23bf-574-5a5b-3ff68a482f70_PORTADA_IDAIRA_01_english.jpg',
  '3a71e4f-778c-4df7-a4b-1cfc321e21f_PORTADA_JUDITH_04_english_copia.jpg',
  'c6e6d-8127-1ecb-d8-b5251bfaba46_PORTADA_JUDITH_03_english.jpg',
  'eaa46c6-ecaa-a874-d472-b5612a1430_PORTADA_JUDITH_01_english.jpg',
  '8de5cfc-ffe-a33a-6f37-00128eb6a4f3_PORTADA_JUDITH_02_english.jpg',
];

function tiles(imgs) {
  // doubled for infinite scroll
  return [...imgs, ...imgs].map(f =>
    '<div class="ed-tile"><img alt="" src="' + CDN + f + '"></div>'
  ).join('\n        ');
}

function buildHeroSection(d) {
  const heroId = d.heroVideoId || 'HERO_ID';
  const freeLessonId = d.freeLessonVideoId || 'FREE_ID';
  return `
<style>
  .hero-section{padding:0;}
  .hero-inner{padding:36px 16px;}
  .hero-title{font-size:48px;font-weight:900;line-height:1.04;letter-spacing:-1.6px;margin:0 auto 18px;color:#ffffff!important;}
  .hero-subtitle{font-size:22px;font-weight:600;line-height:1.3;margin:0 auto 6px;opacity:.92;color:#ffffff!important;}
  .hero-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:42px;align-items:center;margin-top:10px;}
  .hero-video{position:relative;width:100%;border-radius:14px;overflow:hidden;background:#111;box-shadow:0 18px 60px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.08);}
  .hero-video::before{content:"";display:block;padding-top:56.25%;}
  .sound-btn{position:absolute;top:12px;right:12px;z-index:10;display:inline-flex;align-items:center;gap:7px;background:rgba(0,0,0,.70);color:#fff!important;border:1.5px solid rgba(255,255,255,.50);border-radius:999px;padding:7px 14px 7px 10px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:800;cursor:pointer;backdrop-filter:blur(8px);white-space:nowrap;animation:soundPulse 2.2s ease-in-out infinite;transition:background 150ms,border-color 150ms,opacity 250ms,transform 150ms;}
  .sound-btn:hover{background:rgba(0,0,0,.92);border-color:rgba(255,255,255,.95);transform:scale(1.05);animation-play-state:paused;}
  .sound-btn.is-hidden{opacity:0;pointer-events:none;}
  .sound-btn svg{width:14px;height:14px;flex-shrink:0;}
  @keyframes soundPulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.30);}45%{transform:scale(1.04);box-shadow:0 0 0 6px rgba(255,255,255,.08);}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0);}}
  .hero-right{text-align:center;color:#ffffff!important;}
  .hero-kicker{display:inline-flex;align-items:center;justify-content:center;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);font-weight:700;font-size:13px;margin-bottom:14px;color:#ffffff!important;}
  .hero-actions{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:22px;width:100%;}
  .hero-btn{width:min(520px,92%);height:48px;border-radius:12px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:16px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;user-select:none;}
  .hero-btn.primary{background:#fff;color:#000!important;border:2px solid #fff;}
  .hero-btn.primary:hover{opacity:.92;}
  .hero-btn.outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.7);}
  .hero-btn.outline:hover{border-color:rgba(255,255,255,1);}
  .hero-btn .play{width:0;height:0;border-left:10px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent;transform:translateX(1px);}
  @media(max-width:900px){.hero-grid{grid-template-columns:1fr;gap:18px;}.hero-right{padding-top:6px;}}
  @media(max-width:600px){.hero-inner{padding-top:0;padding-bottom:0;}.hero-title{font-size:30px!important;}.hero-subtitle{font-size:16px!important;}.hero-actions{margin-top:16px;}.hero-btn{height:46px;}.sound-btn{font-size:11px;padding:6px 11px 6px 8px;top:8px;right:8px;}}
  .video-modal{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;padding:18px;z-index:999999;}
  .video-modal.is-open{display:flex;}
  .video-modal__panel{width:min(920px,100%);background:#0b0b0b;border:1px solid rgba(255,255,255,.14);border-radius:14px;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.55);}
  .video-modal__topbar{display:grid;grid-template-columns:40px 1fr 40px;align-items:center;padding:10px 12px;background:rgba(255,255,255,.04);color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;}
  .video-modal__title{text-align:center;opacity:.95;padding:0 8px;}
  .video-modal__close{appearance:none;border:none;background:transparent;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:6px 8px;border-radius:10px;justify-self:end;}
  .video-modal__close:hover{background:rgba(255,255,255,.08);}
  .video-modal__video{width:100%;aspect-ratio:16/9;background:#000;position:relative;}
  .video-modal__video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;}
</style>
<script src="https://fast.wistia.com/assets/external/E-v1.js" async><\/script>
<div class="hero-section" style="background:#000;color:#fff;text-align:center;font-family:'Montserrat',sans-serif;margin:0;width:100%;">
  <div class="hero-inner" style="max-width:1180px;margin:0 auto;">
    <div class="hero-grid">
      <div class="hero-video" id="heroVideoWrap">
        <script src="https://fast.wistia.com/embed/medias/${heroId}.jsonp" async><\/script>
        <div class="wistia_embed wistia_async_${heroId} videoFoam=true autoPlay=true muted=true playerColor=000000 endVideoBehavior=loop" style="position:absolute;inset:0;width:100%;height:100%;">&nbsp;</div>
        <button class="sound-btn" id="activateSoundBtn" type="button" aria-label="${d.activateSound || 'Activate Sound'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          ${d.activateSound || 'Activate Sound'}
        </button>
      </div>
      <div class="hero-right">
        <div class="hero-kicker">${d.courseLevel}</div>
        <h1 class="hero-title" style="margin-bottom:10px;">${d.courseTitle}</h1>
        <p class="hero-subtitle" style="font-size:14px;font-weight:700;opacity:.9;margin-bottom:16px;">${d.courseSubtitle}</p>
        <div style="opacity:.78;font-weight:650;font-size:13px;line-height:1.3;margin-top:8px;color:rgba(255,255,255,0.78)!important;">
          Instructor: ${d.artistName},<br/>${d.artistRole}
        </div>
        <div class="hero-actions">
          <a class="hero-btn primary" href="${d.ctaUrl}" target="_blank" rel="noopener">${d.ctaText}</a>
          <button class="hero-btn outline" type="button" id="openFreeLesson">
            <span class="play" aria-hidden="true"></span>
            ${d.freeLessonBtn || 'Free Lesson'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="video-modal" id="videoModal" aria-hidden="true">
  <div class="video-modal__panel" role="dialog" aria-modal="true">
    <div class="video-modal__topbar">
      <span></span>
      <div class="video-modal__title">${d.freeLessonTitle}</div>
      <button class="video-modal__close" type="button" id="closeVideoModal" aria-label="Close">\xd7</button>
    </div>
    <div class="video-modal__video" id="modalVideoWrap"></div>
  </div>
</div>
<script>
(function(){
  var heroApi=null,soundBtn=document.getElementById('activateSoundBtn');
  window._wq=window._wq||[];
  window._wq.push({id:'${heroId}',options:{autoPlay:true,muted:true,playerColor:'000000',endVideoBehavior:'loop'},onReady:function(v){if(v.container&&!v.container.closest('#videoModal'))heroApi=v;}});
  if(soundBtn)soundBtn.addEventListener('click',function(){if(heroApi){heroApi.time(0);heroApi.unmute();heroApi.volume(1);heroApi.play();}soundBtn.classList.add('is-hidden');});
  var openBtn=document.getElementById('openFreeLesson'),modal=document.getElementById('videoModal'),closeBtn=document.getElementById('closeVideoModal'),wrap=document.getElementById('modalVideoWrap');
  function openModal(){wrap.innerHTML='<iframe src="https://fast.wistia.net/embed/iframe/${freeLessonId}?autoPlay=true&playerColor=000000&fitStrategy=fill" allowtransparency="true" allowfullscreen frameborder="0" allow="autoplay;fullscreen" style="position:absolute;inset:0;width:100%;height:100%;border:0;"><\\/iframe>';modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(closeBtn)closeBtn.focus();document.addEventListener('keydown',onKey);}
  function closeModal(){wrap.innerHTML='';modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';document.removeEventListener('keydown',onKey);}
  function onKey(e){if(e.key==='Escape')closeModal();}
  if(openBtn)openBtn.addEventListener('click',openModal);
  if(closeBtn)closeBtn.addEventListener('click',function(e){e.stopPropagation();closeModal();});
  if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
})();
<\/script>`;
}

function buildBeyondSection(d) {
  const artistName = d.artistName || 'Artist';
  const beyondSuffix = d.beyondSuffix || 'You Also Get';
  return `
<style>
  .ed4-bonus{background:#f6f3ef;color:#121212;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif;padding:0;width:100%;}
  .ed4-bonus .ed4-wrap{max-width:1080px;margin:0 auto;padding:80px 18px 90px;}
  .ed4-bonus-head{max-width:780px;margin:0 auto 28px;text-align:left;}
  .ed4-bonus-title{margin:0;font-size:46px;font-weight:900;letter-spacing:-.03em;color:#111!important;}
  .ed4-bonus-sub{margin-top:6px;font-size:18px;font-weight:700;color:rgba(20,20,20,.45);}
  .ed4-bonus-rule{height:1px;background:rgba(0,0,0,.24);margin:14px 0 0;width:100%;}
  .ed4-stats{max-width:780px;margin:26px auto 34px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
  .ed4-stat{background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:16px 16px 14px;box-shadow:0 10px 18px rgba(0,0,0,.08);}
  .ed4-stat-number{font-size:36px;font-weight:900;letter-spacing:-.02em;color:#111;line-height:1.1;margin:0 0 4px;}
  .ed4-stat-label{font-size:14px;font-weight:800;color:rgba(20,20,20,.55);text-transform:uppercase;letter-spacing:.08em;margin:0;}
  .ed4-benefits{max-width:780px;margin:0 auto;background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:6px;overflow:hidden;box-shadow:0 10px 18px rgba(0,0,0,.08);}
  .ed4-benefit{display:flex;gap:12px;padding:14px 16px;align-items:flex-start;}
  .ed4-benefit+.ed4-benefit{border-top:1px solid rgba(0,0,0,.08);}
  .ed4-check{flex:0 0 auto;width:18px;height:18px;margin-top:2px;color:rgba(60,120,125,.85);}
  .ed4-benefit h4{margin:0 0 4px;font-size:16px;font-weight:900;letter-spacing:-.01em;color:#111;}
  .ed4-benefit p{margin:0;font-size:15px;line-height:1.65;color:rgba(20,20,20,.72);}
  @media(max-width:820px){.ed4-bonus-title{font-size:40px;}.ed4-stats{grid-template-columns:1fr;}.ed4-stat-number{font-size:32px;}}
  @media(max-width:600px){.ed4-bonus .ed4-wrap{padding:54px 14px 70px;}.ed4-bonus-title{font-size:34px;}.ed4-bonus-sub{font-size:16px;}.ed4-stat{padding:14px 14px 12px;}.ed4-benefit{padding:13px 14px;}.ed4-benefit h4{font-size:15px;}.ed4-benefit p{font-size:14px;}}
</style>
<section class="ed4-bonus">
  <div class="ed4-wrap">
    <div class="ed4-bonus-head">
      <h2 class="ed4-bonus-title">Beyond ${artistName}'s Courses, ${beyondSuffix}</h2>
      <div class="ed4-bonus-sub">Everything inside Ermes Dance Academy to keep improving faster</div>
      <div class="ed4-bonus-rule"></div>
    </div>
    <div class="ed4-stats">
      <div class="ed4-stat"><p class="ed4-stat-number">30+</p><p class="ed4-stat-label">${d.coursesLabel || 'Courses'}</p></div>
      <div class="ed4-stat"><p class="ed4-stat-number">200+</p><p class="ed4-stat-label">${d.biteLabel || 'Bite-Sized Classes'}</p></div>
      <div class="ed4-stat"><p class="ed4-stat-number">24/7</p><p class="ed4-stat-label">${d.accessLabel || 'Access'}</p></div>
    </div>
    <div class="ed4-benefits">
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>Full Access to 30+ Courses</h4><p>Salsa, Bachata, Musicality, Expression, Flow &amp; more.</p></div></div>
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>Multilingual Subtitles Included</h4><p>English, French, Italian, and German subtitles so you never miss a cue.</p></div></div>
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>200+ Bite-Sized Classes</h4><p>Short, clear lessons designed for fast, repeatable learning.</p></div></div>
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>Motion Bites\xae \u2014 Science-Based Method</h4><p>Learn faster with short, repeatable sessions built for real progress.</p></div></div>
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>Classes for All Levels</h4><p>From complete beginners to intermediate dancers who feel "stuck."</p></div></div>
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>Top Instructors With Unique Styles</h4><p>Build confidence, musicality, expression, and natural movement.</p></div></div>
      <div class="ed4-benefit"><span class="ed4-check" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h4>24/7 Access From Any Device</h4><p>Train anytime on mobile, tablet, or desktop.</p></div></div>
    </div>
  </div>
</section>`;
}

function buildUnlimitedSection(d) {
  const row1 = tiles(ROW1_IMGS);
  const row2 = tiles(ROW2_IMGS);
  const row3 = tiles(ROW3_IMGS);
  return `
<style>
  .ed-uac{position:relative;background:#000;color:#fff;padding:72px 0 62px;overflow:hidden;font-family:'Montserrat',sans-serif;-webkit-user-select:none;user-select:none;}
  .ed-uac::before{content:"";position:absolute;inset:0;background:radial-gradient(1200px 420px at 50% 32%,rgba(0,0,0,.10),rgba(0,0,0,.70));pointer-events:none;z-index:1;}
  .ed-uac::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.92),rgba(0,0,0,0) 34%),linear-gradient(to top,rgba(0,0,0,.86),rgba(0,0,0,0) 34%);pointer-events:none;z-index:2;}
  .ed-uac__sidefade{position:absolute;top:0;bottom:0;width:120px;pointer-events:none;z-index:6;}
  .ed-uac__sidefade.left{left:0;background:linear-gradient(to right,rgba(0,0,0,.98),rgba(0,0,0,0));}
  .ed-uac__sidefade.right{right:0;background:linear-gradient(to left,rgba(0,0,0,.98),rgba(0,0,0,0));}
  .ed-uac__overlay{position:absolute;inset:0;pointer-events:none;z-index:7;opacity:.22;}
  .ed-uac__header{position:relative;z-index:9;text-align:center;max-width:1100px;margin:0 auto;padding:0 16px;transform:translateY(34px);}
  .ed-uac__title{margin:0 0 16px;font-size:44px;font-weight:900;letter-spacing:-.03em;line-height:1.1;}
  .ed-uac__btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 26px;border-radius:12px;background:#fff;color:#111!important;text-decoration:none;font-weight:800;font-size:16px;border:2px solid #fff;box-shadow:0 14px 40px rgba(0,0,0,.55);}
  .ed-uac__btn:hover{opacity:.92;}
  .ed-uac__rows{position:relative;z-index:5;width:100%;margin-top:-18px;}
  .ed-row{position:relative;overflow:hidden;margin:14px 0;}
  .ed-row--topfade::before{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.94),rgba(0,0,0,.10) 70%,rgba(0,0,0,.70));pointer-events:none;z-index:8;}
  .ed-row--offset .ed-track{transform:translateX(-90px);}
  .ed-track{display:flex;width:max-content;gap:16px;will-change:transform;animation-play-state:running!important;}
  .ed-tile{position:relative;flex:0 0 auto;width:290px;height:160px;border-radius:18px;overflow:hidden;background:#111;box-shadow:0 14px 40px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.06);transform:translateZ(0);opacity:.92;-webkit-user-drag:none;}
  .ed-tile img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.05) contrast(1.02);transform:scale(1.01);-webkit-user-drag:none;pointer-events:none;}
  .ed-tile::after{display:none!important;}
  @keyframes ed-scroll-rtl{from{transform:translateX(0);}to{transform:translateX(-50%);}}
  @keyframes ed-scroll-ltr{from{transform:translateX(-50%);}to{transform:translateX(0);}}
  .ed-row--rtl .ed-track{animation:ed-scroll-rtl 78s linear infinite;}
  .ed-row--ltr .ed-track{animation:ed-scroll-ltr 84s linear infinite;}
  @media(max-width:980px){.ed-uac__title{font-size:36px;}.ed-tile{width:250px;height:140px;border-radius:16px;}.ed-row{margin:12px 0;}.ed-track{gap:14px;}.ed-row--offset .ed-track{transform:translateX(-70px);}.ed-uac__sidefade{width:90px;}}
  @media(max-width:600px){.ed-uac{padding:54px 0 48px;}.ed-uac__title{font-size:28px;}.ed-uac__header{transform:translateY(18px);}.ed-uac__btn{height:44px;padding:0 22px;font-size:15px;}.ed-tile{width:210px;height:120px;border-radius:14px;}.ed-track{gap:12px;}.ed-row--offset .ed-track{transform:translateX(-55px);}.ed-row--rtl .ed-track{animation-duration:62s;}.ed-row--ltr .ed-track{animation-duration:68s;}.ed-uac__sidefade{width:70px;}}
  .ed-footer{background:#000;color:rgba(255,255,255,.60);font-family:'Montserrat',sans-serif;padding:0;text-align:center;user-select:none;width:100%;}
  .ed-footer__wrap{max-width:1100px;margin:0 auto;padding:18px 16px 26px;}
  .ed-footer__divider{height:1px;background:rgba(255,255,255,.08);margin:0 auto 14px;width:min(820px,100%);}
  .ed-footer__logo{display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;opacity:.85;}
  .ed-footer__logo img{height:50px;width:auto;display:block;opacity:.82;filter:grayscale(100%) contrast(1.05);pointer-events:none;}
  .ed-footer__text{font-size:12px;letter-spacing:.02em;line-height:1.4;}
</style>
<section class="ed-uac">
  <div class="ed-uac__sidefade left" aria-hidden="true"></div>
  <div class="ed-uac__sidefade right" aria-hidden="true"></div>
  <div class="ed-uac__overlay" aria-hidden="true"></div>
  <div class="ed-uac__header">
    <h2 class="ed-uac__title">${d.unlimitedTitle || 'Unlimited Access to all Courses'}</h2>
    <a class="ed-uac__btn" href="${d.ctaUrl}" target="_blank" rel="noopener">${d.ctaText}</a>
  </div>
  <div class="ed-uac__rows" aria-label="Course covers marquee">
    <div class="ed-row ed-row--ltr ed-row--topfade"><div class="ed-track">${row1}</div></div>
    <div class="ed-row ed-row--rtl ed-row--offset"><div class="ed-track">${row2}</div></div>
    <div class="ed-row ed-row--ltr"><div class="ed-track">${row3}</div></div>
  </div>
</section>
<footer class="ed-footer" role="contentinfo">
  <div class="ed-footer__wrap">
    <div class="ed-footer__divider" aria-hidden="true"></div>
    <div class="ed-footer__logo" aria-hidden="true">
      <img src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2164751305/settings_images/a873d5-a7a4-e2ba-0222-2a6224428c21_2946885f-ffea-485a-9de3-55c9ebec76f1.png" alt="" loading="lazy"/>
    </div>
    <div class="ed-footer__text">\xa9 2026 Ermes Dance Academy. ${d.allRightsReserved || 'All rights reserved.'}</div>
  </div>
</footer>`;
}

function buildSelector(slug) {
  return `
<div id="language-switcher" style="position:fixed;bottom:24px;right:24px;z-index:9999;font-family:'Montserrat',sans-serif;">
  <div id="lang-btn" style="background:#000;color:#fff;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:all .3s;font-size:28px;" aria-label="Language switcher">\ud83c\uddec\ud83c\udde7</div>
  <div id="lang-options" style="position:absolute;bottom:70px;right:0;background:#000;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(10px);transition:all .3s;width:180px;">
    <a href="https://academy.ermesdance.com/${slug}" class="lang-link" data-lang="en">\ud83c\uddec\ud83c\udde7 English</a>
    <a href="https://academy.ermesdance.com/${slug}-es" class="lang-link" data-lang="es">\ud83c\uddea\ud83c\uddf8 Espa\xf1ol</a>
    <a href="https://academy.ermesdance.com/${slug}-it" class="lang-link" data-lang="it">\ud83c\uddee\ud83c\uddf9 Italiano</a>
    <a href="https://academy.ermesdance.com/${slug}-fr" class="lang-link" data-lang="fr">\ud83c\uddeb\ud83c\uddf7 Fran\xe7ais</a>
    <a href="https://academy.ermesdance.com/${slug}-de" class="lang-link" data-lang="de">\ud83c\�\ud83c\udde9\ud83c\uddea Deutsch</a>
  </div>
</div>
<style>
  .lang-link{display:block;padding:14px 20px;color:#fff;text-decoration:none;font-size:12px;font-weight:700;transition:background .2s;}
  .lang-link:hover{background:rgba(255,255,255,.15);}
  #language-switcher:hover #lang-btn{transform:scale(1.12);}
</style>
<script>
(function(){
  var btn=document.getElementById('lang-btn'),options=document.getElementById('lang-options');
  var langMap={en:'https://academy.ermesdance.com/${slug}',es:'https://academy.ermesdance.com/${slug}-es',it:'https://academy.ermesdance.com/${slug}-it',fr:'https://academy.ermesdance.com/${slug}-fr',de:'https://academy.ermesdance.com/${slug}-de'};
  var flagMap={en:'\ud83c\uddec\ud83c\udde7',es:'\ud83c\uddea\ud83c\uddf8',fr:'\ud83c\uddeb\ud83c\uddf7',it:'\ud83c\uddee\ud83c\uddf9',de:'\ud83c\udde9\ud83c\uddea'};
  function currentLang(){var p=(window.location.pathname||'').toLowerCase().replace(/\\/+$/,'');if(p.endsWith('-es'))return 'es';if(p.endsWith('-fr'))return 'fr';if(p.endsWith('-it'))return 'it';if(p.endsWith('-de'))return 'de';return 'en';}
  btn.innerHTML=flagMap[currentLang()]||flagMap.en;
  var ul=(navigator.language||'en').toLowerCase().split('-')[0],pref=localStorage.getItem('forced-lang');
  var curPath=(window.location.pathname||'').toLowerCase().replace(/\\/+$/,'');
  if(curPath==='/${slug}'&&!pref&&langMap[ul]&&ul!=='en'){window.location.replace(langMap[ul]);return;}
  btn.addEventListener('click',function(e){e.stopPropagation();var o=options.style.opacity==='1';options.style.opacity=o?'0':'1';options.style.visibility=o?'hidden':'visible';options.style.transform=o?'translateY(10px)':'translateY(0)';});
  document.querySelectorAll('.lang-link').forEach(function(l){l.addEventListener('click',function(){localStorage.setItem('forced-lang',(l.dataset.lang||'en').toLowerCase());});});
  document.addEventListener('click',function(){options.style.opacity='0';options.style.visibility='hidden';options.style.transform='translateY(10px)';});
})();
<\/script>`;
}

export function buildAboutHtmlStr(aboutData) {
  const {
    introText = '',
    totalLessons = '',
    category = '',
    courses = [],
    instructorName = '',
    instructorRole = '',
    instructorPhoto = '',
  } = aboutData;

  // Build intro paragraphs
  const paragraphs = introText
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `      <p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  // Build accordion items
  const accordionItems = courses.map((course) => {
    const lessonCount = (course.lessons || []).length;
    const lessonsHtml = (course.lessons || []).map((lesson) => {
      const freeBtn = lesson.wistiaId
        ? `\n              <button class="ed4-free" type="button" data-wistia="${lesson.wistiaId}" data-title="${lesson.title} (FREE LESSON)">\n                <span class="ed4-play" aria-hidden="true">▶</span> Free lesson\n              </button>`
        : '';
      return `
            <div class="ed4-lesson">
              <div class="ed4-lesson-left">
                <span class="ed4-ic" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="12" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M15 10l4.5 2.6a1 1 0 010 1.8L15 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                <span class="ed4-lesson-title">${lesson.title}</span>
              </div>${freeBtn}
            </div>`;
    }).join('');

    const titleWithMeta = `${course.title} | ${instructorName || 'Instructor'} | ${course.level || 'All levels'}`;

    return `
        <div class="ed4-item">
          <button class="ed4-btn" type="button" aria-expanded="false">
            <span class="title">${titleWithMeta}</span>
            <span class="ed4-right">
              <span class="ed4-course-meta">${lessonCount} lessons</span>
              <span class="chev">›</span>
            </span>
          </button>
          <div class="ed4-panel">${lessonsHtml}
          </div>
        </div>`;
  }).join('');

  const avatarHtml = instructorPhoto
    ? `<img src="${instructorPhoto}" alt="${instructorName}"/>`
    : '';

  return `<style>
  .ed4-section{background:#f6f3ef;color:#121212;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif;padding:0;width:100%;}
  .ed4-section .ed4-wrap{max-width:1080px;margin:0 auto;padding:80px 18px 90px;}
  .ed4-about{max-width:780px;margin:0 auto 46px;text-align:left;}
  .ed4-about h2{margin:0 0 12px;font-size:34px;font-weight:900;letter-spacing:-.02em;color:#111!important;}
  .ed4-rule{height:1px;background:rgba(0,0,0,.26);margin:0 0 18px;width:420px;max-width:100%;}
  .ed4-about p{margin:0 0 18px;font-size:18px;line-height:1.75;color:rgba(20,20,20,.75);}
  .ed4-meta{margin-top:18px;font-size:18px;line-height:1.7;color:rgba(20,20,20,.86);}
  .ed4-meta b{color:#111;font-weight:800;}
  .ed4-lessons{max-width:780px;margin:0 auto;text-align:left;}
  .ed4-lessons h3{margin:0;font-size:46px;font-weight:900;letter-spacing:-.03em;color:#111!important;}
  .ed4-lessons .sub{margin-top:4px;font-size:18px;font-weight:700;color:rgba(20,20,20,.45);}
  .ed4-lessons .rule{height:1px;background:rgba(0,0,0,.24);margin:14px 0 18px;width:100%;}
  .ed4-acc{display:grid;gap:10px;}
  .ed4-item{border-radius:4px;overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.10);}
  .ed4-btn{width:100%;border:none;cursor:pointer;background:#2f3439;color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:20px;font-weight:800;line-height:1.2;text-align:left;}
  .ed4-btn span.title{display:block;}
  .ed4-right{display:flex;align-items:center;gap:14px;flex:0 0 auto;white-space:nowrap;}
  .ed4-course-meta{font-size:14px;font-weight:800;color:rgba(255,255,255,.65);}
  .ed4-btn .chev{font-size:28px;line-height:1;opacity:.95;transform:translateY(-1px);}
  .ed4-panel{display:none;background:#fff;border:1px solid rgba(0,0,0,.12);border-top:none;padding:10px 0;font-size:16px;line-height:1.7;color:rgba(20,20,20,.82);}
  .ed4-item.is-open .ed4-panel{display:block;}
  .ed4-item.is-open .ed4-btn .chev{transform:rotate(90deg) translateX(2px);}
  .ed4-lesson{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;}
  .ed4-lesson+.ed4-lesson{border-top:1px solid rgba(0,0,0,.08);}
  .ed4-lesson-left{display:flex;align-items:center;gap:10px;min-width:0;}
  .ed4-ic{width:18px;height:18px;color:rgba(0,0,0,.55);flex:0 0 auto;}
  .ed4-lesson-title{font-size:14px;font-weight:600;color:rgba(20,20,20,.75);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ed4-free{border:0;background:transparent;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#ff0033;padding:4px 2px;flex:0 0 auto;white-space:nowrap;}
  .ed4-free:hover{text-decoration:underline;}
  .ed4-play{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#ff0033;color:#fff;font-size:10px;line-height:1;padding-left:1px;}
  .ed4-instructor{max-width:780px;margin:60px auto 0;text-align:left;}
  .ed4-avatar{width:92px;height:92px;border-radius:999px;overflow:hidden;border:4px solid rgba(0,0,0,.18);box-shadow:0 16px 30px rgba(0,0,0,.16);background:#ddd;}
  .ed4-avatar img{width:100%;height:100%;object-fit:cover;display:block;}
  .ed4-name{margin:14px 0 6px;font-size:32px;font-weight:900;letter-spacing:-.02em;color:#111;}
  .ed4-role{margin:0 0 10px;font-size:16px;font-weight:800;color:rgba(60,120,125,.58);}
  .ed4-instructor-sep{height:1px;background:rgba(0,0,0,.22);width:100%;margin:10px 0 14px;}
  .ed4-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:18px;z-index:9999;}
  .ed4-modal.is-open{display:flex;}
  .ed4-modal-card{width:min(920px,100%);background:#0f0f10;border-radius:12px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.45);}
  .ed4-modal-top{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,.06);}
  .ed4-modal-title{font-size:13px;font-weight:800;color:rgba(255,255,255,.85);padding-right:10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
  .ed4-close{border:0;background:transparent;color:#fff;cursor:pointer;font-size:22px;line-height:1;padding:6px 10px;opacity:.85;}
  .ed4-close:hover{opacity:1;}
  .ed4-wistia-wrap{width:100%;aspect-ratio:16/9;background:#000;position:relative;}
  .ed4-wistia-wrap iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;}
  @media(max-width:820px){.ed4-about,.ed4-lessons,.ed4-instructor{max-width:680px;}.ed4-lessons h3{font-size:40px;}.ed4-btn{font-size:18px;padding:13px 16px;}.ed4-name{font-size:28px;}}
  @media(max-width:600px){.ed4-section .ed4-wrap{padding:54px 14px 70px;}.ed4-about{margin-bottom:34px;}.ed4-about h2{font-size:26px;}.ed4-rule{width:260px;margin-bottom:14px;}.ed4-about p{font-size:16px;margin-bottom:14px;}.ed4-meta{font-size:16px;}.ed4-lessons h3{font-size:34px;}.ed4-lessons .sub{font-size:16px;}.ed4-btn{font-size:16px;padding:12px 14px;}.ed4-panel{font-size:15px;}.ed4-avatar{width:84px;height:84px;}.ed4-name{font-size:26px;}}
</style>

<section class="ed4-section">
  <div class="ed4-wrap">
    <div class="ed4-about">
      <h2>About these courses</h2>
      <div class="ed4-rule"></div>
${paragraphs}
      <div class="ed4-meta">
        Instructor: <b>${instructorName}</b><br/>
        Lessons: <b>${totalLessons}</b><br/>
        Category: <b>${category}</b><br/>
      </div>
    </div>

    <div class="ed4-lessons">
      <h3>Courses</h3>
      <div class="rule"></div>
      <div class="ed4-acc" id="ed4AccordionCourses">
${accordionItems}
      </div>
    </div>

    <div class="ed4-instructor">
      <div class="ed4-avatar">${avatarHtml}</div>
      <div class="ed4-name">${instructorName}</div>
      <div class="ed4-role">${instructorRole}</div>
      <div class="ed4-instructor-sep"></div>
    </div>
  </div>
</section>

<div class="ed4-modal" id="ed4VideoModal" aria-hidden="true">
  <div class="ed4-modal-card" role="dialog" aria-modal="true">
    <div class="ed4-modal-top">
      <div class="ed4-modal-title" id="ed4VideoTitle">Free lesson</div>
      <button class="ed4-close" type="button" id="ed4VideoClose" aria-label="Close">×</button>
    </div>
    <div class="ed4-wistia-wrap" id="ed4WistiaWrap"></div>
  </div>
</div>

<script>
(function(){
  var root=document.getElementById('ed4AccordionCourses');
  if(!root)return;
  var items=Array.from(root.querySelectorAll('.ed4-item'));
  items.forEach(function(item){
    var btn=item.querySelector('.ed4-btn');
    if(!btn)return;
    btn.addEventListener('click',function(){
      var isOpen=item.classList.contains('is-open');
      items.forEach(function(it){it.classList.remove('is-open');var b=it.querySelector('.ed4-btn');if(b)b.setAttribute('aria-expanded','false');});
      if(!isOpen){item.classList.add('is-open');btn.setAttribute('aria-expanded','true');}
    });
  });
  var modal=document.getElementById('ed4VideoModal'),closeBtn=document.getElementById('ed4VideoClose'),titleEl=document.getElementById('ed4VideoTitle'),wrap=document.getElementById('ed4WistiaWrap');
  function openModal(id,title){if(!modal)return;if(titleEl)titleEl.textContent=title;wrap.innerHTML='<iframe src="https://fast.wistia.net/embed/iframe/'+id+'?autoPlay=true&playerColor=000000&fitStrategy=fill" allowtransparency="true" allowfullscreen frameborder="0" allow="autoplay;fullscreen" style="position:absolute;inset:0;width:100%;height:100%;border:0;"><\/iframe>';modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(closeBtn)closeBtn.focus();document.addEventListener('keydown',onKey);}
  function closeModal(){if(!modal)return;wrap.innerHTML='';modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';document.removeEventListener('keydown',onKey);}
  function onKey(e){if(e.key==='Escape')closeModal();}
  document.querySelectorAll('.ed4-free').forEach(function(btn){btn.addEventListener('click',function(){openModal(btn.dataset.wistia,btn.dataset.title);});});
  if(closeBtn)closeBtn.addEventListener('click',closeModal);
  if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
})();
<\/script>`;
}

export function buildPage(form, lang, strings, translatedAboutHtml) {
  // strings = { courseLevel, courseTitle, courseSubtitle, ctaText, freeLessonTitle, beyondSuffix, unlimitedTitle, ... }
  const videos = form.wistiaVideos || {};
  const enVideos = videos.en || {};
  const langVideos = videos[lang] || {};

  const d = {
    ...strings,
    artistName: form.artistName || '',
    artistRole: form.artistRole || '',
    ctaUrl: form.ctaUrl || '#',
    // Use lang-specific video IDs, fallback to EN
    heroVideoId:      langVideos.heroVideoId      || enVideos.heroVideoId      || '',
    freeLessonVideoId: langVideos.freeLessonVideoId || enVideos.freeLessonVideoId || '',
    activateSound: strings.activateSound || 'Activate Sound',
    freeLessonBtn: strings.freeLessonBtn || 'Free Lesson',
    coursesLabel: strings.coursesLabel || 'Courses',
    biteLabel: strings.biteLabel || 'Bite-Sized Classes',
    accessLabel: strings.accessLabel || 'Access',
    allRightsReserved: strings.allRightsReserved || 'All rights reserved.',
  };

  const slug = (form.pageSlug || 'lp-artista') + (lang === 'en' ? '' : '-' + lang);
  const baseSlug = form.pageSlug || 'lp-artista';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d.courseTitle} | Ermes Dance Academy</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;}body{margin:0;padding:0;background:#000;}</style>
</head>
<body>
${buildHeroSection(d)}
${translatedAboutHtml}
${buildBeyondSection(d)}
${buildUnlimitedSection(d)}
${buildSelector(baseSlug)}
<script>
(function(){
  var el = document.querySelector('.hero-section');
  if (!el) return;
  var parent = el.parentElement;
  var limit = 8;
  while (parent && limit-- > 0) {
    var tag = parent.tagName.toLowerCase();
    if (tag === 'body' || tag === 'main') break;
    parent.style.setProperty('max-width', '100%', 'important');
    parent.style.setProperty('padding-left', '0', 'important');
    parent.style.setProperty('padding-right', '0', 'important');
    parent.style.setProperty('margin-left', '0', 'important');
    parent.style.setProperty('margin-right', '0', 'important');
    parent.style.setProperty('width', '100%', 'important');
    parent = parent.parentElement;
  }
})();
<\/script>
</body>
</html>`;
}
