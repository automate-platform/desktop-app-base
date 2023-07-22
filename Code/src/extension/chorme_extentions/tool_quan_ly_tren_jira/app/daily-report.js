'use strict';

import ZBase from '../libs/base.js';
import ZUtils from '../libs/utils.js';
import ZLoading from '../libs/loading.js';
import ZAlert from '../libs/alert.js';
import ZRequest from '../libs/request.js';
import ZTable from '../libs/table.js';
import ZUser from '../libs/user.js';
import template from '../html/daily-report.js';
import ZRequestConfig from '../libs/request-config.js';

const DR_CONFIG = ZAPP_CONFIG.DAILY_REPORT;
const FREE_EFFORT = Number(ZAPP_CONFIG.FREE_EFFORT || 8);
const CUSTOM_FIELDS = ZAPP_CONFIG.CUSTOM_FIELDS;
const TRANSITION_ID = ZAPP_CONFIG.TRANSITION_ID;
const RESOLUTION_ID = ZAPP_CONFIG.RESOLUTION_ID;
let selectedTasks = [];
let selectedNextTasks = [];

class DailyReport extends ZBase {
  beforeInit() {
    
    this.title('Daily Report');
    this.options({
      onHide: () => {
        selectedTasks = [];
        selectedNextTasks = [];
      },
      buttons: {
        logwork: {
          name: 'Log Work',
          onClick: () => {
            this.logwork();
          },
        },
        send: {
          name: 'Send',
          onClick: () => {
            this.send();
          },
          class: 'aui-button-primary',
        },
      },
    });

    this.myTasks = [];
  }

  afterInit() {
    this.dialog.addHTML(template);
    this.dialog.show();
    this.myTaskTable = new ZTable($('#my-task'));
  }

  async onDialogShow(data) {
    this.projects = data.projects;
    AJS.tabs.setup();

    // show loading
    ZLoading.show();

    _.each(DR_CONFIG.TO_LIST, (m) => {
      $('#to').append(new Option(m.name, m.email, false, false));
    });
    _.each(DR_CONFIG.CC_LIST, (m) => {
      $('#cc').append(new Option(m.name, m.email, false, false));
    });

    $('#to').auiSelect2().trigger('change');
    $('#cc').auiSelect2().trigger('change');

    // loading
    this.myTaskTable.loading();

    // find all my task in due date
    this.myTasks = await ZUser.myTasks();
    // render data
    this.render();
    // hide loading
    ZLoading.hide();

    const dateNow = moment().format('DD/MM/YYYY');
    // set
    $('#body').val(ZUtils.translate(DR_CONFIG.INTRO, { date: dateNow }));
    $('#date').val(dateNow);
    $('#subject').val(ZUtils.translate(DR_CONFIG.SUBJECT, { date: dateNow }));
    $('#free-effort').text(FREE_EFFORT);
    $('#username').text(this.user.displayName);

    $('#date').on('change', function () {
      const _date = $(this).val();

      if (!_date) {
        return;
      }

      $('#body').val(ZUtils.translate(DR_CONFIG.INTRO, { date: _date }));
      $('#subject').val(ZUtils.translate(DR_CONFIG.SUBJECT, { date: _date }));
    });

    // add next task
    $('#add-next-task').on('click', () => {
      this.addNextTask();
    });

    $('#add-risk-issue').on('click', () => {
      this.addRiskIssue();
    });
  }

