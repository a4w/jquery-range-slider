class Slider{
    // Attributes
    _ranges = new LinkedList();
    _container = null;
    _options = {};
    _callbacks = {};
    _UI_input_fn = {};

    constructor(options){
        this._options = options;

        // Initialize DOM object
        this._container = options.container;
        this._container.addClass("slider-range-container");

        // Add event listeners (if double click creation/deletion is enabled)
        this._container.on("touchstart", this._UI_input_fn.doubleTapDispatcher);
        this._container.on("dbclick", this._UI_input_fn.dispatchDoubleClickEvent);

        // Handle resizing the window and calculate slider size
        $(window).on("resize", this.UI_recalculateSize);
        this.recalculateSize();

        if(typeof options.slide === "function"){
            this._callbacks.slide = slide;
        }

        // Add initial ranges
        for (const range of options.ranges) {
            this.addRange(range[0], range[1]);
        }
    }

    recalculateSize(){
        this._options.width = this._container.clientWidth;
        const max = this._options.max;
        const min = this._options.min;
        const step = this._options.step;
        this._options.steps.count = Math.floor((max - min) / step);
        this._options.steps.width = this._options.width / this._options.steps.count;
        this._recalculateRangesPosition();
    }

    _recalculateRangesPosition(){
        // TODO: Recalculate offsets according to slider size
    }

    addRange(startValue, endValue){
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
        let prevNode = nextNode === null ? this._ranges.size() > 0 ? this._ranges.last() : null : nextNode.prev;

        const overlap = this._options.overlappingRanges; 
        if(!overlap && prevNode !== null && prevNode.data.getEnd() > startValue){
            throw "Overlapping ranges are not allowed";
        }
        if(!overlap && nextNode !== null && nextNode.data.getStart() < endValue){
            throw "Overlapping ranges are not allowed";
        }

        const range = this._createRangeObject(startValue, endValue);
        if(nextNode === null){
            this._ranges.insert(range);
        }else{
            this._ranges.insertBefore(nextNode, range);
        }
    }

    _createRangeObject(startValue, endValue){
        const range = new SliderRange({
            start: startValue,
            end: endValue,
            slider: this
        });
        return range;
    }




}