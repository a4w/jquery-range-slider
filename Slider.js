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
        this._container.on("touchstart", this._UI_input_doubleTapDispatcher);
        this._container.on("dblclick", this._UI_input_dispatchDoubleClickEvent);

        if(typeof options.slide === "function"){
            this._callbacks.slide = options.slide;
        }

        // Add initial ranges
        for (const range of options.ranges) {
            this.addRange(range[0], range[1]);
        }

        // Handle resizing the window and calculate slider size
        $(window).on("resize", this.UI_recalculateSize);
        this.UI_recalculateSize();
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

        // Add to DOM
        this._container.append(n.data.dom);
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

    _UI_input_doubleTapDispatcher = (e) => {}
    _UI_input_dispatchDoubleClickEvent = (e) => {
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
        let bye = null;
        this._ranges.forEach((i, node) => {
            console.log(node.data._highlight, rangeHighlight);
            if(node.data._highlight[0] === rangeHighlight[0]){
                bye = node;
                console.log("Found, ", node);
                return false; // break;
            }
        });
        if(bye !== null){
            this._ranges.remove(bye);
            bye.data.dispose();
        }
    }
}