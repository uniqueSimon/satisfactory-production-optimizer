if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/satisfactory-production-optimizer/sw.js', { scope: '/satisfactory-production-optimizer/' })})}