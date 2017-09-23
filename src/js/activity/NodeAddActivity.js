/* global define */
define([
    'jqueryui',
    'lodash',
    'activity/Activity'],/** @lends NodeAddActivity */function ($, _, Activity) {
        NodeAddActivity.TYPE = "NodeAddActivity";
        NodeAddActivity.prototype = new Activity();
        NodeAddActivity.prototype.constructor = NodeAddActivity;
        /**
         * Activity representing the addition of a new node
         * @class activity.NodeAddActivity
         * @memberof activity
         * @extends activity.Activity
         * @param {string} entityId Entity id of the entity this activity works on
         * @param {string} sender JabberId of the user who issued this activity
         * @param {string} text Text of this activity which is displayed in the activity widget
         * @constructor
         */
        function NodeAddActivity(entityId, sender, text) {
            Activity.call(this, entityId, sender, text);
        }
        return NodeAddActivity;
    });
