import REPORT_HTML from './daily-report/report.js';
import MY_TASK_HTML from './daily-report/my-task.js';

export default `
<div class="aui-tabs horizontal-tabs">
  <ul class="tabs-menu">
    <li class="menu-item active-tab">
      <a href="#tab-1">My Tasks</a>
    </li>
    <li class="menu-item">
      <a href="#tab-2">Báo cáo</a>
    </li>
  </ul>
  <div class="tabs-pane active-pane" id="tab-1">${MY_TASK_HTML}</div>
  <div class="tabs-pane" id="tab-2">${REPORT_HTML}</div>
</div>`;
