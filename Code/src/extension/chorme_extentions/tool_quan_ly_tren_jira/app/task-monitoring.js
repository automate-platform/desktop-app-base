'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZTable from '../libs/table.js';
import ZTask from '../libs/task.js';
import ZRequest from '../libs/request.js';
import ZUrl from '../libs/url.js';
import template from '../html/task-monitoring.js';

const HEADERS = [
  { title: 'STT', attrs: ['width="5%"'] },
  { title: 'Tên công việc', attrs: ['width="40%"'] },
  { title: 'Người thực hiện' },
  { title: 'Hạn chót' },
  { title: 'Quá hạn' },
  { title: 'Lịch sử thay đổi' },
];

const JIRA_SERVER = location.pathname.match(/jira([0-9]+)?\//)[0];

class TaskMonitoring extends ZBase {
  beforeInit() {
    this.title('Task Monitoring');
    this.options({
      buttons: {
        export: {
          name: 'Xuất dữ liệu',
          onClick: function () {
            ZUtils.exportExcel(AJS.$('#ztable')[0], {
              name: 'Task_Monitoring_Report',
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
    this.table.addHeader(HEADERS);

    AJS.$('#duedate').datepicker();
    AJS.$('#duedate').prop('disabled', true); // ---- TaiNV10: disble duedate

    this.disabledBtnExport();

  }

  async onDialogShow(data) {
    this.data = data;

    AJS.$('#type').on('change', function () {
      var data = AJS.$(this).auiSelect2('data');
      AJS.$('#duedate').prop('disabled', data.id != 'change');
    });
    // search
    AJS.$('#search').on('click', () => {
      this.search();
    });
  }

  async search() {
    AJS.$('#search').attr('disabled', 'disabled');
    ZLoading.show();

    this.disabledBtnExport();

    this.table.footer().html('');
    this.table.loading();
    this.render(await this.findTasks());
  }

  findTasks() {
    const req = new ZRequest();
    const type = AJS.$('#type').auiSelect2('data');
    const project = AJS.$('#project').auiSelect2('data');
    const duedate = AJS.$('#duedate').datepicker('getDate', true);
    const searchURI = ZUrl.get('rest/api/2/search?jql=project =' + project.id);
    let maxResult = 200;
    let issues = [];

    return new Promise((resolve) => {
      let URL;

      function search(startAt = 0) {
        URL = searchURI + ` AND status in (Open, "In Progress", Reopened, "To Do") AND due <= "0"`;
        if (type.id === 'change') {
          // URL = searchURI;

          // ----- TaiNV10: add check duedate
          if (duedate && duedate instanceof String) {
            const due = duedate.match(/(\d+)\/(\d+)\/(\d+)/), 
            dueStr = due[3] + '-' + due[1] + '-' + due[2];
            URL += ` AND duedate <= ${dueStr}`;
          } else if(duedate instanceof Date){
            const dueStr = duedate.getFullYear() + '-' + (duedate.getMonth() + 1) + '-' + duedate.getDate();
            URL += ` AND duedate <= ${dueStr}`;
          }
        }
        URL += `&expand=changelog&startAt=${startAt}&maxResults=${maxResult}`;

        req.get(URL).then((resp) => {
          if (resp.issues.length > 0) {
            issues = issues.concat(resp.issues);
          }

          if (resp.total > startAt) {
            setTimeout(() => {
              search(startAt + maxResult);
            });
            return;
          }

          resolve(issues);
        });
      }

      setTimeout(() => {
        search();
      });
    });
  }

  render(tasks) {
    let totalOverDue = 0;
    const thiz = this;
    let num = 0;

    if (tasks.length === 0) {
      this.tableNotFound();
      AJS.$('#search').removeAttr('disabled');
      return;
    }

    tasks = _.sortBy(tasks, function (o) {
      return o.fields.duedate;
    });

    this.table.body().html('');

    _.each(tasks, function (issue) {
      issue = new ZTask(issue);

      if (
        ['comtor task', 'qa task', 'product'].indexOf(
          issue.type().toLowerCase()
        ) >= 0
      ) {
        return;
      }

      var overDue = thiz.overDueDate(issue.fields('duedate')),
        isChangedDue = false,
        overDueStatus =
          overDue === 0 ? 'warning' : overDue && overDue > 0 ? 'danger' : '',
        histories = '';

      if (issue.histories().length > 0) {
        _.each(issue.histories(), function (history) {
          var due = _.findWhere(history.items, { field: 'duedate' });

          if (history.items.length > 0 && due) {
            isChangedDue = true;
            const displayName = history.author ? history.author.displayName : 'Anonymous';
            if (!due.from && due.to) {
              histories += `- <a href="javascript:void(0);">${displayName}</a> changed to <strong>${due.to}</strong><br/>`;
            }

            if (due.from && !due.to) {
              histories += `- <a href="javascript:void(0);">${displayName}</a> removed the Due Date (from <strong>${due.from}</strong>)<br/>`;
            }

            if (due.from && due.to) {
              histories += `- <a href="javascript:void(0);">${displayName}</a> changed from <strong>${due.from}</strong> to <strong>${due.to}</strong><br/>`;
            }
          }
        });
      }

      if (AJS.$('#type').auiSelect2('data').id == 'change' && !isChangedDue) {
        return;
      }

      totalOverDue += overDue;

      num++;
      thiz.table.addRowHTML(`<tr>
        <td>${num}</td>
        <td>${issue.link()}</td>
        <td>${issue.assignee().name}</td>
        <td>${issue.fields('duedate')}</td>
        <td class="${overDueStatus} center">${overDue}</td>
        <td style="font-size: 12px;">${histories}</td>
      </tr>`);
    });

    this.table.footer().html(`<tr>
      <td colspan="4" style="text-align: right;"><strong>Total</strong></td>
      <td class="danger">${ZUtils.numberFormat(totalOverDue)}</td>
      <td></td>
    </tr>`);
    // AJS.$('#total-overdue').html(ZUtils.numberFormat(totalOverDue));

    AJS.$('#search').removeAttr('disabled');
    ZLoading.hide();
    this.disabledBtnExport(false);
  }

  overDueDate(duedate) {
    if (!duedate) {
      return 0;
    }

    var from = new Date(duedate),
      now = new Date(),
      count = 0;

    // reset hour, min, sec, ms
    now.setHours(0, 0, 0, 0);

    while (from < now) {
      if (from.getDay() > 0 && from.getDay() < 6) {
        count++;
      }
      from.setDate(from.getDate() + 1);
    }

    return count;
  }
}

export function init() {
  new TaskMonitoring();
}
