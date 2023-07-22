'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZAlert from '../libs/alert.js';
import ZRequest from '../libs/request.js';
import ZJiraTask from '../libs/jira.task.js';
import ZTable from '../libs/table.js';
import template from '../html/quality-kpi-metric.js';
import { TD_ATTRS } from '../constants.js';
import { TYPE, HEADERS, TABLE_HEADERS } from './qkm-utils.js';

const RESOLUTIONS = ZAPP_CONFIG.RESOLUTION.join('","');
const CUSTOM_FIELDS = ZAPP_CONFIG.CUSTOM_FIELDS;

class QualityKPIMetric extends ZBase {
  beforeInit() {
    this.title('Quality KPI Metric');
    this.options({
      buttons: {
        export: {
          name: 'Xuất dữ liệu',
          onClick: function () {
            ZUtils.exportExcel($('#ztable')[0], {
              name: 'Quality_KPI_Metric_Report',
            });
          },
          class: 'aui-button-primary export-excel',
        },
      },
    });

    this.issues = [];
  }

  afterInit() {
    this.dialog.addHTML(template);
    this.dialog.show();
    this.table = new ZTable($('#ztable'));

    this.disabledBtnExport();
  }

  onDialogShow(data) {
    this.projects = data.projects;
    const thiz = this;

    thiz.loadTemplateProject();

    // set default date
    $('#due_from').datepicker('setDate', moment().weekday(1).toDate());
    $('#due_to').datepicker('setDate', moment().weekday(7).toDate());
    
    $('#project').on('change', async () => {
      this.loadTemplateProject();
      this.issues = []; // clear data
    });

    $('#mode, #component').on('change', () => {
      this.tableRender();
    });
    $('#search').on('click', () => {
      this.search();
    });
  }

  tableRender() {
    const table = this.table.ele();
    const mode = $('#mode').auiSelect2('data');
    const components = $('#component').auiSelect2('data');
    const projectKPI = this.projectKPIs;

    if (this.rendering) {
      return;
    }

    this.rendering = true;
    this.initTable();
    ZLoading.hide();
    this.disabledBtnExport(false);
    $('#search').removeAttr('disabled');

    if (_.size(this.issues) == 0) {
      let _colspan = TABLE_HEADERS[1].length + 4;

      if (mode.id == 'summary') {
        _colspan = TABLE_HEADERS[1].length + 1;
      }

      this.table.text('Không tìm thấy dữ liệu');
      this.rendering = false;
      return;
    }

    // calculate data
    let rows = {};
    let j = 0;

    _.each(this.issues, (issue) => {
      let component = null;
      const componentsIssue = issue.components();

      for (j = 0; j < componentsIssue.length; j++) {
        // kiểm tra component của issue có nằm trong danh sách component của Project mà được cấu hình KPI hay không?
        if (Object.keys(projectKPI).indexOf(componentsIssue[j].name) >= 0) {
          component = componentsIssue[j].name;
        }
      }

      if (!component || !projectKPI || !projectKPI[component]) {
        return;
      }

      if (components.length > 0) {
        const exist = _.findWhere(components, { id: component });
        if (!exist) {
          return;
        }
      }

      if (!rows[component]) {
        rows[component] = [];
      }

      let row = {
        key: issue.key(),
        summary: issue.title(),
        duedate: issue.duedate(),
        status: issue.statusHTML(),
        link: issue.link(),
        quality_data: issue.quality_data,
      };

      if (mode.id == 'summary') {
        if (!rows[component][0]) {
          rows[component][0] = {
            quality_data: {},
          };
        }

        _.each(row.quality_data, function (data, col) {
          if (!rows[component][0].quality_data[col]) {
            rows[component][0].quality_data[col] = {
              fpt: 0,
              customer: 0,
              total_bug: 0,
              completed_size: 0,
              rate: 0,
            };
          }

          rows[component][0].quality_data[col].completed_size +=
            data.completed_size;
          rows[component][0].quality_data[col].total_bug += data.total_bug;
          rows[component][0].quality_data[col].fpt += data.fpt;
          rows[component][0].quality_data[col].rate += data.rate;

          if (data.customer) {
            rows[component][0].quality_data[col].customer += data.customer;
          }
        });
      } else {
        rows[component].push(row);
      }
    });

    if (_.size(rows) == 0) {
      let _colspan = TABLE_HEADERS[1].length + 4;

      if (mode.id == 'summary') {
        _colspan = TABLE_HEADERS[1].length + 1;
      }

      this.table.text('Không tìm thấy dữ liệu.');
      this.rendering = false;
      return;
    }

    // render data
    this.dataRender(rows);
  }

