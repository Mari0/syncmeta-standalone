/*global define*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'Util',
    'attribute/AbstractAttribute',
    'value/Value',
    'value/SelectionValue',
    'text!../../templates/key_value_attribute.html',
    'text!../../templates/key_value_value_attribute.html'
],/** @lends KeySelectionValueSelectionValueAttribute */function($,jsPlumb,_,Util,AbstractAttribute,Value,SelectionValue,keySelectionValueSelectionValueAttributeHtml, propertyBrowserHtml) {

    KeySelectionValueSelectionValueAttribute.prototype = new AbstractAttribute();
    KeySelectionValueSelectionValueAttribute.prototype.constructor = KeySelectionValueSelectionValueAttribute;
    /**
     * KeySelectionValueSelectionValueAttribute
     * @class canvas_widget.KeySelectionValueSelectionValueAttribute
     * @extends canvas_widget.AbstractAttribute
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity id
     * @param {string} name Name of attribute
     * @param {AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {Object} options Selection options
     * @param {Object} options2 Selection options
     */
    function KeySelectionValueSelectionValueAttribute(id,name,subjectEntity,options,options2){

        AbstractAttribute.call(this,id,name,subjectEntity);

        //noinspection UnnecessaryLocalVariableJS
        /**
         * Selection options
         * @type {Object}
         * @private
         */
        var _options = options;

        //noinspection UnnecessaryLocalVariableJS
        /**
         * Selection options
         * @type {Object}
         * @private
         */
        var _options2 = options2;

        /**
         * Value object of key
         * @type {canvas_widget.Value}
         * @private
         */
        var _key = new Value(id+"[key]","",this,this.getRootSubjectEntity());

        /***
         * Value object of value
         * @type {canvas_widget.Value}
         * @private
         */
        var _value = new SelectionValue(id+"[value]","",this,this.getRootSubjectEntity(),_options);

        /***
         * Value object of value
         * @type {canvas_widget.Value}
         * @private
         */
        var _value2 = new SelectionValue(id+"[value2]","",this,this.getRootSubjectEntity(),_options2);

        /**
         * jQuery object of the DOM node representing the attribute
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(keySelectionValueSelectionValueAttributeHtml,{id:id}));
        var _$browserNode = $(propertyBrowserHtml);

        //noinspection JSUnusedGlobalSymbols
        /**
         * Set Value object of key
         * @param {canvas_widget.Value} key
         */
        this.setKey = function(key){
            _key = key;
        };

        /**
         * Get Value object of key
         * @returns {canvas_widget.Value}
         */
        this.getKey = function(){
            return _key;
        };

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
         * Set Value object of value
         * @param {canvas_widget.Value} value
         */
        this.setValue2 = function(value){
            _value2 = value;
        };

        /**
         * Get Value object of value
         * @returns {canvas_widget.Value}
         */
        this.getValue2 = function(){
            return _value2;
        };

        /**
         * Get jQuery object of the DOM node representing the attribute
         * @returns {jQuery}
         */
        this.get$node = function(){
            return _$node;
        };

        /**
         * Get jQuery object of the DOM node representing the attribute
         * @returns {jQuery}
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
            json.key = _key.toJSON();
            json.value = _value.toJSON();
            json.value2 = _value2.toJSON();
            return json;
        };

        /**
         * Set value of key and value by their JSON representation
         * @param json
         */
        this.setValueFromJSON = function(json){
            _key.setValueFromJSON(json.key);
            _value.setValueFromJSON(json.value);
            _value2.setValueFromJSON(json.value2||{value: ""});
        };

        this.registerYType = function(){
            _key.registerYType();
            _value.registerYType();
            _value2.registerYType();
        };
                    
        _$node.find(".key").append(_key.get$node());
        _$node.find(".value").append(_value.get$node());
        _$browserNode.find(".key").append(_key.get$BrowserNode());
        _$browserNode.find(".value").append(_value.get$BrowserNode());
        _$browserNode.find(".value2").append(_value2.get$BrowserNode());
    }
    return KeySelectionValueSelectionValueAttribute;
});