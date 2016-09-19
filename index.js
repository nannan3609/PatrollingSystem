/**
 * Created by nannan on 16/7/12.
 */
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var formidable = require('formidable');
var fs = require("fs");
var adm_zip = require("adm-zip");
var mysql = require('mysql');
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
// 引入
var AVATAR_UPLOAD_FOLDER = 'rimg/';
app.use(bodyParser.json());  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
    extended: false
}));
//app.use(express.bodyParser({
//    defer:false
//}));
//app.use(express.multipart());
app.use(cookieParser());
app.use(session({
    secret: 'patrol',
    resave: true, // don't save session if unmodified
    saveUninitialized: false // don't create session until something stored
}));
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'PatrollingSystem'
});
conn.connect();
// 连接数据库
app.set('view engine', 'ejs');
//设置模板引擎
app.set('views', __dirname + '/views');
app.use(express.static(__dirname));
app.get('/', function (req, res) {
    var local = {alogin: "block", wlogin: "none", watcher: "none", admin: "none"};
    res.render('login.ejs', local);
    //主页
});
function getClientIp(req) {
    //var ipAddress;
    //var forwardedIpsStr = req.header('x-forwarded-for');
    //if (forwardedIpsStr) {
    //    var forwardedIps = forwardedIpsStr.split(',');
    //    ipAddress = forwardedIps[0];
    //}
    //if (!ipAddress) {
    //    ipAddress = req.connection.remoteAddress;
    //}
    //return ipAddress.substring(7);
    var ipAddress;
    var headers = req.headers;
    var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
    forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress.substring(7);
}
app.get('/ip',function(req,res){
   res.send(req.ip);
});
app.post('/checkerinfo', function (req, res) {
    var data = JSON.parse(req.body.data);
    var selectSQL = "select checker_num,checker_name,checker_head,checker_version from checker where checker_device='" + data.MEID+"'";
    conn.query(selectSQL, function (err, rows) {
        console.log(rows);
        console.log(rows.length);
        if (rows.length == 0) {
            res.send("fail");
        } else {
            res.json(rows);
            var log="INSERT INTO `log`(`logintime`, `ip`, `checker_num`) VALUES (NOW(),'"+req.ip+"',"+rows[0].checker_num+")";
            console.log(log);
            conn.query(log, function (err, rows) {
                if (err) console.log(err);
                //res.json(rows);
            });
        }
        // 以JSON输入查询结果
    });
});
app.get('/log',function(req,res){
    var sel="SELECT num,DATE_FORMAT(logintime,'%Y-%m-%e %H:%i:%s') as time,ip,checker_name FROM `log` left join `checker` on log.checker_num=checker.checker_num limit 0,10";
    conn.query(sel, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
    });
});
app.get('/logsearch', function (req, res) {
    var sql="SELECT  log.num,DATE_FORMAT(log.logintime,'%Y-%m-%e %H:%i:%s') as time, log.ip, checker.checker_name FROM `log`,`checker` where log.checker_num=checker.checker_num";
    if (req.query.name != "请选择检查人员") {
        sql = sql + " and checker.checker_name='" + req.query.name+"'";
    }
    if (req.query.ip != "") {
        sql = sql + " and log.ip='" + req.query.ip + "'";
    }
    if (req.query.time != "") {
        sql = sql + " and log.logintime='" + req.query.time + "'";
    }
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get("/lpage", function (req, res) {
    var sql = "select count(*) as num from log";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get("/lrecord",function(req,res){
    var sel="SELECT num,DATE_FORMAT(logintime,'%Y-%m-%e %H:%i:%s') as time,ip,checker_name FROM `log` left join `checker` on log.checker_num=checker.checker_num limit "+req.query.countX+",10";
    conn.query(sel, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
    });
});
//手机端查看巡查人员的资料
app.post('/mission', function (req, res) {
    var data = JSON.parse(req.body.data);
    var selectSQL = "select *  from mission where checker_num=" + data.num + " and status=0";
    conn.query(selectSQL, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//安卓获得任务
app.post('/subkey', function (req, res) {
    var data = JSON.parse(req.body.data);
    var selectSQL = "select *  from subkey where mission_id=" + data.mid;
    conn.query(selectSQL, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
    //子项
});
app.post('/detail', function (req, res) {
    var data = JSON.parse(req.body.data);
    var selectSQL = "select * from stand,department,standard where department.department_ID=" + data.did + " and stand.mission_id=" + data.mid + " and stand.department_ID=" + data.did + " and standard.department_ID=" + data.did + " and standard.stand_ID=stand.stand_ID";
    console.log(selectSQL);
    conn.query(selectSQL, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
    //详情
});

app.post('/probelmUpload', function (req, res) {
    var data = JSON.parse(req.body.data);
    //var gps = "INSERT INTO `gps`(`mission_id`, `time`,`gps_coordinateX`, `gps_coordinateY`) VALUES";
    for (var i = 0; i < eval(data.lat).length; i++) {
        var gps = "INSERT INTO `gps`(`mission_id`, `time`,`gps_coordinateX`, `gps_coordinateY`) VALUES ("+data.lat[i].id+",FROM_UNIXTIME(LEFT(" + data.lat[i].time + ",10), '%Y-%m-%d %H:%i:%S'),'"+data.lat[i].longitude+"','"+data.lat[i].latitude+"')";
       //if(i!=0){
       //    gps=gps+",";
       //}
       // gps = gps+"(" + data.lat[i].id + ",FROM_UNIXTIME(LEFT(" + data.lat[i].time + ",10), '%Y-%m-%d %H:%i:%S'),'" + data.lat[i].longitude + "','" + data.lat[i].latitude + "')";
        console.log(gps);
        conn.query(gps, function (err, rows) {
            if (err) console.log(err);
        });
    }
    //console.log(gps);
    //conn.query(gps, function (err, rows) {
    //    if (err) console.log(err);
    //});
    //var img = "insert into `img` (`mission_id`,`img_url`,`department_ID`,`stand_ID`,`reservoir_Name`) values ";
    for (var d = 0; d < eval(data.photo).length; d++) {
        //if(d!=0){
        //    img=img+",";
        //}
        var img = "insert into `img` (`mission_id`,`img_url`,`department_ID`,`stand_ID`,`reservoir_Name`) values ("+data.photo[d].mission_id+",'rimg/"+ data.photo[d].photo_id+"',"+data.photo[d].department_ID+","+data.photo[d].stand+",(select reservoir_Name from mission where mission_id=" + data.photo[d].mission_id + "))";
         //img = img+"(" + data.photo[d].mission_id + ",'rimg/" + data.photo[d].photo_id + "'," + data.photo[d].department_ID + "," + data.photo[d].stand + ",(select reservoir_Name from mission where mission_id=" + data.photo[d].mission_id + "))";
        console.log(img);
        conn.query(img, function (err, rows) {
            if (err) console.log(err);
        });
    }
    //console.log(img);
    //conn.query(img, function (err, rows) {
    //    if (err) console.log(err);
    //});
    //var sub = "INSERT INTO `probelm`( `department_ID`,`mission_id`,`abnormal_state`,`remark`,`longitude`,`latitude`) VALUES ";
    for (var j = 0; j < eval(data.sub).length; j++) {
        var sub = "INSERT INTO `probelm`( `department_ID`,`mission_id`,`abnormal_state`,`remark`,`longitude`,`latitude`) VALUES ("+data.sub[j].department_ID+","+data.sub[j].mission_id+",0,'"+data.sub[j].remark+"',"+data.sub[j].longitude+","+data.sub[j].latitude +")";
        //if(j!=0) {
        //        sub=sub+",";
        //    }
        //    sub=sub +"("+data.sub[j].department_ID + "," + data.sub[j].mission_id + ",0,'" + data.sub[j].remark + "'," + data.sub[j].longitude + "," + data.sub[j].latitude + ")";
        console.log(sub);
        conn.query(sub, function (err, rows) {
            if (err) console.log(err);
        });
    }
    //console.log(sub);
    //conn.query(sub, function (err, rows) {
    //    if (err) console.log(err);
    //});

    for (var e = 0; e < eval(data.task).length; e++) {
        for (var w = 0; w < eval(data.task[e]).length; w++) {
            var task = "update `stand` set have_problem=" + data.task[e][w].have_problem + ",picture_num=" + data.task[e][w].picture_num + " where department_ID=" + data.task[e][w].department_ID + " and stand_ID=" + data.task[e][w].stand_ID + " and mission_id=" + data.task[e][w].mission_id;
            console.log(task);
            conn.query(task, function (err, rows) {
                if (err) console.log(err);
            });
        }
    }

    var updateSQL = "update `mission` set status=1,uchecker_time=NOW() where mission_id=" + data.lat[0].id;
    console.log(updateSQL);
    conn.query(updateSQL, function (err, rows) {
        if (err) console.log(err);
    });
    res.send("success");
});
//手机端问题上报
app.post('/file_upload', function (req, res) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';   //设置编码
    form.uploadDir = AVATAR_UPLOAD_FOLDER;  //设置上传目录
    form.keepExtensions = true;  //保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024;  //文件大小
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            return;
        }
        var avatarName = files.file.name;
        var newPath = form.uploadDir + avatarName;
        fs.renameSync(files.file.path, newPath); //重命名
        res.send("success");
        var unzip = new adm_zip(newPath);
        unzip.extractAllTo("rimg/", true);
    });
});
//手机文件上传
app.get('/showNewMission', function (req, res) {
    var newmission = 'select * from checker,mission where checker.checker_num=' + req.query.num + ' and checker.checker_num=mission.checker_num and check_time in (select MAX(check_time) from mission where mission.checker_num=' + req.query.num + ') order by mission.uchecker_time desc';
    console.log(newmission);
    conn.query(newmission, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            //console.log(rows);
            res.json(rows);
        }
    });
});
app.post('/pic_upload', function (req, res) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';   //设置编码
    form.uploadDir = 'img/';  //设置上传目录
    form.keepExtensions = true;  //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;  //文件大小
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            return;
        }
        var avatarName = files.img.name;
        var newPath = form.uploadDir + avatarName;
        fs.renameSync(files.img.path, newPath); //重命名
    });
});
app.post('/admin_upload', function (req, res) {
    var sql = "INSERT INTO `admin` ( `admin_account`, `admin_name`, `admin_password`, `admin_phone`,`admin_ID`, `admin_head`) VALUES ('" + req.body.admin_account + "','" + req.body.admin_name + "','" + req.body.admin_password + "'," + req.body.admin_phone + "," + req.body.admin_ID + ",'" + req.body.admin_path + "')";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/manage');
        }
    });
});
app.post('/checker_upload', function (req, res) {
    var sql = 'INSERT INTO `checker`( `checker_device`, `checker_name`, `checker_phone`, `checker_location`, `checker_ID`, `checker_head` , `reservoir_ID`, `checker_role`) VALUES ("' + req.body.checker_device + '","' + req.body.checker_name + '",' + req.body.checker_phone + ',"' + req.body.checker_location + '",' + req.body.checker_ID + ',"' + req.body.checker_path + '",' + req.body.reservoir + ',"' + req.body.work + '")';
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/manage');
        }
    });
});
app.post('/watcher_upload', function (req, res) {
    var sql = "INSERT INTO `watcher`(`watcher_name`, `watcher_account`, `watcher_password`, `watcher_ID`, `watcher_phone`, `watcher_head`) VALUES ('" + req.body.watcher_name + "','" + req.body.watcher_account + "','" + req.body.watcher_password + "'," + req.body.watcher_ID + "," + req.body.watcher_phone + ",'" + req.body.watcher_path + "')";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/manage');
        }
    });
});
//添加人员
app.get('/reservoirchoose', function (req, res) {
    var selectsql = "select * from reservoir";
    console.log(selectsql);
    conn.query(selectsql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            //console.log(rows);
            res.json(rows);
        }
    });
});
app.post('/reservoirAdd', function (req, res) {
    var sql = "INSERT INTO `reservoir`(`reservoir_Name`, `city`, `town`, `river`, `longitude`, `latitude`, `type`, `situation`, `build_time`, `elevation`) VALUES ('" + req.body.rName + "','" + req.body.city + "','" + req.body.town + "','" + req.body.river + "'," + req.body.longitude + "," + req.body.latitude + ",'" + req.body.type + "','" + req.body.situation + "','" + req.body.build_time + "','" + req.body.elevation + "')";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/manage');
        }
    });
});
app.post('/reservoirDetailInsert', function (req, res) {
    var sql = "insert into reservoirDetail (`reservoir_Name`,`river_area`,`flow`,`MaxFloodFlow`,`maxFloodVentD`,`reservior_adjust`,`VFloodStandard`,`FloodCapacity`,`DefineCapacity`,`DeadCapacity`,`TotalCapacity`) values ('" + req.body.rName + "'," + req.body.river_area + "," + req.body.flow + "," + req.body.MaxFloodFlow + "," + req.body.maxFloodVentD + ",'" + req.body.reservior_adjust + "'," + req.body.VFloodStandard + "," + req.body.FloodCapacity + "," + req.body.DefineCapacity + "," + req.body.DeadCapacity + "," + req.body.TotalCapacity + ")";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/manage');
        }
    });
});
app.post('/adminLogin', function (req, res) {
    var selectSQL = "SELECT * FROM `admin` WHERE `admin_account`='" + req.body.admin_name + "' and `admin_password`='" + req.body.admin_password + "';";
    console.log(selectSQL);
    conn.query(selectSQL, function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length > 0) {
                req.session.user = "login";
                res.redirect('/manage');
            }
            else {
                console.log('wrong');
                //res.redirect('/');
                var admin = {alogin: "block", wlogin: "none", admin: "block", watcher: "none"};
                res.render('login.ejs', admin);
            }
        }
    });
});
app.post('/watcherLogin', function (req, res) {
    var selectSQL = "SELECT * FROM `watcher` WHERE `watcher_account`='" + req.body.watcher_name + "' and `watcher_password`='" + req.body.watcher_password + "';";
    console.log(selectSQL);
    conn.query(selectSQL, function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length > 0) {
                req.session.user = "login";
                res.redirect('/manage');
            }
            else {
                console.log('wrong');
                //res.redirect('/');
                var watcher = {alogin: "none", wlogin: "block", watcher: "block", admin: "none"};
                res.render('login.ejs', watcher);
            }
        }
    });
});
app.get('/manage', function (req, res) {
    if (req.session.user == "login") {
        res.render('index.ejs');
    }
    else {
        res.redirect('/');
    }
});
app.get('/admin', function (req, res) {
    var admin = "select * from admin";
    conn.query(admin, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/adminone', function (req, res) {
    var adminone = "select * from admin where admin_num=" + req.query.aid;
    conn.query(adminone, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//管理员具体信息
app.get('/checker', function (req, res) {
    var checker = "select * from checker";
    conn.query(checker, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
    });
});
app.get('/checkerone', function (req, res) {
    var checkone = "select * from checker,reservoir where checker.reservoir_ID=reservoir.reservoir_ID and checker.checker_num=" + req.query.cid;
    conn.query(checkone, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
    });
});
//检查者详情
app.get('/watcher', function (req, res) {
    var watcher = "select * from watcher";
    conn.query(watcher, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//管理端显示观察者信息
app.get('/watcherone', function (req, res) {
    var watcherone = "select * from watcher where watcher_num=" + req.query.wid;
    conn.query(watcherone, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
    });
});
//管理端显示观察者具体信息
app.get('/delete', function (req, res) {
    var deleteworker = "";
    if (req.query.worker == "管理员") {
        deleteworker = "delete from admin where admin_num=" + req.query.workerid;
    } else if (req.query.worker == "巡查者") {
        deleteworker = "delete from checker where checker_num=" + req.query.workerid;
    } else if (req.query.worker == "观察员") {
        deleteworker = "delete from watcher where watcher_num=" + req.query.workerid;
    }
    conn.query(deleteworker, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log('delete success');
        }
    });
});
//删除
app.get('/searchdelete', function (req, res) {
    var searchdelete = "";
    if (req.query.workerType == '管理员') {
        if (req.query.workerName != '') {
            searchdelete = "select * from admin where admin_name='" + req.query.workerName + "'";
        } else {
            searchdelete = "select * from admin";
        }
    } else if (req.query.workerType == '巡查者') {
        if (req.query.workerName != '') {
            searchdelete = "select * from checker where checker_name='" + req.query.workerName + "'";
        }
        else {
            searchdelete = "select * from checker";
        }
    } else if (req.query.workerType == '观察员') {
        if (req.query.workerName != '') {
            searchdelete = "select * from watcher where watcher_name='" + req.query.workerName + "'";
        } else {
            searchdelete = "select * from watcher";
        }
    } else {
        searchdelete = "select * from worker where name='" + req.query.workerName + "'";
    }
    console.log(searchdelete);
    conn.query(searchdelete, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
    });
});
//app.get('/checkerDetail/:num', function (req, res) {
//    var selectSQL = "select *  from checker where checker_num=" + req.params.num;
//    conn.query(selectSQL, function (err, rows) {
//        if (err) console.log(err);
//        res.json(rows);
//        // 以JSON输入查询结果
//    });
//});
//管理端显示巡查者具体信息
//app.post('/tochange', function (req, res) {
//    var data = JSON.parse(req.body.data);
//    var local = {
//        num: data.num,
//        device: data.device,
//        name: data.name,
//        phone: data.phone,
//        location: data.loaction,
//        ID: data.ID,
//        head: data.head,
//        role: data.role
//    };
//    res.render('tochange.ejs', local);
//});
//管理端人员信息修改页面
app.post('/update', function (req, res) {
    var data = JSON.parse(req.body.data);
    var updateSQL = "UPDATE `checker` SET `checker_device`=" + data.device + ",`checker_name`=" + data.name + ",`checker_phone`=" + data.phone + ",`checker_location`=" + data.loaction + ",`checker_ID`=" + data.ID + ",`checker_head`=" + data.head + ",`checker_role`=" + data.role + " WHERE `checker_num`=" + data.num;
    conn.query(updateSQL, function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("success");
        }
    });
});
//管理员提交人员修改


