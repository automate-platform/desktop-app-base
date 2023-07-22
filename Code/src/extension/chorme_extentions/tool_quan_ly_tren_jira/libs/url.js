/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

export default {
  get(path = null) {
    const protocol = location.protocol;
    const host = location.host;
    const pathname = location.pathname.match(/jira([0-9]+)?\//)[0];

    return protocol + '//' + host + '/' + pathname + (path || '');
  },
};
