/*global define*/
define([
    'jqueryui',
    'jsplumb',
    'generic/NodeTool',
    'EntityManager',
    'vml/EnumNode'
],/** @lends EnumNodeTool */function($,jsPlumb,NodeTool,EntityManager,EnumNode) {

    EnumNodeTool.prototype = new NodeTool();
    EnumNodeTool.prototype.constructor = EnumNodeTool;
    /**
     * EnumNodeTool
     * @class canvas_widget.ClassNodeTool
     * @extends canvas_widget.NodeTool
     * @memberof canvas_widget
     * @constructor
     */
    function EnumNodeTool(){
        NodeTool.call(this,EnumNode.TYPE,null,null,EnumNode.DEFAULT_WIDTH,EnumNode.DEFAULT_HEIGHT);
    }

    return EnumNodeTool;

});