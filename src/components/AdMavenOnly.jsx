import { useEffect } from 'react';

const AdMavenOnly = () => {
  useEffect(() => {
    // Very specific ad domains ONLY
    const blockedDomains = [
      'popcash.net',
      'propellerads.com',
      'adsterra.com',
      'exoclick.com',
      'juicyads.com',
      'popads.net',
      'clickadu.com',
      'claithfoiter.click',
      'cpmlink.net',
      'tsyndicate.com',
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
    ];

    const allowedDomains = [
      'admaven.com',
      'peachnime',
      'vercel.app',
      'localhost',
    ];

    const shouldBlock = (url) => {
      if (!url || typeof url !== 'string') return false;
      
      const urlLower = url.toLowerCase();
      
      // NEVER block your own site or AdMaven
      if (allowedDomains.some(domain => urlLower.includes(domain))) {
        return false;
      }
      
      // ONLY block if EXACT match with blocked domains
      return blockedDomains.some(domain => urlLower.includes(domain));
    };

    // ONLY block popups/redirects to ad sites
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0];
      if (url && shouldBlock(url)) {
        console.log('🍑 Blocked popup:', url);
        return null;
      }
      return originalOpen.apply(this, args);
    };

    // ONLY block ad iframe (check every 3 seconds, don't be aggressive)
    const blockAds = () => {
      // Block ONLY iframes with ad URLs
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src || iframe.getAttribute('src') || '';
        if (src && shouldBlock(src)) {
          iframe.remove();
          console.log('🍑 Blocked ad iframe:', src);
        }
      });

      // Block ONLY scripts from ad domains
      document.querySelectorAll('script[src]').forEach(script => {
        if (script.src && shouldBlock(script.src)) {
          script.remove();
          console.log('🍑 Blocked ad script:', script.src);
        }
      });
    };

    // Run ONCE on load
    setTimeout(blockAds, 1000);

    // Then check periodically but gently
    const interval = setInterval(blockAds, 5000);

    console.log('🍑 Minimal ad blocker active');

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default AdMavenOnly;
