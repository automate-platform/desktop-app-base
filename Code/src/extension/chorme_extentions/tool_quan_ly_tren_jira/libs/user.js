/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import { TASK, BUG, PMTASK, SUBTASK } from '../constants.js';
import ZRequest from './request.js';
import ZJiraTask from './jira.task.js';

const DR_CONFIG = ZAPP_CONFIG.DAILY_REPORT;

class ZUser {
  constructor() {
    this._info = null;
  }

  authenticated() {
    return this._info !== null;
  }

  info() {
    return new Promise((resolve) => {
      if (this._info) {
        resolve(this._info);
        return;
      }

      new ZRequest()
        .get('rest/api/2/myself')
        .then((user) => {
          this._info = user;
          resolve(user);
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

  myTasks() {
    // const today = moment().format('YYYY-MM-DD');
    let queryString = [];

    queryString.push(`type in ("${TASK}","${SUBTASK}", "${PMTASK}", "${BUG}")`);
    // queryString.push(`((status in (Open, "In Progress", Reopened, Resolved) AND due >= "0") OR updated >= ${today})`);
    // queryString.push(`status in (Open, "In Progress", Reopened, Resolved, "TO DO")`);
    if(DR_CONFIG.STATUS){
      queryString.push(`status in (${DR_CONFIG.STATUS.join(',')})`);
    } else{
      queryString.push(`status in (Open, "In Progress", Reopened, Resolved, "TO DO")`);
    }

    queryString.push(`assignee in (currentUser())`);
    queryString = queryString.join(' AND ');
    queryString += ' ORDER BY duedate ASC';

    const options = {
      jql: queryString,
      startAt: 0,
      maxResults: 200,
    };

    return ZJiraTask.findAll(options, true);
  }
}

export default new ZUser();
