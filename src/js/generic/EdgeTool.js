/*global define, CONFIG*/
define([
    'jqueryui',
    'lodash',
    'jsplumb',
    'AbstractCanvasTool',
    'EntityManager'
],/** @lends AbstractAttribute */function($,_,jsPlumb,AbstractCanvasTool,EntityManager) {

    EdgeTool.prototype = new AbstractCanvasTool();
    EdgeTool.prototype.constructor = EdgeTool;
    /**
     * EdgeTool
     * @class canvas_widget.EdgeTool
     * @extends canvas_widget.AbstractCanvasTool
     * @memberof canvas_widget
     * @constructor
     * @param {string} name Name of tool
     * @param {string[]} relations Array of valid relations of node types the edge can connect
     * @param {string} [className] Class name assigned to canvas node when tool is mounted
     * @param {string} [description] Description of tool
     */
    function EdgeTool(name,relations,className,description, toolIcon, toolColor){

        AbstractCanvasTool.call(
            this,
            name,
            className||"tool-edge",
            description||"Add an edge",
            toolIcon||"path.png",
            toolColor||"#000000"
        );

        var _relations = relations;
        
        
        /**
         * Mount the tool on canvas
         */
        this.mount = function(){
           
            function makeNeighborhoodFilter(nodeId){
                return function(n){
                    return n.getEntityId() !== nodeId && !n.getNeighbors().hasOwnProperty(nodeId);
                };
            }

            function makeMakeTargetCallback(){
                return function(node){
                    node.makeTarget();
                    node.unlowlight();
                };
            }

            var that = this;

            AbstractCanvasTool.prototype.mount.call(this);

            var $canvas = this.getCanvas().get$canvas();

            //Bind Node Events
            var nodes = EntityManager.getNodes();
            var nodeId, node, nodeType, strGetNodesByType;
            var i, numOfRelations;

            for(nodeId in nodes){
                if(nodes.hasOwnProperty(nodeId)){
                    node = nodes[nodeId];
                    node.lowlight();
                    if(EntityManager.getViewId() === undefined || EntityManager.getLayer() === CONFIG.LAYER.META) {
                        nodeType = node.getType();
                        strGetNodesByType = 'getNodesByType';
                    }
                    else{
                        nodeType = node.getCurrentViewType();
                        strGetNodesByType = 'getNodesByViewType';
                    }
                    for(i = 0, numOfRelations = _relations.length; i < numOfRelations; i++){
                        if(relations[i].sourceTypes.indexOf(nodeType) !== -1){
                            if(_.size(_.filter(EntityManager[strGetNodesByType](relations[i].targetTypes),makeNeighborhoodFilter(node.getEntityId()))) > 0){
                                node.makeSource();
                                node.unbindMoveToolEvents();
                                node.unlowlight();
                                break;
                            }
                        }
                    }
                }
            }

            jsPlumb.bind("connectionDrag", function(info){
                var sourceNode = EntityManager.findNode(info.sourceId),
                    sourceType,
                    i,
                    numOfRelations,
                    strGetNodesByType;
                if(sourceNode){
                    if(EntityManager.getViewId() === undefined || EntityManager.getLayer() === CONFIG.LAYER.META) {
                        sourceType = sourceNode.getType();
                        strGetNodesByType = 'getNodesByType';
                    }
                    else{
                        sourceType = sourceNode.getCurrentViewType();
                        strGetNodesByType = 'getNodesByViewType';
                    }

                    for(i = 0, numOfRelations = _relations.length; i < numOfRelations; i++){
                        if(relations[i].sourceTypes.indexOf(sourceType) !== -1){
                            _.each(_.filter(EntityManager[strGetNodesByType](relations[i].targetTypes),makeNeighborhoodFilter(sourceNode.getEntityId())),makeMakeTargetCallback());
                        }
                    }
                }
                $(info.source).addClass("current");
                $canvas.addClass("dragging");
                return true;
            });
            jsPlumb.bind("beforeDrop",function(){
                $canvas.removeClass("dragging");
                $(".node.current").removeClass("current");
                return true;
            });
            jsPlumb.bind("connectionDetached",function(info){
                if(info.connection.pending){
                    $(".node.current").removeClass("current");
                    $canvas.removeClass("dragging");
                }
                return true;
            });

            jsPlumb.bind("connection", function(info,originalEvent) {
                if(typeof originalEvent !== 'undefined'){ //Was the connection established using Drag'n Drop?
                    jsPlumb.detach(info.connection,{fireEvent: false});
                    that.getCanvas().createEdge(that.getName(),info.sourceId,info.targetId);
                }
                return true;
            });

            $canvas.bind("contextmenu", function(ev){
                if(ev.target == this){
                    ev.preventDefault();
                    that.getCanvas().resetTool();
                    return false;
                }
                return true;
            });

            $canvas.find(".node").bind("contextmenu", function(ev){
                ev.preventDefault();
                that.getCanvas().resetTool();
                that.getCanvas().select(EntityManager.findNode($(this).attr("id")));
                return false;
            });
        };

        /**
         * Unmount the tool from canvas
         */
        this.unmount = function(){
            AbstractCanvasTool.prototype.unmount.call(this,arguments);

            var $canvas = this.getCanvas().get$canvas();

            //Unbind Node Events
            //TODO Not very nicely implemented. Iterates over all nodes again like it was in MoveTool
            var nodes = EntityManager.getNodes();
            var nodeId, node;
            for(nodeId in nodes){
                if(nodes.hasOwnProperty(nodeId)){
                    node = nodes[nodeId];
                    node.unlowlight();
                    node.unbindEdgeToolEvents();
                    node.bindMoveToolEvents();
                }
            }

            //Disable Edge Dragging
            $canvas.find(".node").each(function(){
                var $this = $(this);
                jsPlumb.unmakeSource($this);
                jsPlumb.unmakeTarget($this);
            });
            jsPlumb.unbind("connectionDrag");
            jsPlumb.unbind("beforeDrop");
            jsPlumb.unbind("connection");

            $canvas.unbind("contextmenu");
            $canvas.find(".node").unbind("contextmenu");
        };

    }

    return EdgeTool;

});