  dataRender(rows) {
    const table = this.table.ele();
    const mode = $('#mode').auiSelect2('data');
    const projectKPIs = this.projectKPIs;

    // clear data
    table.find('tbody').html('');

    _.each(rows, async (row, component) => {
      let tr = `<tr>`;
      let export_attr = `data-f-color="333333" data-f-sz="9" data-f-name="Arial" data-b-a-s="thin" data-b-a-c="cccccc"`;

      if (mode.id == 'detail') {
        let size = _.size(row);
        tr += `<td rowspan="${size}" ${export_attr}>${component}</td>`;
      } else {
        tr += `<td ${export_attr}>${component}</td>`;
      }

      let index = 0,
        loc = 0,
        stages = this.projectStages();

      _.each(row, function (task) {
        if (index > 0) {
          tr += `<tr>`;
        }

        if (mode.id == 'detail') {
          tr += `<td ${export_attr}>${task.link}</td>`;
          tr += `<td ${export_attr}>${task.duedate}</td>`;
          tr += `<td ${export_attr}>${task.status}</td>`;
        }

        _.each(TABLE_HEADERS[1], function (head) {
          if (stages && stages.indexOf(head.code) < 0) {
            return;
          }

          let v = 0,
            col_class = 'col-number',
            target = null,
            compet = null,
            completed_size = 0,
            attrs = [
              'data-f-color="333333"',
              'data-f-sz="9"',
              'data-f-name="Arial"',
              'data-b-a-s="thin"',
              'data-b-a-c="cccccc"',
              'data-a-h="center"',
            ],
            rate = 0;

          // start set target
          if (
            projectKPIs[component] &&
            projectKPIs[component][head.code] !== undefined
          ) {
            target = projectKPIs[component][head.code];
          }

          if (target === null) {
            v = '-';
            col_class += ' disabled';
            attrs.push('data-fill-color="808080"');
            tr += `<td class="${col_class}" ${attrs.join(' ')}>${v}</td>`;
            return;
          }

          attrs.push('data-t="n"');

          if (head.col == 'target') {
            v = target.target;
            col_class += ' rate';
            attrs.push('data-fill-color="00ffff"');
            attrs.push('data-num-fmt="0.00"');
            tr += `<td class="${col_class}" ${attrs.join(' ')}>${v}</td>`;
            return;
          }

          // end set target

          if (task.quality_data && task.quality_data[head.code] !== undefined) {
            v = task.quality_data[head.code][head.col] || 0;

            if (head.code == 'CODING') {
              loc = task.quality_data[head.code].completed_size;
            }

            switch (head.col) {
              case 'actual':
                attrs.push('data-num-fmt="0.00"');
                completed_size = task.quality_data[head.code].completed_size;

                if (
                  ['CODING', 'IT_EXECUTE', 'UT_EXECUTE'].indexOf(head.code) >= 0
                ) {
                  if (task.quality_data[head.code].total_bug > 0 && loc > 0) {
                    rate = parseFloat(
                      (task.quality_data[head.code].total_bug * 1000) / loc
                    );
                  }
                  completed_size = loc;
                } else if (
                  task.quality_data[head.code].total_bug > 0 &&
                  task.quality_data[head.code].completed_size > 0
                ) {
                  rate = parseFloat(
                    task.quality_data[head.code].total_bug /
                      task.quality_data[head.code].completed_size
                  );
                }

                v = rate;

                if (rate > 0 && rate >= target.lsl && rate <= target.usl) {
                  col_class += ' green';
                  attrs.push('data-fill-color="008000"');
                }

                if (
                  completed_size > 0 &&
                  (rate < target.lsl || rate > target.usl)
                ) {
                  col_class += ' red';
                  attrs.push('data-fill-color="ff0000"');
                }

                attrs[0] = 'data-f-color="ffffff"';

                if (v > 0 && v % 1 > 0) {
                  v = ZUtils.numberFormat(v, 2);
                }

                break;
              // default:
              //   v = ZUtils.numberFormat(v, 0);
              //   break;
            }
          }

          tr += `<td class="${col_class}" ${attrs.join(' ')}>${v}</td>`;
        });

        tr += `</tr>`;
        index++;
      });
      tr += `</tr>`;

      table.find('tbody').append(tr);
    });

    this.rendering = false;
  }