  render() {
    const myTaskTable = this.myTaskTable.ele();
    const thiz = this;
    let index = 1;

    // reset body
    myTaskTable.find('tbody').html('');

    // render data
    _.each(this.myTasks, function (task) {
      myTaskTable.find('tbody').append(`<tr>
            <td class="center">${index}</td>
            <td><a href="${task.url()}" target="_blank" title="${task.title()}">${task.key()}</a></td>
            <td>${task.link()}</td>
            <td>${task.statusHTML()}</td>
            <td>${task.duedate()}</td>
            <td>
              <a data-key="${task.key()}" class="aui-button add-report">Select</a>
            </td>
            <td>
              <a data-key="${task.key()}" class="aui-button add-next-task">Select</a>
            </td>
        </tr>`);

      index++;
    });

    // init event for a tag
    $('a.add-report')
      .off('click.select')
      .on('click.select', function () {
        var _this = $(this),
          _key = $(this).data('key'),
          _text = _this.text();

        if (_text == 'Select') {
          _.each(thiz.myTasks, (issue) => {
            if (issue.key() === _key) {
              selectedTasks.push(issue);
            }
          });
          // selectedTasks.push(_.findWhere(thiz.myTasks, { _data: { key: _key } }));
        } else {
          selectedTasks = selectedTasks.filter(function (issue) {
            return issue.key() != _key;
          });
        }

        if (_text == 'Select') {
          _this.parents('tr').addClass('selected');
        } else {
          _this.parents('tr').removeClass('selected');
        }

        thiz.renderSelectedTasks(selectedTasks);

        _this.text(_text == 'Select' ? 'Unselect' : 'Select');
      });

    $('a.add-next-task')
      .off('click.select')
      .on('click.select', function () {
        const _this = $(this);
        const _key = $(this).data('key');
        const _text = _this.text();

        if (_text == 'Select') {
          _.each(thiz.myTasks, (issue) => {
            if (issue.key() === _key) {
              selectedNextTasks.push(issue);
              thiz.addNextTask(undefined, issue);
            }
          });
          // var _task = _.findWhere(this.myTasks, { key: _key });
          // selectedNextTasks.push(_task);
          // thiz.addNextTask(undefined, _task);
        } else {
          selectedNextTasks = selectedNextTasks.filter(function (issue) {
            return issue.key() != _key;
          });
          $('#next-task-table')
            .find('tr.' + _key)
            .remove();
        }

        if (_text == 'Select') {
          _this.parents('tr').addClass('selected');
        } else {
          _this.parents('tr').removeClass('selected');
        }

        _this.text(_text == 'Select' ? 'Unselect' : 'Select');
      });
  }

  addNextTask(initEvent, task) {
    const _table = $('#next-task-table');
    const _index = _table.find('tbody tr').length + 1;
    let _tmpl = `<tr>
          <td>${_index}</td>
          <td><textarea ignore-ele elastic class="textarea"></textarea></td>
          <td><input ignore-ele style="width:30px;" class="text effort"> h</td>
          <td><input ignore-ele class="text datepicker" style="width: 100px;"></td>
          <td ignore-ele><a class="remove"><span class="aui-icon aui-icon-small aui-iconfont-delete"></span></a></td>
      </tr>`;

    if (task !== undefined && task !== null) {
      _tmpl = `<tr class="${task.key()}">
              <td>${_index}</td>
              <td>${task.link()}</td>
              <td><input ignore-ele style="width:30px;" class="text effort"> h</td>
              <td>${task.duedate()}</td>
              <td ignore-ele><a class="remove"><span class="aui-icon aui-icon-small aui-iconfont-delete"></span></a></td>
          </tr>`;
    }

    _table.find('tbody').append(_tmpl);

    if (initEvent === undefined) {
      this.initEventsNextTask();
    }
  }

  addRiskIssue(initEvent) {
    var _table = $('#risk-issue-table'),
      _index = _table.find('tbody tr').length + 1,
      _tmpl = `<tr>
          <td>${_index}</td>
          <td><textarea ignore-ele elastic class="textarea summary"></textarea></td>
          <td><textarea ignore-ele elastic class="textarea cause"></textarea></td>
          <td><textarea ignore-ele elastic class="textarea impact"></textarea></td>
          <td><textarea ignore-ele elastic class="textarea action"></textarea></td>
          <td><input ignore-ele style="width:200px;" placeholder="Please input the account name." class="text escalate"></td>
          <td><div class="checkbox"><input ignore-ele type="checkbox" class="checkbox is-create-qa"></div></td>
          <td ignore-ele><a class="remove"><span class="aui-icon aui-icon-small aui-iconfont-delete"></span></a></td>
      </tr>`;

    _table.find('tbody').append(_tmpl);

    if (initEvent === undefined) {
      $('#risk-issue-table tbody tr:last-child .remove').on(
        'click',
        function () {
          $(this).parents('tr').remove();
        }
      );
    }
  }

