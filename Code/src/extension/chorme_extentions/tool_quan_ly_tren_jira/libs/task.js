/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import { SUBTASK, BUG, TASK } from '../constants.js';
import ZUrl from './url.js';
import ZRequest from './request.js';
import ZUtils from './utils.js';
import ZJiraTask from './jira.task.js';

const RESOLUTIONS = ZAPP_CONFIG.RESOLUTION.join(`','`);
const CUSTOM_FIELDS = ZAPP_CONFIG.CUSTOM_FIELDS;
const TRANSITION_ID = ZAPP_CONFIG.TRANSITION_ID;

export default class ZTask {
  constructor(data) {
    this._data = data;
    this._data.bugs = null;
    this._data.subTasks = null;
  }

  key() {
    return this._data.key;
  }

  projectKey() {
    return this.fields('project').key;
  }

  product() {
    let produc = this.fields(CUSTOM_FIELDS.PRODUCT);
    if(!produc){
      return '';
    }
    return this.fields(CUSTOM_FIELDS.PRODUCT).replace(/(.*)(\s+\[.*\])/g, '$1').trim();
  }

  desc() {
    return this.fields('description');
  }

  title() {
    return this.fields('summary');
  }

  fields(field = null) {
    if (!field) {
      return this._data.fields;
    }

    if (!field in this._data.fields) {
      return null;
    }

    return this._data.fields[field];
  }

  assignee() {
    return this._data.fields.assignee;
  }

  url() {
    return ZUrl.get('browse/' + this.key());
  }

  createdDate() {
    const created = this.fields('created');

    if (!created) {
      return '';
    }

    let dateMatch = created.match(/(\d{4})\-(\d{2})\-(\d{2})/);

    if (!dateMatch) {
      return '';
    }

    return dateMatch[3] + '/' + dateMatch[2] + '/' + dateMatch[1];
  }

  duedate() {
    const duedate = this.fields('duedate');

    if (!duedate) {
      return '';
    }

    let dateMatch = duedate.match(/(\d{4})\-(\d{2})\-(\d{2})/);

    if (!dateMatch) {
      return '';
    }

    return dateMatch[3] + '/' + dateMatch[2] + '/' + dateMatch[1];
  }

  histories() {
    return this._data.changelog.histories;
  }

  parent(field = null) {
    const parent = this.fields('parent');

    if (!parent) {
      return null;
    }

    if (field) {
      return parent[field] || null;
    }

    return parent;
  }

  link(length = null) {
    let $parentLink = ``;

    if (this.isSubTask()) {
      const icon = this.icon(this.parent('fields').issuetype.name);
      const url = ZUrl.get('browse/' + this.parent('key'));
      const summary = this.parent('fields').summary;
      $parentLink = `${icon} <a href="${url}" title="${summary}" target="_blank">${summary}</a>`;
      $parentLink += ' // ';
    }

    let title = this.title();
    if (length) {
      title = ZUtils.textLimit(title, length);
    }

    return `${$parentLink}${this.icon()} <a href="${this.url()}" target="_blank" title="${this.title()}">${title}</a>`;
  }

  type() {
    return this.fields('issuetype').name;
  }

