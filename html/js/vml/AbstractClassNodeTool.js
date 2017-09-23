/* global define */
define([
    'jqueryui',
    'jsplumb',
    'generic/NodeTool',
    'vml/AbstractClassNode'
],/** @lends AbstractClassNodeTool */function($,jsPlumb,NodeTool,AbstractClassNode) {
    AbstractClassNodeTool.prototype = new NodeTool();
    AbstractClassNodeTool.prototype.constructor = AbstractClassNodeTool;
    /**
     * AbstractClassNodeTool
     * @class canvas_widget.ClassNodeTool
     * @extends canvas_widget.NodeTool
     * @memberof canvas_widget
     * @constructor
     */
    function AbstractClassNodeTool(){
        NodeTool.call(this,AbstractClassNode.TYPE,null,null,AbstractClassNode.DEFAULT_WIDTH,AbstractClassNode.DEFAULT_HEIGHT);
    }
    return AbstractClassNodeTool;
});