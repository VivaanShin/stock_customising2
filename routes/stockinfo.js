var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var async = require('async')
var iconv = require('iconv-lite');
var charset = require('charset');

// 주식 종목 코드 입력으로 인한 크롤링
router.post('/', function(req, res, next) {
  console.log(req.body.stock_code);
  //if (req.body.latitude != "" && req.body.longitude != ""){
  data = {
    stock_code: req.body.stock_code
  }
  const code = data.stock_code;
  //console.log("코드 입력성공");
  console.log("code: ", code);
  //getData(code);
  // present stock price
  function getData_stock_price(code) {
    //console.log("code1: ", code);
    return new Promise(function(resolve, reject) {
      var base_url = "https://finance.naver.com/item/main.nhn?code=";
      var url = base_url + code;
      request({
        url,
        encoding: 'binary'
      }, function(error, response, body) {
        if (response) {
          const enc = charset(response.headers, body);
          const i_result = iconv.decode(body, 'euc-kr');
          var $ = cheerio.load(i_result);


          //해당 주식 이름
          var s_name = $('.wrap_company h2').text();
          //해당 주식 현재가격
          var FirstPrice = $('.no_today').text().trim();
          var SecondPrice = FirstPrice.replace(",", "");
          var ThirdPrice = SecondPrice.split('\n');
          var s_price = ThirdPrice[0];

          //해당 주식 상세정보(전일가,고가,거래량,시초가,저가,거래대금)
          var s_data = new Array();
          $('.no_info tbody tr td .blind').each(function(i) {
            var link = $(this);
            var text = link.text().trim();
            s_data[i] = text;
            //console.log(text);
          });
          //console.log("s_data: ", s_data);
          var s_yesterday = s_data[0]; //전일가
          var s_highvalue = s_data[1]; //고가
          var s_volume = s_data[3]; //거래량
          var s_startvalue = s_data[4]; //시초가
          var s_lowvalue = s_data[5]; //저가
          var s_volumevalue = s_data[6]; //거래대금
          console.log('s_name: ', s_name);
          console.log('s_price: ', s_price);

          //동일업종 비교
          //동일업종 이름 전처리 이전 값
          var bf_sameindustry_name = new Array();
          var first_industry = $('.section.trade_compare .tb_type1.tb_num thead tr a').each(function(i) {
            var link = $(this);
            var text = link.text();
            //console.log('first', text);
            bf_sameindustry_name[i] = text;
          });
          //console.log("bf_sameindustry_name: ", bf_sameindustry_name);

          //동일업종 코드 값
          var sameindustry_code = new Array();
          var first_industry = $('.section.trade_compare .tb_type1.tb_num thead tr a em').each(function(i) {
            var link = $(this);
            var text = link.text();
            sameindustry_code[i] = text;
          });
          //console.log("sameindustry_code: ", sameindustry_code);

          //동일업종 이름 값
          var sameindustry_name = new Array();
          for (i = 0; i < 5; i++) {
            if (bf_sameindustry_name[i].indexOf(sameindustry_code[i]) != -1) {
              var distribute_locate = bf_sameindustry_name[i].indexOf(sameindustry_code[i]);
              //console.log("locate", distribute_locate);
              sameindustry_name[i] = bf_sameindustry_name[i].substr(0, distribute_locate);
              //console.log("종목이름",sameindustry_name[i]);

            } else {
              console.log("locate not find");
            }
          }

          //동일업종 내용 값
          var sameindustry_price = new Array(); //전일가
          var sameindustry_daytoday = new Array(); //전일대비
          var sameindustry_evenrate = new Array(); //등락률
          var sameindustry_marketvalue = new Array(); //시가총액
          var sameindustry_foreignrate = new Array(); //외국인보유율
          var etc_sameindustry = $('.section.trade_compare .tb_type1.tb_num tbody tr td').each(function(i) {
            var link = $(this);
            var text = link.text().trim();
            if (i < 5) {
              sameindustry_price[i] = text;
              //console.log("sameindustry_yprice", sameindustry_yprice[i]);
            } else if (i < 10) {
              var replacetext = text.replace('\n\t\t\t\t', '');
              sameindustry_daytoday[i - 5] = replacetext;
              //console.log("sameindustry_daytoday", sameindustry_daytoday[i-5]);
            } else if (i < 15) {
              var replacetext = text.replace('\n\t\t\t\t', '');
              sameindustry_evenrate[i - 10] = replacetext;
              //console.log("sameindustry_evenrate", sameindustry_evenrate[i-10]);
            } else if (i < 20) {
              sameindustry_marketvalue[i - 15] = text;
              //console.log("sameindustry_marketvalue", sameindustry_marketvalue[i-15]);
            } else if (i < 25) {
              sameindustry_foreignrate[i - 20] = text;
              //console.log("sameindustry_foreignrate", sameindustry_foreignrate[i-20]);
            }

          });

          // 뉴스기사 크롤링
          var news = new Array();
          var first_news = $('.sub_section.news_section .txt a').each(function(i) {
            var link = $(this);
            //var text = link.attr('href');
            //console.log("text", text);
            news[i] = {
              news_title: link.text(),
              news_url: link.attr('href')
            }
          });
          console.log("news", news);
          var len_news = news.length;
          console.log("len_news", len_news);
          /*
                    var second_news = $('.sub_section.news_section .txt a').text();
                    console.log("second_news", second_news);
          */

          // 1주일 차트
          var weekchart = $('#img_chart_area').attr('src');
          console.log("weekchart", weekchart);

          //동일업종 데이터 객체 SameIndustry
          var si = {
            name: sameindustry_name,
            code: sameindustry_code,
            price: sameindustry_price,
            daytoday: sameindustry_daytoday,
            evenrate: sameindustry_evenrate,
            marketvalue: sameindustry_marketvalue,
            foreignrate: sameindustry_foreignrate
          };
          //console.log("동일업종 객체", si);

          //.then()으로 넘길 데이터
          var s_data = {
            s_code: code,
            s_name: s_name,
            s_price: s_price,
            s_yesterday: s_yesterday,
            s_highvalue: s_highvalue,
            s_lowvalue: s_lowvalue,
            s_startvalue: s_startvalue,
            s_volume: s_volume,
            s_volumevalue: s_volumevalue,
            si_name: si.name,
            si_code: si.code,
            si_price: si.price,
            si_daytoday: si.daytoday,
            si_evenrate: si.evenrate,
            si_marketvalue: si.marketvalue,
            si_foreignrate: si.foreignrate,
            news: news,
            len_news: len_news,
            weekchart: weekchart
          };
          resolve(s_data);
        }
        reject(new Error("Request is failed"));
      });
    });
  }
  getData_stock_price(code).then(function(s_data) {
      return new Promise(function(resolve, reject) {
        //외국인,기관 매매동향 차트 url이 다르기때문에 새로운 주소로 다시 크롤링하기위해 .then
        var foreignbase_url = 'https://finance.naver.com/item/frgn.nhn?code='
        var url = foreignbase_url + s_data.s_code;
        console.log('url', url);
        request({
          url,
          encoding: 'binary'
        }, function(error, response, body){
          if (response) {
            const enc = charset(response.headers, body);
            const i_result = iconv.decode(body, 'euc-kr');
            var $ = cheerio.load(i_result);
            var forechart = new Array();
            var first_foreignchart = $('#frgn_chart_0 .graph.gray03.p11 img').each(function(i) {
              var link = $(this);
              var img = link.attr('src');
              //console.log('src',img);
              //var text = link.attr('href');
              //console.log("text", text);
              forechart[i] = img;
            });
            var foreign_chart = forechart[3];
            //console.log("forechart", foreign_chart);

            var organchart = new Array();
            var first_organchart = $('#organ_chart .graph.gray03.p11 img').each(function(i) {
              var link = $(this);
              var img = link.attr('src');
              //console.log('src',img);
              //var text = link.attr('href');
              //console.log("text", text);
              organchart[i] = img;
            });
            var organ_chart = organchart[3];
            //console.log("organ_chart", organ_chart);
            s_data.foreign_chart = foreign_chart;
            s_data.organ_chart = organ_chart;

            console.log("title",s_data.news);
            console.log("news[0]",s_data.news[0]);
            /*var tradechart = {
              foreign_chart: foreign_chart,
              organ_chart: organ_chart
            };
            console.log("tradechart", tradechart);
            */
            resolve(s_data);
          }
          reject(new Error("Request is failed"));
      })

        //return tradechart;
      });


    /*hn = {
      'rcode': 'ok',
      'rmg': price
    }
    res.status(200).send(hn); */ // 여기 마감 주석
  }).then(function(s_data){
    res.render('stockinfo', {
      title: 'stockinfo',
      s_name: s_data.s_name,
      s_price: s_data.s_price,
      s_yesterday: s_data.s_yesterday,
      s_highvalue: s_data.s_highvalue,
      s_lowvalue: s_data.s_lowvalue,
      s_startvalue: s_data.s_startvalue,
      s_volume: s_data.s_volume,
      s_volumevalue: s_data.s_volumevalue,
      si_name: s_data.si_name,
      si_code: s_data.si_code,
      si_price: s_data.si_price,
      si_daytoday: s_data.si_daytoday,
      si_evenrate: s_data.si_evenrate,
      si_marketvalue: s_data.si_marketvalue,
      si_foreignrate: s_data.si_foreignrate,
      news: s_data.news,
      len_news: s_data.len_news,
      weekchart: s_data.weekchart,
      foreign_chart: s_data.foreign_chart,
      organ_chart: s_data.organ_chart
    });
  }

  ).catch(function(err) {
    console.error(err);
  });


});


module.exports = router;
