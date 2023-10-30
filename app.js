(() => {
  let deferredPrompt;
  const addToHomeBtn = document.querySelector('#add-to-home');

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    
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

  if ( ! google ) {
    // Offline access
    return;
  }

  google.charts.load('current', {
    'packages':['geochart'],
  });
  google.charts.setOnLoadCallback(drawRegionsMap);

  function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable([
      ['Country'],
      ['Brazil'],
      ['United States'],
      ['South Korea'],
      ['Japan'],
      ['Austria'],
      ['Germany'],
      ['Switzerland'],
      ['Netherlands'],
      ['Portugal'],
      ['Mexico'],
      ['Canada'],
      ['Paraguay'],
      ['Argentina'],
    ]);

    var options = {
      backgroundColor: 'transparent',
      defaultColor: '#2096cc',
    };

    var chart = new google.visualization.GeoChart(document.getElementById('visited-countries'));

    chart.draw(data, options);
  }
})();
