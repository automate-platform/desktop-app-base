/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZUrl from './url.js';

const CACHE_NAME = ZUrl.get();
const store = localStorage;

export default {
  set(key, value) {
    let data = this.get() || {};
    data[key] = value;

    store.setItem(CACHE_NAME, JSON.stringify(data));
  },

  get(name) {
    let data = store.getItem(CACHE_NAME);

    if (!data) {
      return null;
    }

    data = JSON.parse(data);

    if (name) {
      return data[name] || null;
    }

    return data || {};
  },

  remove(key) {
    var data = this.get();
    if (key && key in data) {
      data[key] = null;
      store.setItem(CACHE_NAME, JSON.stringify(data));
    }
  },

  clearAll() {
    store.removeItem(CACHE_NAME);
  },
}
