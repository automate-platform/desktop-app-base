/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import ZStore from './store.js';
import ZLoading from './loading.js';
import ZRequest from './request.js';
import ZProject from './project.js';
import ZUser from './user.js';

export default {
  initProjects(projects) {
    if (!projects) {
      return;
    }

    var projs = [];
    _.each(projects, (prj) => {
      projs.push(new ZProject(prj));
    });

    return projs;
  },

  findAll() {
    const thiz = this;
    return new Promise(async (resolve) => {
      const projectURI = 'rest/api/2/project';
      const storeName = 'PROJECT';
      let currentCached;

      ZLoading.show();
      var user = await ZUser.info();

      if (!user) {
        resolve([]);
        return;
      }

      var projectsCached = ZStore.get(storeName);

      if (projectsCached) {
        currentCached = projectsCached[user.key] || null;

        if (currentCached) {
          if (currentCached.expired > new Date().getTime()) {
            resolve(thiz.initProjects(currentCached.items));
            ZLoading.hide();
            return;
          } else {
            delete projectsCached[user.key];
          }
        }
      } else {
        projectsCached = {};
      }

      new ZRequest()
        .get(projectURI)
        .then(function (projects) {
          if (!projects) {
            resolve([]);
            return;
          }

          var projectDeferred = [],
            onGoingProjects = [];

          projects.forEach(() => {
            projectDeferred.push($.Deferred());
          });

          Promise.all(projectDeferred).then(function () {
            var respHTMLs = arguments[0];
            _.each(respHTMLs, function (respHtml, index) {
              var doc = new DOMParser().parseFromString(respHtml, 'text/html');
              var isAddProject = true;

              $(doc)
                .find('div#data_project_info > table tr')
                .each((i, tr) => {
                  var trHtml = $(tr).html();
                  if (!trHtml.match(/(project\s+status|industry)/gi)) {
                    return;
                  }

                  if (
                    trHtml.match(/(industry)/gi) &&
                    trHtml.match(/(n\/a|will\s+be\s+set\s+from\s+quote)/gi)
                  ) {
                    isAddProject = false;
                    return;
                  }

                  if (
                    isAddProject &&
                    trHtml.match(/(project\s+status)/gi) &&
                    trHtml.match(/(on\-going|tentative)/gi)
                  ) {
                    onGoingProjects.push({
                      id: projects[index].id,
                      key: projects[index].key,
                      name: projects[index].name,
                    });
                  }
                });
            });

            projectsCached[user.key] = {
              items: onGoingProjects,
              expired: new Date().setDate(new Date().getDate() + 1),
            };

            ZStore.set(storeName, projectsCached);

            resolve(thiz.initProjects(onGoingProjects));
            ZLoading.hide();
          });

          projects.forEach((project, index) => {
            thiz.findByKey(project.key).then(function (respHtml) {
              projectDeferred[index].resolve(respHtml);
            });
          });
        })
        .catch(() => {
          resolve([]);
        });
    });
  },

  findById(projectId) {
    return new Promise((resolve) => {
      const storeName = 'zproject-' + projectId;
      const projectURI = 'rest/api/2/project';
      const projectCached = ZStore.get(storeName);

      if (projectCached && projectCached.expired > new Date().getTime()) {
        resolve(new ZProject(projectCached));
        return;
      } else {
        ZStore.remove(storeName);
      }

      new ZRequest()
        .get(projectURI + '/' + projectId)
        .then((data) => {
          data.expired = new Date().setDate(new Date().getDate() + 1);
          ZStore.set(storeName, data);

          resolve(new win.ZProject(data));
        })
        .catch(() => {
          resolve(null);
        });
    });
  },

  findByKey(projectKey) {
    const options = {
      dataType: null,
    };
    return new ZRequest(options).get('fsoft.jspa', {
      projectKey: projectKey,
    });
  },
};
