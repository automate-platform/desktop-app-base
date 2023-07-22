export default `
<form class="aui">
  <aui-label>Dự án:</aui-label>
  <select id="project" class="ui-select zui-select project" multiple style="vertical-align: top"></select>
  <aui-label>Hạn chót:</aui-label>
  <input class="text " id="duedate" style="vertical-align: top; width: 150px" placeholder="MM/dd/YYYY"/>
  <aui-label>Trạng thái:</aui-label>
  <select id="status" class="ui-select zui-select" multiple style="vertical-align: top; width: 170px">
    <option value="Closed">Closed</option>
    <option value="Open">Open</option>
    <option value="In Progress">In Progress</option>
    <option value="Reopened">Reopened</option>
  </select>
  <a class="aui-button aui-button-primary" style="vertical-align: top" id="search"><span class="aui-icon aui-icon-small aui-iconfont-search"></span>&nbsp;Tìm kiếm</a>
</form>
<hr />
<table id="ztable" class="ztable aui border">
  <thead></thead>
  <tbody></tbody>
  <tfoot></tfoot>
</table>`;
