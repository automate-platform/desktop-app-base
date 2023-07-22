export default `
<form class="aui">
  <aui-label>Dự án:</aui-label>
  <select id="project" class="ui-select zui-select project" style="vertical-align: top"></select>
  <aui-label>Hạn chót:</aui-label>
  <input class="text datepicker" id="due_from" style="vertical-align: top; width: 90px" />
  <input class="text datepicker" id="due_to" style="vertical-align: top; width: 90px" />
  <a class="aui-button aui-button-primary" style="vertical-align: top" id="search">
    <span class="aui-icon aui-icon-small aui-iconfont-search"></span>&nbsp;Tìm kiếm
  </a>
</form>
<hr />
<table class="ztable aui border small" id="project-productivity" style="width: 30%">
  <thead>
    <tr>
      <th>Project Metric</th>
      <th>Unit</th>
      <th>Target</th>
      <th>Actual</th>
      </th>
  </thead>
  <tbody>
    <tr>
      <td>Project Productivity</td>
      <td id="punit" class="center"></td>
      <td id="ptarget" class="center"></td>
      <td id="pactual" class="center"></td>
    </tr>
    <tr>
      <td>Coding Productivity</td>
      <td id="cunit" class="center"></td>
      <td id="ctarget" class="center"></td>
      <td id="cactual" class="center"></td>
    </tr>
  </tbody>
</table>

<hr />

<table id="scope-productivity" class="ztable aui border small">
  <thead>
    <tr>
      <th width="20%">Scope</th>
      <th>Coding</th>
      <th>UT Create</th>
      <th>UT Exec</th>
      <th>IT Create</th>
      <th>IT Exec</th>
    </tr>
    <tr>
      <th>Đơn vị</th>
      <th>LOC/MD</th>
      <th>Case/MD</th>
      <th>Case/MD</th>
      <th>Case/MD</th>
      <th>Case/MD</th>
    </tr>
    <tr>
      <th>Target</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>`;
