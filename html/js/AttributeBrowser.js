/*global define*/
define([],/** @lends AttributeBrowser */function () {

    /**
     * AttributeBrowser
     * @class canvas_widget.AttributeBrowser
     * @memberof canvas_widget
     * @constructor
     * @param {jQuery} $node jquery Selector of wrapper node
     */
    function AttributeBrowser($node) {
        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $node;

        /**
         * Entity currently selected
         * @type {canvas_widget.AbstractNode|AbstractEdge}
         * @private
         */
        var _selectedEntity = null;

        /**
         * Model attributes
         * @type {canvas_widget.ModelAttributesNode}
         * @private
         */
        var _modelAttributesNode = null;

        /**
         * Get jQuery object of DOM node representing the node
         * @returns {jQuery}
         */
        this.get$node = function () {
            return _$node;
        };

        /**
         * Set model attributes
         * @param node {attribute_widget.ModelAttributesNode}
         */
        this.setModelAttributesNode = function (node) {
            _modelAttributesNode = node;
        };

        /**
         * Get model Attributes
         * @returns {attribute_widget.ModelAttributesNode}
         */
        this.getModelAttributesNode = function () {
            return _modelAttributesNode;
        };

        /**
         * Select an entity
         * @param {attribute_widget.AbstractNode|attribute_widget.AbstractEdge} entity
         */
        this.select = function (entity) {
            if (_selectedEntity != entity) {
                if (_selectedEntity) _selectedEntity.unselect();
                if (entity) entity.select();
                _selectedEntity = entity;
            }
        };

     
        this.select(_modelAttributesNode);
    }

    return AttributeBrowser;

});