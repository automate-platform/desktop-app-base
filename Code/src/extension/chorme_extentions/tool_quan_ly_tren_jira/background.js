/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

chrome.runtime.onInstalled.addListener(function() {
    console.log('app installed.');
    chrome.storage.local.set({
        installed: true
    })
});