//app.get('/probelm/:num', function (req, res) {
//    var getprobelm = "select * from `probelm` WHERE `probelm_id`=" + req.params.num;
//    conn.query(getprobelm, function (err, rows) {
//        if (err) console.log(err);
//    });
//});
//管理端问题显示

app.get('/reservoirTotal', function (req, res) {
    console.log(req.session.user);
    if (req.session.user == 'login' && req.query.reservoir == 'patrolling') {
        var show = "SELECT * FROM reservoir,checker where reservoir.reservoir_ID=checker.reservoir_ID order by reservoir.reservoir_Name";
        console.log(show);
        conn.query(show, function (err, rows) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(rows);
            }
            // 以JSON输入查询结果
        });
    }
    else {
        console.log('登录失败');
        res.redirect('/');
    }
});
//管理端显示所有水库的信息
app.get('/reservoir', function (req, res) {
    var showDetail = "SELECT * FROM `reservoir` where reservoir_Name=" + req.query.rName;
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/reservoirDetail', function (req, res) {
    var showDetail = "SELECT * FROM `reservoirDetail` WHERE reservoir_name='" + req.query.rName + "'";
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//管理端显示水库具体的信息
app.get('/status', function (req, res) {
    var showDetail = "SELECT * FROM `sumbitrecord` WHERE reservoir_Name='" + req.query.rName + "'";
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//总标准状态显示
app.get('/nstatus', function (req, res) {
    var showDetail = "SELECT * FROM `sumbitrecord` WHERE mission_id='" + req.query.mid + "'";
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/stand', function (req, res) {
    var showDetail = "SELECT * FROM `probelm`,`department`,`mission`  WHERE department.department_name='" + req.query.dName + "' and mission.reservoir_Name='" + req.query.rName + "' and department.department_ID=probelm.department_ID and mission.mission_id=probelm.mission_id";
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/standReservoir', function (req, res) {
    var showDetail="select * from `probelm`,`stand`,`standard`,`reservoir`,`department` where probelm.mission_id="+req.query.mid+" and stand.mission_id=probelm.mission_id and stand.reservoir_Name=reservoir.reservoir_Name and stand.department_ID=probelm.department_ID and probelm.department_ID=standard.department_ID and probelm.department_ID=department.department_ID and stand.stand_ID=standard.stand_ID"
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/standOnly', function (req, res) {
    var showDetail="SELECT * FROM `probelm`,`department`,`standard`,`stand`,`reservoir`  WHERE  probelm.mission_id="+req.query.mid+" and stand.mission_id=probelm.mission_id and stand.reservoir_Name=reservoir.reservoir_Name  and department.department_name='"+req.query.dName+"' and standard.department_ID="+req.query.did+" and department.department_ID=standard.department_ID and probelm.department_ID=department.department_ID and stand.department_ID=department.department_ID and stand.stand_ID=standard.stand_ID";
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//显示检查标准结果
app.get('/chooseoneday', function (req, res) {
    var chooseoneday = "select * from `mission`,`checker` where mission.check_time='" + req.query.time + "' and mission.status=1 and checker.checker_name='" + req.query.cName + "' and checker.checker_num=mission.checker_num order by mission.mission_id desc";
    console.log(chooseoneday);
    conn.query(chooseoneday, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/ctime',function(req,res){
   var sql="select * from `mission`,`checker` where mission.check_time='" + req.query.date + "' and checker.checker_name='" + req.query.cName + "' and checker.checker_num=mission.checker_num limit "+req.query.time+",1";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
app.get('/img', function (req, res) {
    var showDetail = "SELECT * FROM `img` WHERE department_ID=" + req.query.did + " and stand_ID=" + req.query.Num + " and  mission_id=" + req.query.mid ;
    console.log(showDetail);
    conn.query(showDetail, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//显示图片
app.get('/ledger', function (req, res) {
    var selectSQL = "SELECT * FROM `missionProbelm` WHERE reservoir_Name='" + req.query.rName + "'";
    console.log(selectSQL);
    conn.query(selectSQL, function (err, rows) {
        if (err) console.log(err);
        res.json(rows);
        // 以JSON输入查询结果
    });
});
//更新表格的时候用update，而不是插入
app.get('/showWorker', function (req, res) {
    var selectSQL = "SELECT reservoir.reservoir_Name,checker.checker_num,checker.checker_name FROM reservoir,checker where reservoir.reservoir_ID=checker.reservoir_ID ";
    console.log(selectSQL);
    if (req.query.all == 'all') {
        conn.query(selectSQL, function (err, rows) {
            if (err) console.log(err);
            res.json(rows);
            // 以JSON输入查询结果
        });
    }
});
app.get('/missionSet2', function (req, res) {
    console.log(req.query.data);
    var data = JSON.parse(req.query.data);
    var checker_num = data.checker;
    var msql = "INSERT INTO `mission`( `checker_num`, `create_time`,`check_time`, `time`,`reservoir_name`, `detail`) VALUES ('" + checker_num + "',NOW(),'" + data.create_time + "','" + data.time + "','" + data.reservoir + "','" + data.detail + "')";
    console.log(msql);
    conn.beginTransaction(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        conn.query(msql, function (err, rows) {
            if (err) {
                console.log(err);
                return conn.rollback(function () {
                    console.log(err);
                });
            } else {
                console.log("success");
                var mid = rows.insertId;
                var subkey = data.subkey;
                var subsql = "INSERT INTO `subkey`( `mission_id`, `department_ID`,`department_name`) VALUES ";
                for (var j = 0; j < eval(subkey).length; j++) {
                    if (j > 0) subsql = subsql + ",";
                    subsql = subsql + "(" + mid + "," + subkey[j].did + ",'" + subkey[j].dName + "')";

                }
                console.log(subsql);
                conn.query(subsql, function (err, rows) {
                    if (err) {
                        console.log(err);
                        return conn.rollback(function () {
                            console.log(err);
                        });
                    } else {
                        console.log("success");
                    }
                });
                var sub = data.sub;
                var ssql = "INSERT INTO `stand` (`mission_id`,`department_ID`, `stand_ID`, `reservoir_Name`) VALUES";
                for (var i = 0; i < eval(sub).length; i++) {
                    if (i > 0) ssql = ssql + ",";
                    ssql = ssql + "(" + mid + ",'" + sub[i].select + "','" + sub[i].sub + "','" + sub[i].reservoir + "')";
                }
                console.log(ssql);
                conn.query(ssql, function (err, rows) {
                    if (err) {
                        console.log(err);
                        return conn.rollback(function () {
                            console.log(err);
                        });
                    } else {
                        console.log("success");
                    }
                });
                conn.commit(function (err) {
                    if (err) {
                        return conn.rollback(function () {
                            console.log(err);
                        });
                    } else {
                        var client = mqtt.connect({host: '1546e5j729.imwork.net', port: 1883});
                        client.subscribe("admin-" + (Math.floor(Math.random() * 100)));
                        client.publish(checker_num + "", '{"tag":"1","content":"' + mid + '"}');
                        client.on('message', function (topic, message) {
                            console.log(message.toString());
                        });
                        client.end();
                    }
                });
                return;
            }
        });
    });
    res.json("success");
});
app.get('/missionSet', function (req, res) {
    var selectSQL = "SELECT * FROM `mission` where `checker_num`=" + req.query.checker + " and `create_time`='" + req.query.create_time + "' and `time`='" + req.query.time + "' and `reservoir_name`='" + req.query.reservoir + "' and `detail`='" + req.query.detail + "'";
    console.log(selectSQL);
    conn.query(selectSQL, function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows == '') {
                var insertSQL = "INSERT INTO `mission`( `checker_num`, `create_time`, `time`,`reservoir_name`, `detail`) VALUES ('" + req.query.checker + "','" + req.query.create_time + "','" + req.query.time + "','" + req.query.reservoir + "','" + req.query.detail + "')";
                console.log(insertSQL);
                conn.query(insertSQL, function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('success');
                        var client = mqtt.connect({host: '1546e5j729.imwork.net', port: 1883});
                        client.subscribe('In');
                        client.publish('In', '{"tag":"1","content":"' + rows.insertId + '"}');
                        client.on('message', function (topic, message) {
                            console.log(message.toString());
                        });
                        client.end();
                        res.json(rows);
                    }
                });
            } else {
                console.log('ok');
            }
        }
    });
});
//任务派发
app.get('/missionSub/:mid', function (req, res) {
    var selectSQL = "select * from `stand` where `mission_id`=" + req.params.mid + " and `department_ID`=" + req.query.select + " and `stand_ID`=" + req.query.sub + " and `reservoir_Name`='" + req.query.reservoir + "'";
    console.log(selectSQL);
    conn.query(selectSQL, function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows == '') {
                var insertSQL = "INSERT INTO `stand` (`mission_id`,`department_ID`, `stand_ID`, `reservoir_Name`) VALUES (" + req.params.mid + ",'" + req.query.select + "','" + req.query.sub + "','" + req.query.reservoir + "')";
                console.log(insertSQL);
                conn.query(insertSQL, function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('success');
                    }
                });
            } else {
                console.log('ok');
            }
        }
    });

});
app.get('/setSubkey', function (req, res) {
    var select = "select * from `subkey` where `mission_id`=" + req.query.mid + " and `department_ID`=" + req.query.did + " and `department_name`='" + req.query.dName + "'";
    console.log(select);
    conn.query(select, function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows == '') {
                var insert = "INSERT INTO `subkey`( `mission_id`, `department_ID`,`department_name`) VALUES (" + req.query.mid + "," + req.query.did + ",'" + req.query.dName + "')";
                console.log(insert);
                conn.query(insert, function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('success');
                    }
                });
            }
            else {
                console.log("ok");
            }
        }
    });

});

