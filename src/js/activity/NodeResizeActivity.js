/* global define */
define([
    'jqueryui',
    'lodash',
    'activity/Activity',
    'activity/ValueChangeActivity',
    'operations/ot/NodeResizeOperation',
    'operations/non_ot/ActivityOperation'
],/** @lends NodeResizeActivity */function($,_,Activity,ValueChangeActivity,NodeResizeOperation,ActivityOperation) {

    NodeResizeActivity.TYPE = "NodeResizeActivity";

    NodeResizeActivity.prototype = new Activity();
    NodeResizeActivity.prototype.constructor = NodeResizeActivity;
    /**
     * Activity representing the resizing of a node
     * @class activity.NodeResizeActivity
     * @memberof activity
     * @extends activity.Activity
     * @param {string} entityId Entity id of the entity this activity works on
     * @param {string} sender JabberId of the user who issued this activity
     * @param {string} text Text of this activity which is displayed in the activity widget
     * @param {string} nodeType Type of the created node
     * @constructor
     */
    function NodeResizeActivity(entityId,sender,text){
        Activity.call(this,entityId,sender,text);
    }
    return NodeResizeActivity;
});
