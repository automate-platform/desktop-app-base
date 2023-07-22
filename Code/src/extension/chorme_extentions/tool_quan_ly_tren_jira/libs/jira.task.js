/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import { BUG, SUBTASK } from '../constants.js';
import ZRequest from './request.js';
import ZTask from './task.js';
import ZUtils from './utils.js';

const RESOLUTIONS = ZAPP_CONFIG.RESOLUTION.join(`","`);

export default {
  findAll(data, checkStage = false) {
    return new Promise((resolve) => {
      let tasks = [];
      data = data || {};
      data.startAt = data.startAt || 0;
      data.maxResults = data.maxResults || 100;

      function search(data) {
        new ZRequest()
          .get('rest/api/2/search', data)
          .then(function (resp) {
            if (!resp || !resp.issues || resp.issues.length === 0) {
              return resolve(tasks);
            }

            _.each(resp.issues, function (a) {
              const task = new ZTask(a);
              if (!checkStage && !ZUtils.isStageValid(task.product())) {
                return;
              }

              tasks.push(task);
            });

            if (resp.total > resp.maxResults + resp.startAt) {
              data.startAt = data.startAt + data.maxResults;

              setTimeout(() => {
                search(data);
              });
            } else {
              resolve(tasks);
            }
          })
          .catch(function () {
            resolve(tasks);
          });
      }

      setTimeout(() => {
        search(data);
      });
    });
  },

  find(data, checkStage = false) {
    return new Promise((resolve) => {
      let tasks = [];
      data = data || {};
      data.startAt = data.startAt || 0;
      data.maxResults = data.maxResults || 100;

      function search(data) {
        new ZRequest()
          .get('rest/api/2/search', data)
          .then(function (resp) {
            if (!resp || !resp.issues || resp.issues.length === 0) {
              return resolve(tasks);
            }

            _.each(resp.issues, function (a) {
              const task = new ZTask(a);
              if (!checkStage && !ZUtils.isStageValid(task.product())) {
                return;
              }

              tasks.push(task);
            });

            resolve(tasks);
          })
          .catch(function () {
            resolve(tasks);
          });
      }

      setTimeout(() => {
        search(data);
      });
    });
  },

  findBug(taskIds = []) {
    let queryString = [];

    if (taskIds.length === 0) {
      return [];
    }

    queryString.push(`issuetype in ('${BUG}')`);
    queryString.push(
      `(resolution = 'Unresolved' OR resolution not in ("${RESOLUTIONS}"))`
    );
    queryString.push(`status != Cancelled`);

    let tmp = [];
    _.each(taskIds, (taskId) => {
      tmp.push(`issue in linkedIssues("${taskId}")`);
    });
    if (tmp.length > 0) {
      queryString.push(`(${tmp.join(' OR ')})`);
    }
    queryString = queryString.join(' AND ');
    queryString += ` ORDER BY duedate ASC`;

    const data = {
      jql: queryString,
    };

    return this.findAll(data);
  },

  findSubTask(taskIds = []) {
    let queryString = [];

    if (taskIds.length === 0) {
      return [];
    }

    queryString.push(`issuetype in ('${SUBTASK}')`);
    queryString.push(
      `(resolution = 'Unresolved' OR resolution not in ("${RESOLUTIONS}"))`
    );
    queryString.push(`status != Cancelled`);
    if (taskIds.length > 0) {
      queryString.push(`parent in ("${taskIds.join('","')}")`);
    }
    queryString = queryString.join(' AND ');
    queryString += ` ORDER BY duedate ASC`;

    return this.findAll({
      jql: queryString,
    });
  },

  findId(taskId) {
    new ZRequest().get(`rest/api/2/issue/${taskId}`);
  },
};
