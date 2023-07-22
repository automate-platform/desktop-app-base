/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZStore from './store.js';

const CACHE_NAME = 'FGA.PDC';
ZStore.set(CACHE_NAME, ZAPP_CONFIG || {});

class ZConfig {
  constructor() {
  }

  get(name) {
    const data = ZStore.get(CACHE_NAME);

    if (!data) {
      return null;
    }

    if (name) {
      return data[name] || null;
    }

    return data;
  }

  set(name, value) {
    const data = ZStore.get(CACHE_NAME);
    data[name] = value;

    ZStore.set(CACHE_NAME, JSON.stringify(data));
  }
}

export default new ZConfig();
