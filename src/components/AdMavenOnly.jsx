import { useEffect } from 'react';

const AdMavenOnly = () => {
  useEffect(() => {
    // Block ALL these ad networks (keep AdMaven)
    const blockedDomains = [
      // Video player ads
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

    // ALLOWED: ONLY AdMaven
    const allowedDomains = [
      'admaven.com',
      'ads.admaven.com',
      'api.admaven.com',
      'serve.admaven.com'
    ];

    // Check if should be blocked
    const shouldBlock = (url) => {
      if (!url) return false;
      
      // Allow AdMaven
      if (allowedDomains.some(domain => url.includes(domain))) {
        return false;
      }
      
      // Block all other ads
      return blockedDomains.some(domain => url.includes(domain));
    };

    // Block scripts
    const blockScripts = () => {
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (shouldBlock(script.src)) {
          script.remove();
          console.log('🍑 Blocked:', script.src);
        }
      });
    };

    // Block iframes
    const blockIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        const src = iframe.src || iframe.getAttribute('src') || '';
        if (shouldBlock(src)) {
          iframe.remove();
          console.log('🍑 Blocked iframe:', src);
        }
      });
    };

    // Block ad containers
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

    // Run blockers
    const runBlockers = () => {
      blockScripts();
      blockIframes();
      blockContainers();
    };

    runBlockers();

    // Watch for new ads
    const observer = new MutationObserver(runBlockers);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const interval = setInterval(runBlockers, 2000);

    console.log('🍑 AdMaven-ONLY: Blocking competitors + video ads');

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default AdMavenOnly;