  renderSelectedTasks(tasks) {
    const _table = $('#today-task-table');
    let index = 1;

    // reset body
    _table.find('tbody').html('');

    function selectHTML(task) {
      const product = task.product().toLowerCase();
      let $html = '';

      if (task.isBug()) {
        return `<select class="ui-select tow-select">
          <option value="Correct">Correct</option>
        </select>`;
      }

      switch (product) {
        case 'srs':
        case 'basic design':
        case 'detail design':
        case 'source code':
        case 'it case':
        case 'st case':
        case 'ut case':
          $html = `<select class="ui-select tow-select">
            <option value="Study">Study</option>
            <option value="Create">Create</option>
            <option value="Review">Review</option>
          </select>`;
          break;
        case 'ut report':
        case 'it report':
        case 'st report':
          $html = `<select class="ui-select tow-select">
            <option value="Test">Test</option>
            <option value="Review">Review</option>
          </select>`;
          break;
        default: // ---- TaiNV10: add default -----
          $html = `<select class="ui-select tow-select">
            <option value="Create">Create</option>
            <option value="Study">Study</option>
            <option value="Review">Review</option>
            <option value="Correct">Correct</option>
            <option value="Test">Test</option>
            <option value="Translate">Translate</option>
          </select>`;
      }

      return $html;
    }

    // render data
    _.each(tasks, function (task) {

      _table.find('tbody').append(`<tr id="${task.key()}">
              <td>${index}</td>
              <td>${task.link()}</td>
              <td ignore-ele>
                ${selectHTML(task)}
              </td>
              <td><input ignore-ele type="text" class="text small completed_percent"></td>
              <td>${task.duedate()}</td>
              <td ignore-ele><input ignore-ele type="text" class="text small completed_size 
               ${!task.existFieldsCompletedSize() ? 'disabled' : ''}"
               ${!task.existFieldsCompletedSize() ? ' disabled="true"' : ''}></td>
              <td><input ignore-ele type="text" class="text small effort"></td>
              <td><input ignore-ele type="text" class="text small remaining_estimate"></td>
              <td><textarea ignore-ele class="textarea output"></textarea></td>
          </tr>`);

      index++;
    });

    this.initEventsSelectedTasks();

    _table.find('select.ui-select').each(function () {
      $(this)
        .auiSelect2({
          allowClear: true,
        })
        .trigger('change');
    });
  }

  async initEventsSelectedTasks() {
    // reset effort
    $('#usage-effort').text(0);
    $('#free-effort').text(Number(FREE_EFFORT));

    // tow
    $('#today-task-table tbody .tow-select')
      .off('change')
      .on('change', function () {
        const _val = $(this).val();
        if (_val === 'Study' || _val === 'Review') {
          $(this)
            .parents('tr')
            .find('.completed_size')
            .attr('disabled', 'disabled');
        } else {
          $(this).parents('tr').find('.completed_size').removeAttr('disabled');
        }

        // ----- TaiNV10: thêm lại disabled khi type task là Bug
        $(this).parents('tr').find('.completed_size.disabled').attr('disabled', 'disabled');
      });

    // free effort
    $('#today-task-table tbody .effort')
      .off('keyup blur')
      .on('keyup', function () {
        let _total = 0;
        let _val = $(this).val() || '0';

        if (!_val.match(/^([0-7](\.)?(\.[1-9]{1,2})?|8)$/)) {
          ZAlert.error('Effort phải bắt đầu từ 0 đến 8.');
          $(this)
            .val(_val.substring(0, _val.length - 1))
            .focus();
          return;
        }

        _val = parseInt(_val, 10);

        // if (_val > _free_effort) {
        //   ZAlert.error('Free effort must be smaller or equal total effort of today.');
        //   $(this).val('');
        //   return;
        // }

        $('#today-task-table tbody .effort').each(function () {
          const _val = $(this).val() || 0;
          _total += parseFloat(_val);
        });

        // if (_free_effort < _total) {
        //   ZAlert.error('Free effort must be smaller or equal total effort of today.');
        //   $(this).val('');
        //   return;
        // }

        $('#usage-effort').text(_total);
        $('#free-effort').text(FREE_EFFORT - _total);
      })
      .on('blur', function () {
        const _val = $(this).val() || '0';

        if (!_val.match(/^([0-7](\.[1-9]{1,2})?|8)$/g)) {
          ZAlert.error('Effort phải bắt đầu từ 0 đến 8.');
          $(this).val('').focus();
          return;
        }
      });

    // completed size
    $('#today-task-table tbody .completed_size')
      .off('keyup')
      .on('keyup', function () {
        const _val = $(this).val();

        if (!_val.match(/^\d+$/g)) {
          ZAlert.error('Completed size phải là một số.');
          $(this).val('');
          return;
        }
      });

    // % completed
    $('#today-task-table tbody .completed_percent')
      .off('keyup')
      .on('keyup', function () {
        const _val = $(this).val();

        if (!_val) {
          return;
        }

        if (!_val.match(/^([1-9]|[1-9][0-9]|100)$/g)) {
          ZAlert.error('Completed percent phải bắt đầu từ 1 đến 100.');
          $(this)
            .val(_val.substring(0, _val.length - 1))
            .focus();
          return;
        }
      });
  }

