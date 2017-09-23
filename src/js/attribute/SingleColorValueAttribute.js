/*global define*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'Util',
    'attribute/AbstractAttribute',
    'value/Value',
    'text!../../templates/single_value_attribute.html'
],/** @lends SingleColorValueAttribute */function($,jsPlumb,_,Util,AbstractAttribute,Value,singleColorValueAttributeHtml) {

    SingleColorValueAttribute.prototype = new AbstractAttribute();
    SingleColorValueAttribute.prototype.constructor = SingleColorValueAttribute;
    /**
     * SingleColorValueAttribute
     * @class canvas_widget.SingleColorValueAttribute
     * @extends canvas_widget.AbstractAttribute
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity id
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     */
    function SingleColorValueAttribute(id,name,subjectEntity){

        AbstractAttribute.call(this,id,name,subjectEntity);

        /***
         * Value object of value
         * @type {canvas_widget.Value}
         * @private
         */
        var _value  = new Value(id,name,this,this.getRootSubjectEntity());

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(singleColorValueAttributeHtml,{}));
        var _$browserNode = _$node.clone().removeClass().addClass('pb_single_value_attribute');

        /**
         * Set Value object of value
         * @param {canvas_widget.Value} value
         */
        this.setValue = function(value){
            _value = value;
        };

        /**
         * Get Value object of value
         * @returns {canvas_widget.Value}
         */
        this.getValue = function(){
            return _value;
        };

        /**
         * jQuery object of DOM node representing the attribute
         * @type {jQuery}
         * @private
         */
        this.get$node = function(){
            return _$node;
        };

        /**
         * jQuery object of DOM node representing the attribute
         * @type {jQuery}
         * @private
         */
        this.get$BrowserNode = function(){
            return _$browserNode;
        };

        /**
         * Get JSON representation of the attribute
         * @returns {Object}
         */
        this.toJSON = function(){
            var json = AbstractAttribute.prototype.toJSON.call(this);
            json.value = _value.toJSON();
            return json;
        };

        /**
         * Set attribute value by its JSON representation
         * @param json
         */
        this.setValueFromJSON = function(json){
            _value.setValueFromJSON(json.value);
        };

        _$node.find(".name").text(this.getName());
        _$node.find(".value").append(_value.get$node());
        _$browserNode.find(".name").text(this.getName());
        _$browserNode.find(".value").append(_value.get$BrowserNode());
    }

    return SingleColorValueAttribute;

});