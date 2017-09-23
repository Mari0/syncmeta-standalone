/* global define */
define([
    'jqueryui',
    'jsplumb',
    'generic/EdgeTool',
    'vml/ObjectNode',
    'vml/RelationshipNode',
    'vml/EnumNode',
    'vml/NodeShapeNode',
    'vml/EdgeShapeNode',
    'vml/BiDirAssociationEdge'
],/** @lends BiDirAssociationEdgeTool */function ($, jsPlumb, EdgeTool, ObjectNode, RelationshipNode, EnumNode, NodeShapeNode, EdgeShapeNode, BiDirAssociationEdge) {

    BiDirAssociationEdgeTool.prototype = new EdgeTool();
    BiDirAssociationEdgeTool.prototype.constructor = BiDirAssociationEdgeTool;
    /**
     * BiDirAssociationEdgeTool
     * @class canvas_widget.BiDirAssociationEdgeTool
     * @extends canvas_widget.EdgeTool
     * @memberof canvas_widget
     * @constructor
     */
    function BiDirAssociationEdgeTool() {
        EdgeTool.call(this, BiDirAssociationEdge.TYPE, BiDirAssociationEdge.RELATIONS, null, null, "bidirassociation.png");
    }

    return BiDirAssociationEdgeTool;

});