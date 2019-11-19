class RangeHandle{
    constructor(options){
        this._slider = options.slider;
        this._range = options.range;

        // Create DOM
        this.dom = $("<div />");
        this.dom.addClass("slider-range-handle");
        this.dom.addClass(this._slider._options.handleClass);

        this._value = options.value;

        // Register events
        this.dom.on("mousedown touchstart", this._dragStart);
    }

    setValue(value){
        /*
            Max =
                if (start) endHandle - minRange
                else 
                    if(overlap)
                    else nextRangeStart
            Min = 
                if(end) startHandle + minRange
                else
                    if(overlap) min
                    else prevRangeEnd
        */
       const startHandle = this._range._handles.start;
       const endHandle = this._range._handles.end;
       const overlap = this._slider._options.overlappingRanges;
       const minRange = parseInt(this._slider._options.minRange);
       const minGap = parseInt(this._slider._options.minGap);
       const max = this._slider._options.max;
       const min = this._slider._options.min;
       let hi, lw;
       if(this === startHandle){
           hi = endHandle.getValue() - minRange;
           if(overlap){
               lw = min;
           }else{
               lw = this._range.node.prev === null ? min : this._range.node.prev.data.getEnd() + minGap; 
           }
       }else{
           lw = startHandle.getValue() + minRange;
           if(overlap)
               hi = max;
           else
               hi = this._range.node.next === null ? max : this._range.node.next.data.getStart() - minGap;
       }
       if(value < lw || value > hi) return;
        this._value = value;
        this._offset = this._slider._valueToOffset(value);
        this.dom.css({"left": this._offset});
        this._range._redrawHighlight();
    }

    getValue(){
        return this._value;
    }

    _dragStart = (e) => {
        e.preventDefault();
        e = Slider.normalizeEvent(e);
        // Start X position
        this.dragInfo = {};
        this.dragInfo.startX = e.pageX;
        this.dragInfo.startValue = this._value;
        this.dragInfo.stepWidth = this._slider._options.steps.width;
        // Add next events
        $(document).on("mousemove touchmove", this._dragMove);
        $(document).on("mouseup touchend", this._dragEnd);
    }

    _dragMove = (e) => {
        e.preventDefault();
        e = Slider.normalizeEvent(e);
        const dx = e.pageX - this.dragInfo.startX;
        const steps = Math.floor(dx / this.dragInfo.stepWidth);
        this.setValue(this.dragInfo.startValue + steps);
    }

    _dragEnd = (e) => {
        e.preventDefault();
        this.dragInfo = null;
        $(document).unbind("mousemove touchmove mouseup touchend");
    }
} 
