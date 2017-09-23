# SyncMeta - Near real-time collaborative modeling framework
## General information
__Note__ _This is an older and very experimental version of SyncMeta. I merged various widgets into one standalone application outside of the ROLE SDK. Beware that it is really buggy and a lot of features are missing._ 

For explanations, presentations, demos and links to modeling sandboxes and other stuff please visit the [SyncMeta homepage](http://dbis.rwth-aachen.de/cms/research/ACIS/SyncMeta). 

## Build steps
1. Make sure to have *npm*, *bower* and *grunt* installed
    * Use your favorite package manager or grab *npm* from [here][2]
    * Use *npm* to install *bower*: ```npm install -g bower```
    * Use *npm* to first install grunt-cli and then grunt itself: ```npm install -g grunt-cli grunt```
2. Install development dependencies: ```npm install```
3. Install dependencies: ```bower install```
4. Copy *.localGruntConfig.json.sample* and name it *.localGruntConfig.json*
5. Change *baseUrl* in *.localGruntConfig.json* to the deployment url
6. Run ```grunt build``` to build the widgets.


### Deploy

In order to deploy SyncMeta to [http://role-sandbox.eu/spaces/syncmeta](http://role-sandbox.eu/spaces/syncmeta), 
you have to push your latest changes to the `gh-pages` github branch. 
(See [github pages](https://pages.github.com/) for explanation)

_Attention!_, Please be aware that any changes you commit to the gh-pages branch will affect all ROLE spaces that link to widget definitions in this branch. Therefore only push very goodly tested commits to gh-pages.

#### Local Deployment
_Attention!_, We don't recommend to use the Pyhton's SimpleHTTPServer. See this [issue](http://layers.dbis.rwth-aachen.de/jira/browse/SYNCMETA-23) for more information.

If you only want to deploy the SyncMeta widgets just run ```grunt connect``` after building the widgets. It starts a http server on port 8081. 
Otherwise u can use [nginx](http://nginx.org/en/download.html) or [AIDeX Mini-Webserver](http://www.aidex.de/software/webserver/)  

###Versions
Syncmeta uses the awesome [Yjs](http://y-js.org/) framework to provide near-realtime collaborative modeling in the web browser.
The previous version of Syncmeta uses the [OpenCoWeb OT](https://github.com/opencoweb/coweb) framework and is still available in the [opencoweb-ot](https://github.com/rwth-acis/syncmeta/tree/opencoweb-ot) branch.
