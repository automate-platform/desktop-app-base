/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZJiraProject from './jira.project.js';

export default class ZDialog {
  constructor(options) {
    this.options = options;
    this.dialog = new AJS.Dialog({
      width: options.width || window.innerWidth * 0.8,
      height: options.height || window.innerHeight * 0.8,
      id: 'zdialog',
      closeOnOutsideClick: options.closeOnOutsideClick || false,
    });
    const thiz = this;
    
    AJS.bind('show.dialog', async function () {
      let data = {};
      const projects = await ZJiraProject.findAll();

      if (projects.length > 0) {
        data.projects = [];
        _.each(projects, function (project) {
          data.projects[project.key()] = project;
        });
      }

      $(thiz.id())
        .find('select.ui-select')
        .each(async function () {
          var ele = this;
          $(ele).auiSelect2({
            allowClear: true,
          });

          if ($(this).hasClass('project') && projects.length > 0) {
            _.each(projects, function (project) {
              $(ele).append(
                new Option(project.name(), project.key(), false, false)
              );
            });
            $(ele).auiSelect2().trigger('change');
          }
        });

      $(thiz.id())
        .find('input.datepicker')
        .each(function () {
          var options = {};

          var defaultDate = $(this).data('default-date');
          if (defaultDate) {
            options.defaultDate = defaultDate;
          }

          $(this).datepicker(
            $.extend(
              {
                format: 'mm/dd/yyyy',
                container: thiz.id(),
                zIndex: 3100,
                autoHide: true,
                autoPick: true,
              },
              options
            )
          );
        });

      $(thiz.id())
        .find('.ztooltip')
        .each(function () {
          $(this).tooltip();
        });

      if (typeof thiz.options.onShow === 'function') {
        thiz.options.onShow(data);
      }
    });

    // ----- TaiNV10: fix không clean data khi chọn lại Daily Report -----
    //   AJS.bind('remove.dialog', function () {
    AJS.bind('remove.dialog', function () {
      if (typeof thiz.options.onHide === 'function') {
        thiz.options.onHide();
      }
    });
  }

  
  id() {
    return '#zdialog';
  }

  title(title) {
    this.options.title = title;
  }

  init() {
    const thiz = this;
    this.dialog.addHeader(this.options.title, 'zdialog-header');

    if (this.options.buttons) {
      _.each(this.options.buttons, function (button) {
        thiz.dialog.addButton(
          button.name,
          function (dialog) {
            button.onClick(dialog);
          },
          button.class || ''
        );
      });
    }

    this.dialog.addButton('Đóng', function () {
      thiz.hide();
      // dialog.hide();
    });

    this.dialog.addPanel(
      'ZDialogBody',
      this.options.html || '',
      'zdialog-body'
    );
  }

  addHTML(html) {
    this.options.html = (this.options.html || '') + html;
  }

  show() {
    this.init();
    this.dialog.show();
  }

  hide() {
    AJS.unbind('show.dialog');
    AJS.unbind('hide.dialog');
    this.dialog.remove();
  }
}
