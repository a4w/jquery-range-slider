class Slider{
    // Attributes
    _ranges = new LinkedList();
    _container = null;
    _options = {};
    _callbacks = {};
    _disabled = false;

    constructor(options){
        this._options = options;

        // Initialize DOM object
        this._container = options.container;
        this._container.addClass("slider-range-container");

        // Add event listeners (if double click creation/deletion is enabled)
        this._bindUIEvents();

        if(typeof options.slide === "function"){
            this._callbacks.slide = options.slide;
        }
        if(typeof options.create === "function"){
            this._callbacks.create = options.create;
        }
        if(typeof options.merge === "function"){
            this._callbacks.merge = options.merge;
        }
        if(typeof options.remove === "function"){
            this._callbacks.remove = options.remove;
        }

        // Add initial ranges
        for (const range of options.ranges) {
            this.addRange(range[0], range[1]);
        }

        // Handle resizing the window and calculate slider size
        $(window).on("resize", this.UI_recalculateSize);
        this.UI_recalculateSize();
    }

    _bindUIEvents(){
        this._container.on("touchstart click", this._UI_input_doubleTapDispatcher);
    }
    _unbindUIEvents(){
        this._container.unbind("touchstart click");
    }

    UI_recalculateSize = () => {
        this._options.width = this._container.width();
        const max = this._options.max;
        const min = this._options.min;
        const step = this._options.step;
        this._options.steps = {};
        this._options.steps.count = Math.floor((max - min) / step);
        this._options.steps.width = this._options.width / (this._options.steps.count * step);
        this._options.steps.value = step;
        this._recalculateRangesPosition();
    }

    _recalculateRangesPosition(){
        this._ranges.forEach((i, node) => {
            node.data._handles.start.setValue(node.data._handles.start.getValue());
            node.data._handles.end.setValue(node.data._handles.end.getValue());
        });
    }

    addRange(startValue, endValue){

        if(this._ranges.getSize() >= this._options.maxNoRanges){
            throw "Maximum number of ranges reached";
        }

        // Round value to be a multiple of step size, with min value as offset
        startValue = Math.floor(startValue/this._options.steps.value) * this._options.steps.value;
        endValue = Math.ceil(endValue/this._options.steps.value) * this._options.steps.value;

        if(startValue < this._options.min || endValue > this._options.max){
            throw "Range values selected are larger than allowed";
        }
        if(endValue - startValue < this._options.minRange){
            throw "Range cannot be smaller than " + this._options.minRange;
        }

        // Find first start value in current ranges bigger than startValue
        let nextNode = null;
        this._ranges.forEach((index, rangeNode) => {
            const range = rangeNode.data;
            if(range.getStart() > startValue){
                nextNode = rangeNode;
                return false; // break;
            }
        });

        // Sorry
        let prevNode = nextNode === null ? this._ranges.getSize() > 0 ? this._ranges.last() : null : nextNode.prev;

        const overlap = this._options.overlappingRanges; 
        if(!overlap && prevNode !== null && prevNode.data.getEnd() > startValue){
            throw "Overlapping ranges are not allowed";
        }
        if(!overlap && nextNode !== null && nextNode.data.getStart() < endValue){
            throw "Overlapping ranges are not allowed";
        }
        const minGap = this._options.minGap;
        if(nextNode !== null && nextNode.data.getStart() - endValue < minGap){
            throw "Range breaks the minimum gap";
        }
        if(prevNode !== null && startValue - prevNode.data.getEnd() < minGap){
            throw "Range breaks the minimum gap";
        }

        let n;
        if(nextNode === null){
            n = this._ranges.insert(0);
        }else{
            n = this._ranges.insertBefore(nextNode, 0);
        }
        n.data = this._createRangeObject(n, startValue, endValue);

        if(this._disabled){
            n.data.disable();
        }
        // Add to DOM
        this._container.append(n.data.dom);
        this._callbacks.create({
            slider: this._container,
            start: {
                element: n.data._handles.start.dom,
                value: n.data._handles.start.getValue()
            },
            end: {
                element: n.data._handles.end.dom,
                value: n.data._handles.end.getValue()
            }
        });
    }

    _valueToOffset(value){
        //TODO: Come up with a formula 
        return value * this._options.steps.width;
    }

    _offsetToValue(offset){
        return Math.floor(offset / this._options.steps.width);
    }

    static normalizeEvent(e){
        let ev = null;
        // FIXME: Find a better way of handling touch events
        if(typeof e.touches !== "undefined" && e.touches.length > 0){
            // Touch event
            ev = e.touches[0];
            ev.currentTarget = e.currentTarget;
            return ev;
        }
        return e;
    }

    _createRangeObject(node, startValue, endValue){
        const range = new SliderRange({
            start: startValue,
            end: endValue,
            slider: this,
            node: node
        });
        return range;
    }

    getRanges(){
        let output = [];
        this._ranges.forEach((i, node) => {
            const range = node.data;
            output.push([range.getStart(), range.getEnd()]);
        });
        return output;
    }

    _UI_input_doubleTapDispatcher = (e) => {
        if(!this._tmp_doubleTap){
            this._tmp_doubleTap = true;
            window.setTimeout(() => {this._tmp_doubleTap = false}, 300);
            return;
        }
        e.preventDefault();
        this._tmp_doubleTap = false;
        this._UI_input_dispatchDoubleClickEvent(e);
    }

    _UI_input_dispatchDoubleClickEvent = (e) => {
        e.preventDefault();
        e = Slider.normalizeEvent(e);
        // Make sure we are "inside" the body and outside any ranges, count on e.target
        const target = $(e.target);
        const X = e.pageX - target.offset().left;
        const Y = e.pageY - target.offset().top;
        // check to dispatch to appropiate function
        if(Y <= parseInt(target.css("border-top-width")) || Y >= target.height() - parseInt(target.css("border-bottom-width"))){
            // Mis-click!
            return;
        }

        if(target.hasClass("slider-range-container")){
            this._UI_createRange(X);
        }else if(target.hasClass("slider-range-highlight")){
            this._UI_removeRange(target);
        }

    }

    _UI_createRange(position){
        const value = this._offsetToValue(position);
        this.addRange(value, value + Math.max(this._options.minRange, this._options.steps.value));
    }

    _UI_removeRange(rangeHighlight){
        let range = null;
        this._ranges.forEach((i, node) => {
            if(node.data._highlight[0] === rangeHighlight[0]){
                range = node.data;
                return false; // break;
            }
        });
        if(range !== null){
            this.deleteRange(range);
        }
    }

    deleteRange(range){
        if(this._ranges.getSize() <= this._options.minNoRanges){
            throw "Minimum number of ranges reached";
        }
        range.dispose();
        this._ranges.remove(range.node);
        this._callbacks.remove(this._container);
    }

    disable(){
        this._ranges.forEach((index, node) => {
            const range = node.data;
            range.disable();
        });
        this._container.addClass("slider-range-container-disabled");
        this._unbindUIEvents();
        this._disabled = true;
    }
    enable(){
        this._ranges.forEach((index, node) => {
            const range = node.data;
            range.enable();
        });
        this._container.removeClass("slider-range-container-disabled");
        this._unbindUIEvents();
        this._bindUIEvents();
        this._disabled = false;
    }

}