  _validate(isCheckEmail = true) {
    var errMsg = [];
    // _free_effort = parseInt(ZConfig.get('FREE_EFFORT')),
    // _total = 0;

    // $('#' + TASK_SELECTED_TABLE_ELE + ' tbody .effort').each(function() {
    //     var _val = $(this).val() || 0;
    //     _total += parseInt(_val);
    // });

    // if (_free_effort > _total) {
    //     errMsg.push('- Free effort must be smaller or equal total effort of today.');
    // }

    if (isCheckEmail === true) {
      // check subject
      const _sbj = $('#subject').val();
      if (_sbj == '') {
        errMsg.push('- Subject không được để trống.');
      }

      // check to
      const _to = $('#to').auiSelect2('data');
      if (_to.length == 0) {
        errMsg.push('- To Email không được để trống.');
      }

      // check cc
      const _cc = $('#cc').auiSelect2('data');
      if (_cc.length == 0) {
        errMsg.push('- CC Email không được để trống.');
      }
    }

    $('#today-task-table tbody .completed_size').each(function () {
      // if disabled, ignore it
      if ($(this).attr('disabled')) {
        return;
      }

      const _val = $(this).val();

      if (!_val) {
        return;
      }

      if (!_val.match(/^([0-9]+)$/g)) {
        errMsg.push(`- Completed Size (${_val}) phải là một số.`);
      }
    });

    $('#today-task-table tbody .completed_percent').each(function () {
      const _val = $(this).val();

      if (!_val) {
        return;
      }

      if (!_val.match(/^([1-9]|[1-9][0-9]|100)$/g)) {
        errMsg.push(`- Completed Percent (${val}) phải bắt đầu từ 1 đến 100.`);
      }
    });

    let _outputEmpty = 0;
    $('#today-task-table tbody .output').each(function () {
      const _val = $(this).val();

      if (_val == '') {
        _outputEmpty++;
      }
    });

    if (_outputEmpty > 0) {
      errMsg.push(`- Output "Tasks today" không được để trống.`);
    }

    return errMsg;
  }

