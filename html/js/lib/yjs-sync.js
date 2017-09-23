/*global define, Y*/
define(['jquery', 'Util'], function($, Util) {

    return function(spaceTitle) {

        var deferred = $.Deferred();
        //if space is not provided by the parameter, get it yourself from frameElement
        if (!spaceTitle) 
            spaceTitle = Util.getSpaceTitle(frameElement.baseURI);
                
        Y({
            db: {
                name: "memory" // store the shared data in memory
            },
            connector: {
                name: "websockets-client", // use the websockets connector
                room: spaceTitle,
                url:""
            },
            share: { // specify the shared content
                users: 'Map',
                join: 'Map',
                canvas: 'Map',
                nodes: 'Map',
                edges: 'Map',
                userList: 'Map',
                select: 'Map',
                views: 'Map',
                data: 'Map',
                activity:'Map',
                globalId: 'Array',
                text:"Text"
            },
            type:["Text","Map"],
            sourceDir: 'https://mari0.github.io/syncmeta-standalone/html/js/lib/vendor'
        }).then(function(y) {   
            deferred.resolve(y);
        });
        return deferred.promise();
    };
});