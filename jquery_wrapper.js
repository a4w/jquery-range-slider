;(function ( $, window, undefined ) {
    const pluginName = "Slider";
    const defaults = {
        ranges: [],
        min: 0,
        max: 100,
        step: 1,
        overlappingRanges: false,
        minRange: 1,
        minGap: 0,
        minNoRanges: 0,
        maxNoRanges: 100,
        mergeRanges: true,
        create: () => {},
        remove: () => {},
        merge: () => {},
        slide: () => {}
    };
    $.fn[pluginName] = function(options = null, args = []){
        if (options === null) {
            // Return only one (anti pattern, TODO: change later)
            return $(this).data("plugin_" + pluginName);
        } else if(typeof options === "object"){
            // Initialize multiples
            const mergedOptions = $.extend({}, defaults, options);
            this.each(function(){
                mergedOptions.container = $(this);
                const obj = new Slider(mergedOptions);
                $(this).data("plugin_" + pluginName, obj);
            });
        }else if(typeof options === "string"){
            // function
            let returnArr = [];
            this.each(function(){
                returnArr.push($(this).data("plugin_" + pluginName)[options](...args));
            });
            return returnArr;
        }
    }
}(jQuery, window));