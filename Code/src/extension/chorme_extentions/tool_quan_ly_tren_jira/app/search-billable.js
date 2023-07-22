'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZAlert from '../libs/alert.js';
import ZRequest from '../libs/request.js';
import ZTable from '../libs/table.js';
import template from '../html/search-billable.js';
import { TD_ATTRS } from '../constants.js';

const HEADERS = [
  [
    { title: 'Project Name', attrs: TD_ATTRS.concat(['rowspan="2"']) },
    { title: 'Order Temp Code', attrs: TD_ATTRS.concat(['rowspan="2"']) },
    { title: 'Order Official Code', attrs: TD_ATTRS.concat(['rowspan="2"']) },
    { title: 'Off. Billable', attrs: TD_ATTRS.concat(['colspan="2"']) },
    { title: 'LO Billable', attrs: TD_ATTRS.concat(['rowspan="2"']) },
    { title: 'Start Date', attrs: TD_ATTRS.concat(['rowspan="2"']) },
    { title: 'End Date', attrs: TD_ATTRS.concat(['rowspan="2"']) },
  ],
  [
    { title: 'Total', attrs: TD_ATTRS },
    { title: 'Used', attrs: TD_ATTRS },
  ],
];

class SearchBillable extends ZBase {
  beforeInit() {
    this.title('Search Billale');
    this.options({
      buttons: {
        export: {
          name: 'Xuất dữ liệu',
          onClick: function () {
            ZUtils.exportExcel(AJS.$('#ztable')[0], {
              name: 'Billable_Report',
            });
          },
          class: 'aui-button-primary export-excel',
        },
      },
    });
  }

  afterInit() {
    this.dialog.addHTML(template);
    // this.dialog.addHTML(this.table.html());
    this.dialog.show();
    this.table = new ZTable(AJS.$('#ztable'));

    // init table
    this.table.attr('data-cols-width', '23,23,83,10,10,10,10');
    this.table.attr('style', 'font-size: 12px;');

    HEADERS.forEach((head) => {
      this.table.addHeader(head);
    });

    this.disabledBtnExport();
  }

  async onDialogShow(data) {
    this.data = data;
    // init year select
    this.initYears();

    // search
    AJS.$('#search').on('click', () => {
      this.search();
    });
  }

  initYears() {
    var yearSel = AJS.$('#year'),
      yearCur = new Date().getFullYear();

    yearSel.append('<option value="">All</option>');

    for (var i = yearCur; i >= yearCur - 5; i--) {
      yearSel.append(`<option value="${i}">${i}</option>`);
    }

    yearSel.on('change', function (e) {
      var _quarter = AJS.$('#quarter');

      if (e.val == '') {
        _quarter.val('').attr('disabled', 'disabled');
      } else {
        _quarter.removeAttr('disabled');
      }

      _quarter.auiSelect2().trigger('change');
    });
  }

  search() {
    const thiz = this;
    const projectSelected = AJS.$('#project').auiSelect2('data');

    if (projectSelected.length == 0) {
      ZAlert.warn('Bạn phải chọn ít nhất một dự án.');
      return;
    }

    let promiseQueue = [],
      data = [];

    // loading
    this.tableLoading();

    _.each(projectSelected, function () {
      promiseQueue.push($.Deferred());
    });

    Promise.all(promiseQueue).then(function () {
      thiz.render(data);
    });

    _.each(projectSelected, function (project, index) {
      let i = 0;
      const projectId = thiz.data.projects[project.id].id();

      new ZRequest()
        .get(`rest/billrvn/1.0/bill-revenue-order/page_info`, {
          projectId: projectId,
          tempCodeSearch: '',
          currencyCodeSearch: 'All',
          customerCodeSearch: 'All',
          pageDelete: 'false',
        })
        .then(function (resp) {
          let deferredQueryDataQueue = [],
            deferredIndex = 0;

          for (i = 1; i <= resp.totalPages; i++) {
            deferredQueryDataQueue.push($.Deferred());
          }

          Promise.all(deferredQueryDataQueue).then(function () {
            _.each(arguments[0], function (billable) {
              data = data.concat(billable);
            });

            promiseQueue[index].resolve();
          });

          for (i = 1; i <= resp.totalPages; i++) {
            new ZRequest()
              .get(`rest/billrvn/1.0/bill-revenue-order/get-order`, {
                page: i,
                isProject: 1,
                projectId: projectId,
                tempCodeSearch: '',
                currencyCodeSearch: 'All',
                customerCodeSearch: 'All',
                pageDelete: 'false',
              })
              .then(function (billables) {
                _.each(billables, function (billable, key) {
                  billables[key].projectId = projectId;
                  billables[key].projectName = project.text;
                });

                deferredQueryDataQueue[deferredIndex].resolve(billables);
                deferredIndex++;
              });
          }
        })
        .catch(() => {
          thiz.tableNotFound();
        });
    });
  }

