var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var dbConfig = require('../db/dbConfig');



router.get('/', function(req, res, next) {
  res.render('login', {
    title: '로그인'
  });
});

router.post('/', function(req, res) {
  console.log('req.body: ', req.body);
  var id = req.body.username;
  var pw = req.body.password;

  function login(id, pw) {
    return new Promise(function(resolve, reject) {
      var sql = 'SELECT * FROM `user` WHERE `user_id`=?';
      var dbOptions = {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
      };
      var conn = mysql.createConnection(dbOptions);
      console.log(dbOptions);
      conn.connect();
      conn.query(sql, id, function(err, results, fields) {
        console.log('쿼리연결됐다고해주라');
        if (err) {
          console.log(err);
        }
        if (!results[0]) {
          console.log("결과없음")
          return res.send('please check your id.');
        }
        var user = results[0];

        if (pw === user.password) {
          var sql2 = 'SELECT * FROM `user_stock` WHERE `user_id`=?';
          conn.query(sql2, id, function(err, results, fields) {
            console.log("2번째 results", results);
            console.log("2번째 results[0].user_id", results[0].user_id);
            console.log("2번째 results[0].SNAME", results[0].SNAME);
            console.log("2번째 results[0].SCODE", results[0].SCODE);
            if (err) {
              console.log(err);
            }
            if (!results[0]) {
              console.log("결과없음")
              return res.render('main', {
                title: '메인 화면',
                user_id: id,
                sname: '없음',
                scode: '없음'
              });
            }else{
              var len_results = results.length;
              console.log("results 길이", len_results);
              var user_stock_data = new Array();

              for (i=0; i<len_results; i++){
                user_stock_data[i] = {
                  sname : results[i].SNAME,
                  scode : results[i].SCODE
                };
              };
              console.log("user_stock_data",user_stock_data);
              console.log("user_stock_data[0]",user_stock_data[0]);
              console.log("user_stock_data[1]",user_stock_data[1]);
              return res.render('main', {
                title: '메인 화면',
                user_id: id,
                user_stock_data: user_stock_data,
                len_results: len_results
              });
            }


          })

        } else {
          return res.send('please check your password.');
        }
      });
    })
  }

  login(id, pw).then(function() {
    conn.end();
  })
  //query

});

module.exports = router;
