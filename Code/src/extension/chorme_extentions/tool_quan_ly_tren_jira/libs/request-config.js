/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author TaiNV10@fsoft.com.vn
 */

 'use strict';

 import ZStore from './store.js';
 import ZRequest from './request.js';

 const CACHE_NAME = 'FGA.PDC';
 ZStore.set(CACHE_NAME, ZAPP_CONFIG || {});
 
   
 const JIRA_SERVER = location.pathname.match(/jira([0-9]+)?\//)[0];

 class ZRequestConfig {
   
   constructor() {
   }

   worklogs(data){
    // jira 3
    let reqData = {};
    let url = "";
    let content_type = 'application/json';
    switch (JIRA_SERVER) {
      case 'jira3/':
        reqData = {
          user: data.user.name,
          ansienddate: data.date.format('YYYY-MM-DD'),
          ansidate: data.date.format('YYYY-MM-DDThh:mm:ss'),
          datefield: data.date.format('YYYY-MM-DD'),
          time: data.effort,
          remainingEstimate: data.remain, // jira 3 convert to hours
          comment: data.comment,
          _TypeofWork_: data.tow.id
        };
        url = `rest/tempo-rest/1.0/worklogs/${data.issueKey}`;
        content_type = 'application/x-www-form-urlencoded';
        break;
    
      case 'jira9/':
        reqData = {
          issueKey: data.issueKey,
          period: false,
          time: ` ${data.date.format('hh:mm:ss')}`,
          remainingTime: data.remain * 3600,
          startDate: data.date.format('DD/MMM/YY'),
          endDate: data.date.format('DD/MMM/YY'),
          timeSpend: data.effort * 3600,
          typeOfWork: data.tow.id,
          username: data.user.name,
          description: data.comment
        };

        reqData = JSON.stringify(reqData);
        url = `rest/tempo/1.0/log-work/create-log-work`;
        break;
    }
    
    return new ZRequest({
      headers: {
        'Content-Type': content_type,
      },
    })
    .post(url, reqData);
   }
 }
 
 export default new ZRequestConfig();
 