app.get('/showPoint', function (req, res) {
    if (req.query.cid != "") {
        var Point = "select  mission.status,checker.checker_name,mission.mission_id,checker.checker_head,checker.checker_num,DATE_FORMAT(mission.check_time,'%Y年%m月%e日') AS check_time from mission,checker where mission.check_time in (select MAX(check_time) FROM mission group by checker_num) and mission.checker_num=checker.checker_num and checker.checker_num=" + req.query.cid + " order by mission.mission_id DESC LIMIT 1";
    } else {
       //var Point="select mission.mission_id,mission.status,gps.gps_coordinateX,gps.gps_coordinateY,checker.checker_name,checker.checker_head,checker.checker_num,DATE_FORMAT(mission.check_time,'%Y年%m月%e日') AS check_time from gps,checker,mission where gps.time in (select MAX(time) from gps where mission_id in (select mission_id from mission where uchecker_time in (select MAX(uchecker_time) from mission where status=1 group by checker_num)) group by mission_id) and gps.mission_id in (select MAX(mission_id) from mission where status=1 group by checker_num) and mission.checker_num=checker.checker_num and mission.mission_id=gps.mission_id";
       //var Point="SELECT mission.mission_id,mission.status,gps.gps_coordinateX,gps.gps_coordinateY,checker.checker_name,checker.checker_head,checker.checker_num,DATE_FORMAT(mission.check_time,'%Y年%m月%e日') AS check_time FROM gps,mission,checker WHERE gps.time in (select MAX(time) from gps where mission_id in (select mission_id from mission where uchecker_time in (select MAX(uchecker_time) from mission where status=1 group by checker_num)) group by mission_id) and mission.checker_num=checker.checker_num and mission.mission_id=gps.mission_id";
        var Point="SELECT mission.mission_id,mission.status,gps.gps_coordinateX,gps.gps_coordinateY,checker.checker_name,checker.checker_head,checker.checker_num,DATE_FORMAT(mission.check_time,'%Y年%m月%e日') AS check_time FROM gps,mission,checker WHERE gps.time in (select MAX(time) from gps where mission_id in (select mission_id from mission where uchecker_time in (select MAX(uchecker_time) from mission where status=1 group by checker_num)) group by mission_id) and gps.mission_id in (select mission_id from mission where uchecker_time in (select MAX(uchecker_time) from mission where status=1 group by checker_num)) and mission.checker_num=checker.checker_num and mission.mission_id=gps.mission_id";
    }
    console.log(Point);
    conn.query(Point, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//显示坐标
app.get('/getTrace', function (req, res) {
    var trace = 'select gps_coordinateX,gps_coordinateY,DATE_FORMAT(time,"%Y-%m-%e %H:%i:%s") as time from gps  where mission_id=' + req.query.mid;
    console.log(trace);
    conn.query(trace, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//获得路径
app.get('/mission2', function (req, res) {
    var mission = 'select mission.mission_id,checker.checker_num,checker.checker_name,DATE_FORMAT(mission.check_time,"%Y年%m月%e日") as check_time,reservoir.reservoir_name,mission.status from mission,checker,reservoir where checker.checker_num=mission.checker_num and mission.reservoir_name=reservoir.reservoir_name order by mission.mission_id LIMIT 0,10';
    console.log(mission);
    conn.query(mission, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get('/missionone', function (req, res) {
    var mission = 'select mission.status,checker.checker_head,checker.checker_name,reservoir.reservoir_name,DATE_FORMAT(`check_time`,"%Y年%m月%e日") AS check_time from mission,checker,reservoir where checker.checker_num=mission.checker_num and mission.reservoir_name=reservoir.reservoir_name and mission.mission_id=' + req.query.mid;
    console.log(mission);
    conn.query(mission, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//历史任务
app.get('/search', function (req, res) {
    var sql = "select mission.mission_id,checker.checker_name,reservoir.reservoir_name,reservoir.abnormal,mission.status,DATE_FORMAT(mission.check_time,'%Y年%m月%e日') as check_time from mission,checker,reservoir where checker.checker_num=mission.checker_num and mission.reservoir_name=reservoir.reservoir_name";
    if (req.query.mid != "") {
        sql = sql + " and mission.mission_id=" + req.query.mid;
    }
    if (req.query.rName != "") {
        sql = sql + " and mission.reservoir_name='" + req.query.rName + "'";
    }
    if (req.query.cName != "") {
        sql = sql + " and checker.checker_name='" + req.query.cName + "'";
    }
    if (req.query.date != "") {
        sql = sql + " and mission.check_time='" + req.query.date + "'";
    }

    if (req.query.states == "未巡查") {
        sql = sql + " and mission.status=0";
    } else if (req.query.states == "巡查中") {
        sql = sql + " and mission.status=1";
    } else if (req.query.states == "已巡查") {
        sql = sql + " and mission.status=2";
    }
    if (req.query.dis == "无") {
        sql = sql + " and  reservoir.abnormal=0";
    } else if (req.query.dis == "有") {
        sql = sql + " and  reservoir.abnormal=1";
    }

    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//历史任务中用的检查者
app.get("/search_checker", function (req, res) {
    var sql = "select * from checker";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//历史任务中用的水库名
app.get("/search_reservoir", function (req, res) {
    var sql = "select * from reservoir";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get("/reservoir_page", function (req, res) {
    var sql = "select * from reservoir limit 0,10";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get("/search_reservoir_page", function (req, res) {
    var sql = "select * from reservoir limit " + req.query.m + ",10";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//分页
app.get("/page", function (req, res) {
    var sql = "select count(*) as num from mission";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get("/rpage", function (req, res) {
    var sql = "select count(*) as num from reservoir";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
//显示分页
app.get("/record", function (req, res) {
    var sql = "select mission.mission_id,checker.checker_num,checker.checker_name,DATE_FORMAT(mission.check_time,'%Y年%m月%e日') as check_time,reservoir.reservoir_name,mission.status  from mission,checker,reservoir where checker.checker_num=mission.checker_num and mission.reservoir_name=reservoir.reservoir_name order by mission.mission_id LIMIT " + req.query.countX + ",10";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});

app.post("/addDevice", function (req, res) {
    //var sql = "select * from mission,checker,reservoir where checker.checker_num=mission.checker_num and mission.reservoir_name=reservoir.reservoir_name LIMIT " + req.query.countX + "," + req.query.countY;
    var sql = "UPDATE `checker` SET `checker_device`='" + req.body.checker_device + "',`checker_phone`=" + req.body.checker_phone + ",`checker_version`=" + req.body.checker_version + " WHERE `checker_name`='" + req.body.checker_name + "'";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        }
    });
});
app.post("/unused", function (req, res) {
    var sql = "UPDATE `checker` SET `checker_device`='',`checker_phone`=0,`checker_version`=0 WHERE `checker_num`=" + req.body.cnum;
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        }
    });
});
app.get("/searchdevice", function (req, res) {
    var sql = "select * from `checker` where `checker_name`='" + req.query.cname + "'";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get('/sgps',function(req,res){
    var sql = "select gps.gps_coordinateX,gps.gps_coordinateY,DATE_FORMAT(gps.time,'%Y-%m-%e %H:%i:%s') as time,mission.mission_id,department.department_name,department.department_ID from gps,mission,department,probelm,stand where gps.mission_id="+req.query.mid+" and stand.mission_id=mission.mission_id and gps.mission_id=mission.mission_id and probelm.mission_id=mission.mission_id and probelm.department_ID=stand.department_ID and stand.department_ID=department.department_ID and gps.gps_coordinateX like probelm.longitude and gps.gps_coordinateY like probelm.latitude group by gps.time";
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.get('/reservoir_search', function (req, res) {
    var sql = "select * from reservoir where 1";
    if (req.query.rname) {
        sql = sql + " and reservoir_Name='" + req.query.rname + "'";
    }
    if (req.query.rcity) {
        sql = sql + " and city='" + req.query.rcity + "'";
    }
    if (req.query.rriver) {
        sql = sql + " and river='" + req.query.rriver + "'";
    }
    if (req.query.rtype != '不限') {
        sql = sql + " and type='" + req.query.rtype + "'";
    }
    if (req.query.relevation != '不限') {
        sql = sql + " and elevation='" + req.query.relevation + "'";
    }
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});
app.post('/submit', function (req, res) {
    var sql = "UPDATE `mission` SET `todo`='" + req.body.status + "',`callback`='" + req.body.remark + "' WHERE `mission_id`=" + req.body.id;
    console.log(sql);
    conn.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
        }
    });
});
app.listen(3000);