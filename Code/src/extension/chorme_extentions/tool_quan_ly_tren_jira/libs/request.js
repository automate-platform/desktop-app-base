/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZAlert from './alert.js';
import ZUrl from './url.js';
import ZLoading from './loading.js';

function errorHandle(jqXHR) {
  if (jqXHR.status >= 200 && jqXHR.status < 300) {
    return;
  }

  if (jqXHR.status >= 400 && jqXHR.status < 500) {
    ZAlert.error('Bạn chưa đăng nhập hệ thống.');
    return;
  }

  console.log(jqXHR.status);
  ZAlert.error('Không thể kết nối tới API.');
}

export default class ZRequest {
  constructor(options) {
    this.options = $.extend(
      {
        dataType: 'json',
        contentType: 'application/json',
      },
      options || {}
    );
  }

  get(url, data = {}) {
    if (!url.match(/^((https|chrome-extension)\:\/\/)/)) {
      url = ZUrl.get(url);
    }

    return new Promise((resolve, reject) => {
      const req = $.ajax(
        $.extend(this.options, {
          url: url,
          data: data,
          type: 'GET',
        })
      );

      req.done((resp) => {
        resolve(resp);
      });

      req.fail((jqXHR) => {
        ZLoading.hide();
        errorHandle(jqXHR);
        reject();
      });
    });
  }

  post(url, data) {
    if (!url.match(/^(https\:\/\/)/)) {
      url = ZUrl.get(url);
    }

    return new Promise((resolve, reject) => {
      const req = $.ajax(
        $.extend(this.options, {
          url: url,
          data: data,
          type: 'POST',
        })
      );

      req.done((resp) => {
        resolve(resp);
      });

      req.fail((jqXHR) => {
        ZLoading.hide();
        errorHandle(jqXHR);
        reject();
      });
    });
  }

  put(url, data) {
    if (!url.match(/^(https\:\/\/)/)) {
      url = ZUrl.get(url);
    }

    return new Promise((resolve, reject) => {
      const req = $.ajax(
        $.extend(this.options, {
          url: url,
          data: JSON.stringify(data),
          type: 'PUT',
        })
      );

      req.done((resp) => {
        resolve(resp);
      });

      req.fail((jqXHR) => {
        ZLoading.hide();
        errorHandle(jqXHR);
        reject();
      });
    });
  }
}
