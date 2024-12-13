var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer  = require('multer');
var fs = require("fs");
var cookieParser = require('cookie-parser')
var util = require('util');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'hsp',
    database : 'test'
});

connection.connect();

// // 创建任务
// var  addSql = 'INSERT INTO tasks(title,description,duedate,priority) VALUES(?,?,?,?)';
// var  addSqlParams = ['完成TODO应用API文档', '编写详细的API文档，包含每个功能的请求和响应示例。','2024-12-10 12:34:56', "high"];
//
// connection.query(addSql,addSqlParams,function (err, result) {
//     if(err){
//         console.log('[INSERT ERROR] - ',err.message);
//         return;
//     }
// });
//
// // 编辑任务
// var modSql = 'UPDATE tasks SET title = ?, description = ? WHERE Id = ?';
// var modSqlParams = ['TodoList后端', '根据API文档完成TodoList后端',2];
// //改
// connection.query(modSql,modSqlParams,function (err, result) {
//     if(err){
//         console.log('[UPDATE ERROR] - ',err.message);
//         return;
//     }
// });
//
// // 删除任务
// var delSql = 'DELETE FROM tasks where id=2';
// //删
// connection.query(delSql,function (err, result) {
//     if(err){
//         console.log('[DELETE ERROR] - ',err.message);
//         return;
//     }
// });

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({ dest: '/tmp/'}).array('image'));
app.use(cookieParser())

// 主页输出任务列表
app.get('/tasks', function (req, res) {
    console.log("主页请求");
    // 查看所有任务
    var sql = 'SELECT * FROM tasks';

    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('[SELECT ERROR] - ', error.message);
            return res.status(500).json({message: "数据库查询出错", error: error.message});
        }

        // 检查结果是否为空
        if (results.length == 0){
            return res.status(404).json({message: "没有找到任何任务", error: error.message});
        }

        res.json(results);
    });
    console.log("Cookies: " + util.inspect(req.cookies));
})

// POST 创建任务
app.post('/api/tasks', function (req, res) {
    console.log("创建任务请求");
    var addSql = 'INSERT INTO tasks(title,description,duedate,priority) VALUES(?,?,?,?)';
    const { title, description, dueDate, priority } = req.body;
    var addSqlParams = [title, description, dueDate, priority];
    console.log(req.body);

    connection.query(addSql,addSqlParams,function (err, result) {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }
    });
    res.status(201).end();
})

// 查看任务
app.get('/api/tasks', function (req, res) {
    console.log("查看任务请求");
    var sql = 'SELECT * FROM tasks where status = ? AND priority = ?';
    const { status, priority } = req.query;
    var sqlParams = [status, priority];

    // status=all && priority=all
    if (status == "all" && priority == "all"){
        sql = 'SELECT * FROM tasks';
        sqlParams = []
    } else if (status == "all"){ // status=all
        sql = 'SELECT * FROM tasks where priority = ?';
        sqlParams = [priority]
    } else if (priority == "all"){ // priority=all
        sql = 'SELECT * FROM tasks where status = ?';
        sqlParams = [status]
    }

    connection.query(sql, sqlParams, function (error, results, fields) {
        if (error) {
            console.log('[SELECT ERROR] - ', error.message);
            return res.status(500).json({message: "数据库查询出错", error: error.message});
        }

        // 检查结果是否为空
        if (results.length == 0){
            return res.status(404).json({message: "没有找到任何任务"});
        }

        res.send(results);
    });
})

// 编辑任务
// 打开编辑界面
app.get('/api/tasks/:id', function (req, res) {
    console.log("打开编辑界面");
    var sql = 'SELECT * FROM tasks where id = ?';
    const id = req.params.id;
    var sqlParams = [id];

    connection.query(sql, sqlParams, function (error, results, fields) {
        if (error) throw error;
        res.send({
            message: 'Selected Task',
            task: results[0] // 将查询结果作为 tasks 返回
        });
    });
})
// 实现编辑
app.put('/api/tasks/:id', function (req, res) {
    console.log("查看任务请求");
    var modSql = 'UPDATE tasks SET title = ?, description = ?, dueDate = ?,priority = ? WHERE id = ?';
    const { title, description, dueDate, priority } = req.body;
    const id = req.params.id;
    var modSqlParams = [title, description, dueDate, priority, id];
    connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            return;
        }
        res.send({
            message: 'Task updated successfully',
            task: { id, title, description, dueDate, priority }  // 返回更新后的任务信息
        });
    });
})

// 删除任务
app.delete('/api/tasks/:id', function (req, res) {
    console.log("查看任务请求");
    var modSql = 'DELETE FROM tasks where id = ?';
    const id = req.params.id;
    var modSqlParams = [id];
    connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            return;
        }
        res.status(204).end();
    });
})

// 标记任务完成/未完成*
app.patch('/api/tasks/:id/status', function (req, res) {
    console.log("查看任务请求");
    var modSql = 'UPDATE tasks SET status = ? WHERE id = ?';
    const status = req.body.status;
    const id = req.params.id;
    console.log(id);
    var modSqlParams = [status, id];
    connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            return;
        }
        res.status(204).end();
    });
})

//  /del_user 页面响应
app.get('/del_user', function (req, res) {
    console.log("/del_user 响应 DELETE 请求");
    res.send('删除页面');
})

//  /list_user 页面 GET 请求
app.get('/list_user', function (req, res) {
    console.log("/list_user GET 请求");
    res.send('用户列表页面');
})

// 对页面 abcd, abxcd, ab123cd, 等响应 GET 请求
app.get('/index.html', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/ab*cd', function(req, res) {
    console.log("/ab*cd GET 请求");
    res.send('正则匹配');
})

// 在表单中通过 GET 方法提交两个参数
app.get('/process_get', function (req, res) {

    // 输出 JSON 格式
    var response = {
        "first_name":req.query.first_name,
        "last_name":req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
})

// 在表单中通过 POST 方法提交两个参数
app.post('/process_post', function (req, res) {

    // 输出 JSON 格式
    var response = {
        "first_name":req.body.first_name,
        "last_name":req.body.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
})

var server = app.listen(8081, function () {

    // var host = server.address().address
    var host = "localhost";
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})

// 在表单中通过 POST 方法提交文件
app.post('/file_upload', function (req, res) {

    console.log(req.files[0]);  // 上传的文件信息

    var des_file = __dirname + "/" + req.files[0].originalname;
    fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if( err ){
                console.log( err );
            }else{
                response = {
                    message:'File uploaded successfully',
                    filename:req.files[0].originalname
                };
            }
            console.log( response );
            res.end( JSON.stringify( response ) );
        });
    });
})