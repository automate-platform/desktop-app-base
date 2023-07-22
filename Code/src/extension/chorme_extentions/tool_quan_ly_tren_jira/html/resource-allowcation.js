export default `
<form class="aui">
  <aui-label>Năm:</aui-label>
  <select id="year" class="ui-select zui-select" style="vertical-align: top; width: 100px"></select>

  <aui-label>Dự án:</aui-label>
  <select id="project" class="ui-select zui-select project" multiple style="vertical-align: top"></select>

  <aui-label>Tài khoản:</aui-label>
  <input type="text" id="users" class="text long-field" style="vertical-align: top; width: 250px"  placeholder="accountA, accountB"/>

  <a class="aui-button aui-button-primary" style="vertical-align: top" id="search"> <span class="aui-icon aui-icon-small aui-iconfont-search"></span> Tìm kiếm </a>
</form>

<hr />
<table id="ztable" class="ztable aui border">
  <thead></thead>
  <tbody></tbody>
  <tfoot></tfoot>
</table>`;