  async initTable() {
    const table = this.table.ele();
    const mode = $('#mode').auiSelect2('data');

    if (mode.id == 'detail') {
      table.attr('data-cols-width', '13,45,10,10');
    } else {
      table.attr('data-cols-width', '13');
    }

    let index = 0;
    let stages = this.projectStages();

    table.find('thead').html('');

    _.each(TABLE_HEADERS, function (row) {
      let tmpl = `<tr data-height="23">`;

      _.each(row, function (td) {
        if (mode.id != 'detail' && td.isSummary) {
          return;
        }

        if (
          td.code &&
          stages &&
          stages.length > 0 &&
          stages.indexOf(td.code) < 0
        ) {
          return;
        }

        let atts = [];
        if (td.attrs) {
          td.attrs = $.extend(td.attrs, TD_ATTRS);
          if (index > 0) {
            td.attrs['data-a-h'] = 'center';
          }

          _.each(td.attrs, function (key, val) {
            atts.push(`${val}="${key}"`);
          });
        }
        atts = ' ' + atts.join(' ');

        let title = td.title;
        if (mode.id == 'user' && td.title == 'Component') {
          title = 'Assignee';
        }

        tmpl += `<th${atts}>${title}</th>`;
      });

      tmpl += `</tr>`;

      table.find('thead').append(tmpl);
      index++;
    });
  }

  projectStages() {
    if (!this.projectKPIs) {
      return [];
    }

    let stages = [];
    _.each(this.projectKPIs, (data) => {
      stages = stages.concat(Object.keys(data));
    });

    return stages;
  }

  async search() {
    const proj = $('#project').auiSelect2('data');

    if (proj.length == 0) {
      ZAlert.warn('Bạn phải chọn ít nhất một dự án.');
      return;
    }

    // disabled search button
    $('#search').attr('disabled', 'disabled');

    // reset data
    this.reset();

    // loading
    ZLoading.show();

    this.disabledBtnExport(false);

    const url = `rest/api/2/project/${proj.id}`;
    const resp = await new ZRequest().get(url);
    this.getKPIMetric(resp.components, proj);
  }

