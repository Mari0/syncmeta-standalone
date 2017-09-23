/* global define */
define(['activity/Activity'],/** @lends ViewApplyActivity */function(Activity) {
    ViewApplyActivity.TYPE = "ViewApplyActivity";
    ViewApplyActivity.prototype = new Activity();
    ViewApplyActivity.prototype.constructor = ViewApplyActivity;
    /**
     * Activity representing the application of a view
     * @class activity.ViewApplyActivity
     * @memberof activity
     * @extends activity.Activity
     * @param {string} viewId the identifier of the view
     * @param {string} sender JabberId of the user who issued this activity
     * @constructor
     */
    function ViewApplyActivity(viewId,sender){
        var _viewId= viewId;

        /**
         * get the identifier of a view
         * @returns {string}
         */
        this.getViewId = function(){
            return _viewId;
        };
        Activity.call(this,null,sender);
    }
    return ViewApplyActivity;
});
