/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author LongNT11@fsoft.com.vn
 */

'use strict';

import {
  PRODUCT_VALID_REGEXP,
  BUG_PRODUCT_VALID_REGEXP,
} from '../constants.js';

export default {
  isProductValid(product) {
    return product && product.match(PRODUCT_VALID_REGEXP);
  },

  isBugProductValid(product) {
    return product && product.match(BUG_PRODUCT_VALID_REGEXP);
  },

  isStageValid(product) {
    if (!product) {
      return false;
    }

    return product.match(PRODUCT_VALID_REGEXP);
  },

  textLimit(str, limit) {
    if (!str) {
      return '';
    }

    if (str.length <= limit) {
      return str;
    }

    return str.substr(0, limit) + '...';
  },

  numberFormat(number, lengthDecimal, sectionDelimiter, decimalDelimiter) {
    const regex =
      '\\d(?=(\\d{' + 3 + '})+' + (lengthDecimal > 0 ? '\\D' : '$') + ')';
    let num = number ? number.toFixed(Math.max(0, ~~lengthDecimal)) : 0;
    let numRep = decimalDelimiter ? num.replace('.', decimalDelimiter) : num;
    return numRep ? numRep.replace(new RegExp(regex, 'g'), '$&' + (sectionDelimiter || ',')) : 0;
  },

  exportExcel(table, options) {
    options = options || {};

    window.TableToExcel.convert(table, {
      name: (options.name || 'Report') + '.xlsx',
      sheet: {
        name: 'Worksheet',
      },
    });
  },

  translate(str, options) {
    options = options || {};

    _.each(options, function (val, key) {
      var _reg = new RegExp(`\{${key}\}`, 'g');
      str = str.replace(_reg, val);
    });

    return str;
  },

  parseHTML(containerElement) {
    let CSS_ATTRIBUTE = 'data-style-cached',
      parseCSSElement = function (ele) {
        if (ele.nodeType != 1) {
          return '';
        }

        let validCSS = [
            'background',
            'background-color',
            'border-bottom-color',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-bottom-style',
            'border-bottom-width',
            'border-collapse',
            'border-image-outset',
            'border-image-repeat',
            'border-image-slice',
            'border-image-source',
            'border-image-width',
            'border-left-color',
            'border-left-style',
            'border-left-width',
            'border-right-color',
            'border-right-style',
            'border-right-width',
            'border-top-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-top-style',
            'border-top-width',
            'color',
            'font-size',
            'font-family',
            'font-style',
            'font-weight',
            'max-height',
            'line-height',
            'overflow-x',
            'overflow-y',
            'padding-left',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'table-layout',
            'text-align',
            'text-decoration',
            'text-transform',
            'vertical-align',
            'white-space',
          ],
          cssCom = window.getComputedStyle(ele, null);

        if (cssCom.length === 0) {
          return '';
        }

        if (
          [/*'TABLE', */ 'TR', 'TD', 'THEAD', 'TBODY', 'TFOOT'].indexOf(
            ele.nodeName
          ) < 0
        ) {
          validCSS = validCSS.concat(['width']);
        }

        let css = [],
          i = 0;

        for (i = 0; i < cssCom.length; i++) {
          let item = cssCom.item(i);
          if (validCSS.indexOf(item) != -1) {
            css.push(item + ':' + cssCom.getPropertyValue(item));
          }
        }

        return css.join(';');
      },
      addCacheStyle = function (ele) {
        $(ele).attr(CSS_ATTRIBUTE, parseCSSElement(ele));

        if (ele.childNodes && 'object' === typeof ele.childNodes) {
          $.each(ele.childNodes, function (i, e) {
            addCacheStyle(e);
          });
        }
      },
      removeStyle = function (ele) {
        $(ele).removeAttr(CSS_ATTRIBUTE);
        if (ele.childNodes && 'object' === typeof ele.childNodes) {
          $.each(ele.childNodes, function (i, e) {
            removeStyle(e);
          });
        }
      },
      addToStyle = function (ele) {
        let style = $(ele).attr(CSS_ATTRIBUTE);
        if (style) {
          $(ele).attr('style', style);
          $(ele).removeAttr(CSS_ATTRIBUTE);
        }

        if (ele.childNodes && 'object' === typeof ele.childNodes) {
          $.each(ele.childNodes, function (i, e) {
            addToStyle(e);
          });
        }
      },
      ele = null;

    if (!containerElement) {
      return '';
    }

    // cached style
    addCacheStyle(containerElement);
    // clone element
    ele = containerElement.cloneNode(true);
    // add to style
    addToStyle(ele);
    // remove cached style
    removeStyle(containerElement);

    if (!ele.outerHTML) {
      return '';
    }

    $(ele)
      .find('input')
      .each(function () {
        let text = $(this).val();
        $(`<span>${text}</span>`).insertBefore(this);
      });
    $(ele)
      .find('textarea')
      .each(function () {
        let text = $(this).val().replace(/\n/g, '<br/>');
        $(`<span>${text}</span>`).insertBefore(this);
      });
    $(ele)
      .find('[contenteditable]')
      .each(function () {
        $(this).html($(this).text().replace(/\n/g, '<br/>'));
      });
    $(ele).find('[ignore-ele], .select2-container').remove();

    let outerHTML = ele.outerHTML;

    // remove attributes
    outerHTML = outerHTML.replace(/\s+class=\"(.*?)\"/g, '');
    outerHTML = outerHTML.replace(/\s+contenteditable=\"(.*?)\"/g, '');
    outerHTML = outerHTML.replace(/\s+id=\"(.*?)\"/g, '');

    // return html
    return outerHTML;
  },

  dateConvert(date) {
    const d = date.split('/');
    const monthMaps = {
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Aug',
      '09': 'Sep',
      10: 'Oct',
      11: 'Nov',
      12: 'Dec',
    };
    d[0] = monthMaps[d[0]];

    return [d[1], d[0], d[2]].join('/');
  },
};
