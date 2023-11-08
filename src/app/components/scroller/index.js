'use client'

// This is the best workaround I found to add DOM events without
// messing with the SSR on Next.js 14, please don't judge me.
export default function Scroller() {
  if (typeof document === 'undefined') {
    return null;
  }

  const script = document.createElement('script');
  script.id = 'media-scroller';
  script.innerHTML = `
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

    setTimeout(() => {
      setupScroller();
    }, 750);
  `;

  if (!document.querySelector('media-scroller')) {
    document.body.appendChild(script);
  } else {
    setTimeout(() => {
      setupScroller();
    }, 750);
  }
  
  return null;
}
