(() => {
  let deferredPrompt;
  const addToHomeBtn = document.querySelector('#add-to-home');

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    
    if (!addToHomeBtn) {
      return;
    }

    addToHomeBtn.style.display = 'block';

    addToHomeBtn.addEventListener('click', (event) => {
      event.preventDefault();
        
      addToHomeBtn.style.display = 'none';
      
      deferredPrompt.prompt();
      
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted to install Viajar com Alê');
        } else {
          console.log('User dismissed to install Viajar com Alê');
        }
        deferredPrompt = null;
      });
    });
  });

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/serviceworker.js', {
          scope: '/',
        });
        if (registration.installing) {
          console.log('Service worker installing');
        } else if (registration.waiting) {
          console.log('Service worker installed');
        } else if (registration.active) {
          console.log('Service worker active');
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };

  registerServiceWorker();

  // This is the best workaround I found to add DOM events without
  // messing with the SSR on Next.js 14, please don't judge me.
  const countryRoutes = window.location.origin + '/countries';
  const hashtagRoutes = window.location.origin + '/hashtags';
  const loadingSpinner = document.querySelector('#loader-spinner');

  function showSpinner(e) {
    const link = e?.target?.href || e?.target?.parentElement?.href;

    if ((e?.target?.parentElement?.target || e?.target?.target) === '_blank') {
      return;
    }

    if (e?.metaKey || !link) {
      return;
    }
    
    if (!link.includes(window.location.origin + '/') || link === window.location.origin + '/#' || link === window.location.href) {
      return;
    }

    loadingSpinner.style.display = 'block';
  }

  let firstPage = window.location.pathname;

  function onBackClick(e) {
    console.log(firstPage)
    if (window.location.pathname === firstPage) {
      firstPage = e.target.parentElement.pathname;
      return;
    }

    e.preventDefault();

    history.back();
  }

  let shuffleClicks = 0;

  const today = new Date().toISOString().split('T')[0];
  let totalShuffleClicksToday = localStorage.getItem('total_shuffle_clicks_today');
  let totalShuffleClicksTodayDate = localStorage.getItem('total_shuffle_clicks_today_date');

  if (totalShuffleClicksToday >= 25) {
    [...document.querySelectorAll('.shuffle')].forEach((item) => {
      item.style.display = 'none';
    });
  }

  function onShuffleClick() {
    if (totalShuffleClicksTodayDate !== today) {
      localStorage.setItem('total_shuffle_clicks_today_date', today);
      localStorage.setItem('total_shuffle_clicks_today', '0');
      totalShuffleClicksTodayDate = today;
      totalShuffleClicksToday = 0;
    }

    shuffleClicks++;

    if (shuffleClicks >= 5 || totalShuffleClicksToday >= 25) {
      [...document.querySelectorAll('.shuffle')].forEach((item) => {
        item.style.display = 'none';
      });
    }

    if (!totalShuffleClicksToday) {
      localStorage.setItem('total_shuffle_clicks_today', '1');
      totalShuffleClicksToday = 1;
    } else {
      localStorage.setItem('total_shuffle_clicks_today', ++totalShuffleClicksToday);
    }

    let count = 30;
    const initialText = this.textContent;

    [...document.querySelectorAll('.shuffle button')].forEach((item) => {
      item.disabled = true;
      item.textContent = count;
    });

    count--;

    const internal = setInterval(() => {
      [...document.querySelectorAll('.shuffle button')].forEach((item) => {
        item.disabled = true;
        item.textContent = count;
      });

      if (count == 0) {
        [...document.querySelectorAll('.shuffle button')].forEach((item) => {
          item.disabled = false;
          item.textContent = initialText;
        });
    
        clearInterval(internal);
      }
      
      count--;
    }, 1000);
  }

  function onNavbarLinkClick() {
    const navLinks = [...document.querySelectorAll('.navbar .nav-link')];
    
    navLinks.forEach((item) => {
      item.parentElement.classList.remove('active');
    });

    this.parentElement.classList.add('active');
  }

  function initNavbarLinkClick() {
    const navLinks = [...document.querySelectorAll('.navbar .nav-link')];

    navLinks.forEach((item) => {
      item.addEventListener('click', onNavbarLinkClick);
    });
  }

  function setupLinks(tag) {
    const currentUrl = window.location.href;

    const routeLinks = [...document.querySelectorAll(tag + ' a')];

    routeLinks.forEach((a) => {
      a.addEventListener('click', showSpinner);
    });

    const languageSwitcherLink = currentUrl.includes('viajarcomale.com.br') ? currentUrl.replace('viajarcomale.com.br', 'viajarcomale.com') : currentUrl.replace('viajarcomale.com', 'viajarcomale.com.br');
    document.querySelector('#language-switcher').href = languageSwitcherLink;
    document.querySelector('#portuguese-language-switcher a').href = languageSwitcherLink;

    const backButton = document.querySelector('#back-button');

    if (backButton) {
      backButton.removeEventListener('click', onBackClick);
      backButton.addEventListener('click', onBackClick);
    }

    if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches) {
      document.querySelectorAll('a[target=_blank]').forEach(function(a) {
        a.removeAttribute('target');
     });
    }

    [...document.querySelectorAll('.shuffle button')].forEach((item) => {
      item.removeEventListener('click', onShuffleClick);
      item.addEventListener('click', onShuffleClick);
    });

    initNavbarLinkClick();

    const navLinks = [...document.querySelectorAll('.navbar .nav-link'), ...document.querySelectorAll('#title-bar .nav-link')];
    
    navLinks.forEach((item) => {
      item.parentElement.classList.remove('active');
    });
    
    if (window.location.pathname == '/') {
      document.querySelector('.navbar .nav-item:nth-child(1)').classList.add('active');
      document.querySelector('#title-bar .nav-item:nth-child(1)').classList.add('active');
    } else if (window.location.pathname == '/countries') {
      document.querySelector('.navbar .nav-item:nth-child(2)').classList.add('active');
      document.querySelector('#title-bar .nav-item:nth-child(2)').classList.add('active');
    }

    firstAccess = false;

    const paths = window.location.pathname.split('/');
    const isMediaSingle = paths[1] === 'countries' && paths[3] === 'cities' && paths[5] === 'medias' && paths[6] && (paths[6].includes('story-') || paths[7]);

    if (isMediaSingle) {
      document.querySelector('header .autocomplete').style.display = 'none';
      document.querySelector('header .profile').style.display = 'none';
      document.querySelector('#bottom-profile').style.display = 'block';
    } else {
      document.querySelector('header .autocomplete').style.display = 'flex';
      document.querySelector('header .profile').style.display = 'flex';
      document.querySelector('#bottom-profile').style.display = 'none';
    }
  }

  function setupScroller() {
    const highlightVideoItems = document.querySelectorAll('[data-scroller]');

    Array.from(highlightVideoItems).forEach((scroller) => {
      const highlightScrollLeft = scroller.previousElementSibling;
      const highlightScrollRight = scroller.nextElementSibling;

      if (highlightScrollLeft.onclick) {
        return;
      }
      
      if (scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth) {
        highlightScrollRight.style.display = 'flex';
      }

      highlightScrollLeft.onclick = function () {
        scroller.scrollLeft -= scroller.clientWidth * 0.75;
      };

      highlightScrollRight.onclick = function () {
        scroller.scrollLeft += scroller.clientWidth * 0.75;
      };

      scroller.onscroll = function () {
        if (this.scrollLeft === 0) {
          highlightScrollLeft.style.display = 'none';
        } else if (scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth) {
          highlightScrollRight.style.display = 'none';
        }

        if (this.scrollLeft > 0) {
          highlightScrollLeft.style.display = 'flex';
        }
        
        if (scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth) {
          highlightScrollRight.style.display = 'flex';
        }
      };
    });
  }

  const elementToObserve = document.querySelector('main');

  observer = new MutationObserver(function() {
    loadingSpinner.style.display = 'none';

    setupLinks('main');

    if (window.location.href.includes(countryRoutes) || window.location.href.includes(hashtagRoutes)) {
      setupScroller();
    }
  });

  observer.observe(elementToObserve, {characterData: false, childList: true, attributes: false, subtree:true});

  setupLinks('body');
  
  if (window.location.href.includes(countryRoutes) || window.location.href.includes(hashtagRoutes)) {
    setupScroller();
  }

  if ('windowControlsOverlay' in navigator) {
    const body = document.querySelector('body');

    if (navigator.windowControlsOverlay.visible) {
      document.querySelector('body').classList.add('window-controls-overlay')
    }

    navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
      const isOverlayVisible = navigator.windowControlsOverlay.visible;
  
      if (isOverlayVisible) {
        body.classList.add('window-controls-overlay');
        return;
      }

      body.classList.remove('window-controls-overlay');
    });
  }

  if (!window.matchMedia('(display-mode: standalone)').matches && !window.matchMedia('(display-mode: window-controls-overlay)').matches && navigator.language.startsWith('pt') && !window.location.origin.includes('viajarcomale.com.br')) {
    document.querySelector('#portuguese-language-switcher').style.display = 'block';
  }
  
  initNavbarLinkClick();
})();
