/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZMenu from './libs/menu.js';

class ZApp {
  constructor() {
    new ZMenu();
  }

  open(moduleName) {
    import('./app/' + moduleName + '.js').then((module) => {
      if (module && typeof module.init === 'function') {
        module.init();
        return;
      }

      console.error(module, `Có lỗi! Tính năng không được cài đặt.`);
    });
  }
}

window.ZApp = new ZApp();
