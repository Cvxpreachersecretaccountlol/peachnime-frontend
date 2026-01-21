import { useEffect } from 'react';

const AdMavenOnly = () => {
  useEffect(() => {
    // Comprehensive ad network list from EasyList patterns
    const blockedDomains = [
      // Major ad networks
      'googlesyndication.com',
      'googleadservices.com',
      'doubleclick.net',
      'adservice.google',
      '2mdn.net',
      'googletagmanager.com',
      'googletagservices.com',
      
      // Pop/Push ad networks
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
      'evadav.com',
      'epicads.net',
      'adcash.com',
      
      // Malicious/redirect ads
      'claithfoiter.click',
      'cpmlink.net',
      'tsyndicate.com',
      
      // Shopping/e-commerce ads
      'shopee.co',
      'shopee.ph',
      'shopee.sg',
      'shopee.id',
      'lazada.co',
      'tokopedia.com',
      'bukalapak.com',
      'tiktokshop.com',
      
      // Other major networks
      'advertising.com',
      'criteo.com',
      'serving-sys.com',
      'outbrain.com',
      'taboola.com',
      'revcontent.com',
      'mgid.com',
      'content.ad',
      'adskeeper.com',
      'contentabc.com',
      
      // Video ad platforms
      'videohub.tv',
      'videoplaza.tv',
      'fwmrm.net',
      'spotxchange.com',
      'advertising.amazon.com',
      
      // Tracking/analytics (optional)
      'facebook.com/tr',
      'analytics.google.com',
      'mixpanel.com',
      'hotjar.com',
    ];

    // Suspicious TLDs commonly used for ads
    const suspiciousTLDs = [
      '.click',
      '.xyz',
      '.top',
      '.site',
      '.online',
      '.store',
      '.shop',
      '.win',
      '.bid',
      '.download',
      '.stream',
      '.racing',
      '.cricket',
      '.party'
    ];

    // ALLOWED domains - your site + AdMaven
    const allowedDomains = [
      'admaven.com',
      'ads.admaven.com',
      'peachnime',
      'vercel.app',
      'localhost',
      // Video players
      'vidstream',
      'vidcloud',
      'player',
      'embed'
    ];

    const shouldBlock = (url) => {
      if (!url || typeof url !== 'string') return false;
      
      const urlLower = url.toLowerCase();
      
      // NEVER block allowed domains
      if (allowedDomains.some(domain => urlLower.includes(domain))) {
        return false;
      }
      
      // Block known ad domains
      if (blockedDomains.some(domain => urlLower.includes(domain))) {
        return true;
      }
      
      // Block suspicious TLDs
      if (suspiciousTLDs.some(tld => urlLower.includes(tld))) {
        return true;
      }
      
      return false;
    };

    // Block popups
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0];
      if (url && shouldBlock(url)) {
        console.log('🍑 Blocked popup:', url);
        return null;
      }
      return originalOpen.apply(this, args);
    };

    // Gentle ad blocking (run every 5 seconds)
    const blockAds = () => {
      // Block ad iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        // Don't block video players
        const isPlayer = iframe.src && (
          iframe.src.includes('player') ||
          iframe.src.includes('embed') ||
          iframe.src.includes('video') ||
          iframe.className?.includes('player')
        );
        
        if (!isPlayer) {
          const src = iframe.src || iframe.getAttribute('src') || '';
          if (src && shouldBlock(src)) {
            iframe.remove();
            console.log('🍑 Blocked iframe:', src);
          }
        }
      });

      // Block ad scripts
      document.querySelectorAll('script[src]').forEach(script => {
        if (script.src && shouldBlock(script.src)) {
          script.remove();
          console.log('🍑 Blocked script:', script.src);
        }
      });
    };

    // Run once after page loads
    setTimeout(blockAds, 1000);

    // Then check every 5 seconds
    const interval = setInterval(blockAds, 5000);

    console.log('🍑 AdMaven-ONLY blocker active with EasyList patterns');

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default AdMavenOnly;
