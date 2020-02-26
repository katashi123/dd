var newFilterName = "rgbsplit2";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.RGBSplitFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [1,-1,-1,0,0,1];
 
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
        filter.red   = [param[0], param[1]];
        filter.green = [param[2], param[3]];
        filter.blue  = [param[4], param[5]];
};

newFilterName = "convolution";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.ConvolutionFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [0, 0];
 
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
        filter.matrix   = [0,0.1,0.05,0.1,1,0.1,0.05,0,0];
        filter.width = param[0];
        filter.height  = param[1];
};

newFilterName = "outline";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.OutlineFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [2];
// Filter_Controller.isMapEventOnly					  = true;
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
        filter.thickness   = param[0];
        filter.color = 0x000000;
        filter.quality  = 0.1;
};

newFilterName = "zoomblur";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.ZoomBlurFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [0.1,580];
 
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
        filter.strength = param[0];
        filter.center  = [640,360];
        filter.innerRadius = param[1];
        filter.radius  = -1;
};

newFilterName = "shade";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.GlowFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [0, 1];
 
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
		filter.distance = 35;
        filter.outerStrength = param[0];
        filter.innerStrength  = param[1];
        filter.color  = 0x000000;
		filter.quality = 0.5;
};

newFilterName = "shadow";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.DropShadowFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [-90, 3];
 
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
		filter.rotation = param[0];
		filter.distance = param[1];
		filter.color = 0x000000;
		filter.alpha = 0.5;
		filter.blur = 0;
		filter.quality = 0.1;
		filter.pixelSize = 2;
};

newFilterName = "glitch";
Filter_Controller.filterNameMap[newFilterName]        = PIXI.filters.GlitchFilter;
Filter_Controller.defaultFilterParam[newFilterName]   = [5,150,25];
 
Filter_Controller.updateFilterHandler[newFilterName]  = function(filter, param) {
    // filter: the PIXI.filters.RGBSplitFilter object
    // param: your own parameters
		filter.slices = param[0];
		filter.fillMode = 2;
		filter.red = [3,0];
		filter.green = [0,3];
		filter.blue = [0,0];
        filter.sampleSize  = 512;
		filter.minSize = 8;
		filter.seed = 0.4;
		filter.direction = param[1];
		filter.offset = param[3];
};
