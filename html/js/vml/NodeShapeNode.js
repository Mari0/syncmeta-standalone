/*global define*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'AbstractNode',
    'attribute/SingleSelectionAttribute',
    'attribute/SingleValueAttribute',
    'attribute/IntegerAttribute',
    'attribute/SingleColorValueAttribute',
    'attribute/SingleMultiLineValueAttribute',
    'text!../../templates/node_shape_node.html',
    'text!../../templates/hint.html'
],/** @lends NodeShapeNode */function($, jsPlumb, _, AbstractNode, SingleSelectionAttribute, SingleValueAttribute, IntegerAttribute, SingleColorValueAttribute, SingleMultiLineValueAttribute, nodeShapeNodeHtml, hintHtml) {

    NodeShapeNode.TYPE = "Node Shape";
    NodeShapeNode.DEFAULT_WIDTH = 180;
    NodeShapeNode.DEFAULT_HEIGHT = 220;

    NodeShapeNode.prototype = new AbstractNode();
    NodeShapeNode.prototype.constructor = NodeShapeNode;
    /**
     * Abstract Class Node
     * @class canvas_widget.NodeShapeNode
     * @extends canvas_widget.AbstractNode
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier of node
     * @param {number} left x-coordinate of node position
     * @param {number} top y-coordinate of node position
     * @param {number} width Width of node
     * @param {number} height Height of node
     * @param {number} zIndex Position of node on z-axis
     */
    function NodeShapeNode(id, left, top, width, height, zIndex, json) {
        var that = this;

        AbstractNode.call(this, id, NodeShapeNode.TYPE, left, top, width, height, zIndex, json);

        /**
         * jQuery object of node template
         * @type {jQuery}
         * @private
         */
        var _$template = $(_.template(nodeShapeNodeHtml, { type: that.getType() }));
        var _$browserNodeTemplate = _$template.clone().removeClass().append($(hintHtml));
        _$browserNodeTemplate.find('.label').empty();
        _$browserNodeTemplate.find('.type').removeClass().addClass('pb_type');
        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = AbstractNode.prototype.get$node.call(this).append(_$template).addClass("class");
        var _$browserNode = AbstractNode.prototype.get$BrowserNode.call(this).append(_$browserNodeTemplate);

        /**
         * jQuery object of DOM node representing the attributes
         * @type {jQuery}
         * @private
         */
        var _$attributeNode = _$node.find(".attributes");
        var _$browserAttributeNode = _$browserNode.find(".attributes");

        /**
         * Attributes of node
         * @type {Object}
         * @private
         */
        var _attributes = this.getAttributes();

        /**
         * Get JSON representation of the node
         * @returns {Object}
         */
        this.toJSON = function() {
            var json = AbstractNode.prototype.toJSON.call(this);
            json.type = NodeShapeNode.TYPE;
            return json;
        };

        var attrShapeSelect = new SingleSelectionAttribute(this.getEntityId() + "[shape]", "Shape", this, { "circle": "Circle", "diamond": "Diamond", "rectangle": "Rectangle", "rounded_rectangle": "Rounded Rectangle", "triangle": "Triangle" });
        var attrWidth = new IntegerAttribute(this.getEntityId() + "[defaultWidth]", "Default Width", this);
        var attrHeight = new IntegerAttribute(this.getEntityId() + "[defaultHeight]", "Default Height", this);
        var attrColor = new SingleColorValueAttribute(this.getEntityId() + "[color]", "Color", this);
        var attrCustomShape = new SingleMultiLineValueAttribute(this.getEntityId() + "[customShape]", "Custom Shape", this);
        var attrAnchors = new SingleValueAttribute(this.getEntityId() + "[customAnchors]", "Custom Anchors", this);



        this.addAttribute(attrShapeSelect);
        this.addAttribute(attrColor);
        this.addAttribute(attrWidth);
        this.addAttribute(attrHeight);
        this.addAttribute(attrCustomShape);
        this.addAttribute(attrAnchors);

        _$node.find(".label").append(this.getLabel().get$node());
        _$browserNode.find(".label").append(this.getLabel().get$BrowserNode());

        for (var attributeKey in _attributes) {
            if (_attributes.hasOwnProperty(attributeKey)) {
                _$attributeNode.append(_attributes[attributeKey].get$node());
                _$browserAttributeNode.append(_attributes[attributeKey].get$BrowserNode());
            }
        }

        this.registerYMap = function() {
            AbstractNode.prototype.registerYMap.call(this);
            attrShapeSelect.getValue().registerYType();
            attrWidth.getValue().registerYType();
            attrHeight.getValue().registerYType();
            that.getLabel().getValue().registerYType();
            attrColor.getValue().registerYType();
            attrAnchors.getValue().registerYType();
            attrCustomShape.getValue().registerYType();
        };
    }

    return NodeShapeNode;

});