  render(data) {
    // filter data by condition
    data = this._filterData(data);

    // clear content
    this.table.body().html('');

    if (data.length == 0) {
      this.tableNotFound();
      return;
    }

    // append billable data
    _.each(data, (billable) => {
      let billableOffshoreTotal = 0,
        billableOffshoreUsed = 0;

      if (billable.listResourceType) {
        billable.listResourceType.forEach((bil) => {
          if (bil.name === 'Offshore') {
            billableOffshoreTotal = bil.effort;
            billableOffshoreUsed = bil.usedEffort;
          }
        });
      }

      const tmpl = `
          <tr>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc">${
                billable.projectName
              }</td>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc">${
                billable.internalCode
              }</td>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc">${
                billable.quoteName
              }</td>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc" data-t="n" data-num-fmt="0.00">${billableOffshoreTotal}</td>
              <td${
                billableOffshoreTotal != billableOffshoreUsed
                  ? ' class="danger"'
                  : ''
              } data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc" data-t="n" data-num-fmt="0.00">${billableOffshoreUsed}</td>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc" data-t="n" data-num-fmt="0.00"></td>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc" data-t="d">${
                billable.StartDate
              }</td>
              <td data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc" data-t="d">${
                billable.EndDate
              }</td>
          </tr>`;

      this.table.addRowHTML(tmpl);
    });

    ZLoading.hide();
    this.disabledBtnExport(false);
  }

  _filterData(data) {
    const yearSel = AJS.$('#year').auiSelect2('data'),
      quarterSel = AJS.$('#quarter').auiSelect2('data'),
      isOK = function (billable, year, quarter) {
        let _quarters = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [9, 10, 11],
          ],
          dateFrom,
          dateTo,
          startMonth,
          endMonth,
          billStartDate = new Date(billable.StartDate),
          billEndDate = new Date(billable.EndDate);

        startMonth =
          quarter.id == '' ? 0 : _quarters[parseInt(quarter.id, 10)][0];
        endMonth =
          quarter.id == '' ? 12 : _quarters[parseInt(quarter.id, 10)][2] + 1;

        dateFrom = new Date();
        dateFrom.setMonth(startMonth);
        dateFrom.setFullYear(year.text);
        dateFrom.setDate(1);

        dateTo = new Date(dateFrom);
        dateTo.setMonth(endMonth);
        dateTo.setDate(0);

        return (
          (billStartDate <= dateFrom && billEndDate >= dateFrom) ||
          (dateFrom <= billStartDate && billStartDate <= dateTo)
        );
      };

    if (!yearSel || yearSel.id == '') {
      return data;
    }

    let result = [];

    _.each(data, function (billable, index) {
      if (isOK(billable, yearSel, quarterSel)) {
        result.push(billable);
      }
    });

    return _.sortBy(result, function (o) {
      return new Date(o.StartDate);
    }).reverse();
  }
}

export function init() {
  new SearchBillable();
}
