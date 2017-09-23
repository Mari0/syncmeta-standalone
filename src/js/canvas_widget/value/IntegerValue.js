/*global define, CONFIG, y*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'value/AbstractValue',
    'operations/ot/ValueChangeOperation',
    'operations/non_ot/ActivityOperation',
    'text!../../templates/integer_value.html',
    'text!../../templates/attribute/integer_value.html'
],/** @lends IntegerValue */function($,jsPlumb,_,AbstractValue,ValueChangeOperation,ActivityOperation,integerValueHtml, attributeIntegerValueHtml) {

    IntegerValue.prototype = new AbstractValue();
    IntegerValue.prototype.constructor = IntegerValue;
    /**
     * IntegerValue
     * @class canvas_widget.IntegerValue
     * @extends canvas_widget.AbstractValue
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {canvas_widget.AbstractNode|canvas_widget.AbstractEdge} rootSubjectEntity Topmost entity in the chain of entity the attribute is assigned to
     */
    function IntegerValue(id,name,subjectEntity,rootSubjectEntity, useAttributeHtml){
        var that = this;

        if(useAttributeHtml)
            integerValueHtml = attributeIntegerValueHtml;

        AbstractValue.call(this,id,name,subjectEntity,rootSubjectEntity);

        /**
         * Value
         * @type {number}
         * @private
         */
        var _value = 0;

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(integerValueHtml,{value: _value}));

        var _$browserNode = $(_.template(attributeIntegerValueHtml, {name: name}));

        /**
         * Apply a Value Change Operation
         * @param {operations.ot.ValueChangeOperation} operation
         */
        var processValueChangeOperation = function(operation){
            that.setValue(operation.getValue());
        };

        var init = function(){
            _$node.off();
            _$browserNode.off();
            _$browserNode.change(function(){
                var value = parseInt(_$browserNode.val());
                if (isNaN(value)) {
                    value = 0;
                }
                var ymap = y.share.nodes.get(rootSubjectEntity.getEntityId());
                if (ymap) {
                    var operation = new ValueChangeOperation(that.getEntityId(), value, CONFIG.OPERATION.TYPE.UPDATE, 0, y.share.users.get(y.db.userId));
                    ymap.set(that.getEntityId(), operation.toJSON());
                }
            });
        };

        /**
         * Set value
         * @param {number} value
         */
        this.setValue = function(value){
            _value = value;
            if(useAttributeHtml)
                _$node.val(value);
            else{
                _$node.text(value);
                _$browserNode.val(value);
            }
        };

        /**
         * Get value
         * @returns {number}
         */
        this.getValue = function(){
            return _value;
        };

        /**
         * Get jQuery object of DOM node representing the value
         * @returns {jQuery}
         */
        this.get$node = function(){
            return _$node;
        };

           /**
         * Get jQuery object of DOM node representing the value in the property browser
         * @returns {jQuery}
         */
            this.get$BrowserNode = function () {
                return _$browserNode;
            };

        /**
         * Get JSON representation of the edge
         * @returns {Object}
         */
        this.toJSON = function(){
            var json = AbstractValue.prototype.toJSON.call(this);
            json.value = _value;
            return json;
        };

        /**
         * Set value by its JSON representation
         * @param json
         */
        this.setValueFromJSON = function(json){
            this.setValue(json.value);
        };

       
        this.registerYType = function () {
            //observer
            that.getRootSubjectEntity().getYMap().observePath([that.getEntityId()], function (event) {
                if (event) {
                    var operation = new ValueChangeOperation(event.entityId, event.value, event.type, event.position, event.jabberId);
                    processValueChangeOperation(operation);

                    //Only the local user Propagates the activity and saves the state of the model
                    if (y.share.users.get(y.db.userId) === operation.getJabberId()) {
                        y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                            "ValueChangeActivity",
                            that.getEntityId(),
                            y.share.users.get(y.db.userId),
                            ValueChangeOperation.getOperationDescription(that.getSubjectEntity().getName(), that.getRootSubjectEntity().getType(), that.getRootSubjectEntity().getLabel().getValue().getValue()), {
                                value: operation.getValue(),
                                subjectEntityName: that.getSubjectEntity().getName(),
                                rootSubjectEntityType: that.getRootSubjectEntity().getType(),
                                rootSubjectEntityId: that.getRootSubjectEntity().getEntityId()
                            }).toJSON());
                    }
                }
                
            });

            //Debounce the save function
            that.getRootSubjectEntity().getYMap().observePath([that.getEntityId()], _.debounce(function (event) {
                if (event && event.jabberId === y.share.users.get(y.db.userId))
                    $('#save').click();
            }, 500));
        };

        init();
    }
    return IntegerValue;
});