'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZAlert from '../libs/alert.js';
import ZRequest from '../libs/request.js';
import ZJiraProject from '../libs/jira.project.js';
import ZJiraTask from '../libs/jira.task.js';
import ZTable from '../libs/table.js';
import template from '../html/project-productivity.js';

const SCOPES_TITLE_MAPPING = {
  CODING: 'Coding',
  DESIGN: 'Design',
  REQUIRMENT: 'Requirement',
  UTC: 'UT Create',
  UTE: 'UT Execute',
  ITC: 'IT Create',
  ITE: 'IT Execute',
  STC: 'ST Create',
  STE: 'ST Execute',
};
const SCOPES_MAPPING = {
  'Source Code': 'CODING',
  'Detail Design': 'DESIGN',
  SRS: 'REQUIRMENT',
  'IT Case': 'ITC',
  'IT Report': 'ITE',
  'ST Case': 'STC',
  'ST Report': 'STE',
  'UT Case': 'UTC',
  'UT Report': 'UTE',
};
const SCOPE_TARGET = ZAPP_CONFIG.SCOPE_TARGET;
const PRODUCTIVITY_TARGET = ZAPP_CONFIG.PRODUCTIVITY_TARGET;
let productivityTarget = null;
let scopeTarget = [];

class ProjectProductivity extends ZBase {
  beforeInit() {
    this.title('Project Productivity');
    this.options({
      buttons: {
        export: {
          name: 'Xuất dữ liệu',
          onClick: function () {
            ZUtils.exportExcel(AJS.$('#ztable')[0], {
              name: 'Project_Productivity_Report',
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

    // init table
    this.table1 = new ZTable(AJS.$('#project-productivity'));
    this.table1.attr('id', 'project-productivity');
    this.table1.attr('style', 'width: 30%');
    this.table2 = new ZTable(AJS.$('#scope-productivity'));
    this.table2.attr('id', 'scope-productivity');

    this.disabledBtnExport();
  }

  onDialogShow(data) {
    this.allProjects = data.projects;
    const thiz = this;

    AJS.$('#search').on('click', () => {
      this.search();
    });

    AJS.$('#due_from').datepicker('setDate', moment().weekday(1).toDate());
    AJS.$('#due_to').datepicker('setDate', moment().weekday(7).toDate());

    // load productivity config when project changed
    $('#project').on('change', async function () {
      const proj = $(this).auiSelect2('data');
      if (!proj) {
        return;
      }

      const project = thiz.allProjects[proj.id];

      $('#punit').text(PRODUCTIVITY_TARGET[0]);
      $('#ptarget').text(PRODUCTIVITY_TARGET[1]);
      $('#pactual').text('N/A');
      $('#cunit').text(SCOPE_TARGET.CODING[0]);
      $('#ctarget').text(SCOPE_TARGET.CODING[1]);
      $('#cactual').text('N/A');

      thiz.table2.text('Không tìm thấy dữ liệu.');

      productivityTarget = await project.productivityTarget();
      if (!productivityTarget) {
        ZAlert.warn(
          'Dự án chưa cài đặt productivity. Thông số FSOFR Norm sẽ được sử dụng.'
        );

        ZLoading.hide();
        productivityTarget = {
          LSL: PRODUCTIVITY_TARGET[1] * 0.9,
          USL: PRODUCTIVITY_TARGET[1] * 1.1,
          target: PRODUCTIVITY_TARGET[1],
          unit: PRODUCTIVITY_TARGET[0],
        };
      }

      scopeTarget = await project.scopeTarget();
      if (!scopeTarget) {
        ZAlert.warn(
          'Dự án chưa cài đặt scope. Thông số FSOFT Norm sẽ được sử dụng.'
        );
        ZLoading.hide();

        const keys = Object.keys(SCOPE_TARGET);
        scopeTarget = Object.values(SCOPE_TARGET).map((s, i) => {
          s.scope = keys[i];
          s.LSL = s.target * 0.9;
          s.USL = s.target * 1.1;
          s.default = true;
          return s;
        });
      }

      $('#punit').text(productivityTarget.unit);

      const target = ZUtils.numberFormat(productivityTarget.target, 2);
      $('#ptarget').html(
        productivityTarget.default
          ? `<span class="norm" title="FSoft Norm">${target}</span>`
          : target
      );

      scopeTarget.forEach((sc) => {
        if (sc.scope === 'CODING') {
          $('#cunit').text(sc.unit);
          $('#ctarget').text(sc.target);
        }
      });

      thiz.table2.header().html(
        `<tr><th width="20%">Scope</th></tr>
        <tr><th>Đơn vị</th></tr>
        <tr><th>Target</th></tr>`
      );

      scopeTarget.forEach((s) => {
        thiz.table2
          .ele()
          .find('thead tr')
          .eq(0)
          .append(`<th width="6%">${SCOPES_TITLE_MAPPING[s.scope]}</th>`);
        thiz.table2.ele().find('thead tr').eq(1).append(`<th>${s.unit}</th>`);
        thiz.table2
          .ele()
          .find('thead tr')
          .eq(2)
          .append(
            `<th>${
              s.default
                ? '<span class="norm" title="FSoft Norm">' +
                  ZUtils.numberFormat(s.target, 2) +
                  '</span>'
                : ZUtils.numberFormat(s.target, 2)
            }</th>`
          );
      });

      ZLoading.hide();
    });

    $('#project').auiSelect2().trigger('change');
  }

  async search() {
    const proj = AJS.$('#project').auiSelect2('data');
    const fromDate = AJS.$('#due_from').val();
    const toDate = AJS.$('#due_to').val();
    const thiz = this;

    if (!proj) {
      ZAlert.warn('Bạn phải chọn ít nhất một dự án.');
      return;
    }

    AJS.$('#search').attr('disabled', 'disabled');
    // loading
    thiz.table2.text('Đang tải dữ liệu...');
    ZLoading.show();

    const project = thiz.allProjects[proj.id];
    const worklogs = await project.worklogs(
      fromDate ? fromDate : null,
      toDate ? toDate : null
    );

    let totalWorklogs = 0;
    let totalCompletedSize = 0;
    let totalCodingWorklog = 0;
    let totalCodingCompletedSize = 0;
    let taskIds = [];
    let members = {};
    let memberNames = {};

    if (worklogs.length === 0) {
      thiz.table2.text('Không tìm thấy dữ liệu.');
      // hide loading
      ZLoading.hide();
      // enable search button
      AJS.$('#search').removeAttr('disabled');
      
      this.disabledBtnExport();
      return;
    }
    
    this.disabledBtnExport(false);

    worklogs.forEach(async function (w) {
      const u = w.user.toUpperCase();
      if (!members[u]) {
        members[u] = {};
      }

      if (!SCOPES_MAPPING[w.productName]) {
        return;
      }

      const scope = SCOPES_MAPPING[w.productName];
      if (!members[u][scope]) {
        members[u][scope] = {
          worklog: 0,
          completed: 0,
        };
      }

      if (
        ['SRS', 'DESIGN', 'CODING', 'ITC', 'UTC', 'STC'].indexOf(scope) >= 0 &&
        ['Create', 'Review', 'Study'].indexOf(w.attribute) >= 0
      ) {
        members[u][scope].worklog += Number(w.worked);
      }

      if (
        ['ITE', 'UTE', 'STE'].indexOf(scope) >= 0 &&
        ['Test'].indexOf(w.attribute) >= 0
      ) {
        members[u][scope].worklog += Number(w.worked);
      }

      totalWorklogs += Number(w.worked);

      if (
        w.productName === 'Source Code' &&
        ['Create', 'Review', 'Study'].indexOf(w.attribute) >= 0
      ) {
        totalCodingWorklog += Number(w.worked);
      }

      if (taskIds.indexOf(w.key) < 0) {
        taskIds.push(w.key);
      }
    });

    if (taskIds.length > 0) {
      var queryString = [];
      queryString.push(`project=${project.key()}`);
      queryString.push(`id in (${taskIds.join(',')})`);
      if (fromDate && !_.isNaN(new Date(fromDate).getTime())) {
        queryString.push(
          `duedate >= ${fromDate.replace(/(\d+)\/(\d+)\/(\d+)/g, '$3-$1-$2')}`
        );
      }

      if (toDate && !_.isNaN(new Date(toDate).getTime())) {
        queryString.push(
          `duedate <= ${toDate.replace(/(\d+)\/(\d+)\/(\d+)/g, '$3-$1-$2')}`
        );
      }
      queryString = queryString.join(' AND ');

      const tasks = await ZJiraTask.findAll({
        jql: queryString,
      });

      tasks.forEach(function (task) {
        const name = task.assignee().name.toUpperCase();
        if (!members[name]) {
          return;
        }

        if (!memberNames[name]) {
          memberNames[name] = task.assignee().displayName;
        }

        const product = task.product();
        if (!SCOPES_MAPPING[product]) {
          return;
        }

        const scope = SCOPES_MAPPING[product];
        if (!members[name][scope]) {
          return;
        }

        members[name][scope].completed += task.completedSize();
        if (product === 'Source Code' && task.type() === 'Sub-task') {
          totalCompletedSize += task.completedSize();
          totalCodingCompletedSize += task.completedSize();
        }
      });
    }

    thiz.table2.body().html('');

    _.each(members, function (mb, name) {
      if (!memberNames[name]) {
        console.error(`Tài khoản ${name} đã logwork chưa đúng!!!`);
        return;
      }

      thiz.table2.body().append(`<tr>
        <td>${memberNames[name]}</td>
      </tr>`);

      scopeTarget.forEach((sc) => {
        if (mb[sc.scope]) {
          var html = '';
          var className = '';
          if (mb[sc.scope].worklog === 0) {
            html = `<span title="Completed Size: ${
              ZUtils.numberFormat(mb[sc.scope].completed)
            } - Worklog: ${mb[sc.scope].worklog} (h)">0</span>`;
          } else {
            const v = (mb[sc.scope].completed * 8) / mb[sc.scope].worklog;
            className = 'danger';
            if (v > sc.target) {
              className = 'green';
            }
            html = `<span title="Completed Size: ${
              ZUtils.numberFormat(mb[sc.scope].completed)
            } - Worklog: ${mb[sc.scope].worklog} (h)">${ZUtils.numberFormat(
              v,
              2
            )}</span>`;
          }

          thiz.table2
            .body()
            .find('tr:last-child')
            .append(`<td class="center ${className}">${html}</td>`);
        } else {
          thiz.table2.body().find('tr:last-child').append(`<td></td>`);
        }
      });
    });

    if (totalWorklogs > 0) {
      var totalProject = (totalCompletedSize * 8) / totalWorklogs;
      $('#pactual').text(ZUtils.numberFormat(totalProject, 2));
      if (totalProject > productivityTarget.target) {
        $('#pactual').addClass('green');
      } else {
        $('#pactual').addClass('danger');
      }
    }

    if (totalCodingWorklog > 0) {
      var totalCoding = (totalCodingCompletedSize * 8) / totalCodingWorklog;
      $('#cactual').text(ZUtils.numberFormat(totalCoding, 2));
      if (totalCoding > Number($('#ctarget').text())) {
        $('#cactual').addClass('green');
      } else {
        $('#cactual').addClass('danger');
      }
    }

    // hide loading
    ZLoading.hide();
    // enable search button
    AJS.$('#search').removeAttr('disabled');
  }
}

export function init() {
  new ProjectProductivity();
}
