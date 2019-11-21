;(function ( $, window, undefined ) {
    const pluginName = "Slider";
    const defaults = {
        
    };
    $.fn[pluginName] = function(options = null){
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
        }
    }
}(jQuery, window));