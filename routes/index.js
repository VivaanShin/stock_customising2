var express = require('express');
var router = express.Router();
var request = require("request");
var bodyParser = require('body-parser');
const stockinfo = require('./stockinfo');

출처: https://hwanschoi.tistory.com/121 [신세계에 발을 담그다]

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: '개인맞춤형 주식 알림 시스템'
  });
});

/* GET sign_up page. */
router.get('/sign_up', function(req, res, next) {
  res.render('sign_up', {
    title: '회원가입 페이지'
  });
});

/*
router.post('/stockinfo', function(req, res, next){
  stockinfo.stockinfo;
});
*/
module.exports = router;
