(function () {
    // 版本号
    var VERSION = '0.0.2';

    //#region 正则
    /** 空格 */
    var reTrim = /^\s+|\s+$/g
    var reTrimStart = /^\s+/
    var reTrimEnd = /\s+$/
    /** 车牌号(非新能源) */
    var carNumber = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/
    /** 12小时制时间 */
    var time12h = /^(?:1[0-2]|0?[1-9]):[0-5]\d:[0-5]\d$/
    /** 24小时制时间 */
    var time24h = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
    //#endregion
    var objectType = {
        'function': true,
        'object': true
    }

    // !exports.nodeType 防止出现 <div id="exports"></div>
    var freeExports = objectType[typeof exports] && exports && !exports.nodeType && exports
    // !module.nodeType 防止出现 <div id="module"></div>
    var freeModule = objectType[typeof module] && module && !module.nodeType && module
    // node环境才有global
    const freeGlobal = freeExports && freeModule && objectType[typeof global] && global && global.Object === Object && global

    const freeSelf = objectType[typeof self] && self && self.Object === Object && self

    const freeWindow = objectType[typeof window] && window && window.object && window

    var moduleExports = freeModule && freeModule.exports === freeExports && freeExports

    var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

    function runInContext () {
        /**
         * @description 判断是否是dom对象
         * @param { any } value 待判定的对象
         */
        function isDom (value) {
            return typeof HTMLElement === 'function' 
                ? value instanceof HTMLElement 
                : (value && typeof value === 'object' && value.nodeType === 1 && typeof value.nodeName === 'string')
        }
        /**
         * @description 时间戳转日期
         * @param { number } ms 时间戳
         * @param { string } formater 日期格式
         */
        function timestampToDate (ms, formater) {
            var zerofill = function (number) {
                return number < 10 ? `0${number}` : number
            }
            if (!ms) return ''
            formater = formater || 'YY-MM-DD hh:mm:ss'
            const time = new Date(ms)
            const year = time.getFullYear()
            const month = zerofill(time.getMonth() + 1)
            const day = zerofill(time.getDate())
            const hour = zerofill(time.getHours())
            const minute = zerofill(time.getMinutes())
            const second = zerofill(time.getSeconds())
            return formater.replace('YY', year)
              .replace('MM', month)
              .replace('DD', day)
              .replace('hh', hour)
              .replace('mm', minute)
              .replace('ss', second)
        }
        /**
         * @description 数组对象进行分组
         * @param { any[] } arr 待分组
         * @param { function } func 返回分组名称的函数
         * // 根据id和name对list进行发呢组
         * var newArr = groupBy(list, (item) => item.id + item.name)
         */
        function groupBy(arr, func) {
            var groups = {};
            arr.forEach((item) => {
                var groupName = JSON.stringify(func(item));
                groups[groupName] = groups[groupName] || [];
                groups[groupName].push(item);
            });
            return Object.keys(groups).map(function (groupName) {
                return groups[groupName];
            })
        }
        /**
         * @description 获取
         * @param { string } key url上query对应的key
         */
        function getUrlQueryvalue (key) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        }
        /**
         * @description 单词或句子首字母大写
         * @param { string } str 代转字符
         * toUpperCaseFirstWord('hello world'); //Hello World
         */
        function toUpperCaseFirstWord (str) {
            return str.replace(/\b[a-z]/g, char => char.toUpperCase())
        }
        /**
         * @description 单词破折号转驼峰
         * @param { string } str 破折号单词
         * dashTocamelCase('same-world'); // sameWorld
         */
        function dashTocamelCase (str) {
            return str.replace(/-(\w)/g, (char1, char2) => char2.toUpperCase())
        }
        /**
         * @description 根据key去重
         * @param { any[] } arr 待去重数组
         * @param { string } key 去重条件
         */
        function distinctByKey (arr, key) {
            let res = [], obj = {}
            for (let i = 0, item; (item = arr[i])!= null; i++) {
                if (!obj[item[key]]) {
                    res.push(item)
                    obj[item[key]] = true
                }
            }
            return res
        }
        /**
         * @description 深度Object.assign
         * @param { object } target 目标对象
         * @param { object } obj 数据对象
         */
        function deepAssign(target, obj){
            if (!target) target = Array.isArray(obj) ? [] : {};
            if (obj && objectType[typeof obj]) {
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] && objectType[typeof obj]) {
                            target[key] = deepAssign(target[key],obj[key]);
                        } else {
                            target[key] = obj[key];
                        }
                    }
                }
            }
            return target;
        }
        /**
         * @description 展平树形数据
         * @default { object } 树形数据
         * @default { function } 回调
         */
        function flatTree(tree, callback) {
            return tree.reduce((acc, node) => {
              if (callback(node)) {
                acc.push(node);
              }
              if (node.children) {
                const children = flatTree(node.children, callback);
                acc.push(...children);
              }
              return acc;
            }, []);
        }

        /**
         * @description 判断dom是否在可视区域内
         * @param { HTMLElement } el dom节点
         * @returns 
         */
        function isElementInViewport (el) {
            var rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (win.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (win.innerWidth || document.documentElement.clientWidth)
            );
        }
        /**
         * @description 获取dom在当前页面中的位置(不是在浏览器可视窗口的位置)
         * @param { HTMLElement } el dom节点
         */
        function getClientRect (el) {
            var rect = el.getBoundingClientRect();
            var documentElement = document ? document.documentElement : {}
            var top = rect.top + documentElement.scrollTop
            var left = rect.left + documentElement.scrollLeft
            return {
                x: left,
                left,
                y: top,
                top,
            }
        }

        /**
         * @description 当持续触发事件时，一定时间段内没有再触发事件，事件处理函数才会执行一次，如果设定的时间到来之前，又一次触发了事件，就重新开始延时
         * @param {*} fn 回调
         * @param {*} wait 规定时间
         * @param {*} immediate 是否立即执行，停止触发 n 秒后，才可以重新触发执行。反过来
         * @returns 
         */
        function debounce(fn, wait, immediate) {
            let timer;
            return function () {
                if (timer) clearTimeout(timer);
                if (immediate) {
                    // 如果已经执行过，不再执行
                    var callNow = !timer;
                    timer = setTimeout(() => {
                        timer = null;
                    }, wait)
                    if (callNow) {
                        fn.apply(this, arguments)
                    }
                } else {
                    timer = setTimeout(() => {
                        fn.apply(this, arguments)
                    }, wait);
                }
            }
        }
        /**
         * @description 表示dom文档结构已经加载完成（不包含图片等非文字媒体文件）
         * @param {*} fn 回调
         */
        function whenReady (fn) {
            var queue = [],     // 回调队列
                isReady = false // dom是否加载完成
            if (isReady) {
                fn.call(window)
            } else {
                queue.push(fn)
            }
            bindReady()
            // 绑定ready
            function bindReady () {
                // 在这使用 readyState === "interactive", 会引起下面问题
                // IE9在页面尚未完全生成，有时也会触发DOMContentLoaded,由ChrisS在这里发现 https://bugs.jquery.com/ticket/12282#comment:15
                // 所以干脆在 readyState === "complete" 后用setTimeout执行
                if (document.readyState === "complete") {
                    setTimeout(ready)
                } else if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", completed)
                    window.addEventListener( "load", completed ); // 兜底方案
                } else { // 如果IE事件模型被使用 
                    document.attachEvent( "onreadystatechange", completed );
                    window.attachEvent( "onload", completed );  // 兜底方案
                    var top = false;
                    try {
                        top = window.frameElement == null && document.documentElement;
                    } catch ( e ) {}
                    if ( top && top.doScroll ) {
                        ( function doScrollCheck() {
                            if (!isReady) {
                                try {
                                    top.doScroll( "left" ); // dom没加载完成.doScroll报错
                                } catch ( e ) {
                                    return setTimeout( doScrollCheck, 50 );
                                }
                                detach()
                                ready();
                            }
                        } )();
                    }
                }
            }
            function ready () {
                // 确保body存在
                if (!document.body) {
                    return setTimeout(ready)
                }
                isReady = true
                // 执行绑定的事件
                for (let index = 0; index < queue.length; index++) {
                    queue[index].call(window)
                }
            }
            // ready触发执行完回调后,解绑
            function detach () {
                if ( document.addEventListener ) {
                    document.removeEventListener( "DOMContentLoaded", completed, false );
                    window.removeEventListener( "load", completed, false );
        
                } else {
                    document.detachEvent( "onreadystatechange", completed );
                    window.detachEvent( "onload", completed );
                }
            }
            function completed (event) {
                if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
                    detach();
                    ready();
                }
            }
        }

        function rich () {}
        rich.isDom = isDom
        rich.timestampToDate = timestampToDate
        rich.groupBy = groupBy
        rich.dashTocamelCase = dashTocamelCase
        rich.toUpperCaseFirstWord = toUpperCaseFirstWord
        rich.getUrlQueryvalue = getUrlQueryvalue
        rich.distinctByKey = distinctByKey
        rich.deepAssign = deepAssign
        rich.flatTree = flatTree
        rich.isElementInViewport = isElementInViewport
        rich.getClientRect = getClientRect
        rich.debounce = debounce
        rich.whenReady = whenReady
        return rich
    }
    var $$ = runInContext();

    //#region es6会通过babel转换成全局变量导出或commonjs导出等
    // AMD
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        root.$$ = $$
        define(function() {
        return $$;
        });
    } else if (freeExports && freeModule) {
        // Export for Node.js or RingoJS.
        if (moduleExports) {
            (freeModule.exports = $$).$$ = $$
        } else { // Export for Rhino with CommonJS support.
            freeExports.$$ = $$
        }
    } else { // Export for a browser or Rhino.
        root.$$ = $$;
    }
    //#endregion
}.call(this))  
