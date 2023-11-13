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

    if (e?.metaKey || !link) {
      return;
    }
    
    if (!link.includes(window.location.origin + '/') || link === window.location.origin + '/#' || link === window.location.href) {
      return;
    }

    loadingSpinner.style.display = 'block';
  }

  function setupLinks(tag) {
    const currentUrl = window.location.href;

    const routeLinks = [...document.querySelectorAll(tag + ' a')];

    routeLinks.forEach((a) => {
      a.addEventListener('click', showSpinner);
    });

    document.querySelector('#language-switcher').href = currentUrl.includes('viajarcomale.com.br') ? currentUrl.replace('viajarcomale.com.br', 'viajarcomale.com') : currentUrl.replace('viajarcomale.com', 'viajarcomale.com.br');

    if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches) {
      document.querySelectorAll('a[target=_blank]').forEach(function(a) {
        a.removeAttribute('target');
     });
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
        highlightScrollRight.style.display = 'block';
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
          highlightScrollLeft.style.display = 'block';
        }
        
        if (scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth) {
          highlightScrollRight.style.display = 'block';
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
})();
