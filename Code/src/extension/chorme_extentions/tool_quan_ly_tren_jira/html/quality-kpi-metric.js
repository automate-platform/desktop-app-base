export default `
<form class="aui">
  <aui-label>Dự án:</aui-label>
  <select id="project" class="zui-select ui-select project" style="vertical-align: top"></select>
  <aui-label>Component:</aui-label>
  <select id="component" class="ui-select zui-select" multiple style="vertical-align: top; width: 170px"></select>
  <aui-label>Hạn chót:</aui-label>
  <input class="text datepicker" id="due_from" style="vertical-align: top; width: 90px" />
  <input class="text datepicker" id="due_to" style="vertical-align: top; width: 90px" />
  <aui-label>Hiển thị:</aui-label>
  <select id="mode" class="ui-select zui-select" style="vertical-align: top; width: 170px">
    <option value="detail">Chi tiết</option>
    <option value="summary">Tổng quan</option>
  </select>

  <a class="aui-button aui-button-primary" style="vertical-align: top" id="search"> <span class="aui-icon aui-icon-small aui-iconfont-search"></span>&nbsp;Tìm kiếm</a>
</form>

<hr />
<table id="ztable" class="ztable aui border small">
  <thead></thead>
  <tbody></tbody>
  <tfoot></tfoot>
</table>`;