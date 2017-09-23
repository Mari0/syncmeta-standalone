/* global define, CONFIG, y */
define([
    'jqueryui',
    'lodash',
    'value/AbstractValue',
    'operations/ot/ValueChangeOperation',
    'operations/non_ot/ActivityOperation',
    'text!../../templates/boolean_value.html',
    'text!../../templates/attribute/boolean_value.html'
],/** @lends BooleanValue */
function($,_,AbstractValue,ValueChangeOperation,ActivityOperation,booleanValueHtml,attributeBooleanValueHtml) {

    BooleanValue.prototype = new AbstractValue();
    BooleanValue.prototype.constructor = BooleanValue;
    /**
     * BooleanValue
     * @class canvas_widget.BooleanValue
     * @extends canvas_widget.AbstractValue
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {canvas_widget.AbstractNode|canvas_widget.AbstractEdge} rootSubjectEntity Topmost entity in the chain of entity the attribute is assigned to
     */
    function BooleanValue(id,name,subjectEntity,rootSubjectEntity, useAttributeHtml){
        var that = this;
        if(useAttributeHtml)
            booleanValueHtml = attributeBooleanValueHtml;

        AbstractValue.call(this,id,name,subjectEntity,rootSubjectEntity);

        /**
         * Value
         * @type {boolean}
         * @private
         */
        var _value = true;

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(booleanValueHtml,{value: _value}));
        var _$browserNode = $(_.template(attributeBooleanValueHtml, {name: name, value:_value}));

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
                var ymap = y.share.nodes.get(rootSubjectEntity.getEntityId());
                if(ymap){
                    var operation = new ValueChangeOperation(that.getEntityId(), this.checked, CONFIG.OPERATION.TYPE.UPDATE,0, y.share.users.get(y.db.userId));
                    ymap.set(that.getEntityId(), operation.toJSON());
                }
            });
        };        

        /**
         * Set value
         * @param {boolean} value
         */
        this.setValue = function(value){
            _value = value;
            if(useAttributeHtml)
                _$node.prop('checked',value);
            else{
                _$node.text(value);
                _$browserNode.prop('checked',value);
            }
        };

        /**
         * Get value
         * @returns {boolean}
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
                            ValueChangeOperation.getOperationDescription(that.getSubjectEntity().getName(), that.getRootSubjectEntity().getType(), that.getRootSubjectEntity().getLabel().getValue().getValue()),
                            {
                                value: operation.getValue(),
                                subjectEntityName: that.getSubjectEntity().getName(),
                                rootSubjectEntityType: that.getRootSubjectEntity().getType(),
                                rootSubjectEntityId: that.getRootSubjectEntity().getEntityId()
                            }
                        ).toJSON());
                        $('#save').click();
                    } 
                }
            });
        };

        init();
    }

    return BooleanValue;

});