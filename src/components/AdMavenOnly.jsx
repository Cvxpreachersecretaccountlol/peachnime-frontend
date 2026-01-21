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
      'hilltopads.net',
      'trafficjunky.com',
      'adcash.com',
      'a-ads.com',
      'coinzilla.com',
      'adhitz.com',
      'adskeeper.com',
      'mgid.com',
      'taboola.com',
      'outbrain.com',
      'revcontent.com',
      'contentabc.com',
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
      'advertising.com',
      'criteo.com',
      'serving-sys.com'
    ];

    // ALLOWED: ONLY AdMaven
    const allowedDomains = [
      'admaven.com',
      'ads.admaven.com', 
      'api.admaven.com',
      'serve.admaven.com',
      'cdn.admaven.com'
    ];

    // Check if should be blocked
    const shouldBlock = (url) => {
      if (!url) return false;
      
      // Allow AdMaven - don't block
      if (allowedDomains.some(domain => url.includes(domain))) {
        return false;
      }
      
      // Block all other ads
      return blockedDomains.some(domain => url.includes(domain));
    };

    // Block competitor scripts
    const blockScripts = () => {
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (shouldBlock(script.src)) {
          script.remove();
          console.log('🍑 Blocked:', script.src);
        }
      });
    };

    // Block competitor iframes  
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

    // Block ad containers (except AdMaven)
    const blockContainers = () => {
      const selectors = [
        'div[id*="google_ads"]',
        'div[class*="adsbygoogle"]',
        '[class*="propeller"]',
        '[id*="propeller"]',
        '[class*="adsterra"]',
        '[id*="adsterra"]',
        '[class*="exoclick"]',
        '[id*="exoclick"]',
        '[class*="popcash"]',
        '[id*="popcash"]'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    // Intercept createElement to block at creation
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName) {
      const element = originalCreateElement(tagName);
      
      if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe') {
        const originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name, value) {
          if (name === 'src' && shouldBlock(value)) {
            console.log('🍑 Blocked at creation:', value);
            return; // Don't set src
          }
          return originalSetAttribute(name, value);
        };
      }
      return element;
    };

    // Run all blockers
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

    console.log('🍑 AdMaven-ONLY mode: All other ads blocked');

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default AdMavenOnly;
