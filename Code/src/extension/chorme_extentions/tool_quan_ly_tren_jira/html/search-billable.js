export default `
<form class="aui">
  <aui-label>Dự án:</aui-label>
  <select id="project" class="ui-select zui-select project" style="vertical-align: top" multiple></select>
  <aui-label>Năm:</aui-label>
  <select id="year" class="ui-select zui-select" style="vertical-align: top; width: 170px"></select>
  <aui-label>Quý:</aui-label>
  <select id="quarter" class="ui-select zui-select" disabled="disabled" style="vertical-align: top; width: 100px">
    <option value="">Tất cả</option>
    <option value="0">Q1</option>
    <option value="1">Q2</option>
    <option value="2">Q3</option>
    <option value="3">Q4</option>
  </select>

  <a class="aui-button aui-button-primary" style="vertical-align: top" id="search"> <span class="aui-icon aui-icon-small aui-iconfont-search"></span>&nbsp;Tìm kiếm</a>
</form>

<hr />
<table id="ztable" class="ztable aui border">
  <thead></thead>
  <tbody></tbody>
  <tfoot></tfoot>
</table>`;
