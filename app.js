// 连接 MySQL：先安装 npm i mysql -D
var mysql = require('mysql');
// MySQL 的连接信息
var connection = mysql.createConnection({
  host: '47.114.140.199',
  user: 'root',
  password: '',
  database: 'data'
});
// 开始连接
connection.connect();

// 引入 http 模块：http 是提供 Web 服务的基础
const http = require("http");

// 引入 url 模块：url 是对用户提交的路径进行解析
const url = require("url");

// 引入 qs 模块：qs 是对路径进行 json 化或者将 json 转换为 string 路径
const qs = require("querystring");

// 用 http 模块创建服务
/**
 * req 获取 url 信息 (request)
 * res 浏览器返回响应信息 (response)
 */
http.createServer(function (req, res) {

  // 设置 cors 跨域
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 设置 header 类型
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 跨域允许的请求方式
  res.setHeader('Content-Type', 'application/json');

  if (req.method == "POST") { // 接口 POST 形式

    console.log("\n【POST 形式】");

    // 获取前端发来的路由地址
    let pathName = req.url;

    console.log("\n接口为：" + pathName);

    // 接收发送过来的参数
    let tempResult = "";

    // 数据接入中
    req.addListener("data", function (chunk) {
      tempResult += chunk;
    });

    // 数据接收完成
    req.addListener("end", function () {

      var result = JSON.parse(tempResult)
      const { username, password } = result
      const time = getNowFormatDate(); // 时间
      console.log("\n参数为：");
      console.log(tempResult, JSON.parse(tempResult));

      if (pathName == "/login") { // 提交留言信息
        // 查询 user 表
        // 使用 Promise 的原因是因为中间调用了两次数据库，而数据库查询是异步的，所以需要用 Promise。
        new Promise((resolve, reject) => {

          // 新增的 SQL 语句及新增的字段信息
          let readSql = "SELECT * FROM user";

          // 连接 SQL 并实施语句
          connection.query(readSql, function (error1, response1) {

            if (error1) { // 如果 SQL 语句错误
              throw error1;
            } else {

              console.log("\nSQL 查询结果：");

              // 将结果先去掉 RowDataPacket，再转换为 json 对象
              let newRes = JSON.parse(JSON.stringify(response1));
              console.log(newRes);

              // 判断姓名重复与否
              let userNameRepeat = false;
              for (let item in newRes) {
                if (newRes[item].user_name == username) {
                  userNameRepeat = true;
                }
              }

              // 如果姓名重复
              if (userNameRepeat) {
                // 返回数据
                res.write(JSON.stringify({
                  code: 0,
                  message: "注册失败，用户名已存在！"
                }));
                // 结束响应
                res.end();
                return;
              } else if (newRes.length > 300) { // 如果注册名额已满
                // 返回数据
                res.write(JSON.stringify({
                  code: 0,
                  message: "注册失败，名额已满！"
                }));

                // 结束响应
                res.end();
                return;
              } else { // 可以注册
                resolve();
              }

            }
          });

        }).then(() => {

          console.log("\n第二步：");

          // 新增的 SQL 语句及新增的字段信息
          let addSql = "INSERT INTO user(user_name,user_password, time) VALUES(?,?,?)";
          let addSqlParams = [username, password, time];

          // 连接 SQL 并实施语句
          connection.query(addSql, addSqlParams, function (error2, response2) {
            if (error2) { // 如果 SQL 语句错误
              res.write(JSON.stringify({
                code: 0,
                message: "未知错误"
              }));
              // 结束响应
              res.end();
            } else {
              // 返回数据
              res.write(JSON.stringify({
                code: 200,
                message: "注册成功！"
              }));

              // 结束响应
              res.end();
            }
          });

        })


      }
      // 接口信息处理完毕
    })
    // 数据接收完毕

  } else if (req.method == "GET") { // 接口 GET 形式

    console.log("\n【GET 形式】");

    // 解析 url 接口
    let pathName = url.parse(req.url).pathname;

    console.log("\n接口为：" + pathName);

    if (pathName == "/login") {

      var result = url.parse(req.url, true);
      // res.writeHead(200, {
      //     "Content-Type": "text/html;charset=UTF-8" // 这里是写入字符串
      // });

      res.writeHead(200, {
        "Content-Type": "application/json;charset=UTF-8" // 这里是写入json
      });

      // ... 其他代码省略，请自行前往章节 4.2 后端接口 获取其他代码


      let username = result.query.username; // 用户名
      let password = result.query.password; // 密码
      let time = getNowFormatDate(); // 时间



      // 查询 user 表
      // 使用 Promise 的原因是因为中间调用了两次数据库，而数据库查询是异步的，所以需要用 Promise。
      new Promise((resolve, reject) => {

        // 新增的 SQL 语句及新增的字段信息
        let readSql = "SELECT * FROM user";

        // 连接 SQL 并实施语句
        connection.query(readSql, function (error1, response1) {

          if (error1) { // 如果 SQL 语句错误
            throw error1;
          } else {

            console.log("\nSQL 查询结果：");

            // 将结果先去掉 RowDataPacket，再转换为 json 对象
            let newRes = JSON.parse(JSON.stringify(response1));
            console.log(newRes);

            // 判断姓名重复与否
            let userNameRepeat = false;
            for (let item in newRes) {
              if (newRes[item].user_name == username) {
                userNameRepeat = true;
              }
            }

            // 如果姓名重复
            if (userNameRepeat) {
              res.end("注册失败，姓名重复！");
              return;
            } else if (newRes.length > 300) { // 如果注册名额已满
              res.end("注册失败，名额已满！");
              return;
            } else { // 可以注册
              resolve();
            }

          }
        });

      }).then(() => {

        console.log("\n第二步：");

        // 新增的 SQL 语句及新增的字段信息
        let addSql = "INSERT INTO user(user_name,user_password, time) VALUES(?,?,?)";
        let addSqlParams = [result.query.username, result.query.password, time];

        // 连接 SQL 并实施语句
        connection.query(addSql, addSqlParams, function (error2, response2) {
          if (error2) { // 如果 SQL 语句错误
            console.log("新增错误：");
            console.log(error2);
            return;
          } else {
            console.log("\nSQL 查询结果：");
            console.log(response2);

            console.log("\n注册成功！");

            // 返回数据
            res.write(JSON.stringify({
              code: "0",
              message: "注册成功！"
            }));

            // 结束响应
            res.end();
          }
        });

      })
      // Promise 结束

      // 注册流程结束
    }


    // res.write('<h1 style="text-align:center">jsliang 前端有限公司服务已开启！</h1><h2 style="text-align:center">详情可见：<a href="https://github.com/LiangJunrong/document-library/blob/master/other-library/Node/NodeBase.md" target="_blank">Node 基础</a></h2>');
    // res.write(JSON.stringify({
    //   code: "1",
    //   message: "登录失败，密码错误！"
    // }));
    // res.end();



  }

}).listen(8888); // 监听的端口

// 获取当前时间
function getNowFormatDate() {
  var date = new Date();
  var year = date.getFullYear(); // 年
  var month = date.getMonth() + 1; // 月
  var strDate = date.getDate(); // 日
  var hour = date.getHours(); // 时
  var minute = date.getMinutes(); // 分
  var second = date.getMinutes(); // 秒
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  // 返回 yyyy-mm-dd hh:mm:ss 形式
  var currentdate = year + "-" + month + "-" + strDate + " " + hour + ":" + minute + ":" + second;
  return currentdate;
}
