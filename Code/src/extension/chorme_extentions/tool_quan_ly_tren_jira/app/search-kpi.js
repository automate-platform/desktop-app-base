/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZTable from '../libs/table.js';
import template from '../html/search-kpi.js';
import { TD_ATTRS } from '../constants.js';
import ZAlert from '../libs/alert.js';

const ROWS_DEFAULT = [
  ['Defect Rate', 'Def/MM'],
  ['Leakage', 'Def/MM'],
  ['Effort Efficiency', '%'],
  ['Effort Efficiency (up to end)', '%'],
  ['Correction Cost', '%'],
  ['Timeliness', '%'],
  ['Project Point', 'Point'],
  ['PCV Rate', '%'],
  ['CSS', 'Point'],
  ['Timeliness First Commited', '%'],
];
const HEADERS = [
  {
    title: 'Số liệu',
    attrs: TD_ATTRS,
  },
  {
    title: 'Đơn vị',
    attrs: TD_ATTRS,
  },
];

class ZSearchKPI extends ZBase {
  beforeInit() {
    this.title('Search KPI');
    this.options({
      buttons: {
        export: {
          name: 'Xuất dữ liệu',
          onClick: function () {
            ZUtils.exportExcel(AJS.$('#ztable')[0], {
              name: 'KPI_Report',
            });
          },
          class: 'aui-button-primary export-excel',
        },
      },
    });
  }

  afterInit() {
    this.dialog.addHTML(template);
    this.dialog.show();
    this.table = new ZTable(AJS.$('#ztable'));

    // init table
    this.table.addHeader(HEADERS);
    _.each(ROWS_DEFAULT, (z) => {
      var tmpl = `<tr>
              <td data-f-name="Arial" data-f-sz="9">${z[0]}</td>
              <td data-f-name="Arial" data-f-sz="9">${z[1]}</td>
          </tr>`;
      this.table.addRowHTML(tmpl);
    });

    this.disabledBtnExport();
  }

  async onDialogShow(data) {
    this.data = data;

    AJS.$('#search').on('click', () => {
      this.search();
    });
  }

  search() {
    var projectDeferred = [],
    thiz = this,
    projects = AJS.$('#project').auiSelect2('data');

    if (projects.length == 0) {
      ZAlert.warn('Bạn phải chọn ít nhất một dự án.');
      return;
    }

    AJS.$('#search').attr('disabled', 'disabled');
    ZLoading.show();

    var projectSelected = [];
    if (projects.length <= 0) {
      projectSelected = Object.values(this.data.projects);
    } else {
      projects.forEach((p) => {
        projectSelected.push(this.data.projects[p.id]);
      });
    }

    _.each(projectSelected, function () {
      projectDeferred.push($.Deferred());
    });

    Promise.all(projectDeferred).then(function () {
      var tmpl,
        dataColsWidth = [31, 11];

      thiz.table.ele().find('.kpi-data').remove();

      _.each(arguments[0], function (data, idx) {
        const projectName = projectSelected[idx].name();
        tmpl = `<th width="15%" class="kpi-data" data-b-a-c="ffffff" data-f-name="Arial" data-f-sz="9" data-f-color="ffffff" data-fill-color="205081" data-b-a-s="thin" data-a-v="middle" data-a-h="center">${projectName}</th>`;
        dataColsWidth.push(23);

        // append header
        thiz.table.header().find('tr').append(tmpl);
        // append body
        thiz.table
          .body()
          .find('tr')
          .each(function (index) {
            if (data[index]) {
              var style = data[index].style || '',
                value = data[index].value || '';
              var color = style.match(/\#([a-f0-9]+)/),
                attrs =
                  ' data-t="n" data-num-fmt="0.00" data-f-name="Arial" data-f-sz="9" data-f-color="FFFFFF"';

              if (color) {
                color = color[1];
                attrs += ` data-fill-color="${color}"`;
              }

              tmpl = `<td class="kpi-data" style="${style}"${attrs}>${value}</td>`;
              AJS.$(this).append(tmpl);
            } else{
              // set default td
              tmpl = `<td class="kpi-data"></td>`;
              AJS.$(this).append(tmpl);
            }
          });
      });

      thiz.table.attr('data-cols-width', dataColsWidth.join(','));

      AJS.$('#search').removeAttr('disabled');
      ZLoading.hide();

      thiz.disabledBtnExport(false);
    });

    _.each(projectSelected, function (project, index) {
      project.KPIMetrics().then(function (data) {
        projectDeferred[index].resolve(data);
      });
    });
  }
}

export function init() {
  new ZSearchKPI();
}
