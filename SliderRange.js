class SliderRange{
    constructor(options){
        this._slider = options.slider;

        this.node = options.node;

        // Create handles
        this._handles = {};
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

        this._handles.start.setValue(options.start);
        this._handles.end.setValue(options.end);
        this._redrawHighlight();
    }

    getStart(){
        return this._handles.start.getValue();
    }

    getEnd(){
        return this._handles.end.getValue();
    }

    _createHandle(value){
        const handle = new RangeHandle({
            value: value,
            slider: this._slider,
            range: this
        });
        return handle;
    }

    _redrawHighlight(){
        // Draw highlight from start to end
        // highlight offset = left offset of start
        // highlight width = end.value - start.value -> to offset
        const startX = this._slider._valueToOffset(this._handles.start.getValue());
        const endX = this._slider._valueToOffset(this._handles.end.getValue());
        this._highlight.css({
            'left': startX,
            'width': endX - startX
        });
    }


} 
