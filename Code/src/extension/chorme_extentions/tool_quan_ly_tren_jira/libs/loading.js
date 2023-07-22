/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

const id = `zloading`;
const html = `<div id="${id}" class="zloading-body">Đang tải...</div>`;

class ZLoading {
  show() {
    if ($('#' + id).length == 0) {
      $('body').append(html);
    }

    $('#' + id).show();
  }

  hide() {
    $('#' + id).remove();
  }
}

export default new ZLoading();
