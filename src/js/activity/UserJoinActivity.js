/* global define */
define(['activity/Activity'],/** @lends UserJoinActivity */function(Activity) {
    UserJoinActivity.TYPE = "UserJoinActivity";
    UserJoinActivity.prototype = new Activity();
	UserJoinActivity.prototype.constructor = UserJoinActivity;
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
    function UserJoinActivity(entityId,sender,text){
        Activity.call(this,entityId,sender,text);
    }
    return UserJoinActivity;
});
