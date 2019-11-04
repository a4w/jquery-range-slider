class Slider{
    // Attributes
    _ranges = new LinkedList();
    _container = null;
    _options = {};
    _callbacks = {};

    constructor(options){
        this._options = options;

        // Initialize DOM object
        this._container = options.container;
        this._container.addClass("slider-range-container");

        // Add event listeners (if double click creation/deletion is enabled)
        if("enableRangeCreation" in options){
            this._container.on("dblclick touchstart", this._doubleTapPropagate);
            this._container.on("dbclick", this._UI_dispatchEvent);
        }

        // Handle resizing the window and calculate slider size
        $(window).on("resize", this.UI_recalculateSize);
        this.UI_recalculateSize();

        if(typeof options.slide === "function"){
            this._callbacks.slide = slide;
        }

        // Add initial ranges
        if("ranges" in options){
            for(const range of options.ranges){
                this.addRange(range[0], range[1]);
            }
        }
    }


}