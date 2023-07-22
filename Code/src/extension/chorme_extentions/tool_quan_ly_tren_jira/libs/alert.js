/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

class ZAlert {
  info(msg, title = 'Thông báo!') {
    AJS.flag({
      type: 'info',
      body: msg,
      title: title,
      close: 'auto',
    });
  }

  error(msg, title = 'Thông báo lỗi!') {
    AJS.flag({
      type: 'error',
      body: msg,
      title: title,
      close: 'auto',
    });
  }

  success(msg, title = 'Thành công!') {
    AJS.flag({
      type: 'success',
      body: msg,
      title: title,
      close: 'auto',
    });
  }

  warn(msg, title = 'Chú ý!') {
    AJS.flag({
      type: 'warning',
      body: msg,
      title: title,
      close: 'auto',
    });
  }
}

export default new ZAlert();
