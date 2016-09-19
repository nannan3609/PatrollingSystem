$(document).ready(function() {
    var map = new AMap.Map('map_container', { zoom: 10, center: [120.15506900000003, 30.274089] });
    $("#check").hide();
    $("#send").hide();
});


function clickMap() {
    $("#map_container").show();
    $("#check").hide();
    $("#send").hide();
}

function clickSeek() {
    $("#map_container").hide();
    $("#check").show();
    $("#send").hide();
    $.ajax({
    url: '/showRecord',
    data:{
          record:"record"
    },
     dataType:'json',
     type:'get',
     success:function(data){
     	for(var i=0;i<data.length;i++){
     		var li=$('<li class="list-group-item">'+(data[i]['record_num']+1)+'<li>')
     		var lilink=$('<a class="link">记录编号：'+data[i]['record_num']+'</a>');
     		//lilink.href="/patrol/"+data[i]['record_num'];
     		lilink.appendTo(li);
     		li.appendTo($(".list-group"));
            $(".link").click(function(i){
                $.ajax({
                   url:'/patrol',
                    data:{
                        record:data[i]['record_num'],
                        date:data[i]['date']
                    },
                    dataType:'json',
                    type:'get',
                    success:function(data){
                        //window.location.href="/"+data[0][];
                        $.ajax({
                            url:'/detail',
                            data:{

                            },
                            dataType:'json',
                            type:'post',
                            success:function(data){
                                window.location.href="/detail";
                            }
                        });
                    }

                });
            });
     	}
     },
     error:function (error) {
        console.log("wrong");
        console.log(error);
     }
     });
}

function clickSend() {
    $("#map_container").hide();
    $("#check").hide();
    $("#send").show();
}
function clickReservoir(){
    $("#map_container").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").show();
    $("#people-manage").hide();
    $("#device").hide();
}

function clickPeople(){
    $("#map_container").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#people-manage").show();
    $("#device").hide();
}

function clickDevice(){
    $("#map_container").hide();
    $("#check").hide();
    $("#send").hide();
    $("#reservoir-manage").hide();
    $("#people-manage").hide();
    $("#device").show();
}