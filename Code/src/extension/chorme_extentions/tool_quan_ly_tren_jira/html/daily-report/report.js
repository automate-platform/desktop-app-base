export default `
<form class="aui" id="mail-body">
  <div class="issue-setup-fields issue-body-content">
    <div class="form-body">
      <div class="content">
      <div class="field-group" ignore-ele>
        <label for="subject">Subject</label>
        <input type="text" name="subject" id="subject" class="text long-field" />
      </div>
      <div class="field-group" ignore-ele>
        <label for="to">To</label>
        <select id="to" name="to" class="ui-select zui-select long-field" multiple></select>
      </div>
      <div class="field-group" ignore-ele>
        <label for="cc">CC</label>
        <select id="cc" name="cc" class="ui-select zui-select long-field" multiple></select>
      </div>
      <div class="module toggle-wrap" ignore-ele>
        <div class="mod-header">
          <ul class="ops"></ul>
          <h2 class="toggle-title">Email body</h2>
        </div>
      </div>
      <br />
      <textarea elastic name="body" id="body" class="textarea long-field" ignore-ele></textarea>
      <br />
      <br />
      <table class="ztable aui border info" style="width: 422px" width="322" cellpadding="0" cellspacing="0">
        <colgroup>
          <col style="width: 140px" />
          <col style="width: 212px" />
        </colgroup>
        <tbody>
        <tr>
          <td class="first" width="140">Account</td>
          <td width="212"><span id="username"></span></td>
        </tr>
        <tr>
          <td class="first">Date</td>
          <td><input ignore-ele id="date" class="datepicker" style="border: none; width: 100%" /></td>
        </tr>
        <tr>
          <td class="first">Project</td>
          <td><span id="project"></span></td>
        </tr>
        <tr>
          <td class="first">Usage Effort</td>
          <td><span id="usage-effort"></span></td>
        </tr>
        <tr>
          <td class="first">Free Effort</td>
          <td><span id="free-effort"></span></td>
        </tr>
        </tbody>
      </table>
      <div class="module toggle-wrap">
        <div class="mod-header">
          <ul class="ops"></ul>
          <h2 class="toggle-title">1. Tasks today</h2>
        </div>
      </div>
      <table id="today-task-table" class="ztable large aui border info" style="width: 1580px" width="1580">
        <colgroup>
          <col style="width: 30px" />
          <col style="width: 450px" />
          <col style="width: 50px" ignore-ele />
          <col style="width: 90px" />
          <col style="width: 80px" />
          <col style="width: 100px" ignore-ele />
          <col style="width: 70px" />
          <col style="width: 80px" />
          <col style="width: 350px" />
        </colgroup>
        <thead>
        <tr>
          <th width="30">#</th>
          <th width="450">Summary</th>
          <th width="50" ignore-ele>TOW</th>
          <th width="90">% Completed</th>
          <th width="80">Due date</th>
          <th width="100" ignore-ele>Completed Size</th>
          <th width="70">Effort (h)</th>
          <th width="80">Remain (h)</th>
          <th width="350">Output</th>
        </tr>
        </thead>
        <tbody></tbody>
        <tfoot></tfoot>
      </table>
      <div class="module toggle-wrap">
        <div class="mod-header">
          <ul class="ops"></ul>
          <h2 class="toggle-title">2. Next tasks</h2>
        </div>
      </div>
      <table id="next-task-table" class="ztable aui border info" style="width: 705px" width="705">
        <colgroup>
          <col style="width: 30px" />
          <col style="width: 435px" />
          <col style="width: 120px" />
          <col style="width: 120px" />
          <col style="width: 40px" ignore-ele />
        </colgroup>
        <thead>
        <tr>
          <th width="15">#</th>
          <th width="435">Summary</th>
          <th width="120">Effort (h)</th>
          <th width="110">Due date</th>
          <th width="50" ignore-ele>
          <a class="white" id="add-next-task"><span class="aui-icon aui-icon-small aui-iconfont-add-small"></span></a>
          </th>
        </tr>
        </thead>
        <tbody></tbody>
        <tfoot></tfoot>
      </table>

      <div class="module toggle-wrap">
        <div class="mod-header">
          <ul class="ops"></ul>
          <h2 class="toggle-title">3. Risks & Issues</h2>
        </div>
      </div>

      <form class="aui">
        <table id="risk-issue-table" class="ztable aui border info" style="width: 1500px" width="1500">
        <colgroup>
          <col style="width: 30px" />
          <col style="width: 435px" />
          <col style="width: 435px" />
          <col style="width: 435px" />
          <col style="width: 200px" />
          <col style="width: 140px" />
          <col style="width: 40px" ignore-ele />
        </colgroup>
        <thead>
          <tr>
            <th width="15">#</th>
            <th width="435">Summary</th>
            <th width="435">Cause</th>
            <th width="435">Impact</th>
            <th width="435">Action</th>
            <th width="200">Escalate</th>
            <th width="140">Create Q&A?</th>
            <th width="50" ignore-ele>
                <a class="white" id="add-risk-issue"><span class="aui-icon aui-icon-small aui-iconfont-add-small"></span></a>
            </th>
          </tr>
        </thead>
        <tbody></tbody>
        <tfoot></tfoot>
        </table>
      </form>
      </div>
    </div>
  </div>
</form>`;