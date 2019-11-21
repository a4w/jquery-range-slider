;(function ( $, window, undefined ) {
    const pluginName = "Slider";
    const defaults = {
        
    };
    $.fn[pluginName] = function(options = null){
        if (options === null) {
            return $(this).data("plugin_" + pluginName);
        } else if(typeof options === "object"){
            // Initialize
            const mergedOptions = $.extend({}, defaults, options);
            mergedOptions.container = $(this);
            const obj = new Slider(mergedOptions);
            $(this).data("plugin_" + pluginName, obj);
        }
    }
}(jQuery, window));