  async logwork() {
    if (!ZUser.authenticated()) {
      ZAlert.error('Bạn cần đăng nhập lại.');
      return;
    }

    if (selectedTasks.length == 0) {
      ZAlert.error('Chưa có task được chọn ngày hôm nay.');
      return;
    }

    let errMsg = this._validate(false);
    if (errMsg.length > 0) {
      ZAlert.error(errMsg.join('<br/>'));
      return;
    }

    let deferredPromises = [];
    const _date = moment($('#date').val(), 'DD/MM/YYYY');

    _.each(selectedTasks, (task) => {

      const _tow = $('#' + task.key())
        .find('.tow-select')
        .auiSelect2('data');
      const _effort = Number(
        $('#' + task.key())
          .find('.effort')
          .val()
      );
      const _comment = $('#' + task.key())
        .find('.output')
        .val();
      const _completed_size = $('#' + task.key())
        .find('.completed_size')
        .val();
      const _resolution = $('#' + task.key())
        .find('.resolution-select')
        .auiSelect2('data');
      const _completed_percent = $('#' + task.key())
        .find('.completed_percent')
        .val();

      const _remain = $('#' + task.key())
        .find('.remaining_estimate')
        .val();
      let _data = {};

      if (_effort > 0 && _tow.id) {
        function comment() {
          if (task.isBug()) {
            return `${_tow.id} defect`;
          }

          return `${_tow.id} ${task.product()}`;
        }

        // ----- TaiNV10 start code------
        const taskTimeEstimate = task.timeEstimate();
        if (taskTimeEstimate > 0) {
          _data.remainingEstimate = taskTimeEstimate - _data.time * 3600; 
        }
        // ----- TaiNV10 end code -----

        
        // -----  TaiNV10 ----
        _data.date = _date;
        _data.comment = comment();
        _data.user = this.user;
        _data.effort = _effort;
        _data.issueKey = task.key();
        _data.tow = _tow;
        _data.remain = _remain;

        // worklog
        // deferredPromises.push(
        //   new ZRequest({
        //     headers: {
        //       'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //   }).post(`rest/tempo-rest/1.0/worklogs/${task.key()}`, _data)
        // );

        deferredPromises.push(
          ZRequestConfig.worklogs(_data)
        );
      }

      _data = {
        fields: {},
      };

      if (_completed_size && _completed_size.match(/^\d+$/g)) {
        if (!_data.fields) {
          _data.fields = {};
        }
        
        // ----- TaiNV10 : add check tồn tại files Completed size -----
        if(task.existFieldsCompletedSize() && !task.isBug()){ 
          _data.fields[CUSTOM_FIELDS.COMPLETED_SIZE] =
          task.completedSize() + Number(_completed_size);
        }
        
        if (task.estimatedSize() > 0) {
          _data.fields[CUSTOM_FIELDS.REMAINING_SIZE] =
            task.estimatedSize() - _data.fields[CUSTOM_FIELDS.COMPLETED_SIZE];
        }
      }

      // append output description (translated)
      var output = `====${_date.format('DD/MM/YYYY')}====
${_comment}`;

      if (task.fields(CUSTOM_FIELDS.DESCRIPTION_TRANSLATED)) {
        output += `
${task.fields(CUSTOM_FIELDS.DESCRIPTION_TRANSLATED)}`;
      }

      _data.fields[CUSTOM_FIELDS.DESCRIPTION_TRANSLATED] = output;

      // deferredPromises.push(new ZRequest().post(`rest/api/2/issue/${task.key()}/comment`, _data));
      deferredPromises.push(
        new ZRequest().put(`rest/api/2/issue/${task.key()}`, _data)
      );

      // resolution
      if (
        // _resolution !== null &&
        // _resolution.length > 0 &&
        _completed_percent.match(/^100$/g)
      ) {
        _data = {
          update: {},
          transition: { id: TRANSITION_ID },
          fields: {
            resolution: {
              name: RESOLUTION_ID,
              description: task.fields('summary'),
            },
          },
        };
        deferredPromises.push(
          new ZRequest().post(
            `rest/api/2/issue/${task.key()}/transitions?expand=transitions.fields&transitionId=${TRANSITION_ID}`,
            JSON.stringify(_data)
          )
        );
      }
    });

    // create q&a if has
    $('#risk-issue-table tbody tr').each(() => {
      const isCreateQA = $(this).find('.is-create-qa').is(':checked');

      if (!isCreateQA) {
        return;
      }

      const summary = $(this).find('.summary').val();
      const cause = $(this).find('.cause').val();
      const impact = $(this).find('.impact').val();
      const action = $(this).find('.action').val();
      const escalate = $(this).find('.escalate').val();
      const description = `
Cause:
${cause}

Impact:
${impact}`;
      if (action) {
        description += `
Action:
${action}`;
      }

      if (escalate) {
        description += `
Escalate:
${escalate}`;
      }

      let _data = {
        fields: {
          project: {
            key: 'TEST',
          },
          components: [],
          summary: summary,
          description: description,
          issuetype: {
            name: 'Q&A',
          },
          assignee: {
            name: escalate,
          },
          reporter: {
            name: this.user.name,
          },
        },
      };

      if (selectedTasks.length > 0) {
        _data.fields.project.key = selectedTasks[0].projectKey();

        selectedTasks[0].components().forEach((com) => {
          _data.fields.components.push({
            id: com.id,
          });
        });
      }

      deferredPromises.push(new ZRequest(`rest/api/2/issue`, _data));
    });

    Promise.allSettled(deferredPromises).then(function () {
      ZAlert.success('Successfully! Logwork done.');
    });
  }

  send() {
    if (selectedTasks.length == 0) {
      ZAlert.error('No task(s) has selected in today.');
      return;
    }

    let errMsg = this._validate();
    if (errMsg.length > 0) {
      ZAlert.error(errMsg.join('<br/>'));
      return;
    }

    // save config to storage
    const _sbj = $('#subject').val();
    const _to = $('#to').auiSelect2('data');
    const _cc = $('#cc').auiSelect2('data');

    // send mail
    let _toList = [],
      _ccList = [];
    _.each(_to, function (to) {
      _toList.push(to.id);
    });
    _.each(_cc, function (cc) {
      _ccList.push(cc.id);
    });

    function makeEmlFile() {
      const text = `To: ${_toList.join(',')}
Cc: ${_ccList.join(',')}
Subject: ${_sbj}
X-Unsent: 1
Content-Type: text/html; charset=UTF-8

<html>
<head></head>
<body>${ZUtils.parseHTML($('#mail-body')[0])}</body>
</html>`;
      const data = new Blob([text], { type: 'text/plain' });
      return window.URL.createObjectURL(data);
    }

    const download = document.createElement('a');
    download.href = makeEmlFile();
    download.target = '_blank';
    download.download = `daily-report-${$('#date').val()}.eml`;
    download.click();
  }

