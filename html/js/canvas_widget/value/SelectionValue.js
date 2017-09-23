/*global define, CONFIG, y*/
define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'value/AbstractValue',
    'viewpoint/ViewTypesUtil',
    'operations/ot/ValueChangeOperation',
    'operations/non_ot/ActivityOperation',
    'text!../../templates/selection_value.html',
    'text!../../templates/attribute/selection_value.html'
], /** @lends SelectionValue */
    function($, jsPlumb, _, AbstractValue, ViewTypesUtil, ValueChangeOperation, ActivityOperation, selectionValueHtml, attributeSelectionValueHtml) {

        SelectionValue.prototype = new AbstractValue();
        SelectionValue.prototype.constructor = SelectionValue;
        /**
         * SelectionValue
         * @class canvas_widget.SelectionValue
         * @extends canvas_widget.AbstractValue
         * @memberof canvas_widget
         * @constructor
         * @param {string} id Entity identifier
         * @param {string} name Name of attribute
         * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
         * @param {canvas_widget.AbstractNode|canvas_widget.AbstractEdge} rootSubjectEntity Topmost entity in the chain of entity the attribute is assigned to
         * @param {Object} options Selection options
         */
        function SelectionValue(id, name, subjectEntity, rootSubjectEntity, options, useAttributeHtml) {
            var that = this;

            useAttributeHtml = typeof useAttributeHtml !== 'undefinded' ? useAttributeHtml : false;

            AbstractValue.call(this, id, name, subjectEntity, rootSubjectEntity);

            /**
             * Value
             * @type {string}
             * @private
             */
            var _value = _.keys(options)[0];

            if (useAttributeHtml) {
                selectionValueHtml = attributeSelectionValueHtml;
            }

            /**
             * jQuery object of DOM node representing the node
             * @type {jQuery}
             * @private
             */
            var _$node = $(_.template(selectionValueHtml, {
                name: name,
                options: options
            }));

            var _$browserNode = $(_.template(attributeSelectionValueHtml, {
                name: name,
                options: options
            }));

            if (useAttributeHtml) {
                _$node.off();
            }

            /**
             * Apply a Value Change Operation
             * @param {operations.ot.ValueChangeOperation} operation
             */
            var processValueChangeOperation = function(operation) {
                that.setValue(operation.getValue());
            };
            
            var init = function(){
                _$browserNode.off();
                _$browserNode.change(function () {
                    var ymap = y.share.nodes.get(rootSubjectEntity.getEntityId());
                    if (ymap) {
                        var operation = new ValueChangeOperation(that.getEntityId(), $(this).val(), CONFIG.OPERATION.TYPE.UPDATE, 0, y.share.users.get(y.db.userId));
                        ymap.set(that.getEntityId(), operation.toJSON());
                    }
                });
            }

            /**
             * Set value
             * @param {string} value
             */
            this.setValue = function(value) {
                _value = value;
                if (useAttributeHtml) {
                    _$node.val(value);
                }
                else{
                    _$node.text(options[value]);
                    _$browserNode.val(value);
                }
                    
            };

            /**
             * Get value
             * @returns {string}
             */
            this.getValue = function() {
                return _value;
            };

            /**
             * Get jQuery object of DOM node representing the value
             * @returns {jQuery}
             */
            this.get$node = function() {
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
            this.toJSON = function() {
                var json = AbstractValue.prototype.toJSON.call(this);
                json.value = _value;
                return json;
            };

            /**
             * Set value by its JSON representation
             * @param json
             */
            this.setValueFromJSON = function(json) {
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
                                }));

                            //its a view type and create a reference to the origin
                            if (event.entityId.indexOf('[target]') != -1) {
                                ViewTypesUtil.createReferenceToOrigin(that.getRootSubjectEntity());
                                //CVG
                                require(['viewpoint/ClosedViewGeneration'], function(CVG){
                                    CVG(rootSubjectEntity);
                                });
                            }
                            //trigger the save 
                            $('#save').click();
                        
                        }
                    }
                });
            }

            init();
        }

        return SelectionValue;

    });
