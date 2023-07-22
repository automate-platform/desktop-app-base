"use strict";

import ZBase from "../libs/base.js";
import ZUtils from "../libs/utils.js";
import ZLoading from "../libs/loading.js";
import ZTable from "../libs/table.js";
import ZTask from "../libs/task.js";
import ZRequest from "../libs/request.js";
import ZUrl from "../libs/url.js";
import template from "../html/project-issue.js";

const HEADERS = [
  { title: "STT", attrs: ['width="5%"'] },
  { title: "Độ nghiêm trọng" },
  { title: "Tên công việc", attrs: ['width="40%"'] },
  { title: "Danh mục" },
  { title: "Trạng thái" },
  { title: "Ngày tạo" },
  { title: "Hạn chót" },
  { title: "Người thực hiện" },
];

class ProjectIssue extends ZBase {
  beforeInit() {
    this.title("Project Issues");
    this.options({
      buttons: {
        export: {
          name: "Xuất dữ liệu",
          onClick: function () {
            ZUtils.exportExcel(AJS.$("#ztable")[0], {
              name: "Project_Issue_Report",
            });
          },
          class: "aui-button-primary export-excel",
        },
      },
    });
  }

  afterInit() {
    this.dialog.addHTML(template);
    // this.dialog.addHTML(this.table.html());
    this.dialog.show();
    this.table = new ZTable(AJS.$("#ztable"));
    this.table.addHeader(HEADERS);

    AJS.$("#duedate").datepicker();

    this.disabledBtnExport();
  }

  async onDialogShow(data) {
    this.data = data;

    // search
    AJS.$("#search").on("click", () => {
      this.search();
    });
  }

  async search() {
    AJS.$("#search").attr("disabled", "disabled");
    ZLoading.show();

    this.disabledBtnExport();

    this.table.footer().html("");
    this.table.loading();
    this.render(await this.findTasks());
  }

  findTasks() {
    const req = new ZRequest();
    const project = $("#project").auiSelect2("data");
    const statuses = $("#status").auiSelect2("data");
    const duedate = AJS.$("#duedate").datepicker("getDate", true);
    const searchURI = ZUrl.get(`rest/api/2/search?jql=type = "Issue"`);
    let maxResult = 200;
    let issues = [];

    return new Promise((resolve) => {
      let URL;

      function search(startAt = 0) {
        URL = searchURI;
        if (project.length) {
          const proj = project.map((p) => p.id);
          URL += `AND project IN (${proj.join(", ")})`;
        }

        if (duedate && duedate instanceof String) {
          const due = duedate.match(/(\d+)\/(\d+)\/(\d+)/),
            dueStr = due[3] + "-" + due[1] + "-" + due[2];
          URL += ` AND duedate <= ${dueStr}`;
        } else if (duedate instanceof Date) {
          const dueStr = duedate.getFullYear() + "-" + (duedate.getMonth() + 1) + "-" + duedate.getDate();
          URL += ` AND duedate <= ${dueStr}`;
        }

        if (statuses.length) {
          const statusText = statuses.map((s) => `"${s.id}"`);
          URL += ` AND status in (${statusText.join(", ")})`;
        } else {
          URL += ` AND status in ("Closed", Open, "In Progress", Reopened)`;
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
      AJS.$("#search").removeAttr("disabled");
      return;
    }

    tasks = _.sortBy(tasks, function (o) {
      return o.fields.duedate;
    });

    this.table.body().html("");

    _.each(tasks, function (issue) {
      issue = new ZTask(issue);

      if (["comtor task", "qa task", "product"].indexOf(issue.type().toLowerCase()) >= 0) {
        return;
      }

      let severity = "";
      if (issue.fields("customfield_10303")) {
        severity = issue.fields("customfield_10303").value;
      }
      let category = "";
      if (issue.fields("customfield_12115")) {
        category = issue.fields("customfield_12115").value;
      }

      num++;
      thiz.table.addRowHTML(`<tr>
        <td>${num}</td>
        <td>${severity}</td>
        <td>${issue.link()}</td>
        <td>${category}</td>
        <td>${issue.statusHTML()}</td>
        <td>${issue.createdDate()}</td>
        <td>${issue.duedate()}</td>
        <td>${issue.assignee().name}</td>
      </tr>`);
    });

    this.table.footer().html(`<tr>
      <td colspan="4" style="text-align: right;"><strong>Total</strong></td>
      <td class="danger">${ZUtils.numberFormat(totalOverDue)}</td>
      <td></td>
    </tr>`);
    // AJS.$('#total-overdue').html(ZUtils.numberFormat(totalOverDue));

    AJS.$("#search").removeAttr("disabled");
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
  new ProjectIssue();
}
