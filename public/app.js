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

  function showSpinner() {
    loadingSpinner.style.display = 'block';
  }

  function setupLinks() {
    const routeLinks = [...document.querySelectorAll('a')].filter(l => l.href.includes(window.location.origin + '/'));

    routeLinks.forEach((a) => {
      a.removeEventListener('click', showSpinner);
      a.addEventListener('click', showSpinner);
    });
  }

  function setupScroller() {
    const highlightVideoItems = document.querySelectorAll('.scroller_items');

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

    setupLinks();

    if (window.location.href.includes(countryRoutes) || window.location.href.includes(hashtagRoutes)) {
      setupScroller();
    }
  });

  observer.observe(elementToObserve, {characterData: false, childList: true, attributes: false, subtree:true});

  setupLinks();
  
  if (window.location.href.includes(countryRoutes) || window.location.href.includes(hashtagRoutes)) {
    setupScroller();
  }

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  if ('windowControlsOverlay' in navigator) {
    console.log(navigator.windowControlsOverlay.visible)
    const top = document.querySelector('#top');

    if (navigator.windowControlsOverlay.visible) {
      document.querySelector('#top').classList.add('window-controls-overlay')
    }

    navigator.windowControlsOverlay.addEventListener('geometrychange', debounce(e => {
      // Detect if the Window Controls Overlay is visible.
      const isOverlayVisible = navigator.windowControlsOverlay.visible;
  
      if (isOverlayVisible) {
        top.classList.add('window-controls-overlay');
        return;
      }

      top.classList.remove('window-controls-overlay');
    }, 200));
  }
})();
