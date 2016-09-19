/**
 * Created by nannan on 16/7/21.
 */
$(document).ready(function () {
    document.getElementById('mapHeadBarDate').valueAsDate = new Date();
    $.ajax({
        url: '/reservoirTotal',
        data: {
            reservoir: 'patrolling'
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (i == 0 || i + 1 < data.length && data[i]['reservoir_Name'] == data[i + 1]['reservoir_Name']) {
                    if (i == 0 || data[i]['reservoir_Name'] != data[i - 1]['reservoir_Name']) {
                        if (i != 0) {
                            var footer = $("<div class='panel-footer'>待处理问题数：" + data[i - 1]['problem_num'] + "</div>");
                            footer.appendTo(pan);
                        }
                        var top = $("<div class='col-lg-2'></div>");
                        var reservoir = $('<div class="panel-heading" onclick="ReservoirHeadInfo(`' + data[i]['reservoir_Name'] + '`)">' + data[i]['reservoir_Name'] + '</div>');
                        top.appendTo($('.row'));
                        if (data[i]['problem_num'] != 0) {
                            var pan = $("<div class='panel panel-danger'></div>");
                        } else {
                            var pan = $("<div class='panel panel-success'></div>");
                        }
                        pan.appendTo(top);
                        reservoir.appendTo(pan);
                        var worker = $("<div class='panel-body ReservoirInfo-body'></div>");
                    } else {
                        console.log('continue');
                    }
                }
                else if (data[i]['reservoir_Name'] == data[i - 1]['reservoir_Name']) {
                    console.log('continue');
                }
                else if (data[i]['reservoir_Name'] != data[i - 1]['reservoir_Name']) {
                    var footer = $("<div class='panel-footer'>待处理问题数：" + data[i - 1]['problem_num'] + "</div>");
                    footer.appendTo(pan);
                    var top = $("<div class='col-lg-2'></div>");
                    var reservoir = $("<div class='panel-heading' onclick='ReservoirHeadInfo(`" + data[i]['reservoir_Name'] + "`)'>" + data[i]['reservoir_Name'] + "</div>");
                    top.appendTo($('.row'));
                    if (data[i]['problem_num'] != 0) {
                        var pan = $("<div class='panel panel-danger'></div>");
                    } else {
                        var pan = $("<div class='panel panel-success'></div>");
                    }
                    pan.appendTo(top);
                    reservoir.appendTo(pan);
                    var worker = $("<div class='panel-body ReservoirInfo-body'></div>");
                }
                if (data[i]['checker_role'] == 'principal') {
                    var dutyer = $("<div class='dutyer'></div>");
                    var image = $("<img class='img-circle portrait' src='" + data[i]['checker_head'] + "'/>");
                    image.appendTo(dutyer);
                    var workerFont = $("<span class='glyphicon glyphicon-king' aria-hidden='true'></span>");
                    workerFont.appendTo(dutyer);
                    var workerName = $("<span>:" + data[i]['checker_name'] + "</span><br>");
                    workerName.appendTo(dutyer);
                    var phoneFont = $("<span class='glyphicon glyphicon-phone-alt' aria-hidden='true'></span>");
                    phoneFont.appendTo(dutyer);
                    var phone = $("<span>:" + data[i]['checker_phone'] + "</span>");
                    phone.appendTo(dutyer);
                    dutyer.appendTo(worker);
                    worker.appendTo(pan);
                }
                else if (data[i]['checker_role'] == 'checker') {
                    var checker = $("<div class='checker'></div>");
                    var image = $("<img class='img-circle portrait' src='" + data[i].checker_head + "'/>");
                    image.appendTo(checker);
                    var workerFont = $("<span class='glyphicon glyphicon-user' aria-hidden='true'></span>");
                    workerFont.appendTo(checker);
                    var workerName = $("<span>:" + data[i]['checker_name'] + "</span><br>");
                    workerName.appendTo(checker);
                    var phoneFont = $("<span class='glyphicon glyphicon-phone' aria-hidden='true'></span>");
                    phoneFont.appendTo(checker);
                    var phone = $("<span>:" + data[i]['checker_phone'] + "</span>");
                    phone.appendTo(checker);
                    checker.appendTo(worker);
                    worker.appendTo(pan);
                }
                if (i == data.length - 1) {
                    var footer = $("<div class='panel-footer'>待处理问题数：" + data[i]['problem_num'] + "</div>");
                    footer.appendTo(pan);
                }
            }
        },
        error: function (err) {
            console.log('wrong' + err);
        }
    });
    $.ajax({
        url: '/search_checker',
        type: 'get',
        success: function (data) {
            if ($("#checker_road").find("option").length == 1) {
                for (var i = 0; i < data.length; i++) {
                    var opt = $("<option  value='" + data[i].checker_num + "'>" + data[i].checker_name + "</option>");
                    opt.appendTo($("#checker_road"));
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
// 定义一个地图
    var defaultLayer = new AMap.TileLayer();
    var Satellite = new AMap.TileLayer.Satellite();
    var map = new AMap.Map('map_container', {
        zoom: 10, resizeEnable: true, layers: [
            defaultLayer,//默认图层
            Satellite//卫星图层
        ], center: [120.15506900000003, 30.274089]
    });
    $("#map_look").click(function () {
        $("#mapReturnBtn").click();
    });
    // 定义标记点
    function showPoint(e, t, x, y) {
        $.ajax({
            url: '/showPoint',
            data: {
                cid: e
            },
            dataType: 'json',
            type: 'get',
            success: function (data) {
                console.log(data);
                if (data.length > 0) {
                    setPeopleToMap(data, t, x, y);
                    map.setFitView();
                }
                //else {
                //    alert("无历史记录");
                //}
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
//$(".point").click(function(){
//   $(".time")
//});
    function setPeopleToMap(data, t, x, y) {
        for (var i = 0; i < data.length; i++) {
            var status;
            if (data[i].status == 0) {
                status = "未巡查";
            }
            else if (data[i].status == 1) {
                status = "已巡查";
            } else {
                status = "巡查中";
            }
            if (t == 1) {
                var gps = [x, y];
            } else {
                var gps = [data[i].gps_coordinateX, data[i].gps_coordinateY];
            }
            var name = data[i].checker_name;
            new AMap.Marker({
                position: gps,
                animation: "AMAP_ANIMATION_DROP",
                extData: data[i].mission_id,
                content: "<div class='user'><div class='people-info-inmap'><table><tr><td class='people-name-intable'>" + data[i].checker_name + "</td><td class='people-state-intable'>" + status + "</td></tr><tr><td colspan='2'>" + data[i].check_time + "</td></tr></table></div><div class='circular'><img class='img-circle portrait-in-map portrait' src='" + data[i].checker_head + "'></div><div class='Triangle'></div></div>",
                map: map
            }).on('click', function (e) {
                    showMapPersonBlock();
                    map.clearMap();
                    $(".people-info-inmap").css("display", "none");
                    $.ajax({
                        url: '/missionone',
                        data: {
                            mid: this.getExtData()
                        },
                        dataType: 'json',
                        type: 'get',
                        success: function (data) {
                            $(".map_info_bottom_head_img").attr("src", data[0].checker_head);
                            $("#map_checker_name").html(data[0].checker_name);
                            if (data[0].status == 0) {
                                $("#map_checker_status").html("未巡查");
                            } else if (data[0].status == 1) {
                                $("#map_checker_status").html("已巡查");
                            } else {
                                $("#map_checker_status").html("巡查中");
                            }
                            $("#map_checker_date").html(data[0].check_time);
                            $("#map_checker_reservoir").html(data[0].reservoir_name);
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                    $.ajax({
                        url: "/standReservoir",
                        data: {
                            mid: this.getExtData()
                        },
                        dataType: 'json',
                        type: 'get',
                        success: function (data) {
                            $(".map_info_right_all").empty();
                            var j=1;
                            var tr = "";
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].abnormal_state == 0) {
                                    var status = "正常";
                                } else {
                                    var status = "异常";
                                }
                                if (i == 0) {
                                    tr = tr + " <tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                } else {
                                    if (data[i].department_name == data[i - 1].department_name) {
                                        tr = tr + "<tr><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                        j++;
                                    } else {
                                        $(tr).appendTo($(".map_info_right_all"));
                                        $("#" + data[i - 1].department_ID).attr('rowspan', j);
                                        tr="";
                                        tr = tr + "<tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                        j = 1;
                                    }
                                }
                                if(i==data.length-1){
                                    $(tr).appendTo($(".map_info_right_all"));
                                    $("#" + data[i].department_ID).attr('rowspan', j);
                                }
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                    $.ajax({
                        url: '/getTrace',
                        data: {
                            mid: this.getExtData()
                        },
                        dataType: 'json',
                        type: 'get',
                        success: function (data) {
                            var path = [];
                            for (var w = 0; w < data.length; w++) {
                                var lngX = data[w].gps_coordinateX;
                                var latY = data[w].gps_coordinateY;
                                path.push([lngX, latY]);
                            }
                            var polyline = new AMap.Polyline({
                                path: path,          //设置线覆盖物路径
                                strokeColor: "#3366FF", //线颜色
                                strokeOpacity: 1,       //线透明度
                                strokeWeight: 5,        //线宽
                                strokeStyle: "solid",   //线样式
                                strokeDasharray: [10, 5] //补充线样式
                            });
                            for (var j in path) {
                                if (j == 0) {
                                   var marker=new AMap.Marker({
                                        map: map,
                                        extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                        position: path[j],
                                        offset: new AMap.Pixel(-20, -40),
                                        icon:"../img/start.gif"
                                    });
                                    marker.content=data[j].time;
                                    var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                    marker.on('click', function (e){
                                        infoWindow.setContent(e.target.content);
                                        infoWindow.open(map, e.target.getPosition());
                                    });
                                } else if (j == path.length - 1) {
                                    var marker=new AMap.Marker({
                                        map: map,
                                        extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                        position: path[j],
                                        offset: new AMap.Pixel(-20, -40),
                                        icon:"../img/end.gif"
                                    });
                                    marker.content=data[j].time;
                                    var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                    marker.on('click', function (e){
                                        infoWindow.setContent(e.target.content);
                                        infoWindow.open(map, e.target.getPosition());
                                    });
                                }
                            }
                            map.setFitView();
                            map.setZoom(13);
                            polyline.setMap(map);
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                    $.ajax({
                        url: '/sgps',
                        data: {
                            mid: this.getExtData()
                        },
                        dataType: 'json',
                        type: 'get',
                        success: function (data) {
                            var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                            for (var j = 0; j < data.length; j++) {
                                //var img = "<img class='path point' src='img/flag.png' data_dName='" + data[j].department_name + "' data_rName='" + data[j].reservoir_name + "' data_did='" + data[j].gps_did + "' data_mid='" + data[j].mission_id + "'>";
                               new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].department_ID,data[j].time],
                                    position: [data[j].gps_coordinateX, data[j].gps_coordinateY],
                                    offset: new AMap.Pixel(-5, -25),
                                    icon:'../img/flag.png'
                                }).on('click', function (e) {
                                        $(".map_info_right_all").empty();
                                       var a = this.getExtData();
                                       this.content=a[3];
                                       infoWindow.setContent(e.target.content);
                                       infoWindow.open(map, e.target.getPosition());
                                        $.ajax({
                                            url: '/standOnly',
                                            data: {
                                                mid: a[0],
                                                dName: a[1],
                                                did: a[2]
                                            },
                                            dataType: 'json',
                                            type: 'get',
                                            success: function (data) {
                                                var tr = "<tr><td rowspan='" + data.length + "'>" + data[0].department_name + "</td>";
                                                for (var i = 0; i < data.length; i++) {
                                                    if (data[i].abnormal_state == 0) {
                                                        var status = "正常";
                                                    } else {
                                                        var status = "异常";
                                                    }
                                                    if (i == 0) {
                                                        tr = tr + "<td style = 'text-align: left'>" + data[0].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[0].department_ID + "," + data[0].mission_id + "," + data[0].stand_ID + ")'>看图</button></td></tr>";
                                                    } else {
                                                        tr = tr + "<tr><td style = 'text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td ><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                                    }
                                                }
                                                $(tr).appendTo($(".map_info_right_all"));
                                            },
                                            error: function (err) {
                                                console.log(err)
                                            }
                                        });
                                        map.setCenter(e.target.getPosition());
                                    });
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                });
        }
    }

    $("#checker_road").change(function () {
        var num = $("#checker_road").val();
        $.ajax({
            url: '/showNewMission',
            data: {
                num: num
            },
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $.ajax({
                    url: '/missionone',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $(".map_info_bottom_head_img").attr("src", data[0].checker_head);
                        $("#map_checker_name").html(data[0].checker_name);
                        if (data[0].status == 0) {
                            $("#map_checker_status").html("未巡查");
                        } else if (data[0].status == 1) {
                            $("#map_checker_status").html("已巡查");
                        } else {
                            $("#map_checker_status").html("巡查中");
                        }
                        $("#map_checker_date").html(data[0].check_time);
                        $("#map_checker_reservoir").html(data[0].reservoir_name);
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: "/standReservoir",
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $(".map_info_right_all").empty();
                        var j=1;
                        var tr = "";
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].abnormal_state == 0) {
                                var status = "正常";
                            } else {
                                var status = "异常";
                            }
                            if (i == 0) {
                                tr = tr + " <tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                            } else {
                                if (data[i].department_name == data[i - 1].department_name) {
                                    tr = tr + "<tr><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                    j++;
                                } else {
                                    $(tr).appendTo($(".map_info_right_all"));
                                    $("#" + data[i - 1].department_ID).attr('rowspan', j);
                                    tr="";
                                    tr = tr + "<tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                    j = 1;
                                }
                            }
                            if(i==data.length-1){
                                $(tr).appendTo($(".map_info_right_all"));
                                $("#" + data[i].department_ID).attr('rowspan', j);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: '/getTrace',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        map.clearMap();
                        var path = [];
                        for (var w = 0; w < data.length; w++) {
                            var lngX = data[w].gps_coordinateX;
                            var latY = data[w].gps_coordinateY;
                            path.push([lngX, latY]);
                        }
                        var polyline = new AMap.Polyline({
                            path: path,          //设置线覆盖物路径
                            strokeColor: "#3366FF", //线颜色
                            strokeOpacity: 1,       //线透明度
                            strokeWeight: 5,        //线宽
                            strokeStyle: "solid",   //线样式
                            strokeDasharray: [10, 5] //补充线样式
                        });
                        for (var j in path) {
                            if (j == 0) {
                                var marker=new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                    position: path[j],
                                    offset: new AMap.Pixel(-20, -40),
                                    icon:"../img/start.gif"
                                });
                                marker.content=data[j].time;
                                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                marker.on('click', function (e){
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                });
                            } else if (j == path.length - 1) {
                                var marker=new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                    position: path[j],
                                    offset: new AMap.Pixel(-20, -40),
                                    icon:"../img/end.gif"
                                });
                                marker.content=data[j].time;
                                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                marker.on('click', function (e){
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                });
                            }
                        }
                        map.setFitView();
                        map.setZoom(13);
                        polyline.setMap(map);
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: '/sgps',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                        for (var j = 0; j < data.length; j++) {
                            //var img = "<img class='path point' src='img/flag.png' data_dName='" + data[j].department_name + "' data_rName='" + data[j].reservoir_name + "' data_did='" + data[j].gps_did + "' data_mid='" + data[j].mission_id + "'>";
                            new AMap.Marker({
                                map: map,
                                extData: [data[j].mission_id, data[j].department_name, data[j].department_ID,data[j].time],
                                position: [data[j].gps_coordinateX, data[j].gps_coordinateY],
                                offset: new AMap.Pixel(-5, -25),
                                icon:'../img/flag.png'
                            }).on('click', function (e) {
                                    $(".map_info_right_all").empty();
                                    var a = this.getExtData();
                                    this.content=a[3];
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                    $.ajax({
                                        url: '/standOnly',
                                        data: {
                                            mid: a[0],
                                            dName: a[1],
                                            did: a[2]
                                        },
                                        dataType: 'json',
                                        type: 'get',
                                        success: function (data) {
                                            var tr = "<tr><td rowspan='" + data.length + "'>" + data[0].department_name + "</td>";
                                            for (var i = 0; i < data.length; i++) {
                                                if (data[i].abnormal_state == 0) {
                                                    var status = "正常";
                                                } else {
                                                    var status = "异常";
                                                }
                                                if (i == 0) {
                                                    tr = tr + "<td style = 'text-align: left'>" + data[0].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[0].department_ID + "," + data[0].mission_id + "," + data[0].stand_ID + ")'>看图</button></td></tr>";
                                                } else {
                                                    tr = tr + "<tr><td style = 'text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td ><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                                }
                                            }
                                            $(tr).appendTo($(".map_info_right_all"));
                                        },
                                        error: function (err) {
                                            console.log(err)
                                        }
                                    });
                                    map.setCenter(e.target.getPosition());
                                });
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    $("#ctime").change(function() {
        var ctime = $("#ctime").val();
        $.ajax({
            url: '/ctime',
            data: {
                time: ctime,
                date: $("#mapHeadBarDate").val(),
                cName: $("#map_checker_name").html()
            },
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $.ajax({
                    url: '/missionone',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $(".map_info_bottom_head_img").attr("src", data[0].checker_head);
                        $("#map_checker_name").html(data[0].checker_name);
                        if (data[0].status == 0) {
                            $("#map_checker_status").html("未巡查");
                        } else if (data[0].status == 1) {
                            $("#map_checker_status").html("已巡查");
                        } else {
                            $("#map_checker_status").html("巡查中");
                        }
                        $("#map_checker_date").html(data[0].check_time);
                        $("#map_checker_reservoir").html(data[0].reservoir_name);
                    },
                    error: function (err) {
                        console.log(err)
                    }
                });
                $.ajax({
                    url: "/standReservoir",
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $(".map_info_right_all").empty();
                        var j=1;
                        var tr = "";
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].abnormal_state == 0) {
                                var status = "正常";
                            } else {
                                var status = "异常";
                            }
                            if (i == 0) {
                                tr = tr + " <tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                            } else {
                                if (data[i].department_name == data[i - 1].department_name) {
                                    tr = tr + "<tr><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                    j++;
                                } else {
                                    $(tr).appendTo($(".map_info_right_all"));
                                    $("#" + data[i - 1].department_ID).attr('rowspan', j);
                                    tr="";
                                    tr = tr + "<tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                    j = 1;
                                }
                            }
                            if(i==data.length-1){
                                $(tr).appendTo($(".map_info_right_all"));
                                $("#" + data[i].department_ID).attr('rowspan', j);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: '/getTrace',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        map.clearMap();
                        var path = [];
                        for (var w = 0; w < data.length; w++) {
                            var lngX = data[w].gps_coordinateX;
                            var latY = data[w].gps_coordinateY;
                            path.push([lngX, latY]);
                        }
                        var polyline = new AMap.Polyline({
                            path: path,          //设置线覆盖物路径
                            strokeColor: "#3366FF", //线颜色
                            strokeOpacity: 1,       //线透明度
                            strokeWeight: 5,        //线宽
                            strokeStyle: "solid",   //线样式
                            strokeDasharray: [10, 5] //补充线样式
                        });
                        for (var j in path) {
                            if (j == 0) {
                                var marker=new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                    position: path[j],
                                    offset: new AMap.Pixel(-20, -40),
                                    icon:"../img/start.gif"
                                });
                                marker.content=data[j].time;
                                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                marker.on('click', function (e){
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                });
                            } else if (j == path.length - 1) {
                                var marker=new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                    position: path[j],
                                    offset: new AMap.Pixel(-20, -40),
                                    icon:"../img/end.gif"
                                });
                                marker.content=data[j].time;
                                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                marker.on('click', function (e){
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                });
                            }
                        }
                        map.setFitView();
                        map.setZoom(13);
                        polyline.setMap(map);
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: '/sgps',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                        for (var j = 0; j < data.length; j++) {
                            //var img = "<img class='path point' src='img/flag.png' data_dName='" + data[j].department_name + "' data_rName='" + data[j].reservoir_name + "' data_did='" + data[j].gps_did + "' data_mid='" + data[j].mission_id + "'>";
                            new AMap.Marker({
                                map: map,
                                extData: [data[j].mission_id, data[j].department_name, data[j].department_ID,data[j].time],
                                position: [data[j].gps_coordinateX, data[j].gps_coordinateY],
                                offset: new AMap.Pixel(-5, -25),
                                icon:'../img/flag.png'
                            }).on('click', function (e) {
                                    $(".map_info_right_all").empty();
                                    var a = this.getExtData();
                                    this.content=a[3];
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                    $.ajax({
                                        url: '/standOnly',
                                        data: {
                                            mid: a[0],
                                            dName: a[1],
                                            did: a[2]
                                        },
                                        dataType: 'json',
                                        type: 'get',
                                        success: function (data) {
                                            var tr = "<tr><td rowspan='" + data.length + "'>" + data[0].department_name + "</td>";
                                            for (var i = 0; i < data.length; i++) {
                                                if (data[i].abnormal_state == 0) {
                                                    var status = "正常";
                                                } else {
                                                    var status = "异常";
                                                }
                                                if (i == 0) {
                                                    tr = tr + "<td style = 'text-align: left'>" + data[0].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[0].department_ID + "," + data[0].mission_id + "," + data[0].stand_ID + ")'>看图</button></td></tr>";
                                                } else {
                                                    tr = tr + "<tr><td style = 'text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td ><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                                }
                                            }
                                            $(tr).appendTo($(".map_info_right_all"));
                                        },
                                        error: function (err) {
                                            console.log(err)
                                        }
                                    });
                                    map.setCenter(e.target.getPosition());
                                });
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    $("#mapHeadBarDate").change(function () {
        var choose = $("#mapHeadBarDate").val();
        $.ajax({
            url: '/chooseoneday',
            data: {
                time: choose,
                cName: $("#map_checker_name").html()
            },
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $("#ctime").empty();
                for(var i=0;i<data.length;i++){
                 var opt=$("<option value='"+i+"'>任务"+(i+1)+"</option>");
                    if(i==data.length-1){
                       opt.attr("selected","selected");
                    }
                    opt.appendTo($("#ctime"));
                }
                $.ajax({
                    url: '/missionone',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $(".map_info_bottom_head_img").attr("src", data[0].checker_head);
                        $("#map_checker_name").html(data[0].checker_name);
                        if (data[0].status == 0) {
                            $("#map_checker_status").html("未巡查");
                        } else if (data[0].status == 1) {
                            $("#map_checker_status").html("已巡查");
                        } else {
                            $("#map_checker_status").html("巡查中");
                        }
                        $("#map_checker_date").html(data[0].check_time);
                        $("#map_checker_reservoir").html(data[0].reservoir_name);
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: "/standReservoir",
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        $(".map_info_right_all").empty();
                        var j=1;
                        var tr = "";
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].abnormal_state == 0) {
                                var status = "正常";
                            } else {
                                var status = "异常";
                            }
                            if (i == 0) {
                                tr = tr + " <tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                            } else {
                                if (data[i].department_name == data[i - 1].department_name) {
                                    tr = tr + "<tr><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                    j++;
                                } else {
                                    $(tr).appendTo($(".map_info_right_all"));
                                    $("#" + data[i - 1].department_ID).attr('rowspan', j);
                                    tr="";
                                    tr = tr + "<tr><td id='" + data[i].department_ID + "'>" + data[i].department_name + "</td><td style='text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                    j = 1;
                                }
                            }
                            if(i==data.length-1){
                                $(tr).appendTo($(".map_info_right_all"));
                                $("#" + data[i].department_ID).attr('rowspan', j);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                $.ajax({
                    url: '/getTrace',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        map.clearMap();
                        var path = [];
                        for (var w = 0; w < data.length; w++) {
                            var lngX = data[w].gps_coordinateX;
                            var latY = data[w].gps_coordinateY;
                            path.push([lngX, latY]);
                        }
                        var polyline = new AMap.Polyline({
                            path: path,          //设置线覆盖物路径
                            strokeColor: "#3366FF", //线颜色
                            strokeOpacity: 1,       //线透明度
                            strokeWeight: 5,        //线宽
                            strokeStyle: "solid",   //线样式
                            strokeDasharray: [10, 5] //补充线样式
                        });
                        for (var j in path) {
                            if (j == 0) {
                                var marker=new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                    position: path[j],
                                    offset: new AMap.Pixel(-20, -40),
                                    icon:"../img/start.gif"
                                });
                                marker.content=data[j].time;
                                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                marker.on('click', function (e){
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                });
                            } else if (j == path.length - 1) {
                                var marker=new AMap.Marker({
                                    map: map,
                                    extData: [data[j].mission_id, data[j].department_name, data[j].gps_did],
                                    position: path[j],
                                    offset: new AMap.Pixel(-20, -40),
                                    icon:"../img/end.gif"
                                });
                                marker.content=data[j].time;
                                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                                marker.on('click', function (e){
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                });
                            }
                        }
                        map.setFitView();
                        map.setZoom(13);
                        polyline.setMap(map);
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });

                $.ajax({
                    url: '/sgps',
                    data: {
                        mid: data[0].mission_id
                    },
                    dataType: 'json',
                    type: 'get',
                    success: function (data) {
                        var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});
                        for (var j = 0; j < data.length; j++) {
                            //var img = "<img class='path point' src='img/flag.png' data_dName='" + data[j].department_name + "' data_rName='" + data[j].reservoir_name + "' data_did='" + data[j].gps_did + "' data_mid='" + data[j].mission_id + "'>";
                            new AMap.Marker({
                                map: map,
                                extData: [data[j].mission_id, data[j].department_name, data[j].department_ID,data[j].time],
                                position: [data[j].gps_coordinateX, data[j].gps_coordinateY],
                                offset: new AMap.Pixel(-5, -25),
                                icon:'../img/flag.png'
                            }).on('click', function (e) {
                                    $(".map_info_right_all").empty();
                                    var a = this.getExtData();
                                    this.content=a[3];
                                    infoWindow.setContent(e.target.content);
                                    infoWindow.open(map, e.target.getPosition());
                                    $.ajax({
                                        url: '/standOnly',
                                        data: {
                                            mid: a[0],
                                            dName: a[1],
                                            did: a[2]
                                        },
                                        dataType: 'json',
                                        type: 'get',
                                        success: function (data) {
                                            var tr = "<tr><td rowspan='" + data.length + "'>" + data[0].department_name + "</td>";
                                            for (var i = 0; i < data.length; i++) {
                                                if (data[i].abnormal_state == 0) {
                                                    var status = "正常";
                                                } else {
                                                    var status = "异常";
                                                }
                                                if (i == 0) {
                                                    tr = tr + "<td style = 'text-align: left'>" + data[0].stand_content + "</td><td>" + status + "</td><td><button onclick='viewPictureModal(" + data[0].department_ID + "," + data[0].mission_id + "," + data[0].stand_ID + ")'>看图</button></td></tr>";
                                                } else {
                                                    tr = tr + "<tr><td style = 'text-align: left'>" + data[i].stand_content + "</td><td>" + status + "</td ><td><button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].stand_ID + ")'>看图</button></td></tr>";
                                                }
                                            }
                                            $(tr).appendTo($(".map_info_right_all"));
                                        },
                                        error: function (err) {
                                            console.log(err)
                                        }
                                    });
                                    map.setCenter(e.target.getPosition());
                                });
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            },
            error: function (err) {
                console.log(err)
            }
        });
    });
    //信息窗关闭缩放
    $("#mapReturnBtn").unbind('click');
    $("#mapReturnBtn").on('click', function () {
        map.clearMap();
        $("#map_block").show();
        document.getElementById('mapHeadBarDate').valueAsDate = new Date();
        $("#checker_road").val("请选择巡查人员");
        $("#ctime").empty();
        $(".people-info-inmap").css("display", "block");
        $(".map_head_bar").hide();
        $(".map_info_bottom").hide();
        $(".map_info_right").hide();
        $("#location1").show();
        $(".map_left").css({
            "width": "100%",
            "display": "inline-block"
        });
        $("#map_container").css({"height": "99.5%", "margin-bottom": "0"});
        showPoint("", 0, 0, 0);
        //map.setZoom(10);
        map.setFitView();
    });
    // 地图插件添加（工具尺、缩放尺、鹰眼、图层切换）
    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.MapType'],
        function () {
            map.addControl(new AMap.ToolBar());
            map.addControl(new AMap.Scale());
            map.addControl(new AMap.OverView({isOpen: true}));
            map.addControl(new AMap.MapType());
        });
    // 将地图概览、巡查审阅、任务派发、水库管理、人员管理、设备管理等模块隐藏，此时只显示水库概览模块
    // 点击标记点进入地图人员信息界面
    function showMapPersonBlock() {
        $(".map_head_bar").show();
        $(".map_info_bottom").show();
        $(".map_info_right").show();
        $("#location1").hide();
        $(".map_left").css({"width": "50%", "display": "inline-block"});
        $("#map_container").css({"height": "360px", "margin-bottom": "-40px"});
    }

    if (!window.WebSocket) {
        alert("Your browser does not support WebSockets.");
    } else {
        var client;
        var host = '1546e5j729.imwork.net';
        var port = '61614';
        var clientId = 'admin-' + Math.floor(Math.random() * 100);
        client = new Messaging.Client(host, Number(port), clientId);
        client.onConnect = onConnect;
        client.onMessageArrived = onMessageArrived;
        client.onConnectionLost = onConnectionLost;
        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure
        });
        // the client is notified when it is connected to the server.
        function onConnect() {
            client.subscribe(clientId);
        }

        // this allows to display debug logs directly on the web page
        function onFailure(failure) {

        }

        //收到消息并定位
        function onMessageArrived(message) {
        try {
            var personLocation = JSON.parse(message.payloadString);
        }
        catch (e) {
            return;
        }
        //alert(message.payloadString);
        switch(personLocation.tag){
            case "null":
                return;
                break;
            case "lat_lng":
                showPoint(personLocation.user, 1, personLocation.longitude, personLocation.latitude);
                map.setFitView();
                break;
            default :
                break;
        }
    }

    //点击信息窗的一键定位发送消息
        $('#location1').on('click', function () {
            var text = '{"tag":"2","user":'+clientId+'}';
            message = new Messaging.Message(text);
            message.destinationName = "In";
            client.send(message);
            map.clearMap();
        });
        //连接断开
        function onConnectionLost(responseObject) {

        }
    }
});


function showtrace(a) {
    $("#" + a).click();
}

// 一键定位倒计时
function showtime(t) {
    document.getElementById("location1").disabled = true;
    for (var i = 1; i <= t; i++) {
        window.setTimeout("update_p(" + i + "," + t + ")", i * 1000);
    }

}

function update_p(num, t) {
    if (num == t) {
        document.getElementById("location1").value = " 一键定位 ";
        document.getElementById("location1").disabled = false;
    }
    else {
        printnr = t - num;
        document.getElementById("location1").value = " (" + printnr + ")秒后重新定位";
    }
}

function clickReservoirInfo() {
    $("#ReservoirInfo").show();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#log-manage").hide();
    $("#people-manage").hide();
    $("#device-manage").hide();
    $("#ReservoirAdd").hide();
}

// 显示新增水库页面
function clickReservoirAdd() {
    $("#ReservoirAdd").show();
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#people-manage").hide();
    $("#log-manage").hide();
    $("#device-manage").hide();
}

function clickMap() {
    $("#ReservoirInfo").hide();
    $("#map_block").show();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#people-manage").hide();
    $("#device-manage").hide();
    $("#log-manage").hide();
    $("#ReservoirAdd").hide();
}

function clickSeek() {
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").show();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#people-manage").hide();
    $("#device-manage").hide();
    $("#log-manage").hide();
    $("#ReservoirAdd").hide();
    if (!$("#hismission").find("tr").length) {
        $.ajax({
            url: '/search_checker',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var opt = $("<option>" + data[i].checker_name + "</option>");
                    opt.appendTo($("#checker_search"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        //历史任务中用的检查者
        $.ajax({
            url: '/search_reservoir',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var opt = $("<option>" + data[i].reservoir_Name + "</option>");
                    opt.appendTo($("#reservoir_search"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        //历史任务中用的水库名
        $.ajax({
            url: '/mission2',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var status;
                    if (data[i].status == 0) {
                        status = "未巡查";
                    } else if (data[i].status == 1) {
                        status = "已巡查";
                    } else {
                        status = "巡查中";
                    }
                    var probelm;
                    if (data[i].abnormal == 0) {
                        probelm = "无";
                    } else {
                        probelm = "有";
                    }
                    var tr = $("<tr><td>" + (i + 1) + "</td><td>" + data[i].checker_name + "</td><td>" + data[i].reservoir_name + "</td><td>" + data[i].check_time + "</td><td>" + status + "</td><td>" + probelm + "</td><td><button onclick='showCheckRecordDetailModal(" + data[i].mission_id + ",`" + data[i].reservoir_name + "`)'>详情</button></td></tr>");
                    tr.appendTo($("#hismission"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    $.ajax({
        url: '/page',
        type: 'get',
        success: function (data) {
            $(".pagination").empty();
            for (var i = 0; i < Math.ceil(data[0].num / 10); i++) {
                if (i == 0) {
                    var j = $("<li><a onclick='fontPage()'>上一页</a></li>");
                    j.appendTo($(".pagination"));
                }
                var li = $("<li><a onclick='searchPage(" + (i * 10) + ")' >" + (i + 1) + "</a></li>");
                li.appendTo($(".pagination"));
                //if(i==0){
                //     $("#s10").addClass('active');
                //}
                if (i == Math.ceil(data[0].num / 10) - 1) {
                    var j = $("<li><a onclick='nextPage(" + data[0].num + ")'>下一页</a></li>");
                    j.appendTo($(".pagination"));
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });

}

var selectall = 1;

function selectAll(obj) {
    if (selectall % 2) {
        $(obj).find("input").prop("checked", true);
        $(obj).children("div").children("div").show();
        $(obj).find("#selectAll").text("全不选");
        selectall++;
    } else {
        $(obj).find("input").prop("checked", false);
        $(obj).children("div").children("div").hide();
        $(obj).find("#selectAll").text("全选");
        selectall++;
    }
}

function fontPage() {
    //var a=$(".active").attr('id');
    //var n= parseInt(a.substring(2))-1;
    //console.log(n);
    //$(".active").removeClass();
    //$("#s1"+n).addClass('active');
    var m = $("#hismission tr:first td:first").text();
    if (m > 10) {
        searchPage(parseInt(m) - 11);
    }
}

function nextPage(w) {
    var d = $("#hismission tr:first td:first").text();
    if (parseInt(d) < Math.ceil(w / 10) * 10 - 10) {
        searchPage(parseInt(d) + 9);
    }
}

function searchPage(m) {
    $.ajax({
        url: '/record',
        data: {
            countX: m
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#hismission").empty();
            for (var i = 0; i < data.length; i++) {
                var status;
                if (data[i].status == 0) {
                    status = "未巡查";
                } else if (data[i].status == 1) {
                    status = "已巡查";
                } else {
                    status = "巡查中";
                }
                var probelm;
                if (data[i].abnormal == 0) {
                    probelm = "无";
                } else {
                    probelm = "有";
                }
                var tr = $("<tr><td>" + (m + 1 + i) + "</td><td>" + data[i].checker_name + "</td><td>" + data[i].reservoir_name + "</td><td>" + data[i].check_time + "</td><td>" + status + "</td><td>" + probelm + "</td><td><button onclick='showCheckRecordDetailModal(" + data[i].mission_id + ",`" + data[i].reservoir_name + "`)'>详情</button></td></tr>");
                tr.appendTo($("#hismission"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    //$(".active").removeClass();
    //$("#s1"+l).addClass('active');
}

//历史任务
function searchPage1(m) {
    $.ajax({
        url: '/search_reservoir_page',
        data: {
            m: m
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#showReservoir").empty();
            for (var i = 0; i < data.length; i++) {
                var tr = $("<tr><td>" + (m + 1 + i) + "</td><td>" + data[i].reservoir_Name + "</td><td>" + data[i].city + "</td><td>" + data[i].river + "</td><td>" + data[i].type + "</td><td>" + data[i].elevation + "</td><td><button onclick='ReservoirHeadInfo(`" + data[i].reservoir_Name + "`)'>详情</button></td></tr>");
                tr.appendTo($("#showReservoir"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}

function fontPage1() {
    var m = $("#showReservoir tr:first td:first").text();
    if (m > 10) {
        searchPage1(parseInt(m) - 11);
    }
}

function nextPage1(w) {
    var d = $("#showReservoir tr:first td:first").text();
    if (parseInt(d) < Math.ceil(w / 10) * 10 - 10) {
        searchPage1(parseInt(d) + 9);
    }
}

function search() {
    $.ajax({
        url: "/search",
        data: {
            mid: $("#mission_id").val(),
            rName: $("#reservoir_search").val(),
            cName: $("#checker_search").val(),
            date: $("#date_search").val(),
            states: $("#status").val(),
            dis: $("#disable").val()
        },
        type: 'get',
        dataType: 'json',
        success: function (data) {
            $("#hismission").empty();
            for (var i = 0; i < data.length; i++) {
                var status;
                if (data[i].status == 0) {
                    status = "未巡查";
                } else if (data[i].status == 1) {
                    status = "已巡查";
                } else {
                    status = "巡查中";
                }
                var probelm;
                if (data[i].abnormal == 0) {
                    probelm = "无";
                } else {
                    probelm = "有";
                }
                var tr = $("<tr><td>" + data[i].mission_id + "</td><td>" + data[i].checker_name + "</td><td>" + data[i].reservoir_name + "</td><td>" + data[i].check_time + "</td><td>" + status + "</td><td>" + probelm + "</td><td><button>详情</button></td></tr>");
                tr.appendTo($("#hismission"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function clickLog() {
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").hide();
    $("#ReservoirAdd").hide();
    $("#reservoir-manage").hide();
    $("#people-manage").hide();
    $("#device-manage").hide();
    $("#log-manage").show();
    if ($("#log-user").find("option").length == 1) {
        $.ajax({
            url: '/search_checker',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var opt = $("<option  value='" + data[i].checker_name + "'>" + data[i].checker_name + "</option>");
                    opt.appendTo($("#log-user"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    $.ajax({
        url: '/log',
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#log-table-tbody").empty();
            for (var i = 0; i < data.length; i++) {
                var tr = $("<tr><td>"+(i+1)+"</td><td>" + data[i].checker_name + "</td><td>"+ data[i].ip + "</td><td>" + data[i].time + "</td><tr>");
                tr.appendTo($("#log-table-tbody"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $.ajax({
        url: '/lpage',
        type: 'get',
        success: function (data) {
            $(".pagination").empty();
            for (var i = 0; i < Math.ceil(data[0].num / 10); i++) {
                if (i == 0) {
                    var j = $("<li><a onclick='fontPage3()'>上一页</a></li>");
                    j.appendTo($(".pagination"));
                }
                var li = $("<li><a onclick='searchPage3(" + (i * 10) + ")'>" + (i + 1) + "</a></li>");
                li.appendTo($(".pagination"));
                if (i == Math.ceil(data[0].num / 10) - 1) {
                    var j = $("<li><a onclick='nextPage3(" + data[0].num + ")'>下一页</a></li>");
                    j.appendTo($(".pagination"));
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
$("#logsearch").click(function(){
    $.ajax({
        url:'/logsearch',
        data:{
            name:$("#log-user").val(),
            ip:$("#log-ip").val(),
            time:$("#log-time").val()
        },
        dataType:'json',
        type:'get',
        success:function(data){
            $("#log-table-tbody").empty();
            for (var i = 0; i < data.length; i++) {
                var tr = $("<tr><td>"+data[i].num+"</td><td>" + data[i].checker_name + "</td><td>"+ data[i].ip + "</td><td>" + data[i].time + "</td><tr>");
                tr.appendTo($("#log-table-tbody"));
            }
        },
        error:function(err){
            console.log(err);
        }
    });
});
function fontPage3() {
    var m = $("#log-table-tbody tr:first td:first").text();
    if (m > 10) {
        searchPage3(parseInt(m) - 11);
    }
}
function nextPage3(w) {
    var d = $("#log-table-tbody tr:first td:first").text();
    if (parseInt(d) < Math.ceil(w / 10) * 10 - 10) {
        searchPage3(parseInt(d) + 9);
    }
}
function searchPage3(m) {
    $.ajax({
        url: '/lrecord',
        data: {
            countX: m
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#log-table-tbody").empty();
            for (var i = 0; i < data.length; i++) {
                var tr = $("<tr><td>"+(m + 1 + i)+"</td><td>" + data[i].checker_name + "</td><td>"+ data[i].ip + "</td><td>" + data[i].time + "</td><tr>");
                tr.appendTo($("#log-table-tbody"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
function clickSend() {
    $.ajax({
        url: '/showWorker',
        data: {
            all: 'all'
        },
        dataType: 'json',
        Type: 'get',
        success: function (data) {
            $('#people').empty();
            $('#reservoir').empty();
            for (var i = 0; i < data.length; i++) {
                var option = $("<option value='" + data[i]['checker_num'] + "'>" + data[i]['checker_name'] + "</option>");
                option.appendTo($('#people'));
                if (i == 0 || data[i]['reservoir_Name'] != data[i - 1]['reservoir_Name'] && i != 0) {
                        var resoption = $("<option>" + data[i]['reservoir_Name'] + "</option>");
                        resoption.appendTo($('#reservoir'));
                }
                else if (data[i]['reservoir_Name'] == data[i - 1]['reservoir_Name']) {
                    console.log('continue');
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").show();
    $("#reservoir-manage").hide();
    $("#people-manage").hide();
    $("#device-manage").hide();
    $("#log-manage").hide();
    $("#send-item-1").hide();
    $("#send-item-2").hide();
    $("#send-item-3").hide();
    $("#send-item-4").hide();
    $("#send-item-5").hide();
    $("#send-item-6").hide();
    $("#send-item-7").hide();
    $("#send-item-8").hide();
    $("#send-item-9").hide();
    $("#send-item-10").hide();
}

function clickReservoir() {
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").show();
    $("#people-manage").hide();
    $("#device-manage").hide();
    $("#log-manage").hide();
    $("#ReservoirAdd").hide();
    if (!$("#showReservoir").find("tr").length) {
        $.ajax({
            url: '/reservoir_page',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var tr = $("<tr><td>" + (i + 1) + "</td><td>" + data[i].reservoir_Name + "</td><td>" + data[i].city + "</td><td>" + data[i].river + "</td><td>" + data[i].type + "</td><td>" + data[i].elevation + "</td><td><button onclick='ReservoirHeadInfo(`" + data[i].reservoir_Name + "`)'>详情</button></td></tr>");
                    tr.appendTo($("#showReservoir"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    $.ajax({
        url: '/rpage',
        type: 'get',
        success: function (data) {
            $(".pagination").empty();
            for (var i = 0; i < Math.ceil(data[0].num / 10); i++) {
                if (i == 0) {
                    var j = $("<li><a onclick='fontPage1()'>上一页</a></li>");
                    j.appendTo($(".pagination"));
                }
                var li = $("<li><a onclick='searchPage1(" + (i * 10) + ")'>" + (i + 1) + "</a></li>");
                li.appendTo($(".pagination"));
                if (i == Math.ceil(data[0].num / 10) - 1) {
                    var j = $("<li><a onclick='nextPage1(" + data[0].num + ")'>下一页</a></li>");
                    j.appendTo($(".pagination"));
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function clickPeople() {
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#ReservoirAdd").hide();
    $("#people-manage").show();
    $("#device-manage").hide();
    $("#log-manage").hide();
    $.ajax({
        url: '/reservoirchoose',
        type: 'get',
        success: function (data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                var opt = $("<option value='" + data[i].reservoir_ID + "'>" + data[i].reservoir_Name + "</option>");
                opt.appendTo($("#reservoirchecker"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    if (!$("#worker").find("tr").length) {
        $.ajax({
            url: '/admin',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var tr = $("<tr><td>" + data[i].admin_num + "</td><td>管理员</td><td>" + data[i].admin_name + "</td><td><button class='btn btn-primary' onclick='showAdminInfo(" + data[i].admin_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].admin_num + ",\"管理员\")'>删除</button></td></tr>");
                    tr.appendTo($("#worker"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        $.ajax({
            url: '/checker',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var tr = $("<tr><td>" + data[i].checker_num + "</td><td>巡查者	</td><td>" + data[i].checker_name + "</td><td><button class='btn btn-primary' onclick='showInspectorInfo(" + data[i].checker_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].checker_num + ",\"巡查者\")'>删除</button></td></tr>");
                    tr.appendTo($("#worker"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        $.ajax({
            url: '/watcher',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var tr = $("<tr><td>" + data[i].watcher_num + "</td><td>观察员</td><td>" + data[i].watcher_name + "</td><td><button class='btn btn-primary' onclick='showWatcherInfo(" + data[i].watcher_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].watcher_num + ",\"观察员\")'>删除</button></td></tr>");
                    tr.appendTo($("#worker"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

//删除
$("#people-seekbtn").click(function () {
    $.ajax({
        url: '/searchdelete',
        data: {
            workerType: $("#seek-input1").val(),
            workerName: $("#seek-input2").val()
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            if (!data[0].role) {
                $("#worker").empty();
                for (var i = 0; i < data.length; i++) {
                    if (data[i].admin_num) {
                        var tr = $("<tr><td>" + data[i].admin_num + "</td><td>管理员</td><td>" + data[i].admin_name + "</td><td><button class='btn btn-primary' onclick='showAdminInfo(" + data[i].admin_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].admin_num + ",\"管理员\")'>删除</button></td></tr>");
                        tr.appendTo($("#worker"));
                    } else if (data[i].checker_num) {
                        var tr = $("<tr><td>" + data[i].checker_num + "</td><td>巡查者	</td><td>" + data[i].checker_name + "</td><td><button class='btn btn-primary' onclick='showInspectorInfo(" + data[i].checker_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].checker_num + ",\"巡查者\")'>删除</button></td></tr>");
                        tr.appendTo($("#worker"));
                    } else if (data[i].watcher_num) {
                        var tr = $("<tr><td>" + data[i].watcher_num + "</td><td>观察员</td><td>" + data[i].watcher_name + "</td><td><button class='btn btn-primary' onclick='showWatcherInfo(" + data[i].watcher_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].watcher_num + ",\"观察员\")'>删除</button></td></tr>");
                        tr.appendTo($("#worker"));
                    }
                }
            }
            else {
                for (var j = 0; j < data.length; j++) {
                    $.ajax({
                        url: '/searchdelete',
                        data: {
                            workerType: data[j].role,
                            workerName: data[j].name
                        },
                        dataType: 'json',
                        type: 'get',
                        success: function (data) {
                            $("#worker").empty();
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].admin_num) {
                                    var tr = $("<tr><td>" + data[i].admin_num + "</td><td>管理员</td><td>" + data[i].admin_name + "</td><td><button class='btn btn-primary' onclick='showAdminInfo(" + data[i].admin_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].admin_num + ",\"管理员\")'>删除</button></td></tr>");
                                    tr.appendTo($("#worker"));
                                } else if (data[i].checker_num) {
                                    var tr = $("<tr><td>" + data[i].checker_num + "</td><td>巡查者</td><td>" + data[i].checker_name + "</td><td><button class='btn btn-primary' onclick='showInspectorInfo(" + data[i].checker_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].checker_num + ",\"巡查者\")'>删除</button></td></tr>");
                                    tr.appendTo($("#worker"));
                                } else if (data[i].watcher_num) {
                                    var tr = $("<tr><td>" + data[i].watcher_num + "</td><td>观察员</td><td>" + data[i].watcher_name + "</td><td><button class='btn btn-primary' onclick='showWatcherInfo(" + data[i].watcher_num + ")'>详情</button> <button class='btn btn-primary' onclick='deletePerson(this.parentNode.parentNode," + data[i].watcher_num + ",\"观察员\")'>删除</button></td></tr>");
                                    tr.appendTo($("#worker"));
                                }
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});
//$("#admin_btn").click(function(){
//    $.ajax({
//        url:'/pic_upload',
//        data:{
//            type:'管理员',
//            anum:$("#admin_num").val(),
//            account:$("#admin_account").val(),
//            apassword:$("#admin_password").val(),
//            aphone:$("#admin_phone").val(),
//            aname:$('#admin_name').val(),
//            aid:$('#admin_ID').val(),
//            ahead:$('#admin_img').val()
//        },
//        dataType:'json',
//        type:'post',
//        success:function(data){
//            console.log(data);
//        },
//        error:function(err){
//            console.log(err);
//        }
//    });
//});
// 水库详情模态框细节展示隐藏按钮
function clickDevice() {
    $("#ReservoirInfo").hide();
    $("#map_block").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#log-manage").hide();
    $("#people-manage").hide();
    $("#ReservoirAdd").hide();
    $("#device-manage").show();
    if ($("#cNamed").find("option").length == 1) {
        $.ajax({
            url: '/search_checker',
            type: 'get',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var opt = $("<option  value='" + data[i].checker_name + "'>" + data[i].checker_name + "</option>");
                    opt.appendTo($("#cNamed"));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    $.ajax({
        url: '/search_checker',
        type: 'get',
        success: function (data) {
            $("#unused").empty();
            for (var i = 0; i < data.length; i++) {
                if (data[i].checker_phone != 0) {
                    var tr = $("<tr><td>" + data[i].checker_num + "</td><td>" + data[i].checker_name + "</td><td><button class='btn btn-primary' onclick='deviceAble(this.parentNode.parentNode," + data[i].checker_num + ")'>停用</button></td></tr>");
                    tr.appendTo($("#unused"));
                }
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

function addDeviceClicked() {
    $.ajax({
        url: '/addDevice',
        data: {
            checker_name: $("#cNamed").val(),
            checker_device: $("#device_checker_device").val(),
            checker_version: $("#device_phone_version").val(),
            checker_phone: $("#device_checker_number").val()
        },
        type: 'post',
        success: function (data) {
            console.log(data);
        },
        error: function (err) {
            console.log(err);
        }
    });
    clickReservoirInfo();
    $("#cNamed").val("请选择巡查者");
    $("#device_checker_device").val("");
    $("#device_phone_version").val("");
    $("#device_checker_number").val("");
}

$("#devicesearch").click(function () {
    $.ajax({
        url: '/searchdevice',
        data: {
            cname: $("#deviceSearchInput").val()
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#unused").empty();
            for (var i = 0; i < data.length; i++) {
                if (data[i].checker_phone != 0) {
                    var tr = $("<tr><td>" + data[i].checker_num + "</td><td>" + data[i].checker_name + "</td><td><button class='btn btn-primary' onclick='deviceAble(this.parentNode.parentNode," + data[i].checker_num + ")'>停用</button></td></tr>");
                    tr.appendTo($("#unused"));
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
});
// 模态框翻页
function modalFlip1() {
    $("#modalFlip1").show();
    $("#modalFlip2").hide();
    $("#modalFlip3").hide();
    $("#modalFlip4").hide();
    $("#modalFlip11").css("background-color", '#428bca');
    $("#modalFlip12").css("background-color", 'lightblue');
    $("#modalFlip13").css("background-color", 'lightblue');
    $("#modalFlip14").css("background-color", 'lightblue');
}

//function modalFlip2(){
$('#modalFlip12').click(function () {
    $.ajax({
        url: '/reservoirDetail',
        data: {
            rName: $('.modal-title').html()
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $('#river_area').html(data[0]['river_area']);
            $('#flow').html(data[0]['flow']);
            $('#maxFloodVentD').html(data[0]['maxFloodVentD']);
            $('#maxFloodVentV').html(data[0]['maxFloodVentV']);
            $('#reservior_adjust').html(data[0]['reservior_adjust']);
            $('#DesignFloodStandard').html(data[0]['DesignFloodStandard']);
            $('#DFloodlevel').html(data[0]['DFloodlevel']);
            $('#VFloodlevel').html(data[0]['VFloodlevel']);
            $('#NormalWlevel').html(data[0]['NormalWlevel']);
            $('#DeadWlevel').html(data[0]['DeadWlevel']);
            $('#NormalWlevelArea').html(data[0]['NormalWlevelArea']);
            $('#VFloodStandard').html(data[0]['VFloodStandard']);
            $('#TotalCapacity').html(data[0]['TotalCapacity']);
            $('#AbjustCapacity').html(data[0]['AbjustCapacity']);
            $('#DeadCapacity').html(data[0]['DeadCapacity']);
            $('#XinliCapacity').html(data[0]['XinliCapacity']);
            $('#AdFloodCapacity').html(data[0]['AdFloodCapacity']);
            $('#Floodwlevel').html(data[0]['Floodwlevel']);
            var date1 = new Date(data[0]['FloodStart']);
            var y = date1.getUTCFullYear();
            var m = date1.getUTCMonth() + 1;
            var d = date1.getUTCDate();
            $('#FloodStart').html(y + "年" + m + "月" + d + "日");
            var date2 = new Date(data[0]['FloodEnd']);
            var y = date2.getUTCFullYear();
            var m = date2.getUTCMonth() + 1;
            var d = date2.getUTCDate();
            $('#FloodEnd').html(y + "年" + m + "月" + d + "日");
            $('#FloodCapacity').html(data[0]['FloodCapacity']);
            $('#DefineFloodStandard').html(data[0]['DefineFloodStandard']);
            $('#DefineWlevel').html(data[0]['DefineWlevel']);
            $('#DefineCapacity').html(data[0]['DefineCapacity']);
            $('#HistoryMaxWlevel').html(data[0]['HistoryMaxWlevel']);
            var date3 = new Date(data[0]['HistoryMaxWlevelTime']);
            var y = date3.getUTCFullYear();
            var m = date3.getUTCMonth() + 1;
            var d = date3.getUTCDate();
            $('#HistoryMaxWlevelTime').html(y + "年" + m + "月" + d + "日");
            $('#HistoryMaxinFlow').html(data[0]['HistoryMaxinFlow']);
            var date4 = new Date(data[0]['HistoryMaxinFlowTime']);
            var y = date4.getUTCFullYear();
            var m = date4.getUTCMonth() + 1;
            var d = date4.getUTCDate();
            $('#HistoryMaxinFlowTime').html(y + "年" + m + "月" + d + "日");
            $('#HistoryMaxoutFlow').html(data[0]['HistoryMaxoutFlow']);
            var date4 = new Date(data[0]['HistoryMaxoutFlowTime']);
            var y = date4.getUTCFullYear();
            var m = date4.getUTCMonth() + 1;
            var d = date4.getUTCDate();
            $('#HistoryMaxoutFlowTime').html(y + "年" + m + "月" + d + "日");
            $('#BuildingType').html(data[0]['BuildingType']);
            $('#Damlevel').html(data[0]['Damlevel']);
            $('#MaxDamHigh').html(data[0]['MaxDamHigh']);
            $('#DamLength').html(data[0]['DamLength']);
            $('#DamWidth').html(data[0]['DamWidth']);
            $('#DamTopElevation').html(data[0]['DamTopElevation']);
            $('#DamDefineType').html(data[0]['DamDefineType']);
            $('#Damlow_addr').html(data[0]['Damlow_addr']);
            $('#DamDefine').html(data[0]['DamDefine']);
            $('#FloodBuildingType').html(data[0]['FloodBuildingType']);
            $('#BuildingLevel').html(data[0]['BuildingLevel']);
            $('#FlowRoad').html(data[0]['FlowRoad"']);
            $('#MaxFloodFlow').html(data[0]['MaxFloodFlow']);
            $('#BuildingLocation').html(data[0]['BuildingLocation']);
            $('#circleNum').html(data[0]['circleNum']);
            $('#circleType').html(data[0]['circleType']);
            $('#circleHigh').html(data[0]['circleHigh']);
            $('#circleWidth').html(data[0]['circleWidth']);
            $('#circleRadius').html(data[0]['circleRadius']);
            $('#EnterElevation').html(data[0]['EnterElevation']);
            $('#EnterGateTYype').html(data[0]['EnterGateTYype']);
            $('#RemoteName').html(data[0]['RemoteName']);
            $('#RemoteID').html(data[0]['RemoteID']);
            $('#project').html(data[0]['project']);
            $('#telType').html(data[0]['telType']);
            $('#hubMap').html(data[0]['hubMap']);
            $('#DamProfileMap').html(data[0]['DamProfileMap']);
            $('#BuildingProfileMap').html(data[0]['BuildingProfileMap']);
            $('#DamSafeMap').html(data[0]['DamSafeMap']);
        },
        error: function (err) {
            console.log(err);
        }
    });
    $("#modalFlip1").hide();
    $("#modalFlip2").show();
    $("#modalFlip3").hide();
    $("#modalFlip4").hide();
    $("#modalFlip11").css("background-color", 'lightblue');
    $("#modalFlip12").css("background-color", '#428bca');
    $("#modalFlip13").css("background-color", 'lightblue');
    $("#modalFlip14").css("background-color", 'lightblue');
});


$('#modalFlip13').click(function () {
    $.ajax({
        url: '/status',
        data: {
            rName: $('.modal-title').html()
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]['abnormal_state'] == 0) {
                    $("#Dam" + i).html('正常');
                } else {
                    $("#Dam" + i).html('异常');
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $("#modalFlip1").hide();
    $("#modalFlip2").hide();
    $("#modalFlip3").show();
    $("#modalFlip4").hide();
    $("#modalFlip11").css("background-color", 'lightblue');
    $("#modalFlip12").css("background-color", 'lightblue');
    $("#modalFlip13").css("background-color", '#428bca');
    $("#modalFlip14").css("background-color", 'lightblue');
});

function modalFlip4(rName) {
    $.ajax({
        url: '/ledger',
        data: {
            rName: rName
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            var date1 = new Date(data[0]['start']);
            var y = date1.getUTCFullYear();
            var m = date1.getUTCMonth() + 1;
            var d = date1.getUTCDate();
            $('.start').html(y + "年" + m + "月" + d + "日");
            var date2 = new Date(data[0]['end']);
            var y = date2.getUTCFullYear();
            var m = date2.getUTCMonth() + 1;
            var d = date2.getUTCDate();
            $('.end').html(y + "年" + m + "月" + d + "日");
            $('.waterlevel').html(data[0]['waterlevel']);
            $('#waterPDF').attr('src', data[0]['waterPDF']);
            $('#yearPDF').attr('src', data[0]['yearPDF']);
            $('#safePDF').attr('src', data[0]['safePDF']);
        },
        error: function (err) {
            console.log(err);
        }
    });
    $("#modalFlip1").hide();
    $("#modalFlip2").hide();
    $("#modalFlip3").hide();
    $("#modalFlip4").show();
    $("#modalFlip11").css("background-color", 'lightblue');
    $("#modalFlip12").css("background-color", 'lightblue');
    $("#modalFlip13").css("background-color", 'lightblue');
    $("#modalFlip14").css("background-color", '#428bca');
}

function ReservoirHeadInfo(rName) {
    $.ajax({
        url: '/reservoir',
        data: {
            rName: "'" + rName + "'"
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $('#myModalLabel').html(data[0]['reservoir_Name']);
            $('#city').html(data[0]['city']);
            $('#town').html(data[0]['town']);
            $('#river').html(data[0]['river']);
            $('#longitude').html(data[0]['longitude']);
            $('#latitude').html(data[0]['latitude']);
            $('#type').html(data[0]['type']);
            $('#level').html(data[0]['level']);
            $('#situation').html(data[0]['situation']);
            var date1 = new Date(data[0]['build_time']);
            var y = date1.getUTCFullYear();
            var m = date1.getUTCMonth() + 1;
            var d = date1.getUTCDate();
            $('#build_time').html(y + "年" + m + "月" + d + "日");
            $('#elevation').html(data[0]['elevation']);
        },
        error: function (err) {
            console.log(err);
        }
    });
    $('#reservoirDetailModal').modal('show');
}

function removeReservoirInfo(obj) {
    if (confirm("您确定要从展示区移除此水库吗？") == 1) {
        obj.remove();
    }
}

// 触发小项查看弹框
function showLittleItem(dName, rName, j) {
    $.ajax({
        url: '/stand',
        data: {
            dName: dName,
            rName: rName
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]['abnormal_state'] == 0) {
                    $('.State' + i).html('正常');
                }
                else {
                    $('.State' + i).html('异常');
                }
                $('.Command' + i).html(data[i]['remark']);
                $(".Pbtn" + i).html("<button onclick='viewPictureModal(" + data[i].department_ID + "," + data[i].mission_id + "," + data[i].department_ID + ")'>点我看图</button>");
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $('#littleItem1Modal' + j).modal('show');
}

function viewPictureModal(did, mid, j) {
    $.ajax({
        url: '/img',
        data: {
            did: did,
            mid: mid,
            Num: j
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $('.carousel-inner').empty();
            for (var i = 0; i < data.length; i++) {
                if (i == 0) {
                    var div = $('<div class="item active"></div>');
                    var url = $('<img src="' + data[0]['img_url'] + '" alt="0" onclick="imgRotate(this)">');
                    url.appendTo(div);
                    div.appendTo($('.carousel-inner'));
                }
                else {
                    var div = $('<div class="item"></div>');
                    var url = $('<img src="' + data[i]['img_url'] + '" alt="' + i + '" onclick="imgRotate(this)">');
                    url.appendTo(div);
                    div.appendTo($('.carousel-inner'));
                }
            }
            var left = $('<a href="#carouselcontainer" class="carousel-control left" data-slide="prev" onclick="newImgRotate(this.parentNode)">&lsaquo;</a>');
            left.appendTo($('.carousel-inner'));
            var right = $('<a href="#carouselcontainer" class="carousel-control right" data-slide="next" onclick="newImgRotate(this.parentNode)">&rsaquo;</a>');
            right.appendTo($('.carousel-inner'));
        },
        error: function (err) {
            console.log(err);
        }
    });
    $('#viewPictureModal').modal('show');
}
var current = 0;
function imgRotate(obj){
    current = (current+90)%360;
    obj.style.transform = 'rotate('+current+'deg)';
}
//恢复旋转前的图片位置
function newImgRotate(obj){
    $(obj).find(".active img")[0].style.transform = 'none';
    current = 0;
}
// 触发小项查看PDF弹框
function showPDF1() {
    $('#viewPDFModal1').modal('show');
}

function showPDF2() {
    $('#viewPDFModal2').modal('show');
}

function showPDF3() {
    $('#viewPDFModal3').modal('show');
}

//function submitmission() {
//    var msg = '{"checker":' + $("#people").val() + ',"create_time":"' + $("#day").val() + '","time":"' + $("#time").val() + '","reservoir":"' + $("#reservoir").val() + '","detail":"' + $("#detail").val() + '","subkey":[';
//    var selectItem = $(".checkItem:checked");
//    var submsg = '[';
//
//    for (var i = 0; i < selectItem.length; i++) {
//        if (i > 0) {
//            msg = msg + ',';
//            submsg = submsg + ',';
//        }
//        msg = msg + '{"did":' + selectItem.eq(i).val() + ',"dName":"' + selectItem.eq(i).next().text() + '"}';
//        //var subItem = $(".sub" + i + ":checked");
//        var subItem=selectItem.eq(i).siblings(".send-item").children("input:checked");
//        for (var j = 0; j < subItem.length; j++) {
//            if (j > 0)submsg = submsg + ',';
//            submsg = submsg + '{"select":' + selectItem.eq(i).val() + ',"reservoir":"' + $("#reservoir").val() + '","sub":' + subItem.eq(j).val() + '}';
//        }
//    }
//    submsg = submsg + ']';
//    msg = msg + '],"sub":' + submsg + '}';
//    return msg;
//}
function submitmission() {
    var user = $("#people").val();
    var checkDate = $("#day").val();
    if(checkDate.length<1){
        $("#day").focus();
        return "errorDate";
    }
    var checkTime = $("#time").val();
    var checkReservoir = $("#reservoir").val();
    var detail = $("#detail").val();
    if(detail.length<1){
        $("#detail").focus();
        return "errorDetail";
    }
    var msg = '{"checker":' + user + ',"create_time":"' + checkDate + '","time":"' + checkTime + '","reservoir":"' + checkReservoir + '","detail":"' + detail + '","subkey":[';
    var selectItem = $(".checkItem:checked");
    if(selectItem.length<1){
        return "errorCheckItem";
    }
    var submsg = '[';

    for (var i = 0; i < selectItem.length; i++) {
        if (i > 0) {
            msg = msg + ',';
            submsg = submsg + ',';
        }
        msg = msg + '{"did":' + selectItem.eq(i).val() + ',"dName":"' + selectItem.eq(i).next().text() + '"}';

        var subItem=selectItem.eq(i).siblings(".send-item").children("input:checked");
        if(subItem.length<1){
            return "errorSubItem";
        }
        for (var j = 0; j < subItem.length; j++) {
            if (j > 0)submsg = submsg + ',';
            submsg = submsg + '{"select":' + selectItem.eq(i).val() + ',"reservoir":"' + $("#reservoir").val() + '","sub":' + subItem.eq(j).val() + '}';
        }
    }
    submsg = submsg + ']';
    msg = msg + '],"sub":' + submsg + '}';
    return msg;
}


$('#submitButton').click(function () {
    var msg=submitmission();
    switch(msg){
        case "errorDate":
            alert("error");
            return;
            break;
        case "errorDetail":
            alert("error");
            return;
            break;
        case "errorCheckItem":
            alert("error");
            return;
            break;
        case "errorSubItem":
            alert("error");
            return;
            break;
        default:
            break;
    }
    $.ajax({
        url: '/missionSet2',
        data: {
            data: msg
        },
        Type: 'get',
        success: function (data) {
            console.log(data)
        },
        error: function (err) {
            console.log(err);
        }
    });
    $('#day').val("");
    $('#detail').val("");
    $(".checkItem").removeAttr('checked');
    for (var a = 0; a < 10; a++) {
        $(".sub" + a).removeAttr('checked');
    }
    $("#selectAll").html("全选");
    alert('任务派发成功');
    clickReservoirInfo();
});
function sendItem1(obj) {
    if ($(obj).children("input").is(':checked') == true) {
        $(obj).children("div").show();
    } else {
        $(obj).children("div").hide();
    }
}

function subkey(mid) {
    var selectItem = $(".checkItem:checked");
    for (var i = 0; i < selectItem.length; i++) {
        $.ajax({
            url: '/setSubkey',
            data: {
                mid: mid,
                did: selectItem.eq(i).val(),
                dName: selectItem.eq(i).next().text()
            },
            dataType: 'json',
            Type: 'get',
            success: function () {
                console.log('insert success');
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

function sub(mid) {
    var selectItem = $(".checkItem:checked");
    for (var i = 0; i < selectItem.length; i++) {
        var subItem = $(".sub" + i + ":checked");
        for (var j = 0; j < subItem.length; j++) {
            $.ajax({
                url: '/missionSub/' + mid,
                data: {
                    reservoir: $('#reservoir').val(),
                    select: selectItem.eq(i).val(),
                    sub: subItem.eq(j).val()
                },
                dataType: 'json',
                Type: 'get',
                success: function () {
                    console.log('insert success');
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    }
}

// 人员管理人员添加人员类型切换
function selectPeopleType(obj) {
    switch ($("#people-type").val()) {
        case "0":
            $("#admin-add").hide();
            $("#watcher-add").hide();
            $("#inspector-add").hide();
            break;
        case "1":
            $("#admin-add").hide();
            $("#watcher-add").hide();
            $("#inspector-add").show();
            break;
        case "2":
            $("#admin-add").show();
            $("#watcher-add").hide();
            $("#inspector-add").hide();
            break;
        case "3":
            $("#admin-add").hide();
            $("#watcher-add").show();
            $("#inspector-add").hide();
            break;
        default:
            return;
    }
}

// 点击图片上传头像
function uploadAdminAvatar() {
    $("#admin_img").click();
}

$("#admin_img").change(function () {
    $("#admin_head").submit();
    if (navigator.userAgent.indexOf("Chrome") > -1) {
        $("#admin_path").val("img/" + $("#admin_img").val().substring(12));
    } else {
        $("#admin_path").val("img/" + $("#admin_img").val());
    }
});
function uploadWatcherAvatar() {
    $("#watcher_img").click();
}

$("#watcher_img").change(function () {
    $("#watcher_head").submit();
    if (navigator.userAgent.indexOf("Chrome") > -1) {
        $("#watcher_path").val("img/" + $("#watcher_img").val().substring(12));
    } else {
        $("#watcher_path").val("img/" + $("#watcher_img").val());
    }
});
function uploadInspectorAvatar() {
    $("#inspector_img").click();
}

$("#inspector_img").change(function () {
    $("#checker_head").submit();
    if (navigator.userAgent.indexOf("Chrome") > -1) {
        $("#checker_path").val("img/" + $("#inspector_img").val().substring(12));
    } else {
        $("#checker_path").val("img/" + $("#inspector_img").val());
    }
});
// 人员详情弹窗
function showAdminInfo(a) {
    $.ajax({
        url: '/adminone',
        data: {
            aid: a
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#admin").attr('src', data[0].admin_head);
            $("#aname").text(data[0].admin_name);
            $("#aphone").text(data[0].admin_phone);
            $("#aid").text(data[0].admin_ID);
            $("#aacount").text(data[0].admin_account);
        },
        error: function (err) {
            console.log(err);
        }
    });
    $('#adminInfoWindow').modal('show');
}

function closeAdminInfo() {
    $('#adminInfoWindow').modal('hide');
}

function showInspectorInfo(a) {
    $.ajax({
        url: '/checkerone',
        data: {
            cid: a
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#checkerone").attr("src", data[0].checker_head);
            $("#cname").text(data[0].checker_name);
            $("#cphone").text(data[0].checker_phone);
            $("#cdevice").text(data[0].checker_device);
            $("#clocation").text(data[0].checker_location);
            $("#cid").text(data[0].checker_ID);
            $("#cversion").text(data[0].checker_version);
            $("#creservoir").text(data[0].reservoir_Name);
            if (data[0].checker_role == 'principal') {
                $("#cwork").text("负责人");
            } else {
                $("#cwork").text("检查者");
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $('#inspectorInfoWindow').modal('show');
}

function closeInspectorInfo() {
    $('#inspectorInfoWindow').modal('hide');
}

function showWatcherInfo(a) {
    $.ajax({
        url: '/watcherone',
        data: {
            wid: a
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#watcher").attr('src', data[0].watcher_head);
            $("#wname").text(data[0].watcher_name);
            $("#wphone").text(data[0].watcher_phone);
            $("#wid").text(data[0].watcher_ID);
            $("#wacount").text(data[0].watcher_account);
        },
        error: function (err) {
            console.log(err);
        }
    })
    $('#watcherInfoWindow').modal('show');
}

function closeWatcherInfo() {
    $('#watcherInfoWindow').modal('hide');
}

// 人员删除
function deletePerson(obj, workerid, worker) {
    $.ajax({
        url: '/delete',
        data: {
            worker: worker,
            workerid: workerid
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            console.log(data);
        },
        error: function (err) {
            console.log(err);
        }
    });
    if (confirm("您确定要删除此人员吗？") == 1) {
        obj.remove();
    }
}

// 设备停用
function deviceAble(obj, x) {
    if (confirm("您确定要停用此设备吗？") == 1) {
        //$(obj).find('.deviceAble').html("已停用");
        obj.remove();
    }
    $.ajax({
        url: '/unused',
        data: {
            cnum: x
        },
        dataType: 'json',
        type: 'post',
        success: function (data) {
            console.log(data);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function deviceDisable(obj) {
    if (confirm("您确定要起用此设备吗？") == 1) {
        $(obj).find('.deviceAble').html("使用中");
    }
}

$("#reservoiradd").click(function () {
    if ($("#rrName").val() == "" || $("#rcity").val() == "" || $("#rtown").val() == ""
        || $("#rriver").val() == "" || $("#rlongitude").val() == "" || $("#rlatitude").val() == ""
        || $("#rtype").val() == "" || $("#rsituation").val() == "" || $("#rbuild_time").val() == ""
        || $("#relevation").val() == "") {
        alert("请输入完整的水库信息。");
        $("#rrName").val("");
        $("#rcity").val("");
        $("#rtown").val("");
        $("#rriver").val("");
        $("#rlongitude").val("");
        $("#rlatitude").val("");
        $("#rtype").val("");
        $("#rsituation").val("");
        $("#rbuild_time").val("");
        $("#relevation").val("");
    } else {
        alert("设备信息输入完整");
        $.ajax({
            url: '/reservoirAdd',
            data: {
                rName: $("#rrName").val(),
                city: $("#rcity").val(),
                town: $("#rtown").val(),
                river: $("#rriver").val(),
                longitude: $("#rlongitude").val(),
                latitude: $("#rlatitude").val(),
                type: $("#rtype").val(),
                situation: $("#rsituation").val(),
                build_time: $("#rbuild_time").val(),
                elevation: $("#relevation").val()
            },
            dataType: 'json',
            type: 'post',
            success: function (data) {
                console.log(data);
            },
            error: function (err) {
                console.log(err);
            }
        });
        $.ajax({
            url: '/reservoirDetailInsert',
            data: {
                rName: $("#rrName").val(),
                river_area: $("#rriver_area").val(),
                flow: $("#rflow").val(),
                MaxFloodFlow: $("#rMaxFloodFlow").val(),
                maxFloodVentD: $("#rmaxFloodVentD").val(),
                reservior_adjust: $("#rreservior_adjust").val(),
                VFloodStandard: $("#rVFloodStandard").val(),
                FloodCapacity: $("#rFloodCapacity").val(),
                DefineCapacity: $("#rDefineCapacity").val(),
                DeadCapacity: $("#rDeadCapacity").val(),
                TotalCapacity: $("#rTotalCapacity").val()
            },
            dataType: 'json',
            type: 'post',
            success: function (data) {
                console.log(data);
            },
            error: function (err) {
                console.log(err);
            }
        });
        clickReservoirInfo();
        $("#rrName").val("");
        $("#rcity").val("");
        $("#rtown").val("");
        $("#rriver").val("");
        $("#rlongitude").val("");
        $("#rlatitude").val("");
        $("#rtype").val("");
        $("#rsituation").val("");
        $("#rbuild_time").val("");
        $("#relevation").val("");
        $("#rriver_area").val("");
        $("#rflow").val("");
        $("#rMaxFloodFlow").val("");
        $("#rmaxFloodVentD").val("");
        $("#rreservior_adjust").val("");
        $("#rVFloodStandard").val("");
        $("#rFloodCapacity").val("");
        $("#rDefineCapacity").val("");
        $("#rDeadCapacity").val("");
        $("#rTotalCapacity").val("");
    }
});
$("#optionBlockBtn").click(function () {
    $.ajax({
        url: "/reservoir_search",
        data: {
            rname: $("#srname").val(),
            rcity: $("#srcity").val(),
            rriver: $("#srriver").val(),
            rtype: $("#srtype").val(),
            relevation: $("#srelevation").val()
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            $("#showReservoir").empty();
            for (var i = 0; i < data.length; i++) {
                var tr = $("<tr><td>" + data[i].reservoir_ID + "</td><td>" + data[i].reservoir_Name + "</td><td>" + data[i].city + "</td><td>" + data[i].river + "</td><td>" + data[i].type + "</td><td>" + data[i].elevation + "</td><td><button onclick='ReservoirHeadInfo(`" + data[i].reservoir_Name + "`)'>详情</button></td></tr>");
                tr.appendTo($("#showReservoir"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});
//地图人员信息窗最新新体检单查看弹窗
function showPeopleNewCheckInMap(a, b) {

    $.ajax({
        url: '/nstatus',
        data: {
            mid: a,
            rName: b
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]['abnormal_state'] == 0) {
                    $("#NDam" + i).html('正常');
                } else {
                    $("#NDam" + i).html('异常');
                }
                if (!$(".tDam" + i).find("button").length) {
                    var but = $("<td><button onclick='showLittleItem(`" + $('.NDam' + i).html() + "`,`" + b + "`," + i + ")'>查看小项</button></td>");
                    but.appendTo($(".tDam" + i));
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $("#peopleNewCheckInMap").modal('show');
}

//巡查审阅记录详情查看
function showCheckRecordDetailModal(a, b) {
    $.ajax({
        url: '/nstatus',
        data: {
            mid: a,
            rName: b
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]['abnormal_state'] == 0) {
                    $("#CDam" + i).html('正常');
                } else {
                    $("#CDam" + i).html('异常');
                }
                if (!$(".tCDam" + i).find("button").length) {
                    var but = $("<td><button onclick='showLittleItem(`" + $('.CDam' + i).html() + "`,`" + b + "`," + i + ")'>查看小项</button></td>");
                    but.appendTo($(".tCDam" + i));
                }
            }
            if (!$("#submitremark").find("button").length) {
                var submitbtn = $('<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="submitremark(' + data[0].mission_id + ')">提交评审结果</button></div>')
                submitbtn.appendTo($("#submitremark"));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    $("#checkRecordDetailModal1").modal('show');
}

function submitremark(a) {
    $.ajax({
        url: '/submit',
        data: {
            id: a,
            status: $("#normal").val(),
            remark: $("#callback").val()
        },
        dataType: 'json',
        type: 'post',
        success: function (data) {
            console.log(data);
        },
        error: function (err) {
            console.log(err);
        }
    })
}