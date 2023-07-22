/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

const PRODUCTIVITY_TARGET = ZAPP_CONFIG.PRODUCTIVITY_TARGET;
const SCOPE_TARGET = ZAPP_CONFIG.SCOPE_TARGET;
const PRODUCTS = ZAPP_CONFIG.PRODUCTS;
import ZRequest from './request.js';
import ZUtils from './utils.js';

export default class ZProject {
  constructor(project) {
    this._data = project;
  }

  id() {
    return this._data.id;
  }

  key() {
    return this._data.key;
  }

  name() {
    return this._data.name;
  }

  KPIMetrics() {
    return new Promise((resolve) => {
      new ZRequest({
        dataType: null,
        contentType: null,
      })
        .get('projectKPIReport.jspa', {
          projectKey: this.key(),
        })
        .then(function (respHtml) {
          const doc = new DOMParser().parseFromString(respHtml, 'text/html'),
            data = [];

          if (!doc) {
            return resolve(data);
          }

          $(doc)
            .find('#data_kpi table.aui tbody tr')
            .each(function () {
              const name = $(this).find('th:first-child').text().trim();
              const metrics = [
                'Defect Rate',
                'Leakage',
                'Effort Efficiency',
                'Effort Efficiency (up to end)',
                'Correction Cost',
                'Timeliness',
                'Project Point',
                'PCV Rate',
                'CSS',
                'Timeliness First Commited',
              ];

              const reg = new RegExp(
                `(${metrics.map((s) => s.trim().toLowerCase()).join('|')})`,
                'gi'
              );

              if (!name.trim().match(reg)) {
                return;
              }
              // if (name.match(/(([a-zA-Z0-9]+)\.([a-zA-Z0-9]+))/)) {
              //   return;
              // }

              const td = $(this).find('td:eq(3)');
              data.push({
                style: td.attr('style'),
                value: td.text().trim(),
              });
            });

          resolve(data);
        });
    });
  }

  KPIConfig() {
    return new Promise((resolve) => {
      const thiz = this;
      const STAGE_MATCHES = {
        SRS: 'SRS',
        BD: 'BASIC_DESIGN',
        DD: 'DETAIL_DESIGN',
        COD: 'CODING',
        CUT: 'UT_CREATE',
        EUT: 'UT_EXECUTE',
        CIT: 'IT_CREATE',
        EIT: 'IT_EXECUTE',
        CST: 'ST_CREATE',
        EST: 'ST_EXECUTE',
      };

      if (this._KPIConfig) {
        return resolve(this._KPIConfig);
      }

      new ZRequest({
        dataType: null,
        contentType: null,
      })
        .get('projectKPIReport.jspa', {
          projectKey: this.key(),
        })
        .then(function (respHtml) {
          var doc = new DOMParser().parseFromString(respHtml, 'text/html'),
            data = {};

          if (!doc) {
            return resolve(data);
          }
          $(doc)
            .find('#data_kpi table.aui tbody tr')
            .each(function () {
              const name = $(this)
                .find('th:first-child')
                .text()
                .trim()
                .match(/(.*)\.(SRS|BD|DD|COD|CUT|EUT|CIT|EIT|CST|EST)/);

              if (!name) {
                return;
              }

              const lsl = $(this).find('td:eq(0)');
              const target = $(this).find('td:eq(1)');
              const usl = $(this).find('td:eq(2)');

              if (!data[name[1]]) {
                data[name[1]] = {};
              }

              if (!STAGE_MATCHES[name[2]]) {
                return;
              }

              if (!data[name[1]][STAGE_MATCHES[name[2]]]) {
                data[name[1]][STAGE_MATCHES[name[2]]] = {};
              }

              data[name[1]][STAGE_MATCHES[name[2]]] = {
                lsl: Number(lsl.text().trim()),
                target: Number(target.text().trim()),
                usl: Number(usl.text().trim()),
              };
            });

          if (Object.values(data).length === 0) {
            return resolve(null);
          }

          thiz._KPIConfig = data;
          resolve(data);
        });
    });
  }

