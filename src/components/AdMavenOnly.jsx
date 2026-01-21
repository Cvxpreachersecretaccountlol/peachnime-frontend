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
      'vidcloud.pro',
      'streamtape.com',
      'dood.watch',
      'filemoon.sx',
      'hilltopads.net',
      'trafficjunky.com',
      'adcash.com',
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net'
    ];

    const allowedDomains = [
      'admaven.com',
      'ads.admaven.com',
      'api.admaven.com',
      'serve.admaven.com'
    ];

    const shouldBlock = (url) => {
      if (!url) return false;
      if (allowedDomains.some(domain => url.includes(domain))) {
        return false;
      }
      return blockedDomains.some(domain => url.includes(domain));
    };

    // 1. BLOCK REDIRECTS - Prevent window.location changes
    let isBlocking = false;
    const originalLocationSetter = Object.getOwnPropertyDescriptor(window, 'location').set;
    
    Object.defineProperty(window, 'location', {
      get: () => window.location,
      set: (value) => {
        const urlString = value.toString();
        if (shouldBlock(urlString)) {
          console.log('🍑 Blocked redirect to:', urlString);
          isBlocking = true;
          return;
        }
        originalLocationSetter.call(window, value);
      }
    });

    // 2. BLOCK window.open popups
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0];
      if (shouldBlock(url)) {
        console.log('🍑 Blocked popup:', url);
        return null;
      }
      return originalOpen.apply(this, args);
    };

    // 3. BLOCK link clicks to ad domains
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && shouldBlock(link.href)) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🍑 Blocked link click:', link.href);
      }
    }, true);

    // 4. BLOCK meta refresh redirects
    const blockMetaRefresh = () => {
      document.querySelectorAll('meta[http-equiv="refresh"]').forEach(meta => {
        const content = meta.getAttribute('content') || '';
        if (blockedDomains.some(domain => content.includes(domain))) {
          meta.remove();
          console.log('🍑 Blocked meta refresh');
        }
      });
    };

    // 5. BLOCK scripts
    const blockScripts = () => {
      document.querySelectorAll('script[src]').forEach(script => {
        if (shouldBlock(script.src)) {
          script.remove();
          console.log('🍑 Blocked script:', script.src);
        }
      });
    };

    // 6. BLOCK iframes
    const blockIframes = () => {
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src || iframe.getAttribute('src') || '';
        if (shouldBlock(src)) {
          iframe.remove();
          console.log('🍑 Blocked iframe:', src);
        }
      });
    };

    // 7. BLOCK ad containers
    const blockContainers = () => {
      const selectors = [
        'div[id*="google_ads"]',
        'div[class*="adsbygoogle"]',
        '[class*="propeller"]',
        '[class*="adsterra"]',
        '[class*="exoclick"]',
        '[class*="popcash"]'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    // Run all blockers
    const runBlockers = () => {
      blockMetaRefresh();
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

    console.log('🍑 AdMaven-ONLY with redirect blocking active');

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default AdMavenOnly;
