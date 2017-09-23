/* global define */
define([
    'jqueryui',
    'lodash',
    'activity/Activity',
    'activity/ValueChangeActivity',
    'operations/ot/NodeMoveOperation',
    'operations/non_ot/ActivityOperation'
],/** @lends NodeMoveActivity */function($,_,Activity,ValueChangeActivity,NodeMoveOperation,ActivityOperation) {

    NodeMoveActivity.TYPE = "NodeMoveActivity";

    NodeMoveActivity.prototype = new Activity();
    NodeMoveActivity.prototype.constructor = NodeMoveActivity;
    /**
     * Activity representing the movement of a node
     * @class activity.NodeMoveActivity
     * @memberof activity
     * @extends activity.Activity
     * @param {string} entityId Entity id of the entity this activity works on
     * @param {string} sender JabberId of the user who issued this activity
     * @param {string} text Text of this activity which is displayed in the activity widget
     * @param {string} nodeType Type of the created node
     * @constructor
     */
    function NodeMoveActivity(entityId,sender,text){
        Activity.call(this,entityId,sender,text);
    }
    return NodeMoveActivity;
});