  productivityTarget() {
    return new Promise((resolve) => {
      const url = `rest/productivity/1.0/fi20-productivity-project/list-data/${this.key()}?_${new Date().getTime()}`;

      new ZRequest()
        .get(url)
        .then(function (resp) {
          var data = [];

          resp.forEach(function (s) {
            if (s.status !== 'approved') {
              return;
            }

            data.push({
              LSL: s.LSL ? Number(s.LSL) : PRODUCTIVITY_TARGET[1] * 0.9,
              USL: s.USL ? Number(s.USL) : PRODUCTIVITY_TARGET[1] * 1.1,
              target: s.targetProductivity
                ? Number(s.targetProductivity)
                : PRODUCTIVITY_TARGET[1],
              unit: s.unit,
              default: !s.targetProductivity,
            });
          });

          if (data.length > 0) {
            return resolve(data[0]);
          }

          resolve(null);
        })
        .catch(function () {
          resolve(null);
        });
    });
  }

  scopeTarget() {
    return new Promise((resolve) => {
      const SCOPES = [
        'SRS',
        'CODING',
        'DESIGN',
        'UTC',
        'UTE',
        'ITC',
        'ITE',
        'STC',
        'STE',
      ];
      const url = `rest/productivity/1.0/fi20-productivity-scope-target/list-data/${this.key()}?_${new Date().getTime()}`;

      new ZRequest()
        .get(url)
        .then(function (resp) {
          let data = [];
          resp.forEach(function (sc) {
            // if (sc.status !== 'approved') {
            //   return;
            // }

            const reg = new RegExp(`^(${SCOPES.join('|')})`, 'gi');

            if (!sc.scope.toUpperCase().match(reg)) {
              return;
            }

            const scopeName = sc.scope.toUpperCase().match(reg)[0];

            data.push({
              LSL: sc.LSL ? Number(sc.LSL) : SCOPE_TARGET[scopeName][1] * 0.9,
              USL: sc.USL ? Number(sc.USL) : SCOPE_TARGET[scopeName][1] * 1.1,
              target: sc.targetProductivity
                ? Number(sc.targetProductivity)
                : SCOPE_TARGET[scopeName][1],
              unit: sc.unit,
              scope: scopeName,
              default: !sc.targetProductivity,
            });
          });

          if (data.length > 0) {
            return resolve(data);
          }

          resolve(null);
        })
        .catch(function () {
          resolve(null);
        });
    });
  }

  worklogs(startDate = null, endDate = null) {
    const thiz = this;
    return new Promise((resolve) => {
      let worklogs = [];

      function searchWorklog(page) {
        const queryParams = {
          components: '',
          endDate: '',
          filConflict: 'All',
          filStatus: 'Approved', // 'Approved,Pending,Reopened'
          pid: thiz.id(),
          pkey: thiz.key(),
          products: PRODUCTS,
          startDate: '',
          typeOfWork: '',
          username: '',
        };

        if (startDate) {
          queryParams.startDate = ZUtils.dateConvert(startDate);
        }

        if (endDate) {
          queryParams.endDate = ZUtils.dateConvert(endDate);
        }

        const url = `rest/hunger/1.0/project-worklogs-report/get-all?orderby=&desc=false&page=${page}`;
        new ZRequest().post(url, JSON.stringify(queryParams)).then((resp) => {
          if (!resp || !resp.rows || resp.rows.length === 0) {
            return resolve(worklogs);
          }

          _.each(resp.rows, function (wl) {
            worklogs.push(wl);
          });

          if (resp.total > page) {
            setTimeout(() => {
              searchWorklog(page + 1);
            });
          } else {
            resolve(worklogs);
          }
        });
      }

      setTimeout(() => {
        searchWorklog(1);
      });
    });
  }
}
