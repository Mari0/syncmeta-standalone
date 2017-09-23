/*global define */
define([
    'require',
    'jqueryui',
    'jsplumb',
    'lodash',
    'AbstractNode',
    'attribute/KeySelectionValueListAttribute',
    'attribute/BooleanAttribute',
    'text!../../templates/abstract_class_node.html',
    'text!../../templates/hint.html'
],/** @lends AbstractClassNode */
function(require,$,jsPlumb,_,AbstractNode,KeySelectionValueListAttribute,BooleanAttribute,abstractClassNodeHtml, hintHtml) {

    AbstractClassNode.TYPE = "Abstract Class";
    AbstractClassNode.DEFAULT_WIDTH = 150;
    AbstractClassNode.DEFAULT_HEIGHT = 100;

    AbstractClassNode.prototype = new AbstractNode();
    AbstractClassNode.prototype.constructor = AbstractClassNode;
    /**
     * Abstract Class Node
     * @class canvas_widget.AbstractClassNode
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
    function AbstractClassNode(id,left,top,width,height,zIndex, json){
        var that = this;

        AbstractNode.call(this,id,AbstractClassNode.TYPE,left,top,width,height,zIndex, json);

        /**
         * jQuery object of node template
         * @type {jQuery}
         * @private
         */
        var _$template = $(_.template(abstractClassNodeHtml,{type: that.getType()}));
        var _$browserNodeTemplate = _$template.clone().removeClass().append($(hintHtml));
        _$browserNodeTemplate.find('.label').empty();
        _$browserNodeTemplate.find('.type').removeClass().addClass('pb_type');

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = AbstractNode.prototype.get$node.call(this).append(_$template).addClass("class");
        var _$browserNode = AbstractNode.prototype.get$BrowserNode.call(this).append(_$browserNodeTemplate);

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
            json.type = AbstractClassNode.TYPE;
            return json;
        };

        var attr= new KeySelectionValueListAttribute("[attributes]","Attributes",this,{"string":"String","boolean":"Boolean","integer":"Integer","file":"File"});
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

        this.setContextMenuItemCallback(function(){
            return {
                convertTo: {
                    name: "Convert to..",
                    items: {
                        objectNode: {
                            name: "..Object",
                            callback: function(){
                                var canvas = that.getCanvas(),
                                    appearance = that.getAppearance(),
                                    nodeId;

                                //noinspection JSAccessibilityCheck
                                nodeId = canvas.createNode(require('vml/ObjectNode').TYPE,appearance.left,appearance.top,appearance.width,appearance.height,that.getZIndex(),that.toJSON());
                                var edges = that.getOutgoingEdges(),
                                    edge,
                                    edgeId;

                                for(edgeId in edges){
                                    if(edges.hasOwnProperty(edgeId)){
                                        edge = edges[edgeId];
                                        canvas.createEdge(edge.getType(),nodeId,edge.getTarget().getEntityId(),edge.toJSON());
                                    }
                                }

                                edges = that.getIngoingEdges();

                                for(edgeId in edges){
                                    if(edges.hasOwnProperty(edgeId)){
                                        edge = edges[edgeId];
                                        if(edge.getSource() !== edge.getTarget()){
                                            canvas.createEdge(edge.getType(),edge.getSource().getEntityId(),nodeId,edge.toJSON());
                                        }
                                    }
                                }

                                that.triggerDeletion();

                            }
                        },
                        relationshipNode: {
                            name: "..Relationship",
                            callback: function(){
                                var canvas = that.getCanvas(),
                                    appearance = that.getAppearance(),
                                    nodeId;

                                //noinspection JSAccessibilityCheck
                                nodeId = canvas.createNode(require('vml/RelationshipNode').TYPE,appearance.left,appearance.top,appearance.width,appearance.height,that.getZIndex(),that.toJSON());
                                var edges = that.getOutgoingEdges(),
                                    edge,
                                    edgeId;

                                for(edgeId in edges){
                                    if(edges.hasOwnProperty(edgeId)){
                                        edge = edges[edgeId];
                                        canvas.createEdge(edge.getType(),nodeId,edge.getTarget().getEntityId(),edge.toJSON());
                                    }
                                }

                                edges = that.getIngoingEdges();

                                for(edgeId in edges){
                                    if(edges.hasOwnProperty(edgeId)){
                                        edge = edges[edgeId];
                                        if(edge.getSource() !== edge.getTarget()){
                                            canvas.createEdge(edge.getType(),edge.getSource().getEntityId(),nodeId,edge.toJSON());
                                        }
                                    }
                                }

                                that.triggerDeletion();

                            }
                        },
                        relationshipGroupNode: {
                            name: "..Relationship Group",
                            callback: function(){
                                var canvas = that.getCanvas(),
                                    appearance = that.getAppearance(),
                                    nodeId;

                                //noinspection JSAccessibilityCheck
                                nodeId = canvas.createNode(require('vml/RelationshipGroupNode').TYPE,appearance.left,appearance.top,appearance.width,appearance.height,that.getZIndex(),that.toJSON());
                                var edges = that.getOutgoingEdges(),
                                    edge,
                                    edgeId;

                                for(edgeId in edges){
                                    if(edges.hasOwnProperty(edgeId)){
                                        edge = edges[edgeId];
                                        canvas.createEdge(edge.getType(),nodeId,edge.getTarget().getEntityId(),edge.toJSON());
                                    }
                                }

                                edges = that.getIngoingEdges();

                                for(edgeId in edges){
                                    if(edges.hasOwnProperty(edgeId)){
                                        edge = edges[edgeId];
                                        if(edge.getSource() !== edge.getTarget()){
                                            canvas.createEdge(edge.getType(),edge.getSource().getEntityId(),nodeId,edge.toJSON());
                                        }
                                    }
                                }

                                that.triggerDeletion();

                            }
                        }
                    }
                },
                sep: "---------"
            };

        });

    }

    return AbstractClassNode;

});