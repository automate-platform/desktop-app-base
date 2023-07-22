export default `
<form class="aui">
  <aui-label>Dự án:</aui-label>
  <select id="project" class="ui-select zui-select project" style="vertical-align: top"></select>
  <aui-label>Loại:</aui-label>
  <select id="type" class="ui-select zui-select" style="vertical-align: top; width: 170px">
    <option value="over">Quá duedate</option>
    <option value="change">Thay đổi duedate</option>
  </select>
  <aui-label>Hạn chót:</aui-label>
  <input class="text " id="duedate" style="vertical-align: top; width: 150px" placeholder="MM/dd/YYYY"/>
  <a class="aui-button aui-button-primary" style="vertical-align: top" id="search"><span class="aui-icon aui-icon-small aui-iconfont-search"></span>&nbsp;Tìm kiếm</a>
</form>
<hr />
<table id="ztable" class="ztable aui border">
  <thead></thead>
  <tbody></tbody>
  <tfoot></tfoot>
</table>`;
