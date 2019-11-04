class SliderRange{
    constructor(options){
        this._slider = options.slider;

        // Create handles
        this._handles.start = this._createHandle(options.start);
        this._handles.end = this._createHandle(options.end);
        
        // Create handle highlight
        this._highlight = $("<div />");
        this._highlight.addClass("slider-range-highlight");

        // Container dom
        this.dom = $("<div />");
        this.dom.append(this._handles.start.dom);
        this.dom.append(this._handles.end.dom);
        this.dom.append(this._highlight);
    }

    _createHandle(value){
        const handle = new RangeHandle({
            offset: this._slider._valueToOffset(value),
            slider: this._slider,
            range: this
        });
        return handle;
    }

} 
