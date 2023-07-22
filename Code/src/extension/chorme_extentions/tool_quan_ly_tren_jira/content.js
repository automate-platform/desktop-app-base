/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

// insert css
['styles/css/style.css'].forEach((file) => {
  Helper.insertCss(file);
});

// insert config
Helper.insertConfig();

// insert app.js
Helper.insertJs('app.js', true);
// insert TableToExcel.js
Helper.insertJs('oss/tableToExcel.js');
Helper.insertJs('oss/jquery.validate.min.js');