  addRiskIssue(initEvent) {
    var _table = $('#risk-issue-table'),
      _index = _table.find('tbody tr').length + 1,
      _tmpl = `<tr>
        <td>${_index}</td>
        <td><textarea ignore-ele elastic class="textarea summary"></textarea></td>
        <td><textarea ignore-ele elastic class="textarea cause"></textarea></td>
        <td><textarea ignore-ele elastic class="textarea impact"></textarea></td>
        <td><textarea ignore-ele elastic class="textarea action"></textarea></td>
        <td><input ignore-ele style="width:200px;" placeholder="Please input the account name." class="text escalate"></td>
        <td><div class="checkbox"><input ignore-ele type="checkbox" class="checkbox is-create-qa"></div></td>
        <td ignore-ele><a class="remove"><span class="aui-icon aui-icon-small aui-iconfont-delete"></span></a></td>
    </tr>`;

    _table.find('tbody').append(_tmpl);

    if (initEvent === undefined) {
      $('#risk-issue-table tbody tr:last-child .remove').on(
        'click',
        function () {
          $(this).parents('tr').remove();
        }
      );
    }
  }

  addNextTask(initEvent, task) {
    var _table = $('#next-task-table'),
      _index = _table.find('tbody tr').length + 1,
      _tmpl = `<tr>
        <td>${_index}</td>
        <td><textarea ignore-ele elastic class="textarea"></textarea></td>
        <td><input ignore-ele style="width:30px;" class="text effort"> h</td>
        <td><input ignore-ele class="text datepicker" style="width: 100px;"></td>
        <td ignore-ele><a class="remove"><span class="aui-icon aui-icon-small aui-iconfont-delete"></span></a></td>
    </tr>`;

    if (task !== undefined && task !== null) {
      _tmpl = `<tr class="${task.key()}">
            <td>${_index}</td>
            <td>${task.link()}</td>
            <td><input ignore-ele style="width:30px;" class="text effort"> h</td>
            <td>${task.duedate()}</td>
            <td ignore-ele><a class="remove"><span class="aui-icon aui-icon-small aui-iconfont-delete"></span></a></td>
        </tr>`;
    }

    _table.find('tbody').append(_tmpl);

    if (initEvent === undefined) {
      this.initEventsNextTask();
    }
  }

  initEventsNextTask() {
    $('#next-task-table tbody tr:last-child .effort')
      .on('keyup', function () {
        let _val = $(this).val();

        if (!_val.match(/^([0-7](\.)?(\.[1-9]{1,2})?|8)$/g)) {
          ZAlert.error('Effort is must be started from 0 to 8.');
          $(this)
            .val(_val.substring(0, _val.length - 1))
            .focus();
          return;
        }

        _val = parseFloat(_val);

        if (_val < 0 || _val > 8) {
          ZAlert.error('Effort is must be started from 0 to 8.');
          $(this).val('');
          return;
        }
      })
      .on('blur', function () {
        if (
          !$(this)
            .val()
            .match(/^([0-7](\.[1-9]{1,2})?|8)$/g)
        ) {
          ZAlert.error('Effort is must be started from 0 to 8.');
          $(this).val('').focus();
          return;
        }
      });

    $('#next-task-table tbody tr:last-child .datepicker').each(function () {
      var options = {};

      var defaultDate = $(this).data('default-date');
      if (defaultDate) {
        options.defaultDate = defaultDate;
      }

      $(this).datepicker(
        $.extend(
          {
            format: 'mm/dd/yyyy',
            zIndex: 3100,
            autoHide: true,
            autoPick: true,
          },
          options
        )
      );
    });

    $('#next-task-table tbody tr:last-child .remove').on('click', function () {
      var _key = $(this).parents('tr').attr('class');
      if (_key) {
        $('a.add-next-task[data-key="' + _key + '"]').trigger('click');
      } else {
        $(this).parents('tr').remove();
      }

      var _index = 1;
      $('#next-task-table tbody tr').each(function () {
        $(this).find('td:first-child').text(_index);
        _index++;
      });
    });
  }
}

export function init() {
  new DailyReport();
}
