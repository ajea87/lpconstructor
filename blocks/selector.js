<!-- Selector flotante 5 idiomas + detector browser (para /lp-carolina y /lp-carolina-xx) -->
<div id="language-switcher" style="position:fixed; bottom:24px; right:24px; z-index:9999; font-family:'Montserrat',sans-serif;">
  <div id="lang-btn" style="background:#000000; color:#ffffff; width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,0.4); transition:all 0.3s; font-size:28px;" aria-label="Language switcher">
    🇬🇧
  </div>

  <div id="lang-options" style="position:absolute; bottom:70px; right:0; background:#000000; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.5); opacity:0; visibility:hidden; transform:translateY(10px); transition:all 0.3s; width:180px;">
    <a href="https://academy.ermesdance.com/lp-carolina"     class="lang-link" data-lang="en">🇬🇧 English</a>
    <a href="https://academy.ermesdance.com/lp-carolina-es"  class="lang-link" data-lang="es">🇪🇸 Español</a>
    <a href="https://academy.ermesdance.com/lp-carolina-it"  class="lang-link" data-lang="it">🇮🇹 Italiano</a>
    <a href="https://academy.ermesdance.com/lp-carolina-fr"  class="lang-link" data-lang="fr">🇫🇷 Français</a>
    <a href="https://academy.ermesdance.com/lp-carolina-de"  class="lang-link" data-lang="de">🇩🇪 Deutsch</a>
  </div>
</div>

<style>
  .lang-link {display:block; padding:14px 20px; color:#ffffff; text-decoration:none; font-size:12px; font-weight:700; transition:background 0.2s;}
  .lang-link:hover {background:rgba(255,255,255,0.15);}
  #language-switcher:hover #lang-btn {transform:scale(1.12);}
</style>

<script>
  (function () {
    const btn = document.getElementById('lang-btn');
    const options = document.getElementById('lang-options');

    // ====== URLs (lp-carolina) ======
    const langMap = {
      en: 'https://academy.ermesdance.com/lp-carolina',
      es: 'https://academy.ermesdance.com/lp-carolina-es',
      it: 'https://academy.ermesdance.com/lp-carolina-it',
      fr: 'https://academy.ermesdance.com/lp-carolina-fr',
      de: 'https://academy.ermesdance.com/lp-carolina-de'
    };

    const flagMap = { en:'🇬🇧', es:'🇪🇸', fr:'🇫🇷', it:'🇮🇹', de:'🇩🇪' };

    // ====== Actualizar banderita según URL actual (slug con sufijo -xx) ======
    function currentLangFromPath() {
      const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
      if (path.endsWith('-es')) return 'es';
      if (path.endsWith('-fr')) return 'fr';
      if (path.endsWith('-it')) return 'it';
      if (path.endsWith('-de')) return 'de';
      return 'en';
    }
    const currentLang = currentLangFromPath();
    btn.innerHTML = flagMap[currentLang] || flagMap.en;

    // ====== DETECCIÓN AUTOMÁTICA DEL NAVEGADOR ======
    const userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    const langCode = userLang.split('-')[0]; // es-es -> es
    const hasPreference = localStorage.getItem('forced-lang');

    // Solo redirigir si estamos exactamente en /lp-carolina (EN base) y no hay preferencia guardada
    const currentPath = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
    const isBase = currentPath === '/lp-carolina';

    if (isBase && !hasPreference && langMap[langCode] && langCode !== 'en') {
      window.location.replace(langMap[langCode]);
      return;
    }

    // ====== Abrir/cerrar menú ======
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = options.style.opacity === '1';
      options.style.opacity = isOpen ? '0' : '1';
      options.style.visibility = isOpen ? 'hidden' : 'visible';
      options.style.transform = isOpen ? 'translateY(10px)' : 'translateY(0)';
    });

    // ====== Guardar elección manual ======
    document.querySelectorAll('.lang-link').forEach(link => {
      link.addEventListener('click', () => {
        localStorage.setItem('forced-lang', (link.dataset.lang || 'en').toLowerCase());
      });
    });

    // ====== Cerrar al clic fuera ======
    document.addEventListener('click', () => {
      options.style.opacity = '0';
      options.style.visibility = 'hidden';
      options.style.transform = 'translateY(10px)';
    });
  })();
</script>