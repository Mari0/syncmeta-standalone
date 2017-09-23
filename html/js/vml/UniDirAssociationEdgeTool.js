define([
    'jqueryui',
    'jsplumb',
    'generic/EdgeTool',
    'vml/AbstractClassNode',
    'vml/ObjectNode',
    'vml/RelationshipNode',
    'vml/EnumNode',
    'vml/NodeShapeNode',
    'vml/EdgeShapeNode',
    'vml/UniDirAssociationEdge'
],/** @lends UniDirAssociationEdgeTool */function ($, jsPlumb, EdgeTool, AbstractClassNode, ObjectNode, RelationshipNode, EnumNode, NodeShapeNode, EdgeShapeNode, UniDirAssociationEdge) {

    UniDirAssociationEdgeTool.prototype = new EdgeTool();
    UniDirAssociationEdgeTool.prototype.constructor = UniDirAssociationEdgeTool;
    /**
     * BiDirAssociationEdgeTool
     * @class canvas_widget.UniDirAssociationEdgeTool
     * @extends canvas_widget.EdgeTool
     * @memberof canvas_widget
     * @constructor
     */
    function UniDirAssociationEdgeTool() {
        EdgeTool.call(this, UniDirAssociationEdge.TYPE, UniDirAssociationEdge.RELATIONS, null, null, "unidirassociation.png");
    }

    return UniDirAssociationEdgeTool;

});