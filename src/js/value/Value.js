/*global define, CONFIG, Y, y*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'value/AbstractValue',
    'attribute/AbstractAttribute',
    'operations/non_ot/ActivityOperation',
     'operations/ot/ValueChangeOperation',
    'text!../../templates/value.html'
],/** @lends Value */function ($, jsPlumb, _, AbstractValue, AbstractAttribute, ActivityOperation,ValueChangeOperation, valueHtml) {

    Value.prototype = new AbstractValue();
    Value.prototype.constructor = Value;

    /**
     * Value
     * @class canvas_widget.Value
     * @extends canvas_widget.AbstractValue
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {canvas_widget.AbstractNode|canvas_widget.AbstractEdge} rootSubjectEntity Topmost entity in the chain of entity the attribute is assigned to
     */
    function Value(id, name, subjectEntity, rootSubjectEntity) {
        var that = this;
        var _ytext = null;
        if (window.hasOwnProperty("y")) {
            if (rootSubjectEntity.getYMap().keys().indexOf(id) != -1)
                _ytext = rootSubjectEntity.getYMap().get(id);
            else _ytext = rootSubjectEntity.getYMap().set(id, Y.Text);
        }
        AbstractValue.call(this, id, name, subjectEntity, rootSubjectEntity);

        /**
         * Value
         * @type {string}
         * @private
         */
        var _value = "";

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(valueHtml, { name: name }));

        var _$browserNode = _$node.clone().removeClass().removeAttr('disabled').removeAttr('name').attr('placeholder', name);

        /**
         * Set value
         * @param {string} value
         */
        this.setValue = function (value) {
            _value = value;
            _$node.val(value).trigger("blur");

            if (_ytext) {
                if (value !== _ytext.toString()) {
                    if (_ytext.toString().length > 0)
                        _ytext.delete(0, _ytext.toString().length);
                    _ytext.insert(0, value);
                }
            }
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
                _value = _ytext.toString().replace(/\n/g,'');
                //NOTE: i can not find out who triggered the delete :-(. Therefore do this only for non delete event types
                if (event.type !== "delete") {
                    var jabberId = y.share.users.get(event.object._content[event.index].id[0]);
                    y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                        "ValueChangeActivity",
                        that.getEntityId(),
                        jabberId,
                        ValueChangeOperation.getOperationDescription(that.getSubjectEntity().getName(), that.getRootSubjectEntity().getType(), that.getRootSubjectEntity().getLabel().getValue().getValue()),
                        {
                            value: _value,
                            subjectEntityName: that.getSubjectEntity().getName(),
                            rootSubjectEntityType: that.getRootSubjectEntity().getType(),
                            rootSubjectEntityId: that.getRootSubjectEntity().getEntityId()
                        }
                    ).toJSON());
                }
            });

            _ytext.observe(_.debounce(function (event) {
                if (event.type !== "delete") {
                    var jabberId = y.share.users.get(event.object._content[event.index].id[0]);
                    if (jabberId === y.share.users.get(y.db.userId))
                        $('#save').click();
                }
                else {
                    //I don't know who deleted here, so everyone save's  the current state for now
                    $('#save').click();
                }

            }, 500));
        };

        this.getYText = function () {
            return _ytext;
        };

        //automatically determines the size of input
        _$node.autoGrowInput({
            comfortZone: 10,
            minWidth: 40,
            maxWidth: 1000
        }).trigger("blur");
    }
    return Value;
});