'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZAlert from '../libs/alert.js';
import ZRequest from '../libs/request.js';
import ZJiraProject from '../libs/jira.project.js';
import ZTable from '../libs/table.js';
import template from '../html/resource-allowcation.js';
import { TD_ATTRS } from '../constants.js';

const HEADERS = [
  [
    { title: 'STT', attrs: TD_ATTRS.concat(['width="30"']) },
    { title: 'Tên thành viên', attrs: TD_ATTRS },
    { title: 'Jan', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Feb', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Mar', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Apr', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'May', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Jun', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Jul', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Aug', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Sep', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Oct', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Nov', attrs: TD_ATTRS.concat(['width="55"']) },
    { title: 'Dec', attrs: TD_ATTRS.concat(['width="55"']) },
  ],
];

class ResourceAllowcation extends ZBase {
  beforeInit() {
    this.title('Resource Allocation');
    this.options({
      buttons: {
        export: {
          name: 'Xuất dữ liệu',
          onClick: function () {
            ZUtils.exportExcel($('#ztable')[0], {
              name: 'Resource_Allowcation_Report',
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
    this.table = new ZTable($('#ztable'));

    // init table
    this.table.attr('data-cols-width', '23,23,83,10,10,10,10');

    HEADERS.forEach((head) => {
      this.table.addHeader(head);
    });
    
    this.disabledBtnExport();
  }

  onDialogShow(data) {
    this.data = data;
    this.initYears();

    // search
    $('#search').on('click', () => {
      this.search();
    });
  }

  initYears() {
    const yearEl = $('#year');
    const yearCur = new Date().getFullYear();

    for (var i = yearCur; i >= yearCur - 10; i--) {
      yearEl.append(`<option value="${i}">${i}</option>`);
    }
  }

  search() {
    const thiz = this;
    const projects = $('#project').auiSelect2('data');
    const year = $('#year').auiSelect2('data');
    const user = $('#users').val();
    let projectDeferred = [];
    let data = [];

    if (!projects || projects.length == 0) {
      ZAlert.warn('Bạn phải chọn ít nhất một dự án.');
      return;
    }

    if (!year || year.length == 0) {
      ZAlert.warn('Bạn phải chọn ít nhất một năm.');
      return;
    }

    // loading
    this.tableLoading();

    projects.forEach((m) => {
      projectDeferred.push($.Deferred());
    });

    Promise.all(projectDeferred).then(() => {
      thiz.render(data);
    });

    const dateFrom = '01/Jan/' + year.id;
    const dateTo = '31/Dec/' + year.id;

    // const filterUser = !user? "All": user;
    const filterUser = 'All';

    _.each(projects, function (project, index) {
      let i = 0;
      
      new ZRequest()
        .get('rest/hunger/1.0/time-allocate-resource/allocate/page_info', {
          projectId: thiz.data.projects[project.id].id(),
          filterUsername: filterUser,
          filterFromDate: dateFrom,
          filterToDate: dateTo,
        })
        .then(function (resp) {
          let deferredQueryDataQueue = [],
            deferredIndex = 0;

          for (i = 1; i <= resp.totalPages; i++) {
            deferredQueryDataQueue.push($.Deferred());
          }

          Promise.all(deferredQueryDataQueue).then(function () {
            _.each(arguments[0], function (items) {
              data = data.concat(items);
            });

            projectDeferred[index].resolve();
          });

          for (i = 1; i <= resp.totalPages; i++) {
            const params = {
              projectId: thiz.data.projects[project.id].id(),
              filterUsername: filterUser,
              filterFromDate: dateFrom,
              filterToDate: dateTo,
              pageNo: i,
            };
            const url =
              'rest/hunger/1.0/time-allocate-resource/allocate/get_all';
            new ZRequest().get(url, params).then(function (items) {
              deferredQueryDataQueue[deferredIndex].resolve(items);
              deferredIndex++;
            });
          }
        });
    });
  }

  render(users) {
    const _user = $('#users').val();
    const year = $('#year').auiSelect2('data');
    const thiz = this;
    let results = {},
      monthIsValid = function (from, to, month) {
        var date = new Date();
        date.setFullYear(year.id);
        date.setMonth(month);

        return date >= from && date <= to;
      };

    this.table.body().html('');

    const userCustom  = _user.split(',')?.map(p=> {return p.trim().toLowerCase()});;
    if(_user && userCustom.length > 0){
      users = users.filter(p => userCustom.includes(p.username))
    }

    _.each(users, function (user) {
      // if (_user && _user.split(',').indexOf(user.username) >= 0) {
      //   return;
      // }

      if (!results[user.username]) {
        results[user.username] = {
          username: user.username,
          displayName: user.displayName,
          resourceAllowcation: {},
        };
      }

      const fromDate = new Date(user.fromDate);
      const toDate = new Date(user.toDate);

      for (let i = 0; i < 12; i++) {
        if (!results[user.username].resourceAllowcation[i]) {
          results[user.username].resourceAllowcation[i] = 0;
        }

        if (monthIsValid(fromDate, toDate, i)) {
          results[user.username].resourceAllowcation[i] += parseFloat(
            user.hours
          );
        }
      }
    });

    let index = 1;
    _.each(results, function (user) {
      let tmpl = `<tr>
            <td widtd="3%" data-t="n" class="center" data-f-name="Arial" data-f-sz="9">${index}</td>
            <td data-f-name="Arial" data-f-sz="9">${user.displayName}</td>`;

      _.each(user.resourceAllowcation, function (ra) {
        let className = 'busy',
          hour = '',
          attrs = [
            'data-fill-color="008000"',
            'data-f-name="Arial" data-f-sz="9" data-b-a-c="FFFFFF" data-b-a-s="thin"',
          ];

        if (ra > 0 && ra < 8) {
          hour = ra;
          attrs.push('data-t="n"');
          attrs.push('data-a-h="center"');
          attrs[0] = 'data-fill-color="fff200"';
          className = 'pk';
        }

        if (ra == 0) {
          className = 'free';
          attrs[0] = 'data-fill-color="999999"';
        }

        attrs = attrs.join(' ');
        const effort = hour.toString().match(/(\.)/) ? hour.toFixed(2) : hour;
        tmpl += `<td class="${className} center" ${attrs}>${effort}</td>`;
      });

      tmpl += `</tr>`;

      thiz.table.addRowHTML(tmpl);
      index++;
    });

    ZLoading.hide();
    this.disabledBtnExport(false);
  }

}

export function init() {
  new ResourceAllowcation();
}
