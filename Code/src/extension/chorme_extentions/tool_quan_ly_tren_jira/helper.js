var Helper = {
  insertJs: function (js, isModule = false) {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');

    if (isModule) {
      script.setAttribute('type', 'module');
    }

    script.setAttribute('src', chrome.extension.getURL(js));

    const head =
      document.head ||
      document.getElementsByTagName('head')[0] ||
      document.documentElement;

    head.insertBefore(script, head.lastChild);
  },
  insertCss: function (css) {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');

    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', chrome.runtime.getURL(css));

    head.appendChild(link);
  },
  insertConfig: function () {
    const pathname = window.location.pathname;
    const version = pathname.match(/(jira(\d+))/g);
    const promises = [];
    const configFiles = ['config/app.json'];

    if (version) {
      configFiles.push(`config/app.${version[0]}.json`);
    }

    configFiles.forEach((file) => {
      promises.push(
        new Promise((resolve) => {
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (xhr.status === 200 && xhr.readyState === 4) {
              resolve(xhr.responseText);
            }
          };
          xhr.open('GET', chrome.runtime.getURL(file), true);
          xhr.send();
        })
      );
    });

    Promise.all(promises).then((resp) => {
      // add config url
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');

      script.type = 'text/javascript';
      script.text = `var ZAPP_CONFIG = Object.assign({}, ${resp[0]}, ${resp[1]});
  ZAPP_CONFIG.baseURL = '${chrome.runtime.getURL('')}';`;

      head.appendChild(script);
    });
  },
};
