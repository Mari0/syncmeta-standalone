/* global define, y, Y, CONFIG */
define([
    'require',
    'jqueryui',
    'jsplumb',
    'lodash',
    'Util',
    'operations/ot/NodeDeleteOperation',
    'operations/ot/NodeMoveOperation',
    'operations/ot/NodeMoveZOperation',
    'operations/ot/NodeResizeOperation',
    'operations/non_ot/ActivityOperation',
    'AbstractEntity',
    'attribute/SingleValueAttribute',
    'HistoryManager',
    'text!../../templates/abstract_node.html',
    'text!../../templates/awareness_trace.html',
    'jquery.transformable-PATCHED'
],/** @lends AbstractNode */function (require, $, jsPlumb, _, Util, NodeDeleteOperation, NodeMoveOperation, NodeMoveZOperation, NodeResizeOperation, ActivityOperation, AbstractEntity, SingleValueAttribute, HistoryManager, abstractNodeHtml, awarenessTraceHtml) {

    AbstractNode.prototype = new AbstractEntity();
    AbstractNode.prototype.constructor = AbstractNode;
    /**
     * AbstractNode
     * @class canvas_widget.AbstractNode
     * @extends canvas_widget.AbstractEntity
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier of node
     * @param {string} type Type of node
     * @param {number} left x-coordinate of node position
     * @param {number} top y-coordinate of node position
     * @param {number} width Width of node
     * @param {number} height Height of node
     * @param {number} zIndex Position of node on z-axis
     */
    function AbstractNode(id, type, left, top, width, height, zIndex, json) {
        var that = this;


        /**y-map instances which belongs to the node
         * @type {Y.Map}
         * @private
         * */
        var _ymap = null;
        if (window.hasOwnProperty("y")) {
            if (y.share.nodes.keys().indexOf(id) != -1) {
                _ymap = y.share.nodes.get(id);
            }
            else {
                _ymap = y.share.nodes.set(id, Y.Map);
                _ymap.set('left', left);
                _ymap.set('top', top);
                _ymap.set('width', width);
                _ymap.set('height', height);
                _ymap.set('zIndex', zIndex);
                _ymap.set('type', type);
                _ymap.set('id', id);
                if (json) _ymap.set('json', json);
                _ymap.set('jabberId', y.share.users.get(y.db.userId));
            }
        }
        this.getYMap = function () {
            return _ymap;
        };
        AbstractEntity.call(this, id);

        /**
         * Type of node
         * @type {string}
         * @private
         */
        var _type = type;

        /**
         * Label of edge
         * @type {canvas_widget.SingleValueAttribute}
         * @private
         */
        var _label = new SingleValueAttribute(id + "[label]", "Label", this);

        /**
         * Appearance information of edge
         * @type {{left: number, top: number, width: number, height: number}}
         * @private
         */
        var _appearance = {
            left: left,
            top: top,
            width: width,
            height: height
        };

        /**
         * Position of node on z-axis
         * @type {number}
         * @private
         */
        var _zIndex = zIndex;

        /**
         * Canvas the node is drawn on
         * @type {canvas_widget.AbstractCanvas}
         * @private
         */
        var _canvas = null;

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$canvasNode = $(_.template(abstractNodeHtml, { id: id }));
        var _$browserNode = _$canvasNode.clone().removeClass().removeAttr('id').addClass(id).css('display', 'none').css('margin-left', 30);

        var _$awarenessTrace = $(_.template(awarenessTraceHtml, { id: id + "_awareness" }));

        var _awarenessTimer = setInterval(function () {
            var opacity = _$awarenessTrace.css("opacity");
            opacity -= 0.1;
            if (opacity < 0)
                opacity = 0;
            _$awarenessTrace.css({
                opacity: opacity
            });
        }, 3000);


        /**
         * Attributes of node
         * @type {Object}
         * @private
         */
        var _attributes = {};

        /**
         * Callback to generate list of context menu items
         * @type {function}
         */
        var _contextMenuItemCallback = function () { return {}; };

        /**
         * Set of ingoing edges
         * @type {Object}
         * @private
         */
        var _ingoingEdges = {};

        /**
         * Set of outgoing edges
         * @type {Object}
         * @private
         */
        var _outgoingEdges = {};

        /**
         * Set of nodes with an edge to the node
         * @type {Object}
         * @private
         */
        var _ingoingNeighbors = {};

        /**
         * Set of nodes with an edge from the node
         * @type {Object}
         * @private
         */
        var _outgoingNeighbors = {};

        var _relatedGhostEdges = [];

        /**
         * Apply a Node Move Operation
         * @param {operations.ot.NodeMoveOperation} operation
         */
        var processNodeMoveOperation = function (operation) {
            _canvas.hideGuidanceBox();
            that.move(operation.getOffsetX(), operation.getOffsetY(), 0);
            _canvas.showGuidanceBox();

        };

        /**
         * Apply a Node Move Z Operation
         * @param {operations.ot.NodeMoveZOperation} operation
         */
        var processNodeMoveZOperation = function (operation) {
            that.move(0, 0, operation.getOffsetZ());
        };

        /**
         * Propagate a Node Move Operation to the remote users and the local widgets
         * @param {operations.ot.NodeMoveOperation} operation
         */
        this.propagateNodeMoveOperation = function (operation) {
            operation.setJabberId(y.share.users.get(y.db.userId));
            processNodeMoveOperation(operation);
            that.getCanvas().getHeatMap().processOperation(operation);
            HistoryManager.add(operation);
            $('#save').click();

            hideTraceAwareness();

            y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                "NodeMoveActivity",
                operation.getEntityId(),
                operation.getJabberId(),
                NodeMoveOperation.getOperationDescription(that.getType(), that.getLabel().getValue().getValue()),
                { nodeType: that.getType() }
            ).toJSON());

            if (_ymap) {
                _ymap.set(NodeMoveOperation.TYPE, operation.toJSON());
            }


        };

        /**
         * Propagate a Node Move Z Operation to the remote users and the local widgets
         * @param {operations.ot.NodeMoveZOperation} operation
         */
        this.propagateNodeMoveZOperation = function (operation) {
            var jabberId = y.share.users.get(y.db.userId);
            operation.setJabberId(jabberId);
            processNodeMoveZOperation(operation);
            HistoryManager.add(operation);
            hideTraceAwareness();
            y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                "NodeMoveActivity",
                operation.getEntityId(),
                jabberId,
                NodeMoveOperation.getOperationDescription(that.getType(), that.getLabel().getValue().getValue()),
                { nodeType: that.getType() }
            ).toJSON());

            if (_ymap)
                _ymap.set(NodeMoveZOperation.TYPE, operation.toJSON());
        };

        /**
         * Apply a Node Resize Operation
         * @param {operations.ot.NodeResizeOperation} operation
         */
        var processNodeResizeOperation = function (operation) {
            _canvas.hideGuidanceBox();
            that.resize(operation.getOffsetX(), operation.getOffsetY());
            _canvas.showGuidanceBox();
        };

        /**
         * Propagate a Node Resize Operation to the remote users and the local widgets
         * @param {operations.ot.NodeResizeOperation} operation
         */
        this.propagateNodeResizeOperation = function (operation) {
            operation.setJabberId(y.share.users.get(y.db.userId));
            processNodeResizeOperation(operation);
            that.getCanvas().getHeatMap().processOperation(operation);
            HistoryManager.add(operation);
            $('#save').click();
            hideTraceAwareness();
            y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                "NodeResizeActivity",
                operation.getEntityId(),
                operation.getJabberId(),
                NodeResizeOperation.getOperationDescription(that.getType(), that.getLabel().getValue().getValue()),
                { nodeType: that.getType() }
            ).toJSON());

            if (_ymap)
                _ymap.set('NodeResizeOperation', operation.toJSON());
        };

        /**
         * Apply a Node Delete Operation
         * @param {operations.ot.NodeDeleteOperation} operation
         */
        var processNodeDeleteOperation = function () {
            var edges = that.getEdges(),
                edgeId,
                edge;

            for (edgeId in edges) {
                if (edges.hasOwnProperty(edgeId)) {
                    edge = edges[edgeId];
                    edge.remove();
                }
            }

            for (var i = 0; i < _relatedGhostEdges.length; i++) {
                if (typeof _relatedGhostEdges[i].remove == "function")
                    _relatedGhostEdges[i].remove();
            }
            if (_ymap) {
                _ymap = null;
            }
            that.remove();
        };

        /**
         * Propagate a Node Delete Operation to the remote users and the local widgets
         * @param {operations.ot.NodeDeleteOperation} operation
         */
        var propagateNodeDeleteOperation = function (operation) {
            processNodeDeleteOperation(operation);
            $('#save').click();
            y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                "NodeDeleteActivity",
                operation.getEntityId(),
                y.share.users.get(y.db.userId),
                NodeDeleteOperation.getOperationDescription(that.getType(), that.getLabel().getValue().getValue()),
                {}
            ).toJSON());

        };

        var refreshTraceAwareness = function (color) {
            _$awarenessTrace.css({
                opacity: 1,
                fill: color
            });
        };

        var hideTraceAwareness = function () {
            _$awarenessTrace.css({
                opacity: 0
            });
        };

        /**
         * Callback for a remote Node Move Operation
         * @param {operations.ot.NodeMoveOperation} operation
         */
        var remoteNodeMoveCallback = function (operation) {
            if (operation instanceof NodeMoveOperation && operation.getEntityId() === that.getEntityId()) {
                if (y.share.users.get(y.db.userId) !== operation.getJabberId()) {
                    var color = Util.getColor(y.share.userList.get(operation.getJabberId()).globalId);
                    refreshTraceAwareness(color);
                }

                processNodeMoveOperation(operation);
                that.getCanvas().getHeatMap().processOperation(operation);
            }
        };

        /**
         * Callback for a remote Node Move Z Operation
         * @param {operations.ot.NodeMoveZOperation} operation
         */
        var remoteNodeMoveZCallback = function (operation) {
            if (operation instanceof NodeMoveZOperation && operation.getEntityId() === that.getEntityId()) {
                if (y.share.users.get(y.db.userId) !== operation.getJabberId()) {
                    var color = Util.getColor(y.share.userList.get(operation.getJabberId()).globalId);
                    refreshTraceAwareness(color);
                }
                processNodeMoveZOperation(operation);
            }
        };

        /**
         * Callback for a remote Node Resize Operation
         * @param {operations.ot.NodeResizeOperation} operation
         */
        var remoteNodeResizeCallback = function (operation) {
            if (operation instanceof NodeResizeOperation && operation.getEntityId() === that.getEntityId()) {
                if (y.share.users.get(y.db.userId) !== operation.getJabberId()) {
                    var color = Util.getColor(y.share.userList.get(operation.getJabberId()).globalId);
                    refreshTraceAwareness(color);
                }
                processNodeResizeOperation(operation);
                that.getCanvas().getHeatMap().processOperation(operation);
            }
        };

        /**
         * Callback for a remote Node Delete Operation
         * @param {operations.ot.NodeDeleteOperation} operation
         */
        this.remoteNodeDeleteCallback = function (operation) {
            if (operation instanceof NodeDeleteOperation && operation.getEntityId() === that.getEntityId()) {
                that.getCanvas().getHeatMap().processOperation(operation);
                processNodeDeleteOperation(operation);
                HistoryManager.clean(operation.getEntityId());
            }
        };

        this.init = function () {
            //Define Node Rightclick Menu
            $.contextMenu({
                selector: "#" + id,
                zIndex: AbstractEntity.CONTEXT_MENU_Z_INDEX,
                build: function (/*$trigger, e*/) {
                    var menuItems;
                    var EntityManager = require('EntityManager');

                    if (_canvas.getSelectedEntity() === null || _canvas.getSelectedEntity() === that) {
                        menuItems = _.extend(_contextMenuItemCallback(), {
                            connectTo: EntityManager.generateConnectToMenu(that),
                            sepMove: "---------",
                            moveToForeground: {
                                name: "Move to Foreground",
                                callback: function (/*key, opt*/) {
                                    that.propagateNodeMoveZOperation(new NodeMoveZOperation(that.getEntityId(), ++AbstractEntity.maxZIndex - _zIndex));
                                }
                            },
                            moveToBackground: {
                                name: "Move to Background",
                                callback: function (/*key, opt*/) {
                                    that.propagateNodeMoveZOperation(new NodeMoveZOperation(that.getEntityId(), --AbstractEntity.minZIndex - _zIndex));
                                }
                            },
                            sepDelete: "---------",
                            delete: {
                                name: "Delete",
                                callback: function (/*key, opt*/) {
                                    that.triggerDeletion();
                                }
                            },
                            quit: {
                                name: ' ',
                                disabled: true
                            }
                        });

                        return {
                            items: menuItems,
                            events: {
                                show: function (/*opt*/) {
                                    _canvas.select(that);
                                }
                            }
                        };
                    } else {
                        _canvas.select(null);
                        return false;
                    }

                }
            });

            //Property Browser: click event to show/hide the list of possible connections
            _$browserNode.find('.show_hint a').click(function (e) {
                var $this = $(this),
                    $hint = _$browserNode.find('.hint');

                e.preventDefault();
                if ($hint.is(":visible")) {
                    $hint.hide();
                    $this.text('Show list of possible connections');
                } else {
                    $hint.show();
                    $this.text('Hide list of possible connections');
                }
            }).text('Show list of possible connections');
            _$browserNode.find('.hint').hide();

        };

        /**
         * Triggers jsPlumb's repaint function and adjusts the angle of the edge labels
         */
        var repaint = function () {
            //var edgeId,
            //    edges = that.getEdges();
            jsPlumb.repaint(_$canvasNode);
            /*for(edgeId in edges){
             if(edges.hasOwnProperty(edgeId)){
             edges[edgeId].repaintOverlays();
             edges[edgeId].setZIndex();
             }
             }*/
            _.each(require('EntityManager').getEdges(), function (e) { e.setZIndex(); });
        };

        /**
         * Anchor options for new connections
         * @type {object}
         */
        var _anchorOptions = ["Perimeter", { shape: "Rectangle", anchorCount: 10 }];

        /**
         * Get options for new connections
         * @returns {Object}
         */
        this.getAnchorOptions = function () {
            return _anchorOptions;
        };

        /**
         * Send NodeDeleteOperation for node
         */
        this.triggerDeletion = function (historyFlag) {
            var edgeId,
                edges = this.getEdges(),
                edge;
            _canvas.select(null);
            for (edgeId in edges) {
                if (edges.hasOwnProperty(edgeId)) {
                    edge = edges[edgeId];
                    edge.triggerDeletion();
                }
            }
            var operation = new NodeDeleteOperation(id, that.getType(), _appearance.left, _appearance.top, _appearance.width, _appearance.height, _zIndex, that.toJSON());
            that.getCanvas().getHeatMap().processOperation(operation);
            if (_ymap) {
                propagateNodeDeleteOperation(operation);
                y.share.nodes.delete(that.getEntityId());
            }
            else {
                propagateNodeDeleteOperation(operation);
            }
            if (!historyFlag)
                HistoryManager.add(operation);
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get callback to generate list of context menu items
         * @returns {object}
         */
        this.getContextMenuItemCallback = function () {
            return _contextMenuItemCallback;
        };

        /**
         * Set callback to generate list of context menu items
         * @param {function} contextMenuItemCallback
         */
        this.setContextMenuItemCallback = function (contextMenuItemCallback) {
            if (typeof contextMenuItemCallback === 'function') {
                _contextMenuItemCallback = contextMenuItemCallback;
            }
        };

        /**
         * Get node appearance
         * @returns {{left: number, top: number, width: number, height: number}}
         */
        this.getAppearance = function () {
            return _appearance;
        };

        /**
         * Get position of node on z-axis
         * @return {number}
         */
        this.getZIndex = function () {
            return _zIndex;
        };

        this.refreshTraceAwareness = function (color) {
            refreshTraceAwareness(color);
        };

        /**
         * Adds node to canvas
         * @param {canvas_widget.AbstractCanvas} canvas
         */
        this.addToCanvas = function (canvas) {
            _canvas = canvas;
            canvas.get$canvas().append(_$awarenessTrace);
            canvas.get$canvas().append(_$canvasNode);
            //Add to attribute browser
            var attributeBrowser = canvas.getAttributeBrowser();
            attributeBrowser.get$node().append(_$browserNode);
        };

        /**
         * Get associated canvas
         * @returns {canvas_widget.AbstractCanvas}
         */
        this.getCanvas = function () {
            return _canvas;
        };

        /**
         * Removes node from canvas
         */
        this.removeFromCanvas = function () {
            _$canvasNode.remove();
            //destroy the context menu
            $.contextMenu('destroy', '#' + that.getEntityId());
            _canvas = null;
            _$awarenessTrace.remove();
        };

        /**
         * Add attribute to node
         * @param {canvas_widget.AbstractAttribute} attribute
         */
        this.addAttribute = function (attribute) {
            var id = attribute.getEntityId();
            if (!_attributes.hasOwnProperty(id)) {
                _attributes[id] = attribute;
            }
        };

        /**
         * Get attribute by id
         * @param {String} id Attribute's entity id
         * @returns {canvas_widget.AbstractAttribute}
         */
        this.getAttribute = function (id) {
            if (_attributes.hasOwnProperty(id)) {
                return _attributes[id];
            }
            return null;
        };

        /**
         * Delete attribute by id
         * @param {String} id Attribute's entity id
         */
        this.deleteAttribute = function (id) {
            if (_attributes.hasOwnProperty(id)) {
                delete _attributes[id];
            }
        };

        /**
         * Set node's attributes
         * @param {Object} attributes
         */
        this.setAttributes = function (attributes) {
            _attributes = attributes;
        };

        /**
         * Get node's attributes
         * @returns {Object}
         */
        this.getAttributes = function () {
            return _attributes;
        };

        /**
         * Set edge label
         * @param {canvas_widget.SingleValueAttribute} label
         */
        this.setLabel = function (label) {
            _label = label;
        };

        /**
         * Get edge label
         * @returns {canvas_widget.SingleValueAttribute}
         */
        this.getLabel = function () {
            return _label;
        };

        /**
         * Get edge type
         * @returns {string}
         */
        this.getType = function () {
            return _type;
        };

        /**
         * Get jQuery object of DOM node representing the node in the canvas
         * @returns {jQuery}
         * @private
         */
        this._get$canvasNode = function () {
            return _$canvasNode;
        };

        /**
         * Get jQuery object of DOM node representing the node in the property browser
         * @returns {jQuery}
         * @private
         */
        this._get$browserNode = function () {
            return _$browserNode;
        };

        /**
         * Apply position and dimension attributes to the node
         * @private
         */
        this._draw = function () {
            //noinspection JSAccessibilityCheck
            _$awarenessTrace.css({
                left: _appearance.left + _appearance.width / 2,
                top: _appearance.top + _appearance.height / 2,
                width: _appearance.width * 1.2,
                height: _appearance.height * 1.2,
                zIndex: _zIndex - 1
            });
            _$canvasNode.css({
                left: _appearance.left,
                top: _appearance.top,
                width: _appearance.width,
                height: _appearance.height,
                zIndex: _zIndex
            });
        };

        /**
         * Move the node
         * @param {number} offsetX Offset in x-direction
         * @param {number} offsetY Offset in y-direction
         * @param {number} offsetZ Offset in z-direction
         */
        this.move = function (offsetX, offsetY, offsetZ) {
            _appearance.left += offsetX;
            _appearance.top += offsetY;

            _zIndex += offsetZ;

            if (_ymap) {
                _ymap.set('left', _appearance.left);
                _ymap.set('top', _appearance.top);
                _ymap.set('zIndex', _zIndex);
            }
            this._draw();
            repaint();
        };

        /**
         * Resize the node
         * @param {number} offsetX Offset in x-direction
         * @param {number} offsetY Offset in y-direction
         */
        this.resize = function (offsetX, offsetY) {
            _appearance.width += offsetX;
            _appearance.height += offsetY;
            if (_ymap) {
                _ymap.set('width', _appearance.width);
                _ymap.set('height', _appearance.height);
            }
            this._draw();
            repaint();
        };

        /**
         * Add ingoing edge
         * @param {canvas_widget.AbstractEdge} edge
         */
        this.addIngoingEdge = function (edge) {
            var id = edge.getEntityId();
            var source = edge.getSource();
            var sourceEntityId = source.getEntityId();
            if (!_ingoingEdges.hasOwnProperty(id)) {
                _ingoingEdges[id] = edge;
                if (!_ingoingNeighbors.hasOwnProperty(sourceEntityId)) {
                    _ingoingNeighbors[sourceEntityId] = source;
                }
            }
        };

        /**
         * Add outgoing edge
         * @param {canvas_widget.AbstractEdge} edge
         */
        this.addOutgoingEdge = function (edge) {
            var id = edge.getEntityId();
            var target = edge.getTarget();
            var targetEntityId = target.getEntityId();
            if (!_outgoingEdges.hasOwnProperty(id)) {
                _outgoingEdges[id] = edge;
                if (!_outgoingNeighbors.hasOwnProperty(targetEntityId)) {
                    _outgoingNeighbors[targetEntityId] = target;
                }
            }
        };

        /**
         * Delete ingoing edge
         * @param {canvas_widget.AbstractEdge} edge
         */
        this.deleteIngoingEdge = function (edge) {
            var id = edge.getEntityId();
            var source = edge.getSource();
            var sourceEntityId = source.getEntityId();
            var isMultiEdge = false;
            if (_ingoingEdges.hasOwnProperty(id)) {
                delete _ingoingEdges[id];
                for (var edgeId in _ingoingEdges) {
                    if (_ingoingEdges.hasOwnProperty(edgeId) && _ingoingEdges[edgeId].getSource().getEntityId() === sourceEntityId) {
                        isMultiEdge = true;
                    }
                }
                if (!isMultiEdge) {
                    delete _ingoingNeighbors[sourceEntityId];
                }
            }
        };

        /**
         * Delete outgoing edge
         * @param {canvas_widget.AbstractEdge} edge
         */
        this.deleteOutgoingEdge = function (edge) {
            var id = edge.getEntityId();
            var target = edge.getTarget();
            var targetEntityId = target.getEntityId();
            var isMultiEdge = false;
            if (_outgoingEdges.hasOwnProperty(id)) {
                delete _outgoingEdges[id];
                for (var edgeId in _outgoingEdges) {
                    if (_outgoingEdges.hasOwnProperty(edgeId) && _outgoingEdges[edgeId].getTarget().getEntityId() === targetEntityId) {
                        isMultiEdge = true;
                    }
                }
                if (!isMultiEdge) {
                    delete _outgoingNeighbors[targetEntityId];
                }
            }
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get ingoing edges
         * @returns {Object}
         */
        this.getIngoingEdges = function () {
            return _ingoingEdges;
        };

        /**
         * Get outgoing edges
         * @returns {Object}
         */
        this.getOutgoingEdges = function () {
            return _outgoingEdges;
        };

        /**
         * Get all ingoing and outgoing edges
         * @returns {Array}
         */
        this.getEdges = function () {
            return Util.union(_ingoingEdges, _outgoingEdges);
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get neighbors with an edge to the node
         * @returns {Object}
         */
        this.getIngoingNeighbors = function () {
            return _ingoingNeighbors;
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get neighbors with an edge from the node
         * @returns {Object}
         */
        this.getOutgoingNeighbors = function () {
            return _outgoingNeighbors;
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Get neighbors with an edge to or from the node
         * @returns {Object}
         */
        this.getNeighbors = function () {
            return Util.union(_ingoingNeighbors, _outgoingNeighbors);
        };

        /**
         * Lowlight the node
         */
        this.lowlight = function () {
            _$canvasNode.addClass('lowlighted');
        };

        /**
         * Unlowlight the node
         */
        this.unlowlight = function () {
            _$canvasNode.removeClass('lowlighted');
        };

        /**
         * Select the node
         */
        this.select = function () {
            this.unhighlight();
            _$canvasNode.addClass("selected");

            //select node on property browser
            _$browserNode.show();
            var connectToText = require('EntityManager').generateConnectToText(this);
            _$browserNode.find('.hint').html(connectToText).hide();
            _$browserNode.find('.show_hint').toggle(connectToText !== "");

            Util.delay(100).then(function () {
                _.each(require('EntityManager').getEdges(), function (e) {
                    e.setZIndex();
                });
            });
        };

        /**
         * Unselect the node
         */
        this.unselect = function () {
            //this.highlight(_highlightColor,_highlightUsername);
            _$canvasNode.removeClass("selected");
            _$browserNode.hide();
            //tigger save when unselecting an entity
            $('#save').click();
            Util.delay(100).then(function () {
                _.each(require('EntityManager').getEdges(), function (e) {
                    e.setZIndex();
                });
            });
        };

        /**
         * Highlight the node by assigning it the passed color and label it with the passed username
         * @param {String} color
         * @param {String} username
         */
        this.highlight = function (color, username) {
            //unhighlight everything else
            //$('.node:not(.selected)').css({border: "2px solid transparent"});
            //$('.user_highlight').remove();
            if (color && username) {
                _$canvasNode.css({ border: "2px solid " + color });
                _$canvasNode.append($('<div></div>').addClass('user_highlight').css('color', color).text(username));
                Util.delay(100).then(function () { _.each(require('EntityManager').getEdges(), function (e) { e.setZIndex(); }); });
            }
        };

        /**
         * Unhighlight the node
         */
        this.unhighlight = function () {
            _$canvasNode.css({ border: "" });
            _$canvasNode.find('.user_highlight').remove();
            Util.delay(100).then(function () {
                var EntityManager = null;
                try {
                    EntityManager = require('EntityManager');
                    _.each(EntityManager.getEdges(), function (e) {
                        e.setZIndex();
                    });
                }
                catch (error) {
                    require(['EntityManager'], function (EntityManager) {
                        _.each(EntityManager.getEdges(), function (e) {
                            e.setZIndex();
                        });
                    });
                }

            });
        };

        /**
         * Remove the node
         */
        this.remove = function () {
            clearInterval(_awarenessTimer);
            this.removeFromCanvas();
            require('EntityManager').deleteNode(this.getEntityId());
        };

        /**
         * Get JSON representation of the node
         * @returns {Object}
         * @private
         */
        this._toJSON = function () {
            var attr = {};
            _.forEach(this.getAttributes(), function (val, key) {
                attr[key] = val.toJSON();
            });
            //noinspection JSAccessibilityCheck
            return {
                label: _label.toJSON(),
                left: _appearance.left,
                top: _appearance.top,
                width: _appearance.width,
                height: _appearance.height,
                zIndex: _zIndex,
                type: _type,
                attributes: attr
            };
        };

        this.addGhostEdge = function (ghostEdge) {
            _relatedGhostEdges.push(ghostEdge);
        };

        /**
         * Bind events for move tool
         */
        this.bindMoveToolEvents = function () {

            //$canvas.find(".node.ui-draggable").draggable("option","disabled",false);
            var originalPos = {
                left: 0,
                top: 0
            };

            //Enable Node Selection
            var drag = false;
            var $sizePreview = $("<div class=\"size-preview\"></div>").hide();
            _$canvasNode.on("click", function () {
                _canvas.select(that);
            })
                //Enable Node Resizing
                .resizable({
                    containment: "parent",
                    start: function (ev/*,ui*/) {
                        _canvas.hideGuidanceBox();
                        $sizePreview.show();
                        _$canvasNode.css({ opacity: 0.5 });
                        _$canvasNode.append($sizePreview);
                        _$canvasNode.resizable("option", "aspectRatio", ev.shiftKey);
                        _$canvasNode.resizable("option", "grid", ev.ctrlKey ? [20, 20] : '');
                    },
                    resize: function (ev, ui) {
                        _canvas.hideGuidanceBox();
                        $sizePreview.text(Math.round(ui.size.width) + "x" + Math.round(ui.size.height));
                        repaint();
                        _$canvasNode.resizable("option", "aspectRatio", ev.shiftKey);
                        _$canvasNode.resizable("option", "grid", ev.ctrlKey ? [20, 20] : '');
                    },
                    stop: function (ev, ui) {
                        $sizePreview.hide();
                        _$canvasNode.css({ opacity: '' });
                        var $target = ui.helper;
                        $target.css({ width: ui.originalSize.width, height: ui.originalSize.height });
                        var offsetX = ui.size.width - ui.originalSize.width;
                        var offsetY = ui.size.height - ui.originalSize.height;
                        var operation = new NodeResizeOperation(id, offsetX, offsetY);
                        that.propagateNodeResizeOperation(operation);
                        _$canvasNode.resizable("option", "aspectRatio", false);
                        _$canvasNode.resizable("option", "grid", '');

                        //TODO: check that! Already called in processNodeResizeOperation called by propagateNodeResizeOperation
                        //_canvas.showGuidanceBox();
                    }
                })

                //Enable Node Dragging
                .draggable({
                    containment: 'parent',
                    start: function (ev, ui) {
                        originalPos.top = ui.position.top;
                        originalPos.left = ui.position.left;
                        //ui.position.top = 0;
                        //ui.position.left = 0;
                        _canvas.select(that);
                        _canvas.hideGuidanceBox();
                        _$canvasNode.css({ opacity: 0.5 });
                        _$canvasNode.resizable("disable");
                        drag = false;
                        _$canvasNode.draggable("option", "grid", ev.ctrlKey ? [20, 20] : '');
                    },
                    drag: function (ev) {
                        // ui.position.left = Math.round(ui.position.left  / _canvas.getZoom());
                        // ui.position.top = Math.round(ui.position.top / _canvas.getZoom());

                        if (drag) repaint();
                        drag = true;

                        _canvas.hideGuidanceBox();
                        _$canvasNode.draggable("option", "grid", ev.ctrlKey ? [20, 20] : '');
                    },
                    stop: function (ev, ui) {
                        _$canvasNode.css({ opacity: '' });
                        _$canvasNode.resizable("enable");
                        var id = _$canvasNode.attr("id");
                        //_$node.css({top: originalPos.top / _canvas.getZoom(), left: originalPos.left / _canvas.getZoom()});
                        var offsetX = Math.round((ui.position.left - originalPos.left) / _canvas.getZoom());
                        var offsetY = Math.round((ui.position.top - originalPos.top) / _canvas.getZoom());
                        var operation = new NodeMoveOperation(id, offsetX, offsetY);
                        that.propagateNodeMoveOperation(operation);

                        //Avoid node selection on drag stop
                        _$canvasNode.draggable("option", "grid", '');
                        _canvas.showGuidanceBox();
                        $(ev.toElement).one('click', function (ev) { ev.stopImmediatePropagation(); });
                    }
                })

                //Enable Node Rightclick menu
                .contextMenu(true)

                .transformable({
                    rotatable: false,
                    skewable: false,
                    scalable: false
                })

                .find("input").prop("disabled", false).css('pointerEvents', '');

        };

        /**
         * Unbind events for move tool
         */
        this.unbindMoveToolEvents = function () {
            //Disable Node Selection
            _$canvasNode.off("click")

                //$canvas.find(".node.ui-draggable").draggable( "option", "disabled", true);

                //Disable Node Resizing
                .resizable().resizable("destroy")

                //Disable Node Draggin
                .draggable().draggable("destroy")

                //Disable Node Rightclick Menu
                .contextMenu(false)

                .transformable('destroy')

                .find("input").prop("disabled", true).css('pointerEvents', 'none');
        };

        /**
         * Bind source node events for edge tool
         */
        this.makeSource = function () {
            _$canvasNode.addClass("source");
            jsPlumb.makeSource(_$canvasNode, {
                connectorPaintStyle: { strokeStyle: "#aaaaaa", lineWidth: 2 },
                endpoint: "Blank",
                anchor: _anchorOptions,
                //maxConnections:1,
                uniqueEndpoint: false,
                deleteEndpointsOnDetach: true,
                onMaxConnections: function (info/*, originalEvent*/) {
                    console.log("element is ", info.element, "maxConnections is", info.maxConnections);
                }
            });
        };

        /**
         * Bind target node events for edge tool
         */
        this.makeTarget = function () {
            _$canvasNode.addClass("target");
            jsPlumb.makeTarget(_$canvasNode, {
                isTarget: false,
                endpoint: "Blank",
                anchor: _anchorOptions,
                uniqueEndpoint: false,
                //maxConnections:1,
                deleteEndpointsOnDetach: true,
                onMaxConnections: function (info/*, originalEvent*/) {
                    console.log("user tried to drop connection", info.connection, "on element", info.element, "with max connections", info.maxConnections);
                }
            });
        };

        /**
         * Unbind events for edge tool
         */
        this.unbindEdgeToolEvents = function () {
            _$canvasNode.removeClass("source target");
            jsPlumb.unmakeSource(_$canvasNode);
            jsPlumb.unmakeTarget(_$canvasNode);
        };

        that.init();

        this._registerYMap = function () {
            _ymap.observe(function (event) {
                var yUserId = event.object.map[event.name][0];

                if (y.db.userId !== yUserId || (event.value && event.value.historyFlag)) {
                    var operation;
                    var data = event.value;
                    var jabberId = y.share.users.get(yUserId);
                    switch (event.name) {
                        case NodeMoveOperation.TYPE:
                            {
                                operation = new NodeMoveOperation(data.id, data.offsetX, data.offsetY, jabberId);
                                remoteNodeMoveCallback(operation);
                                break;
                            }
                        case NodeMoveZOperation.TYPE:
                            {
                                operation = new NodeMoveZOperation(data.id, data.offsetZ, jabberId);
                                remoteNodeMoveZCallback(operation);
                                break;
                            }
                        case NodeResizeOperation.TYPE:
                            {
                                operation = new NodeResizeOperation(data.id, data.offsetX, data.offsetY, jabberId);
                                remoteNodeResizeCallback(operation);
                                break;
                            }
                    }
                }
            });
        };
    }

    /**
     * Apply position and dimension attributes to the node
     */
    AbstractNode.prototype.draw = function () {
        return this._draw();
    };

    /**
     * Get jQuery object of DOM node representing the node in the canvas
     * @returns {jQuery}
     */
    AbstractNode.prototype.get$canvasNode = function () {
        return this._get$canvasNode();
    };
    //TODO remove this if property browser implementation is finished
    AbstractNode.prototype.get$node = function () {
        return this._get$canvasNode();
    };
    /**
     * Get jQuery object of DOM node representing the node in the property browser
     * @returns {jQuery}
     */
    AbstractNode.prototype.get$BrowserNode = function () {
        return this._get$browserNode();
    };
    /**
     * Get JSON representation of the node
     * @returns {{label: Object, left: number, top: number, width: number, height: number, type: string, attributes: Object}}
     */
    AbstractNode.prototype.toJSON = function () {
        return this._toJSON();
    };

    /**
     * hide the node and all associated edges
     */
    AbstractNode.prototype.hide = function () {
        this.get$node().hide();
        jsPlumb.hide(this.get$node());
    };

    /**
     * show the node and all associated edges
     */
    AbstractNode.prototype.show = function () {
        this.get$node().show();
        jsPlumb.show(this.get$node()[0]);
        jsPlumb.repaint(this.get$node()[0]);
    };

    AbstractNode.prototype.registerYMap = function () {
        this._registerYMap();
    };

    return AbstractNode;

});