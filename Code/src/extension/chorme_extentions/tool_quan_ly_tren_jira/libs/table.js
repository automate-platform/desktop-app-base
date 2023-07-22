/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

export default class ZTable {
  constructor(ele) {
    if (ele) {
      this.tb = ele;
    } else {
      (this.tb = $(`
      <table id="ztable" class="ztable aui border">
        <thead></thead>
        <tbody></tbody>
        <tfoot></tfoot>
      </table>
    `)).find('#ztable');
    }
  }

  ele() {
    return this.tb;
  }

  attr(key, value) {
    this.tb.attr(key, value);
  }

  header() {
    return this.tb.find('thead');
  }

  body() {
    return this.tb.find('tbody');
  }

  footer() {
    return this.tb.find('tfooter');
  }

  loading(num = 0) {
    if (typeof num === 'boolean') {
      this.body().find('tr.loading-text').remove();
      return;
    }

    this.text('Đang tải dữ liệu...', num);
  }

  text(msg, num = 0) {
    this.body().find('tr.loading-text').remove();

    const thLength = this.header().find('tr th').length;
    this.body().html(`<tr class="loading-text">
      <td colspan="${num || thLength}" align="center">${msg}</td>
    </tr>`);
  }

  addHeader(head) {
    let th = ``;
    head.forEach((col) => {
      const atts = col.attrs ? col.attrs.join(' ') : '';
      th += `<th ${atts}>${col.title}</th>`;
    });

    this.header().append(`<tr>${th}</tr>`);
  }

  addRow(row) {
    let td = ``;
    row.forEach((col) => {
      const atts = col.attrs ? col.attrs.join(' ') : '';
      td += `<td ${atts}>${col.title}</td>`;
    });

    this.body().append(`<tr>${td}</tr>`);
  }

  addRowHTML(rowHTML) {
    this.body().append(rowHTML);
  }

  addFooter(row) {
    let td = ``;
    row.forEach((col) => {
      const atts = col.attrs ? col.attrs.join(' ') : '';
      td += `<td ${atts}>${col.title}</td>`;
    });

    this.footer().append(`<tr>${td}</tr>`);
  }

  html() {
    return this.tb[0].outerHTML;
  }
}