  icon($type = null) {
    $type = $type ? $type : this.type();

    switch ($type) {
      case SUBTASK:
        return `<img ignore-ele class="issue-type-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDE2IDE2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5zdWJ0YXNrPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc2tldGNoOnR5cGU9Ik1TUGFnZSI+CiAgICAgICAgPGcgaWQ9InN1YnRhc2siIHNrZXRjaDp0eXBlPSJNU0FydGJvYXJkR3JvdXAiPgogICAgICAgICAgICA8ZyBpZD0iU3VidGFzayIgc2tldGNoOnR5cGU9Ik1TTGF5ZXJHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4wMDAwMDAsIDEuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTM2IiBmaWxsPSIjNEJBRUU4IiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHJ4PSIyIj48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTgwIiBzdHJva2U9IiNGRkZGRkYiIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiIHg9IjMiIHk9IjMiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiIHJ4PSIwLjgwMDAwMDAxMiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS04MC1Db3B5IiBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiIHg9IjYiIHk9IjYiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiIHJ4PSIwLjgwMDAwMDAxMiI+PC9yZWN0PgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=" height="16" width="16" border="0" align="absmiddle">`;
      case BUG:
        return `<img ignore-ele class="issue-type-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDE2IDE2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5idWc8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBza2V0Y2g6dHlwZT0iTVNQYWdlIj4KICAgICAgICA8ZyBpZD0iYnVnIiBza2V0Y2g6dHlwZT0iTVNBcnRib2FyZEdyb3VwIj4KICAgICAgICAgICAgPGcgaWQ9IkJ1ZyIgc2tldGNoOnR5cGU9Ik1TTGF5ZXJHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4wMDAwMDAsIDEuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTM2IiBmaWxsPSIjRTU0OTNBIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHJ4PSIyIj48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsNyBDMTAsOC42NTcgOC42NTcsMTAgNywxMCBDNS4zNDMsMTAgNCw4LjY1NyA0LDcgQzQsNS4zNDMgNS4zNDMsNCA3LDQgQzguNjU3LDQgMTAsNS4zNDMgMTAsNyIgaWQ9IkZpbGwtMiIgZmlsbD0iI0ZGRkZGRiIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=" height="16" width="16" border="0" align="absmiddle">`;
      case TASK:
        return `<img ignore-ele class="issue-type-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDE2IDE2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy41LjIgKDI1MjM1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT50YXNrPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc2tldGNoOnR5cGU9Ik1TUGFnZSI+CiAgICAgICAgPGcgaWQ9InRhc2siIHNrZXRjaDp0eXBlPSJNU0FydGJvYXJkR3JvdXAiPgogICAgICAgICAgICA8ZyBpZD0iVGFzayIgc2tldGNoOnR5cGU9Ik1TTGF5ZXJHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4wMDAwMDAsIDEuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTM2IiBmaWxsPSIjNEJBREU4IiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHJ4PSIyIj48L3JlY3Q+CiAgICAgICAgICAgICAgICA8ZyBpZD0iUGFnZS0xIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0LjAwMDAwMCwgNC41MDAwMDApIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMiw1IEw2LDAiIGlkPSJTdHJva2UtMSI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yLDUgTDAsMyIgaWQ9IlN0cm9rZS0zIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==" height="16" width="16" border="0" align="absmiddle">`;
      default:
        return '';
    }
  }

  statusHTML() {
    const status = this.status();
    let statusClass = 'jira-issue-status-lozenge';

    switch (status) {
      case 'Resolved':
      case 'Closed':
      case 'Cancelled':
        statusClass += '-green';
        break;
      case 'In Progress':
        statusClass += '-yellow';
        break;
      default:
        statusClass += '-blue-gray';
        break;
    }

    return `<span class='jira-issue-status-lozenge aui-lozenge ${statusClass} aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium'>${status}</span>`;
  }

  status() {
    return this.fields('status').name;
  }

  completedSize() {
    return this.fields(CUSTOM_FIELDS.COMPLETED_SIZE) || 0;
  }

  // ---- TaiNV10: edit name estimateSize => estimatedSize
  estimatedSize() {
    return this.fields(CUSTOM_FIELDS.ESTIMATED_SIZE) || 0;
  }

  timeSpent() {
    return this.fields(CUSTOM_FIELDS.TIME_SPENT) || 0;
  }

  timeEstimate() {
    return this.fields(CUSTOM_FIELDS.TIME_ESTIMATE) || 0;
  }

  role() {
    const role = this.fields(CUSTOM_FIELDS.ROLE);

    if (!role) {
      return null;
    }

    return role.value;
  }

  qcActivity() {
    const qcActivity = this.fields(CUSTOM_FIELDS.QC_ACTIVITY);

    if (!qcActivity) {
      return null;
    }

    return qcActivity.value;
  }

  defectOrigin() {
    return this.fields(CUSTOM_FIELDS.DEFECT_ORIGIN);
  }

  hasProduct() {
    return this.product() !== null;
  }

  isSubTask() {
    return this.type() === 'Sub-task';
  }

  isBug() {
    return this.type() === 'Bug';
  }

  isTask() {
    return this.type() === 'Task';
  }

  subTasks() {
    const d = new $.Deferred();

    if (this._data.subtasks) {
      d.resolve(this._data.subtasks);
      return;
    }

    const subTasks = this.fields('subtasks');
    if (subTasks && subTasks.length === 0) {
      d.resolve([]);
      return;
    }

    let deferredQueue = [];

    _.each(subTasks, function () {
      deferredQueue.push($.Deferred());
    });

    const thiz = this;
    Promise.all(deferredQueue).then(function () {
      let subtasks = arguments[0] || [];

      if (subtasks.length > 0) {
        _.each(subtasks, function (sub, index) {
          subtasks[index] = new ZTask(sub);
        });
      }

      thiz._data.subtasks = subtasks;
      d.resolve(thiz._data.subtasks);
    });

    _.each(subTasks, function (subtask, queueIndex) {
      new ZRequest()
        .get(`rest/api/2/issue/${subtask.key}`)
        .then(function (subTaskInfo) {
          deferredQueue[queueIndex].resolve(subTaskInfo);
        });
    });

    return d.promise();
  }