  async getKPIMetric(componentList, project) {
    let component_names = [];
    let query_string = [];
    const from_date = AJS.$('#due_from').val();
    const to_date = AJS.$('#due_to').val();
    const _components = AJS.$('#component').auiSelect2('data');
    const projectKPIs = this.projectKPIs;
    const product_maps = {
      reviewcode: 'source code',
      reviewdd: 'detail design',
      reviewsst: 'it case',
      reviewut: 'ut case',
    };

    _.each(componentList, function (comp) {
      component_names.push(comp.name);
    });

    if (_components.length > 0) {
      component_names = [];

      _.each(_components, function (cmp) {
        component_names.push(cmp.id);
      });
    }

    query_string.push(`project=${project.id}`);
    query_string.push(`issuetype in ("Task", "Story")`);
    query_string.push(
      `(resolution = "Unresolved" OR resolution not in ("${RESOLUTIONS}"))`
    );

    if (from_date && !_.isNaN(new Date(from_date).getTime())) {
      query_string.push(
        `duedate >= ${from_date.replace(/(\d+)\/(\d+)\/(\d+)/g, '$3-$1-$2')}`
      );
    }

    if (to_date && !_.isNaN(new Date(to_date).getTime())) {
      query_string.push(
        `duedate <= ${to_date.replace(/(\d+)\/(\d+)\/(\d+)/g, '$3-$1-$2')}`
      );
    }

    if (component_names.length > 0) {
      query_string.push(`component in ("${component_names.join('","')}")`);
    }

    //queryString.push(`component = null`);
    query_string.push(`status != Cancelled`);

    if (this.issues.length > 0) {
      let _issueIds = [];
      _.each(this.issues, function (issue) {
        if (issue.isCached == true) {
          _issueIds.push(issue.key());
        }
      });

      query_string.push(`id NOT IN ("${_issueIds.join('","')}")`);
    }

    query_string = query_string.join(' AND ');
    query_string += ' ORDER BY duedate ASC';

    this.table.loading();
    this.issues = await ZJiraTask.findAll({
      jql: query_string,
    });

    if (this.issues.length === 0) {
      this.tableRender([]);
      return;
    }

    let taskIds = [];

    _.each(this.issues, (task) => {
      taskIds.push(task.key());
    });

    // find all sub-task
    let subTasks = await ZJiraTask.findSubTask(taskIds);
    let bugs = await ZJiraTask.findBug(taskIds);
    let subTasksTmp = {};
    let j = 0;

    _.each(subTasks, (subtask) => {
      if (!subtask.parent().key) {
        return;
      }
      const components = subtask.components();
      let isHasComponentConfig = false;

      for (j = 0; j < components.length; j++) {
        // kiểm tra component của subtask có nằm trong danh sách component của Project mà được cấu hình KPI hay không?
        if (projectKPIs && Object.keys(projectKPIs).indexOf(components[j].name) >= 0) {
          isHasComponentConfig = true;
        }
      }

      if (!isHasComponentConfig) {
        return;
      }

      if (!subTasksTmp[subtask.parent().key]) {
        subTasksTmp[subtask.parent().key] = [];
      }
      subTasksTmp[subtask.parent().key].push(subtask);
    });
    subTasks = null;

    let bugsTmp = {};
    _.each(bugs, (bug) => {
      if (bug.fields('issuelinks') && bug.fields('issuelinks').length === 0) {
        return;
      }

      const components = bug.components();
      let isHasComponentConfig = false;

      for (j = 0; j < components.length; j++) {
        // kiểm tra component của bug có nằm trong danh sách component của Project mà được cấu hình KPI hay không?
        if (Object.keys(projectKPIs).indexOf(components[j].name) >= 0) {
          isHasComponentConfig = true;
        }
      }

      _.each(bug.fields().issuelinks, (issueLink) => {
        if (
          issueLink.inwardIssue &&
          issueLink.inwardIssue.fields.issuetype.name === 'Task'
        ) {
          if (!bugsTmp[issueLink.inwardIssue.key]) {
            bugsTmp[issueLink.inwardIssue.key] = [];
          }
          bugsTmp[issueLink.inwardIssue.key].push(bug);
          return;
        }

        if (
          issueLink.outwardIssue &&
          issueLink.outwardIssue.fields.issuetype.name === 'Task'
        ) {
          if (!bugsTmp[issueLink.outwardIssue.key]) {
            bugsTmp[issueLink.outwardIssue.key] = [];
          }
          bugsTmp[issueLink.outwardIssue.key].push(bug);
          return;
        }
      });
    });
    bugs = null;

    _.each(this.issues, (issue, index) => {
      const key = issue.key();

      issue.quality_data = {};
      _.each(HEADERS, function (header) {
        if (!issue.quality_data[header.code]) {
          issue.quality_data[header.code] = {
            completed_size: 0,
            fpt: 0,
            total_bug: 0,
            rate: 0,
          };
        }
      });

      issue.subTasks = [];
      // calculate subtask
      if (key in subTasksTmp) {
        _.each(subTasksTmp[key], function (subtask) {
          if (!subtask.hasProduct()) {
            return;
          }

          let product = subtask.product();
          product = product.replace(/(.*)(\s+\[.*\])/g, '$1');

          if (!ZUtils.isStageValid(subtask.product())) {
            return;
          }

          product = product.toLowerCase();

          _.each(HEADERS, function (header) {
            issue.quality_data[header.code].customer = 0;

            if (
              CUSTOM_FIELDS.PRODUCT in subtask.fields() &&
              product === header.type
            ) {
              issue.quality_data[header.code].completed_size +=
                subtask.completedSize();
            }
          });
        });

        issue.subTasks = subTasksTmp[key];
        subTasksTmp[key] = null;
      }

      issue.bugs = [];
      // calculate bugs
      if (key in bugsTmp) {
        _.each(bugsTmp[key], (bug) => {
          const qc_activity = bug.qcActivity();
          const product =
            product_maps[bug.product().toLowerCase()] ||
            bug.product().toLowerCase();

          _.each(HEADERS, function (header) {
            if (header.field.product !== product) {
              return;
            }

            if (
              header.field.qc &&
              qc_activity.toLowerCase() !== header.field.qc
            ) {
              return;
            }

            if (
              ['Code Review', 'Document Review'].indexOf(qc_activity) >= 0 &&
              [
                TYPE.SOURCE_CODE,
                TYPE.DETAIL_DESIGN,
                TYPE.BASIC_DESIGN,
                TYPE.SRS,
              ].indexOf(product) >= 0
            ) {
              if (bug.role() === 'Customer') {
                issue.quality_data[header.code].customer++;
              } else {
                issue.quality_data[header.code].fpt++;
              }
            }

            issue.quality_data[header.code].total_bug++;
          });
        });

        issue.bugs = bugsTmp[key];
        bugsTmp[key] = null;
      }

      this.issues[index] = issue;
    });

    this.tableRender();
  }

  reset() {
    this.issues = [];
  }

  async loadTemplateProject(){
    const thiz = this;
    const proj = $('#project').auiSelect2('data');
      thiz.projectKPIs = await thiz.projects[proj.id].KPIConfig();
      if(!thiz.projectKPIs){
        ZAlert.error('Dự án chưa define các KPI ở KPI Update như dưới đây: SRS; BD; DD; COD; CUT; EUT; CIT; EIT; CST; EST.');
      }
      $('#component').html('');
      thiz.initTable();

      if (thiz.projectKPIs) {
        _.each(thiz.projectKPIs, function (data, component) {
          $('#component').append(
            new Option(component, component, false, false)
          );
        });

        $('#component').auiSelect2().trigger('change');
      }

      this.tableRender();
  }
}

export function init() {
  new QualityKPIMetric();
}
