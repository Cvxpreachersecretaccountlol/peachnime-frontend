import { useEffect } from 'react';

const AdMavenOnly = () => {
  useEffect(() => {
    const blockedDomains = [
      'popcash.net',
      'propellerads.com',
      'adsterra.com',
      'exoclick.com',
      'juicyads.com',
      'popads.net',
      'clickadu.com',
      'bidvertiser.com',
      'claithfoiter.click',
      'cpmlink.net',
      'tsyndicate.com',
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
      // Shopee and e-commerce
      'shopee.co',
      'shopee.ph',
      'shopee.sg',
      'lazada.co',
      'tokopedia.com',
      'bukalapak.com',
      'tiktokshop.com',
    ];

    // Suspicious TLDs often used for ads
    const suspiciousTLDs = ['.click', '.xyz', '.top', '.site', '.online', '.store', '.shop', '.win', '.bid'];

    const allowedDomains = [
      'admaven.com',
      'ads.admaven.com',
      'api.admaven.com',
      'serve.admaven.com'
    ];

    const shouldBlock = (url) => {
      if (!url) return false;
      
      // Allow AdMaven
      if (allowedDomains.some(domain => url.includes(domain))) {
        return false;
      }
      
      // Block known ad domains
      if (blockedDomains.some(domain => url.includes(domain))) {
        return true;
      }
      
      // Block suspicious TLDs
      if (suspiciousTLDs.some(tld => url.includes(tld))) {
        return true;
      }
      
      // Block random-looking domains
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // Block if domain has very long random strings (15+ chars)
        if (/[a-z0-9]{15,}/i.test(domain)) {
          return true;
        }
      } catch (e) {
        // Not a valid URL
      }
      
      return false;
    };

    // BLOCK REDIRECTS
    const originalLocationSetter = Object.getOwnPropertyDescriptor(window, 'location')?.set;
    if (originalLocationSetter) {
      Object.defineProperty(window, 'location', {
        get: () => window.location,
        set: (value) => {
          const urlString = value.toString();
          if (shouldBlock(urlString)) {
            console.log('🍑 Blocked redirect:', urlString);
            return;
          }
          originalLocationSetter.call(window, value);
        }
      });
    }

    // BLOCK window.open
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0];
      if (shouldBlock(url)) {
        console.log('🍑 Blocked popup:', url);
        return null;
      }
      return originalOpen.apply(this, args);
    };

    // BLOCK link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && shouldBlock(link.href)) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🍑 Blocked link:', link.href);
      }
    }, true);

    const blockScripts = () => {
      document.querySelectorAll('script[src]').forEach(script => {
        if (shouldBlock(script.src)) {
          script.remove();
          console.log('🍑 Blocked script:', script.src);
        }
      });
    };

    const blockIframes = () => {
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src || iframe.getAttribute('src') || '';
        if (shouldBlock(src)) {
          iframe.remove();
          console.log('🍑 Blocked iframe:', src);
        }
      });
    };

    const blockContainers = () => {
      const selectors = [
        'div[id*="google_ads"]',
        'div[class*="adsbygoogle"]',
        '[class*="propeller"]',
        '[class*="shopee"]',
        '[id*="shopee"]'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    const runBlockers = () => {
      blockScripts();
      blockIframes();
      blockContainers();
    };

    runBlockers();

    const observer = new MutationObserver(runBlockers);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const interval = setInterval(runBlockers, 2000);

    console.log('🍑 AdMaven-ONLY with Shopee/random ad blocking');

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default AdMavenOnly;
