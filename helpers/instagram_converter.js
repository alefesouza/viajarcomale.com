// Workaround to get Instagram links even with virtual dom
theImages4 = [...$0.querySelectorAll('img')].map(item => ({ image: item.src, description: item.alt, link: item.closest('a').href, width: item.naturalWidth, height: item.naturalHeight, mode: item.naturalHeight > item.naturalWidth ? 'portrait' : 'landscape' }));

allImages = [...theImages4, ...theImages3, ...theImages2, ...theImages];

allImagesLinks = new Set(allImages.map(i => i.link));

allImages2 = [...allImagesLinks].map(i => allImages.find(a => a.link == i));
