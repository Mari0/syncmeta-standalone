/*global define*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'AbstractNode',
    'attribute/SingleValueListAttribute',
    'text!../../templates/enum_node.html',
    'text!../../templates/hint.html'
],/** @lends EnumNode */function($,jsPlumb,_,AbstractNode,SingleValueListAttribute,enumNodeHtml,hintHtml) {

    EnumNode.TYPE = "Enumeration";
    EnumNode.DEFAULT_WIDTH = 150;
    EnumNode.DEFAULT_HEIGHT = 100;

    EnumNode.prototype = new AbstractNode();
    EnumNode.prototype.constructor = EnumNode;
    /**
     * Abstract Class Node
     * @class canvas_widget.EnumNode
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
    function EnumNode(id,left,top,width,height,zIndex, json){
        var that = this;

        AbstractNode.call(this,id,EnumNode.TYPE,left,top,width,height,zIndex, json);

        /**
         * jQuery object of node template
         * @type {jQuery}
         * @private
         */
        var _$template = $(_.template(enumNodeHtml,{type: that.getType()}));

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = AbstractNode.prototype.get$node.call(this).append(_$template).addClass("class");
        var _$browserNodeTemplate = _$template.clone().removeClass().append($(hintHtml));
        _$browserNodeTemplate.find('.label').empty();
        _$browserNodeTemplate.find('.type').removeClass().addClass('pb_type');

        /**
         * jQuery object of DOM node representing the attributes
         * @type {jQuery}
         * @private
         */
        var _$attributeNode = _$node.find(".attributes");
        var _$browserNode = AbstractNode.prototype.get$BrowserNode.call(this).append(_$browserNodeTemplate)

        /**
         * Attributes of node
         * @type {Object}
         * @private
         */
        var _attributes = this.getAttributes();
        var _$browserAttributeNode = _$browserNode.find(".attributes");

        /**
         * Get JSON representation of the node
         * @returns {Object}
         */
        this.toJSON = function(){
            var json = AbstractNode.prototype.toJSON.call(this);
            json.type = EnumNode.TYPE;
            return json;
        };
        var attr= new SingleValueListAttribute("[attributes]","Attributes",this);
        this.addAttribute(attr);

        this.registerYMap = function(){
            AbstractNode.prototype.registerYMap.call(this);
            that.getLabel().getValue().registerYType();
            attr.registerYMap();
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

    return EnumNode;

});