/*global define, CONFIG, Y, y*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'value/AbstractValue',
    'attribute/AbstractAttribute',
    'operations/ot/ValueChangeOperation',
    'operations/non_ot/ActivityOperation',
    'text!../../templates/multi_line_value.html',
    'text!../../templates/attribute/multi_line_value.html'
],/** @lends MultiLineValue */function ($, jsPlumb, _, AbstractValue, AbstractAttribute, ValueChangeOperation, ActivityOperation, multiLineValueHtml, browser_multiLineValueHtml) {

    MultiLineValue.prototype = new AbstractValue();
    MultiLineValue.prototype.constructor = MultiLineValue;
    /**
     * MultiLineValue
     * @class canvas_widget.MultiLineValue
     * @extends canvas_widget.AbstractValue
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {canvas_widget.AbstractNode|canvas_widget.AbstractEdge} rootSubjectEntity Topmost entity in the chain of entity the attribute is assigned to
     */
    function MultiLineValue(id, name, subjectEntity, rootSubjectEntity) {
        var that = this;

        var _ytext = null;
        if(window.hasOwnProperty("y")){
            if(rootSubjectEntity.getYMap().keys().indexOf(id) != -1)
                _ytext = rootSubjectEntity.getYMap().get(id);
            else
                _ytext = rootSubjectEntity.getYMap().set(id, Y.Text);
        }

        AbstractValue.call(this, id, name, subjectEntity, rootSubjectEntity);

        /**
         * MultiLineValue
         * @type {string}
         * @private
         */
        var _value = "";

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(multiLineValueHtml, { value: _value }));
        var _$browserNode = $(_.template(browser_multiLineValueHtml, { name: name })).removeClass();

        /**
         * Get chain of entities the attribute is assigned to
         * @returns {string[]}
         */
        var getEntityIdChain = function () {
            var chain = [that.getEntityId()],
                entity = that;
            while (entity instanceof AbstractAttribute) {
                chain.unshift(entity.getSubjectEntity().getEntityId());
                entity = entity.getSubjectEntity();
            }
            return chain;
        };


        /**
         * Propagate a Value Change Operation to the remote users and the local widgets
         * @param {operations.ot.ValueChangeOperation} operation
         */
        var propagateValueChangeOperation = function (operation) {
            operation.setEntityIdChain(getEntityIdChain());
            operation.setRemote(false);
            that.setValue(operation.getValue());
            operation.setRemote(true);
            y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                "ValueChangeActivity",
                that.getEntityId(),
                y.share.users.get(y.db.userId),
                ValueChangeOperation.getOperationDescription(that.getSubjectEntity().getName(), that.getRootSubjectEntity().getType(), that.getRootSubjectEntity().getLabel().getValue().getValue()),
                {
                    value: _value,
                    subjectEntityName: that.getSubjectEntity().getName(),
                    rootSubjectEntityType: that.getRootSubjectEntity().getType(),
                    rootSubjectEntityId: that.getRootSubjectEntity().getEntityId()
                }
            ).toJSON());
        };

        /**
         * Callback for a local Value Change Operation
         * @param {operations.ot.ValueChangeOperation} operation
         */
        var localValueChangeCallback = function (operation) {
            if (operation instanceof ValueChangeOperation && operation.getEntityId() === that.getEntityId()) {
                propagateValueChangeOperation(operation);
            }
        };


        /**
         * Set value
         * @param {string} value
         */
        this.setValue = function (value) {
            _value = value;
            _$node.text(value);
        };

        /**
         * Get value
         * @returns {string}
         */
        this.getValue = function () {
            return _value;
        };

        /**
         * Get jQuery object of DOM node representing the value in the canvas
         * @returns {jQuery}
         */
        this.get$node = function () {
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
        this.toJSON = function () {
            var json = AbstractValue.prototype.toJSON.call(this);
            json.value = _value;
            return json;
        };

        /**
         * Set value by its JSON representation
         * @param json
         */
        this.setValueFromJSON = function (json) {
            this.setValue(json.value);
        };

        
        this.registerYType = function () {
            _ytext.bind(_$node[0]);
            _ytext.bind(_$browserNode[0]);
            if (that.getValue() !== _ytext.toString()) {
                if (_ytext.toString().length > 0)
                    _ytext.delete(0, _ytext.toString().length - 1);
                _ytext.insert(0, that.getValue());
            }

            _ytext.observe(function (event) {
                _value = _ytext.toString();

                //TODO i can not find out who triggered the delete :-(. Therefore do this only for non delete event types
                if (event.type !== "delete") {
                    var jabberId = y.share.users.get(event.object._content[event.index].id[0]);
                    y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                        "ValueChangeActivity",
                        that.getEntityId(),
                        jabberId,
                        ValueChangeOperation.getOperationDescription(that.getSubjectEntity().getName(), that.getRootSubjectEntity().getType(), that.getRootSubjectEntity().getLabel().getValue().getValue()),
                        {
                            value: '',
                            subjectEntityName: that.getSubjectEntity().getName(),
                            rootSubjectEntityType: that.getRootSubjectEntity().getType(),
                            rootSubjectEntityId: that.getRootSubjectEntity().getEntityId()
                        }).toJSON());
                }
            });
        };
    }
    return MultiLineValue;
});