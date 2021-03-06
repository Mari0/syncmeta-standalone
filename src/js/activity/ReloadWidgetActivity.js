/* global define */
define(['activity/Activity'],/** @lends UserJoinActivity */function(Activity) {

    ReloadWidgetActivity.TYPE = "ReloadWidgetActivity";

    ReloadWidgetActivity.prototype = new Activity();
	ReloadWidgetActivity.prototype.constructor = ReloadWidgetActivity;
    /**
     * Activity representing the deletion of an edge
     * @class activity.UserJoinActivity
     * @memberof activity
     * @extends activity.Activity
     * @param {string} entityId Entity id of the entity this activity works on
     * @param {string} sender JabberId of the user who issued this activity
     * @param {string} text Text of this activity which is displayed in the activity widget
     * @constructor
     */
    function ReloadWidgetActivity(entityId,sender,text){
        Activity.call(this,entityId,sender,text);
    }
    return ReloadWidgetActivity;
});
