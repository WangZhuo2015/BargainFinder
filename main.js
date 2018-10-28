/**
 * Created by wangzhuo on 2017/8/8.
 */
var cheerio = require('cheerio');
var superagent = require('superagent')
var sleep = require('system-sleep');
var moment = require('moment')
//URLs
var base = 'http://http://www.baicaio.com/'
var collection = 'http://www.baicaio.com/index-index-type--tab-isnice-dss-cc'
var wechat = 'http://sc.ftqq.com/SCU9052T35a00d2837ea718a186e07060fe9ee00593a5304ad5bf.send'
var pushBear = 'https://pushbear.ftqq.com/sub'
var sendKey = '653-d3bbdc890549ec3ca601a1f302484f7b'
//哦莫西罗伊，也就是关注的关键词咯
var omxly = ['凌美', '耳机', '钢笔', '鼠标', '显示器', '电脑', '手机', '电视','冰箱']
//通知过的内容的href，防止多次通知相同内容
var notificated = []

function refresh(callback) {
    console.log('检查优惠信息  '+ moment().format('MMMM Do YYYY, h:mm:ss a'))
    var items = []
    superagent
        .get(collection)
        .end(function (err, res) {
            var $ = cheerio.load(res.text)
            $('#C_drc ').find('li').each(function (idx, element) {
                $element = $(element)
                var href = $element.find('h2 > a').attr('href')
                var title = $element.find('h2 > a').attr('title')
                var price = $element.find('h2 > a > em').text()
                var img = $element.find('a > img').attr('src')
                items.push({
                    href: href,
                    title: title,
                    price: price,
                    img:img
                })
            })
            check(items, callback)
        })
}

function check(items, callback) {
    for (index in items) {
        var item = items[index]
        for (word_index in omxly) {
            var flag = true
            var word = omxly[word_index]
            if (String(item.title).indexOf(omxly[word_index]) !== -1) {
                for (href_index in notificated) {
                    if (notificated[href_index] == item.href) {
                        flag = false
                        callback()
                        break
                    }
                }
                if (flag) {
                    console.log('发现关注商品')
                    console.log(item.title, item.price)
                    notificated.push(item.href)
                    wechatNotification(word,item, callback)
                }
            }
        }
    }
}
function wechatNotification(word,item, callback) {
    var title = item.title
    var desc = ''
    var url = item.href
    var text = '发现了你喜欢的:' + '' + word
    //url
    desc = '['+ title + ']('+ base + url +')\n\n'
    desc += '\n\n'+item.price+'\n\n'
    desc += '时间:'+moment().format('MMMM Do YYYY, h:mm:ss a')
    desc += '\n\n' + '![logo](http://sc.ftqq.com/static/image/bottom_logo.png)\n\n'
    superagent
        .get(pushBear)
        .query({sendkey: sendKey})
        .query({text: text})
        .query({desp: desc})
        .end(function (err, sres) {
            callback()
        })
}
while (true) {
    refresh({})
    sleep(5 * 1000)
}