  bugs() {
    const d = new $.Deferred();
    let queryString = [];

    if (this._data.bugs && this._data.bugs.length > 0) {
      d.resolve(this._data.bugs);
      return d.promise();
    }

    queryString.push(`issuetype in ('${BUG}')`);
    queryString.push(
      `(resolution = 'Unresolved' OR resolution not in ('${RESOLUTIONS}'))`
    );

    queryString.push(`status != Cancelled`);
    queryString.push(`issue in linkedIssues('${this.key()}')`);
    queryString = queryString.join(' AND ');
    queryString += ` ORDER BY duedate ASC`;

    const thiz = this;

    ZJiraTask.findAll({
      jql: queryString,
      startAt: 0,
      maxResults: 500,
    })
      .then(function (bugs) {
        if (bugs.length > 0) {
          _.each(bugs, function (bug, index) {
            bugs[index] = new ZTask(bug);
          });
        }

        thiz._data.bugs = Array.values(bugs);
        d.resolve(thiz._data.bugs);
      })
      .catch(d.reject);

    return d.promise();
  }

  components(index = null) {
    if (index === null) {
      return this.fields('components');
    }

    return this.fields('components')[index].name;
  }

  async logwork(data) {
    const user = await ZUser.info();
    const promises = [];
    const _data = {
      user: user.name,
      ansienddate: data.date.format('YYYY-MM-DD'),
      ansidate: data.date.format('YYYY-MM-DDThh:mm:ss'),
      datefield: data.date.format('YYYY-MM-DD'),
      time: data.effort,
      remainingEstimate: 0,
      comment: this.isBug()
        ? `${data.tow.id} defect`
        : `${data.tow.id} ${this.product()}`,
      _TypeofWork_: data.tow.id,
    };

    if (this.timeEstimate() > 0) {
      _data.remainingEstimate = this.timeEstimate() - _data.time * 3600;
    }

    // worklog
    const url = `rest/tempo-rest/1.0/worklogs/${this.key()}`;
    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    promises.push(new ZRequest(options).post(url, _data));
    promises.push(this.updateDescTranslated(data));
    promises.push(this.updateResolution(data));

    return promises;
  }

  updateDescTranslated(data) {
    const _data = {
      fields: {},
    };
    const descTranslated = this.fields(CUSTOM_FIELDS.DESCRIPTION_TRANSLATED);

    // append output description (translated)
    _data.fields[
      CUSTOM_FIELDS.DESCRIPTION_TRANSLATED
    ] = `====${data.date.format('DD/MM/YYYY')}====
${data.ouput}
${descTranslated || ''}`;

    const url = `rest/api/2/issue/${this.key()}`;
    return new ZRequest().put(url, _data);
  }

  updateResolution(data) {
    // resolution
    if (data.resolution && data.percent_completed.match(/^100$/g)) {
      const _data = {
        update: {},
        transition: { id: TRANSITION_ID },
        fields: {
          resolution: {
            name: data.resolution.id,
            description: this.fields('summary'),
          },
        },
      };

      const url = `rest/api/2/issue/${this.key()}/transitions?expand=transitions.fields&transitionId=${TRANSITION_ID}`;
      return new ZRequest().post(url, _data);
    }

    return Promise.resolve();
  }

  async addQnA(data) {
    const user = await ZUser.info();
    const description = `
  Cause:
  ${data.cause}

  Impact:
  ${data.impact}`;

    if (data.action) {
      description += `
  Action:
  ${data.action}`;
    }

    if (data.escalate) {
      description += `
  Escalate:
  ${data.escalate}`;
    }

    const _data = {
      fields: {
        project: {
          key: this.projectKey(),
        },
        summary: data.summary,
        description: description,
        issuetype: {
          name: 'Q&A',
        },
        assignee: {
          name: data.escalate,
        },
        reporter: {
          name: user.name,
        },
        components: []
      },
    };

    this.components().forEach((com) => {
      _data.fields.components.push({
        id: com.id,
      });
    });

    return new ZRequest(`rest/api/2/issue`, _data);
  }


  // ----- TaiNV10: Add metho
  existFieldsCompletedSize() {
    return this._data.fields.hasOwnProperty(CUSTOM_FIELDS.COMPLETED_SIZE);
  }

}
