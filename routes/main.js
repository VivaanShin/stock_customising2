var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var async = require('async')
var iconv = require('iconv-lite');
var charset = require('charset');
var mysql = require('mysql');
var dbConfig = require('../db/dbConfig');

/* GET main page. */
router.get('/', function(req, res, next) {
  res.render('main', {
    title: '개인맞춤형 주식 알림 시스템'
  });
});



module.exports = router;
