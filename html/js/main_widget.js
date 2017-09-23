/*global requirejs, y, CONFIG*/
/**
 * Namespace for canvas widget.
 * @namespace canvas_widget
 */
requirejs([
    'jqueryui',
    'jsplumb',
    'lib/yjs-sync',
    'Util',
    'operations/non_ot/NonOTOperation',
    'operations/non_ot/ToolSelectOperation',
    'operations/non_ot/ActivityOperation',
    'operations/non_ot/ViewInitOperation',
    'operations/non_ot/UpdateViewListOperation',
    'operations/non_ot/DeleteViewOperation',
    'operations/non_ot/SetViewTypesOperation',
    'operations/non_ot/InitModelTypesOperation',
    'operations/non_ot/SetModelAttributeNodeOperation',
    'Canvas',
    'Palette',
    'AttributeBrowser',
    'EntityManager',
    'MoveTool',
    'generic/NodeTool',
    'vml/ObjectNodeTool',
    'vml/AbstractClassNodeTool',
    'vml/RelationshipNodeTool',
    'vml/RelationshipGroupNodeTool',
    'vml/EnumNodeTool',
    'vml/NodeShapeNodeTool',
    'vml/EdgeShapeNodeTool',
    'generic/EdgeTool',
    'vml/GeneralisationEdgeTool',
    'vml/BiDirAssociationEdgeTool',
    'vml/UniDirAssociationEdgeTool',
    'vml/ObjectNode',
    'vml/AbstractClassNode',
    'vml/RelationshipNode',
    'vml/RelationshipGroupNode',
    'vml/EnumNode',
    'vml/NodeShapeNode',
    'vml/EdgeShapeNode',
    'vml/GeneralisationEdge',
    'vml/BiDirAssociationEdge',
    'vml/UniDirAssociationEdge',
    'viewpoint/ViewObjectNode',
    'viewpoint/ViewObjectNodeTool',
    'viewpoint/ViewRelationshipNode',
    'viewpoint/ViewRelationshipNodeTool',
    'viewpoint/ViewManager',
    'view/ViewGenerator',
    'HistoryManager',
    'JSONtoGraph',
    'activity/ActivityList',
    //'promise!User',
    'promise!Guidancemodel',
], function ($, jsPlumb, yjsSync, Util, NonOTOperation, ToolSelectOperation, ActivityOperation, ViewInitOperation, UpdateViewListOperation, DeleteViewOperation, SetViewTypesOperation, InitModelTypesOperation, SetModelAttributeNodeOperation, Canvas, Palette, AttributeBrowser, EntityManager, MoveTool, NodeTool, ObjectNodeTool, AbstractClassNodeTool, RelationshipNodeTool, RelationshipGroupNodeTool, EnumNodeTool, NodeShapeNodeTool, EdgeShapeNodeTool, EdgeTool, GeneralisationEdgeTool, BiDirAssociationEdgeTool, UniDirAssociationEdgeTool, ObjectNode, AbstractClassNode, RelationshipNode, RelationshipGroupNode, EnumNode, NodeShapeNode, EdgeShapeNode, GeneralisationEdge, BiDirAssociationEdge, UniDirAssociationEdge, ViewObjectNode, ViewObjectNodeTool, ViewRelationshipNode, ViewRelationshipNodeTool, ViewManager, ViewGenerator, HistoryManager, JSONtoGraph, ActivityList,/* user,*/ guidancemodel) {

    $('#join').dialog({
        autoOpen: true,
        resizable: false,
        height: 400, 
        width: 400,
        modal : false, 
        buttons:{
            "Join": function(event){
                var that = this;
                var userName = $("#user_name").val();
                var spaceName = $("#space_name").val();                   
                if(userName.length > 0 && spaceName.length > 0){
                    $('#loading').show();                                            
                    yjsSync(spaceName || 'yjstesting55').done(function (y) {
                        console.info('CANVAS: Yjs Initialized successfully');
                        
                        var userId = Util.generateRandomId();
                        y.share.users.set(y.db.userId, userId);
                        var userInfo = {};
                        userInfo[CONFIG.NS.PERSON.TITLE] = userName;
                        userInfo[CONFIG.NS.PERSON.JABBERID] = userId;
                        userInfo.globalId = Util.getGlobalId(userInfo, y);
                        y.share.userList.set(userId, userInfo);
                        var metamodel, model;
                        if (guidancemodel.isGuidanceEditor()) {
                            //Set the model which is shown by the editor to the guidancemodel
                            model = y.share.data.get('guidancemodel');
                            //Set the metamodel to the guidance metamodel
                            metamodel = y.share.data.get('guidancemetamodel');
                        }
                        else {
                            metamodel = y.share.data.get('metamodel');
                            model = y.share.data.get('model');
                        }
                        EntityManager.init(metamodel);
                        EntityManager.setGuidance(guidancemodel);
                        window.y = y;
                        InitMainWidget(metamodel, model, userInfo);  
                        $(that).dialog("close");
                        $('.syncmeta-container').show();                        
                    }).fail(function () {
                        console.info("yjs log: Yjs intialization failed!");
                        window.y = undefined;
                        InitMainWidget();
                    });
                }                    
            }
        },
        open : function(){
            $('#loading').hide();
        },
        close : function(){

        }
    });

    function InitMainWidget(metamodel, model, userInfo) {
        var canvas = new Canvas($("#canvas"));
        var palette = new Palette($('#palette'),null,canvas);
        var activity = new ActivityList($("#user_list"),$("#activity_list"));
        activity.addUser(userInfo[CONFIG.NS.PERSON.JABBERID]);
       
        canvas.addAttributeBrowser(new AttributeBrowser($('#property_browser')));

        var moveTool = new MoveTool();
        canvas.addTool(MoveTool.TYPE, moveTool);
        palette.addTool(moveTool)
        palette.addSeparator();

        HistoryManager.init(canvas);
        /*TODO not working???
        y.connector.onUserEvent(function (event) {
            if (event.action === 'userLeft') {
                var breakpoint = true;
            }
        });*/

        //not working pretty well 
        window.onbeforeunload = function (/*event*/) {
            y.share.userList.delete(y.share.users.get(y.db.userId)); 
            y.share.users.delete(y.db.userId);
            y.share.activity.set('UserLeftActivity', new ActivityOperation('UserLeftActivity', null, y.share.users.get(y.db.userId))); 
        }
        
        y.share.join.observe(function (event) {
             if (!event.value && event.name !== y.share.users.get(y.db.userId)) {
                 //send to activity widget that a remote user has joined.
                y.share.join.set(y.share.users.get(y.db.userId), true);
                activity.addUser(event.name);
            } else if (event.name === y.share.users.get(y.db.userId) && !event.value) {  
                $("#loading").hide();
                canvas.resetTool();

                if (CONFIG.TEST.CANVAS)
                    require(['./../test/CanvasWidgetTest'], function (CanvasWidgetTest) {
                        CanvasWidgetTest(canvas);
                    });
                
                y.share.canvas.observe(function (event) {
                    switch (event.name) {
                        case UpdateViewListOperation.TYPE: {
                            ViewManager.GetViewpointList();
                            break;
                        }
                        case 'ReloadWidgetOperation': {
                            var text;
                            switch (event.value) {
                                case 'import': {
                                    text = 'ATTENTION! Imported new model. Some widgets will reload';
                                    break;
                                }
                                case 'delete': {
                                    text = 'ATTENTION! Deleted current model. Some widgets will reload';
                                    break;
                                }
                                case 'meta_delete': {
                                    text = "ATTENTION! Deleted current metamodel. Some widgets will reload";
                                    break;
                                }
                                case 'meta_import': {
                                    text = "ATTENTION! Imported new metamodel. Some widgets will reload";
                                    break;
                                }
                            }
                            var activityOperation = new ActivityOperation("ReloadWidgetOperation", undefined, y.share.users.get(y.db.userId), text);
                            frameElement.contentWindow.location.reload();
                        }
                    }

                });
            }
        });

        if (metamodel) {
            if (metamodel.hasOwnProperty("nodes")) {
                palette.initNodePalette(metamodel);
                var nodes = metamodel.nodes, node;
                for (var nodeId in nodes) {
                    if (nodes.hasOwnProperty(nodeId)) {
                        node = nodes[nodeId];
                        canvas.addTool(node.label, new NodeTool(node.label, null, null, node.shape.defaultWidth, node.shape.defaultHeight));
                    }
                }

            }
            if (metamodel.hasOwnProperty("edges")) {
                palette.initEdgePalette(metamodel);
                var edges = metamodel.edges, edge;
                for (var edgeId in edges) {
                    if (edges.hasOwnProperty(edgeId)) {
                        edge = edges[edgeId];
                        canvas.addTool(edge.label, new EdgeTool(edge.label, edge.relations));
                    }
                }

            }
            ViewManager.GetViewpointList();

            //Not needed int the model editor
            $("#btnCreateViewpoint").hide();
            $('#btnDelViewPoint').hide();

            //init the new tools for the canvas
            var initTools = function (vvs) {
                //canvas.removeTools();
                //canvas.addTool(MoveTool.TYPE, new MoveTool());
                if (vvs && vvs.hasOwnProperty("nodes")) {
                    var nodes = vvs.nodes, node;
                    for (var nodeId in nodes) {
                        if (nodes.hasOwnProperty(nodeId)) {
                            node = nodes[nodeId];
                            canvas.addTool(node.label, new NodeTool(node.label, null, null, node.shape.defaultWidth, node.shape.defaultHeight));
                        }
                    }
                }

                if (vvs && vvs.hasOwnProperty("edges")) {
                    var edges = vvs.edges, edge;
                    for (var edgeId in edges) {
                        if (edges.hasOwnProperty(edgeId)) {
                            edge = edges[edgeId];
                            canvas.addTool(edge.label, new EdgeTool(edge.label, edge.relations));
                        }
                    }
                }
            };

            //Modeling layer implementation. View generation process starts here
            $('#btnShowView').click(function () {
                //Get identifier of the current selected view
                var viewId = ViewManager.getViewIdOfSelected();
                var $currentViewIdLabel = $('#lblCurrentViewId');
                if (viewId === $currentViewIdLabel.text())
                    return;

                var vvs = y.share.views.get(viewId);
                EntityManager.initViewTypes(vvs);

                //send the new tools to the palette as well
                var operation = new InitModelTypesOperation(vvs, true).toNonOTOperation();
                //CHECK:sendLocalNonOTOperation(CONFIG.WIDGET.NAME.PALETTE, operation);
                //CHECK:sendLocalNonOTOperation(CONFIG.WIDGET.NAME.ATTRIBUTE, operation);

                //var activityOperation = new ActivityOperation("ViewApplyActivity", vvs.id, TODO user id);
                //CHECK:sendLocalNonOTOperation(CONFIG.WIDGET.NAME.ACTIVITY, activityOperation.toNonOTOperation());
                //y.share.canvas.set('ViewApplyActivity', { viewId: viewId, jabberId: TODO user id });

                //init the tools for canvas
                initTools(vvs);
                ViewGenerator.generate(metamodel, vvs);

                $('#lblCurrentView').show();
                $currentViewIdLabel.text(viewId);
            });

            //Modelling layer implementation
            $('#viewsHide').click(function () {
                $(this).hide();
                $('#viewsShow').show();
                $('#ViewCtrlContainer').hide();
                $('#canvas-frame').css('margin-top', '32px');
                var $lblCurrentViewId = $('#lblCurrentViewId');
                var viewpointId = $lblCurrentViewId.text();
                if (viewpointId.length > 0) {
                    //var $loading = $("#loading");
                    //$loading.show();


                    //reset view
                    var operation = new InitModelTypesOperation(metamodel, true);
                    
                    //var activityOperation = new ActivityOperation("ViewApplyActivity", '', TODO user id);

                    //y.share.canvas.set('ViewApplyActivity', { viewId: '', jabberId: TODO user id });


                    EntityManager.setViewId(null);
                    EntityManager.initModelTypes(metamodel);
                    initTools(metamodel);

                    ViewGenerator.reset(metamodel);

                    $('#lblCurrentView').hide();
                    $lblCurrentViewId.text("");
                    // $loading.hide();
                }
            });

            var $saveImage = $("#save_image");
            $saveImage.show();
            $saveImage.click(function () {
                canvas.toPNG().then(function (uri) {
                    var link = document.createElement('a');
                    link.download = "export.png";
                    link.href = uri;
                    link.click();
                });
            });

        }
        else {
            var abstractClassNodeTool = new AbstractClassNodeTool();
            var objectNodeTool = new ObjectNodeTool();
            var relationshipNodeTool = new RelationshipNodeTool();
            var relationshipGroupNodeTool = new RelationshipGroupNodeTool();
            var enumNodeTool = new EnumNodeTool();
            var nodeShapeTool = new NodeShapeNodeTool();
            var edgeShapeTool = new EdgeShapeNodeTool();
            palette.addTool(abstractClassNodeTool);
            palette.addTool(objectNodeTool);
            palette.addTool(relationshipNodeTool);
            palette.addTool(relationshipGroupNodeTool);
            palette.addTool(enumNodeTool);
            palette.addTool(nodeShapeTool);
            palette.addTool(edgeShapeTool);
            palette.addSeparator();
            var bidirAssoTool = new BiDirAssociationEdgeTool();
            var uniDirAssoTool = new UniDirAssociationEdgeTool();
            var generalisationTool = new GeneralisationEdgeTool();  
            palette.addTool(bidirAssoTool);
            palette.addTool(uniDirAssoTool);
            palette.addTool(generalisationTool);
            //Add Node Tools
            canvas.addTool(ObjectNode.TYPE, objectNodeTool);
            canvas.addTool(AbstractClassNode.TYPE, abstractClassNodeTool);
            canvas.addTool(RelationshipNode.TYPE, relationshipNodeTool);
            canvas.addTool(RelationshipGroupNode.TYPE, relationshipGroupNodeTool);
            canvas.addTool(EnumNode.TYPE, enumNodeTool);
            canvas.addTool(NodeShapeNode.TYPE, nodeShapeTool);
            canvas.addTool(EdgeShapeNode.TYPE, edgeShapeTool);

            //Add Edge Tools
            canvas.addTool(GeneralisationEdge.TYPE, generalisationTool);
            canvas.addTool(BiDirAssociationEdge.TYPE, bidirAssoTool);
            canvas.addTool(UniDirAssociationEdge.TYPE, uniDirAssoTool);

            //Add View Types
            canvas.addTool(ViewObjectNode.TYPE, new ViewObjectNodeTool());
            canvas.addTool(ViewRelationshipNode.TYPE, new ViewRelationshipNodeTool());
 
            $('#generate').show();

            //Init control elements for views
            $("#btnCreateViewpoint").click(function () {
                ShowViewCreateMenu();
            });
            $('#btnCancelCreateViewpoint').click(function () {
                HideCreateMenu();
            });

            $('#btnShowView').click(function () {
                var viewId = ViewManager.getViewIdOfSelected();
                if (viewId === $('#lblCurrentViewId').text())
                    return;
                $("#loading").show();
                $('#lblCurrentView').show();
                $('#lblCurrentViewId').text(viewId);
                visualizeView(viewId);
            });

            $('#btnDelViewPoint').click(function () {
                var viewId = ViewManager.getViewIdOfSelected();
                if (viewId !== $('#lblCurrentViewId').text()) {
                    y.share.views.set(viewId, null);
                    ViewManager.deleteView(viewId);

                }
                else {
                    y.share.views.set(viewId, null);
                    ViewManager.deleteView(viewId);
                    $('#viewsHide').click();
                }
            });

            $('#btnAddViewpoint').click(function () {
                var viewId = $('#txtNameViewpoint').val();
                if (ViewManager.existsView(viewId)) {
                    alert('View already exists');
                    return;
                }
                ViewManager.addView(viewId);
                HideCreateMenu();
                y.share.canvas.set(UpdateViewListOperation.TYPE, true);
            });

            //Meta-modelling layer implementation
            $('#viewsHide').click(function () {
                $(this).hide();
                $('#viewsShow').show();
                $('#ViewCtrlContainer').hide();
                $('#canvas-frame').css('margin-top', '32px');
                var $lblCurrentViewId = $('#lblCurrentViewId');
                if ($lblCurrentViewId.text().length > 0) {
                    var $loading = $("#loading");
                    $loading.show();

                    var model = y.share.data.get('model');
                    //Disable the view types in the palette
                    var operation = new SetViewTypesOperation(false);

                    //var activityOperation = new ActivityOperation("ViewApplyActivity", '', TODO user id);

                    //y.share.canvas.set('ViewApplyActivity', { viewId: '', jabberId: TODO user id });

                    resetCanvas();
                    JSONtoGraph(model, canvas);
                    $("#loading").hide();
                    canvas.resetTool();

                    $('#lblCurrentView').hide();
                    $lblCurrentViewId.text("");
                    EntityManager.setViewId(null);
                }
            })
        }
        //Functions and Callbacks for the view-based modeling approach
        var ShowViewCreateMenu = function () {
            $('#btnCreateViewpoint').hide();
            $('#ddmViewSelection').hide();
            $('#btnShowView').hide();
            $('#btnDelViewPoint').hide();
            $('#txtNameViewpoint').show();
            $('#btnAddViewpoint').show();
            $('#btnCancelCreateViewpoint').show();
        };
        var HideCreateMenu = function () {
            $('#btnCreateViewpoint').show();
            $('#ddmViewSelection').show();
            $('#btnDelViewPoint').show();
            $('#btnShowView').show();
            $('#txtNameViewpoint').hide();
            $('#btnAddViewpoint').hide();
            $('#btnCancelCreateViewpoint').hide();

        };

        function resetCanvas() {
            var edges = EntityManager.getEdges();
            for (edgeId in edges) {
                if (edges.hasOwnProperty(edgeId)) {
                    var edge = EntityManager.findEdge(edgeId);
                    edge.remove();
                    //edge.triggerDeletion();
                }
            }
            var nodes = EntityManager.getNodes();
            for (nodeId in nodes) {
                if (nodes.hasOwnProperty(nodeId)) {
                    var node = EntityManager.findNode(nodeId);
                    //node.triggerDeletion();
                    node.remove();
                }
            }
            EntityManager.deleteModelAttribute();
        }

        var visualizeView = function (viewId) {
            //ViewManager.getViewResource(viewId).getRepresentation('rdfjson', function (viewData) {
            var viewData = y.share.views.get(viewId);
            if (viewData) {
                resetCanvas();
                ViewToGraph(viewData);
                $('#lblCurrentView').show();
                $('#lblCurrentViewId').text(viewData.id);
                EntityManager.setViewId(viewData.id);
                canvas.resetTool();

            }
            //});
        };

        function ViewToGraph(json) {
            y.share.canvas.set('ViewApplyActivity', { viewId: json.id, jabberId: null});
            JSONtoGraph(json, canvas)
            $("#loading").hide();
            canvas.resetTool();

        }


        //-------------------------------------------------------------

        var $undo = $("#undo");
        $undo.prop('disabled', true);
        var $redo = $("#redo");
        $redo.prop('disabled', true);

        $undo.click(function () {
            HistoryManager.undo();
        });

        $redo.click(function () {
            HistoryManager.redo();
        });
           
        var $paletteShowBtn = $('#paletteShow');
        var $palleteHideBtn = $('#paletteHide');   
        $paletteShowBtn.click(function(){
            $paletteShowBtn.hide();
            $palleteHideBtn.show();
            $('#palette').show();
            $('#canvas-frame').css('width','75%');
        });
        $palleteHideBtn.click(function(){
            $paletteShowBtn.show();
            $palleteHideBtn.hide();
            $('#palette').hide();
            $('#canvas-frame').css('width','90%');
        });

        $("#showtype").click(function () {
            canvas.get$node().removeClass("hide_type");
            $(this).hide();
            $("#hidetype").show();
        }).hide();

        $("#hidetype").click(function () {
            canvas.get$node().addClass("hide_type");
            $(this).hide();
            $("#showtype").show();
        });

        $('#viewsShow').click(function () {
            $(this).hide();
            $('#viewsHide').show();
            $('#ViewCtrlContainer').show();
            $('#canvas-frame').css('margin-top', '64px');
        });

        $("#zoomin").click(function () {
            canvas.setZoom(canvas.getZoom() + 0.1);
        });

        $("#zoomout").click(function () {
            canvas.setZoom(canvas.getZoom() - 0.1);
        });

        var $feedback = $("#feedback");

        var saveFunction = function () {
            $feedback.text("Saving...");

            var viewId = $('#lblCurrentViewId').text();
            if (viewId.length > 0 && !metamodel) {
                ViewManager.updateViewContent(viewId);
                $feedback.text("Saved!");
                setTimeout(function () {
                    $feedback.text("");
                }, 1000);

            } else {
                EntityManager.storeDataYjs();
                $feedback.text("Saved!");
                setTimeout(function () {
                    $feedback.text("");
                }, 1000);
            }


        };
        $("#save").click(function () {
            saveFunction();
        });
        
        $("#dialog").dialog({
            autoOpen: false,
            resizable: false,
            height: 350,
            width: 400,
            modal: true,
            buttons: {
                "Generate": function (event) {
                    var title = $("#space_title").val();
                    var label = $("#space_label").val().replace(/[^a-zA-Z]/g, "").toLowerCase();

                    if (title === "" || label === "") return;
                    EntityManager.generateSpace(label, title).then(function (spaceObj) {
                        var operation = new ActivityOperation(
                            "EditorGenerateActivity",
                            "-1",
                            null, //TODO user id
                            "..generated new Editor <a href=\"" + spaceObj.spaceURI + "\" target=\"_blank\">" + spaceObj.spaceTitle + "</a>",
                            {}
                        ).toNonOTOperation();

                        $("#space_link").text(spaceObj.spaceURI).attr({ href: spaceObj.spaceURI }).show();
                        $("#space_link_text").show();
                        $("#space_link_input").hide();
                        $(event.target).parent().hide();
                    });
                },
                "Close": function () {
                    $(this).dialog("close");
                }
            },
            open: function () {
                var name = canvas.getModelAttributesNode().getAttribute("modelAttributes[name]").getValue().getValue();
                var $spaceTitle = $("#space_title");
                var $spaceLabel = $("#space_label");

                if ($spaceTitle.val() === "") $spaceTitle.val(name);
                if ($spaceLabel.val() === "") $spaceLabel.val(name.replace(/[^a-zA-Z]/g, "").toLowerCase());

                $(":button:contains('Generate')").show();
            },
            close: function (/*event, ui*/) {
                $("#space_link_text").hide();
                $("#space_link_input").show();
            }
        });

        var $generate = $("#generate").click(function () {
            $("#dialog").dialog("open");
        });

        if (!metamodel || !metamodel.hasOwnProperty("nodes") && !metamodel.hasOwnProperty("edges")) {
            $generate.show();
        }

   
        if (model) {
            var report = JSONtoGraph(model, canvas);
            console.info(report);
            //initialize guidance model's if we are in metamodeling layer
            if(EntityManager.getLayer() === CONFIG.LAYER.META){
                y.share.data.set('guidancemetamodel', EntityManager.generateGuidanceMetamodel());
                y.share.data.set('metamodelpreview', EntityManager.generateMetaModel());
            }

        } else {
            if (canvas.getModelAttributesNode() === null) {
                var modelAttributesNode = EntityManager.createModelAttributesNode();
                modelAttributesNode.registerYMap();
                canvas.setModelAttributesNode(modelAttributesNode);
                modelAttributesNode.addToCanvas(canvas);
            }
        }
        //local user joins
        y.share.join.set(y.share.users.get(y.db.userId), false);
        ViewManager.GetViewpointList();
       $("#loading").hide();
          

    }

});

