/*global define, CONFIG, y*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'Util',
    'operations/ot/AttributeAddOperation',
    'operations/ot/AttributeDeleteOperation',
    'attribute/AbstractAttribute',
    'attribute/SingleValueAttribute',
    'text!../../templates/list_attribute.html'
], /** @lends SingleValueListAttribute */ function ($, jsPlumb, _, Util, AttributeAddOperation, AttributeDeleteOperation, AbstractAttribute, SingleValueAttribute, singleValueListAttributeHtml) {

    SingleValueListAttribute.TYPE = "SingleValueListAttribute";

    SingleValueListAttribute.prototype = new AbstractAttribute();
    SingleValueListAttribute.prototype.constructor = SingleValueListAttribute;
    /**
     * SingleValueListAttribute
     * @class canvas_widget.SingleValueListAttribute
     * @extends canvas_widget.AbstractAttribute
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity id
     * @param {string} name Name of attribute
     * @param {AbstractEntity} subjectEntity Entity the attribute is assigned to
     */
    function SingleValueListAttribute(id, name, subjectEntity) {
        var that = this;

        AbstractAttribute.call(this, id, name, subjectEntity);

        /**
         * List of attributes
         * @type {Object}
         * @private
         */
        var _list = {};

        /**
         * jQuery object of DOM node representing the attribute
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(singleValueListAttributeHtml, {}));
        var _$browserNode = _$node.clone().append('<div><span class="ui-icon ui-icon-plus"></span></div>');
        _$browserNode.find('.name').show();

        /**
         * Apply an Attribute Add Operation
         * @param {operations.ot.AttributeAddOperation} operation
         */
        var processAttributeAddOperation = function (operation) {
            var attribute = new SingleValueAttribute(operation.getEntityId() + '[value]', "Attribute", that);
            attribute.registerYType();
            that.addAttribute(attribute);
            _$node.find(".list").append(attribute.get$node());
            _$browserNode.find(".list").append(attribute.get$BrowserNode());
        };


        /**
         * Apply an Attribute Delete Operation
         * @param {operations.ot.AttributeDeleteOperation} operation
         */
        var processAttributeDeleteOperation = function (operation) {
            var attribute = that.getAttribute(operation.getEntityId());
            if (attribute) {
                that.deleteAttribute(attribute.getEntityId());
                attribute.get$node().remove();
            }
        };
        /**
         * Propagate an Attribute Add Operation to the remote users and the local widgets
         * @param {operations.ot.AttributeAddOperation} operation
         */
        var propagateAttributeAddOperation = function (operation) {
            processAttributeAddOperation(operation);
        };

        /**
         * Propagate an Attribute Delete Operation to the remote users and the local widgets
         * @param {operations.ot.AttributeDeleteOperation} operation
         */
        var propagateAttributeDeleteOperation = function (operation) {
            processAttributeDeleteOperation(operation);
            var ynode = that.getRootSubjectEntity().getYMap();
            ynode.delete(operation.getEntityId());
        };

        /**
         * Callback for a remote Attrbute Add Operation
         * @param {operations.ot.AttributeAddOperation} operation
         */
        var remoteAttributeAddCallback = function (operation) {
            if (operation instanceof AttributeAddOperation && operation.getRootSubjectEntityId() === that.getRootSubjectEntity().getEntityId() && operation.getSubjectEntityId() === that.getEntityId()) {
                processAttributeAddOperation(operation);
            }
        };

        /**
         * Callback for a remote Attribute Delete Operation
         * @param {operations.ot.AttributeDeleteOperation} operation
         */
        var remoteAttributeDeleteCallback = function (operation) {
            if (operation instanceof AttributeDeleteOperation && operation.getRootSubjectEntityId() === that.getRootSubjectEntity().getEntityId() && operation.getSubjectEntityId() === that.getEntityId()) {
                processAttributeDeleteOperation(operation);
            }
        };

        var localAttributeAddCallback = function (operation) {
            if (operation instanceof AttributeAddOperation && operation.getRootSubjectEntityId() === that.getRootSubjectEntity().getEntityId() && operation.getSubjectEntityId() === that.getEntityId()) {
                propagateAttributeAddOperation(operation);
            }
        };

        /**
         * Callback for a local Attribute Delete Operation
         * @param {operations.ot.AttributeDeleteOperation} operation
         */
        var localAttributeDeleteCallback = function (operation) {
            if (operation instanceof AttributeDeleteOperation && operation.getRootSubjectEntityId() === that.getRootSubjectEntity().getEntityId() && operation.getSubjectEntityId() === that.getEntityId()) {
                propagateAttributeDeleteOperation(operation);
            }
        };

        /**
         * Add attribute to attribute list
         * @param {canvas_widget.AbstractAttribute} attribute
         */
        this.addAttribute = function (attribute) {
            var id = attribute.getEntityId();
            if (!_list.hasOwnProperty(id)) {
                _list[id] = attribute;
            }
        };

        /**
         * Get attribute of attribute list by its entity id
         * @param id
         * @returns {canvas_widget.AbstractAttribute}
         */
        this.getAttribute = function (id) {
            if (_list.hasOwnProperty(id)) {
                return _list[id];
            }
            return null;
        };

        /**
         * Delete attribute from attribute list by its entity id
         * @param {string} id
         */
        this.deleteAttribute = function (id) {
            if (_list.hasOwnProperty(id)) {
                delete _list[id];
            }
        };

        /**
         * Get attribute list
         * @returns {Object}
         */
        this.getAttributes = function () {
            return _list;
        };

        /**
         * Set attribute list
         * @param {Object} list
         */
        this.setAttributes = function (list) {
            _list = list;
        };

        /**
         * Get jQuery object of the DOM node representing the attribute (list)
         * @returns {jQuery}
         */
        this.get$node = function () {
            return _$node;
        };
        this.get$BrowserNode = function () {
            return _$browserNode;
        }
        /**
         * Get JSON representation of the attribute (list)
         * @returns {Object}
         */
        this.toJSON = function () {
            var json = AbstractAttribute.prototype.toJSON.call(this);
            json.type = SingleValueListAttribute.TYPE;
            var attr = {};
            _.forEach(this.getAttributes(), function (val, key) {
                attr[key] = val.toJSON();
            });
            json.list = attr;
            return json;
        };

        /**
         * Set attribute list by its JSON representation
         * @param json
         */
        this.setValueFromJSON = function (json) {
            _.forEach(json.list, function (val, key) {
                var attribute = new SingleValueAttribute(key, key, that);
                attribute.setValueFromJSON(json.list[key]);
                that.addAttribute(attribute);
                _$node.find(".list").append(attribute.get$node());
                _$browserNode.find(".list").append(attribute.get$BrowserNode());
            });
        };

        _$node.find(".name").text(this.getName());
        _$browserNode.find(".name").text(this.getName());

        for (var attributeId in _list) {
            if (_list.hasOwnProperty(attributeId)) {
                _$node.find(".list").append(_list[attributeId].get$node());
                _$browserNode.find(".list").append(_list[attributeId].get$BrowserNode());
            }
        }

        _$browserNode.find(".ui-icon-plus").click(function () {
            var id = Util.generateRandomId();
            var operation = new AttributeAddOperation(id, that.getEntityId(), that.getRootSubjectEntity().getEntityId(), SingleValueAttribute.TYPE, y.share.users.get(y.db.userId));
            propagateAttributeAddOperation(operation);
        });

        this.registerYMap = function () {
            var ymap = that.getRootSubjectEntity().getYMap();

            var attrs = that.getAttributes();
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    var attr = attrs[key];
                    attr.getValue().registerYType();
                }
            }

            ymap.observe(function (event) {
                var operation;
                if (event.name.indexOf('[value]') != -1) {
                    switch (event.type) {
                        case 'add':
                            {
                                var yUserId = event.object.map[event.name][0];
                                if (yUserId === y.db.userId) return;
                                operation = new AttributeAddOperation(event.name.replace(/\[\w*\]/g, ''), that.getEntityId(), that.getRootSubjectEntity().getEntityId(), that.constructor.name);
                                remoteAttributeAddCallback(operation);
                                break;
                            }
                        case 'delete':
                            {
                                operation = new AttributeDeleteOperation(event.name, that.getEntityId(), that.getRootSubjectEntity().getEntityId(), that.constructor.name);
                                remoteAttributeDeleteCallback(operation);
                            }
                    }
                }
            });
        }
    }

    return SingleValueListAttribute;

});