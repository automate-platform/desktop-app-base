/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

const CREATE_ISSUE_BTN = $(
  'nav.aui-header .aui-header-primary .aui-nav #create-menu'
);
const MENU_NAME = ZAPP_CONFIG.MENU_NAME;
const MENU_ITEMS = [
  {
    group: 'Monitor',
    childs: [{ name: 'Task Monitoring', app: 'task-monitoring' }, { name: 'Project Issues', app: 'project-issue' }],
  },
  {
    group: 'KPI & Productivity',
    childs: [
      { name: 'Quality KPI Metric', app: 'quality-kpi-metric' },
      { name: 'Project Productivity', app: 'project-productivity' },
    ],
  },
  {
    group: 'Advanced',
    childs: [
      { name: 'Search Billable', app: 'search-billable' },
      { name: 'Search KPI Metric', app: 'search-kpi' },
      { name: 'Resource Allocation', app: 'resource-allocation' },
    ],
  },
  {
    group: 'Daily Report',
    childs: [{ name: 'Daily Report', app: 'daily-report' }],
  },
];

export default class ZMenu {
  constructor() {
    this.render();
  }

  render() {
    let html = `
        <li><a class="aui-nav-link aui-dropdown2-trigger" id="bu-tools" aria-haspopup="true" aria-controls="fga-pdc-menu">${MENU_NAME}</a></li>
        <div class="aui-dropdown2 aui-style-default aui-layer" id="fga-pdc-menu">
      `;

    MENU_ITEMS.forEach((item) => {
      html += `<div class="aui-dropdown2-section">`;

      if (item.group) {
        html += `<strong>${item.group}</strong>`;
      }

      if (item.childs && item.childs.length > 0) {
        html += `<ul class="aui-list-truncate">`;
        item.childs.forEach((child) => {
          html += `<li>
              <a onClick="ZApp.open('${child.app}')">${child.name}</a>
            </li>`;
        });
        html += `</ul>`;
      }

      html += `</div>`;
    });

    html += `</div>`;

    if (CREATE_ISSUE_BTN.length) {
      $(html).insertBefore(CREATE_ISSUE_BTN);
    } else {
      $('nav.aui-header .aui-header-primary').append(`
          <ul class="aui-nav" style="width: auto">
            ${html}
          </ul>
        `);
    }
  }
}
