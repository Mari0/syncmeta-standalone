/*global define*/
define([
    'jquery',
    'lodash',
    'operations/non_ot/ToolSelectOperation',
    'operations/non_ot/SetViewTypesOperation',
    'operations/non_ot/InitModelTypesOperation',
    'MoveTool',
    'generic/NodeTool',
    'generic/EdgeTool',
    'text!../templates/circle_node.html',
    'text!../templates/diamond_node.html',
    'text!../templates/rectangle_node.html',
    'text!../templates/rounded_rectangle_node.html',
    'text!../templates/triangle_node.html'
],/** @lends Palette */function($,_,ToolSelectOperation,SetViewTypesOperation,InitModelTypesOperation,MoveTool,NodeTool, EdgeTool, circleNodeHtml,diamondNodeHtml,rectangleNodeHtml,roundedRectangleNodeHtml,triangleNodeHtml) {

    /**
     * Palette
     * @class palette_widget.Palette
     * @memberof palette_widget
     * @constructor
     */
    function Palette($palette,$info, canvas){
        var that = this;
        
        /**
         * Tools added to palette
         * @type {Object}
         * @private
         */
        var _tools = {};

        var _canvas = canvas;

        /**
         * Tool currently selected
         * @type String
         * @private
         */
        var _currentToolName = null;

    
        /**
         * Apply a tool selection
         * @param {String} name
         */
        var processToolSelection = function(name){
            var tool;
            if(_tools.hasOwnProperty(name)){
                if(_currentToolName) {
                    _tools[_currentToolName].unselect();
                    //$info.text("");
                }
                tool = _tools[name];
                tool.select();
                //$info.text(tool.getDescription());
                _currentToolName = name;
            }
        };

        var setViewTypesCallback = function(operation){
            if(operation instanceof SetViewTypesOperation) {
                if(operation.getFlag() && _tools.hasOwnProperty('ViewObject') && _tools.hasOwnProperty('ViewRelationship')){
                    _tools['ViewObject'].get$node().show();
                    _tools['ViewRelationship'].get$node().show();
                    _tools['Object'].get$node().hide();
                    _tools['Enumeration'].get$node().hide();
                    _tools['Relationship'].get$node().hide();
                    _tools['Abstract Class'].get$node().hide();
                }
                else if(!operation.getFlag() &&  _tools.hasOwnProperty('ViewObject') && _tools.hasOwnProperty('ViewRelationship')) {
                    _tools['ViewObject'].get$node().hide();
                    _tools['ViewRelationship'].get$node().hide();
                    _tools['Object'].get$node().show();
                    _tools['Enumeration'].get$node().show();
                    _tools['Relationship'].get$node().show();
                    _tools['Abstract Class'].get$node().show();

                }

            }
        };

        var initModelTypesCallback = function(operation){
            if(operation instanceof InitModelTypesOperation){
                var vls = operation.getVLS();

                if(!$.isEmptyObject(_tools)){
                    _tools = {};
                    $palette.empty();
                }
                that.addTool(new MoveTool());
                that.addSeparator();
                that.initNodePalette(vls);
                that.addSeparator();
                that.iniEdgePalette(vls);
                _currentToolName = 'MoveTool';
            }
        };

        /**
         * Add tool tool to palette
         * @param {palette_widget.AbstractTool} tool
         */
        this.addTool = function(tool){
            var name = tool.getName();
            var $node;
            if(!_tools.hasOwnProperty(name)){
                _tools[name] = tool;
                $node = tool.get$node();
                $node.on("mousedown",function(ev){
                    if (ev.which != 1) return;
                    that.selectTool(name);
                });
                $palette.append($node);
            }
        };

        /**
         * Add separator to palette
         */
        this.addSeparator = function(){
            $palette.append($('<hr />'));
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get tool by name
         * @param {string} name
         * @returns {palette_widget.AbstractTool}
         */
        this.getTool = function(name){
            if(_tools.hasOwnProperty(name)){
                return _tools[name];
            }
            return null;
        };

        /**
         * Select tool by name
         * @param {string} name
         */
        this.selectTool = function(name){
            if(_tools.hasOwnProperty(name)){
                processToolSelection(name);
                _canvas.mountTool(name);
              }
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get currently selected tool
         * @returns {AbstractTool}
         */
        this.getCurrentToolName = function(){
            return _currentToolName;
        };

        this.initNodePalette = function(metamodel){
            var nodeShapeTypes = {
                "circle": circleNodeHtml,
                "diamond": diamondNodeHtml,
                "rectangle": rectangleNodeHtml,
                "rounded_rectangle": roundedRectangleNodeHtml,
                "triangle": triangleNodeHtml
            };

            /**
             * jQuery object to test for valid color
             * @type {$}
             */
            var $colorTestElement = $('<div></div>');

            var nodes = metamodel.nodes,
                node,
                shape,
                color,
                $shape;

            for(var nodeId in nodes) {
                if (nodes.hasOwnProperty(nodeId)) {
                    node = nodes[nodeId];
                    if (node.shape.customShape) {
                        shape = node.shape.customShape;
                    } else {
                        shape = nodeShapeTypes.hasOwnProperty(node.shape.shape) ? nodeShapeTypes[node.shape.shape] : _.keys(nodeShapeTypes)[0];
                    }
                    color = node.shape.color ? $colorTestElement.css('color', '#FFFFFF').css('color', node.shape.color).css('color') : '#FFFFFF';
                    $shape = $('<div>').css('display', 'table-cell').css('verticalAlign', 'middle').css('width', node.shape.defaultWidth || 100).css('height', node.shape.defaultHeight || 50).append($(_.template(shape, {
                        color: color,
                        type: node.label
                    })));
                    $shape.find('.type').hide();

                    that.addTool(new NodeTool(node.label, node.label, null, null, null, $shape));
                }
            }
        };
        this.initEdgePalette = function(metamodel){
            var edges = metamodel.edges, edge;
            for(var edgeId in edges){
                if(edges.hasOwnProperty(edgeId)){
                    edge = edges[edgeId];
                    that.addTool(new EdgeTool(edge.label,edge.relations,edge.label, null,edge.shape.arrow+".png",edge.shape.color));
                }
            }
        }
    }
    return Palette;
});
