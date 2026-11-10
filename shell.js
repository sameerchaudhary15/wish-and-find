/* The page skeleton. The Admin page re-saves the site by filling this
   template with the latest content, so index.html always has this shape. */
(function (root) {
  function shell(contentJson) {
    return [
      '<meta name="claude:viewport-fit-sides" content="cover">',
      '<title>Wish &amp; Find</title>',
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap">',
      '<link rel="stylesheet" href="styles.css">',
      '<div id="app"><p class="boot">Loading Wish &amp; Find</p></div>',
      '<script type="application/json" id="wf-content">' + contentJson + '</script>',
      '<script src="site-config.js"></script>',
      '<script src="shell.js"></script>',
      '<script src="app.js"></script>',
      '<script src="admin.js"></script>',
      ''
    ].join('\n');
  }
  root.WF_SHELL = shell;
  if (typeof module !== 'undefined' && module.exports) module.exports = shell;
})(typeof window !== 'undefined' ? window : globalThis);
