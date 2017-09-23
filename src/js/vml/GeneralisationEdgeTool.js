/*global define*/
define([
    'jqueryui',
    'jsplumb',
    'generic/EdgeTool',
    'vml/AbstractClassNode',
    'vml/ObjectNode',
    'vml/RelationshipNode',
    'vml/EnumNode',
    'vml/GeneralisationEdge'
],/** @lends GeneralisationEdgeTool */function($,jsPlumb,EdgeTool,AbstractClassNode,ObjectNode,RelationshipNode,EnumNode,GeneralisationEdge) {

    GeneralisationEdgeTool.prototype = new EdgeTool();
    GeneralisationEdgeTool.prototype.constructor = GeneralisationEdgeTool;
    /**
     * GeneralisationEdgeTool
     * @class canvas_widget.GeneralisationEdgeTool
     * @extends canvas_widget.EdgeTool
     * @memberof canvas_widget
     * @constructor
     */
    function GeneralisationEdgeTool() {
        EdgeTool.call(this, GeneralisationEdge.TYPE, GeneralisationEdge.RELATIONS, null, null, "generalisation.png");
    }

    return GeneralisationEdgeTool;

});