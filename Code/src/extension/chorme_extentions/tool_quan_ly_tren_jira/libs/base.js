/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZDialog from './dialog.js';
import ZLoading from './loading.js';
import ZUser from './user.js';

export default class ZBase {
  constructor() {
    this._options = {
      onShow: (data) => {
        this.onDialogShow(data);
      },
      onHide: () => {
        this.onDialogHide();
      },
    };
    this.init();
  }

  title(title) {
    this._options.title = title;
  }

  options(options) {
    this._options = Object.assign(this._options, options);
  }

  async init() {
    this.user = await ZUser.info();

    if (typeof this.beforeInit === 'function') {
      this.beforeInit();
    }

    this.dialog = new ZDialog(this._options || {});

    if (typeof this.afterInit === 'function') {
      this.afterInit();
    }
  }

  onDialogShow() {}
  onDialogHide() {}

  tableNotFound() {
    if (this.table) {
      this.table.text('Không tìm thấy dữ liệu.');
    }
    ZLoading.hide();
  }

  tableLoading() {
    if (this.table) {
      this.table.loading();
    }
    ZLoading.show();
  }

  disabledBtnExport(isDisable = true){
    const btnExport = $('.export-excel');
    if(isDisable){
      btnExport.attr('disabled', 'disabled');
    } else{
      btnExport.removeAttr('disabled');
    }
  }
}
