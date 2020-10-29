(function () {
    // 版本号
    var VERSION = '0.0.1';

    //#region 获取全局变量
    // node.js
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
    // web
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
    //#endregion
    var root = freeGlobal || freeSelf || Function('return this')();
        /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;


    // Export lodash.
    var _ = runInContext();

    // AMD
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        root._ = _;
        define(function() {
        return _;
        });
    }
    // 
    else if (freeModule) {
        // Export for Node.js.
        (freeModule.exports = _)._ = _;
        // CommonJS
        freeExports._ = _;
    }
    // 直接绑定nodejs或浏览器的全局变量
    else {
        root._ = _;
    }
}.call(this))  
