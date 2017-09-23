define([
    'jqueryui',
    'jsplumb',
    'AbstractCanvasTool',
    'EntityManager'
],/** @lends MoveTool */function($, jsPlumb, AbstractCanvasTool, EntityManager) {

    MoveTool.TYPE = "MoveTool";

    MoveTool.prototype = new AbstractCanvasTool();
    MoveTool.prototype.constructor = MoveTool;
    /**
     * MoveTool
     * @class canvas_widget.MoveTool
     * @extends canvas_widget.AbstractCanvasTool
     * @memberof canvas_widget
     * @constructor
     */
    function MoveTool() {

        AbstractCanvasTool.call(this, MoveTool.TYPE, "tool-move", "Move Nodes and Edges", "arrow.png", "rgba(0, 0, ,0, 0)");

        /**
         * Mount the tool on canvas
         */
        this.mount = function() {
            var that = this;

            AbstractCanvasTool.prototype.mount.call(this);
            this.getCanvas().bindMoveToolEvents();
        };

        /**
         * Unmount the tool from canvas
         */
        this.unmount = function() {
            AbstractCanvasTool.prototype.unmount.call(this);
            this.getCanvas().unbindMoveToolEvents();
        };

    }

    return MoveTool;

});