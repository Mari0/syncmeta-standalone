/*global define */
define([
    'require',
    'jqueryui',
    'jsplumb',
    'lodash',
    'AbstractNode',
    'attribute/BooleanAttribute',
    'text!../../templates/relationship_group_node.html',
    'text!../../templates/hint.html'
],/** @lends RelationshipGroupNode */function(require,$,jsPlumb,_,AbstractNode,BooleanAttribute,relationshipGroupNodeHtml, hintHtml) {

    RelationshipGroupNode.TYPE = "Relation";
    RelationshipGroupNode.DEFAULT_WIDTH = 150;
    RelationshipGroupNode.DEFAULT_HEIGHT = 100;

    RelationshipGroupNode.prototype = new AbstractNode();
    RelationshipGroupNode.prototype.constructor = RelationshipGroupNode;
    /**
     * Abstract Class Node
     * @class canvas_widget.RelationshipGroupNode
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
    function RelationshipGroupNode(id,left,top,width,height,zIndex){
        var that = this;

        AbstractNode.call(this,id,RelationshipGroupNode.TYPE,left,top,width,height,zIndex);

        /**
         * jQuery object of node template
         * @type {jQuery}
         * @private
         */
        var _$template = $(_.template(relationshipGroupNodeHtml,{type: that.getType()}));
        var _$browserNodeTemplate = _$template.clone().removeClass().append($(hintHtml));
        _$browserNodeTemplate.find('.label').empty();
        _$browserNodeTemplate.find('.type').removeClass().addClass('pb_type');
        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = AbstractNode.prototype.get$node.call(this).append(_$template).addClass("class");
        var _$browserNode = AbstractNode.prototype.get$BrowserNode.call(this).append(_$browserNodeTemplate)

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
        this.toJSON = function(){
            var json = AbstractNode.prototype.toJSON.call(this);
            json.type = RelationshipGroupNode.TYPE;
            return json;
        };

        this.registerYMap = function(){
            AbstractNode.prototype.registerYMap.call(this);
            that.getLabel().getValue().registerYType();
        };

        _$node.find(".label").append(this.getLabel().get$node());
        _$browserNode.find(".label").append(this.getLabel().get$BrowserNode());

        for(var attributeKey in _attributes){
            if(_attributes.hasOwnProperty(attributeKey)){
                _$attributeNode.append(_attributes[attributeKey].get$node());
                _$browserAttributeNode.append(_attributes[attributeKey].get$BrowserNode());
            }
        }

    }

    return RelationshipGroupNode;

});