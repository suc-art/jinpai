/*
金牌影视 - TVBox专用爬虫
API站：https://m.jiabaide.cn
支持：首页、分类、搜索、详情、播放
*/

var baseUrl = "https://m.jiabaide.cn";
var headers = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36",
  "Referer": baseUrl + "/"
};
var appKey = "cb808529bae6b6be45ecfab29a4889bc";

// 工具函数：MD5+SHA1签名
function getSign(params) {
  let t = String(Date.now());
  let obj = { ...params, key: appKey, t: t };
  let str = Object.keys(obj).filter(k => obj[k] !== "").map(k => `${k}=${obj[k]}`).join("&");
  let md5 = CryptoJS.MD5(str).toString();
  let sign = CryptoJS.SHA1(md5).toString();
  return { t, sign };
}

// 发起请求
function fetch(path, params) {
  let sign = getSign(params);
  let url = baseUrl + path + "?" + Object.keys(params).filter(k => params[k] !== "").map(k => `${k}=${encodeURIComponent(params[k])}`).join("&");
  let res = req({
    url: url,
    headers: { ...headers, ...sign }
  });
  return JSON.parse(res);
}

// 首页
function home() {
  let data = fetch("/api/mw-movie/anonymous/home/hotSearch", {});
  let list = data.data || [];
  let videos = [];
  for (let v of list) {
    videos.push({
      id: v.vodId,
      name: v.vodName,
      pic: v.vodPic,
      remark: (v.vodRemarks || "") + (v.vodDoubanScore ? "_" + v.vodDoubanScore : "")
    });
  }
  return JSON.stringify({
    class: getTypes(),
    list: videos
  });
}

// 获取分类
function getTypes() {
  let data = fetch("/api/mw-movie/anonymous/get/filer/type", {});
  let arr = data.data || [];
  let types = [];
  for (let t of arr) {
    types.push({
      id: t.typeId,
      name: t.typeName
    });
  }
  return types;
}

// 分类页
function category(tid, page) {
  page = page || 1;
  let data = fetch("/api/mw-movie/anonymous/video/list", {
    type1: tid,
    pageNum: page,
    pageSize: 30,
    sort: "1",
    sortBy: "1"
  });
  let list = data.data?.list || [];
  let videos = [];
  for (let v of list) {
    videos.push({
      id: v.vodId,
      name: v.vodName,
      pic: v.vodPic,
      remark: (v.vodRemarks || "") + (v.vodDoubanScore ? "_" + v.vodDoubanScore : "")
    });
  }
  return JSON.stringify({
    page: page,
    pagecount: page + (list.length >= 30 ? 1 : 0),
    list: videos
  });
}

// 搜索
function search(wd, page) {
  page = page || 1;
  let data = fetch("/api/mw-movie/anonymous/video/searchByWordPageable", {
    keyword: wd,
    pageNum: page,
    pageSize: 30
  });
  let list = data.data?.list || [];
  let videos = [];
  for (let v of list) {
    videos.push({
      id: v.vodId,
      name: v.vodName,
      pic: v.vodPic,
      remark: (v.vodRemarks || "") + (v.vodDoubanScore ? "_" + v.vodDoubanScore : "")
    });
  }
  return JSON.stringify({
    page: page,
    pagecount: page + (list.length >= 30 ? 1 : 0),
    list: videos
  });
}

// 详情
function detail(id) {
  let data = fetch("/api/mw-movie/anonymous/video/detail", { id: id });
  let v = data.data || {};
  let episodes = [];
  let list = v.episodeList || [];
  for (let ep of list) {
    let playId = JSON.stringify({
      vodId: v.vodId,
      nid: ep.nid
    });
    episodes.push({
      name: ep.name || ep.episodeName || "播放",
      url: playId
    });
  }
  return JSON.stringify({
    list: [{
      vod_id: v.vodId,
      vod_name: v.vodName,
      vod_pic: v.vodPic,
      type_name: v.typeName,
      vod_remarks: v.vodRemarks,
      vod_year: (v.vodPubdate || "").split("-")[0] || "",
      vod_area: v.vodArea,
      vod_lang: v.vodLang,
      vod_director: v.vodDirector || "未知",
      vod_actor: v.vodActor || "未知",
      vod_content: v.vodContent || "暂无简介",
      vod_play_url: episodes.map(e => e.name + "$" + e.url).join("#"),
      vod_play_from: "金牌线路"
    }]
  });
}

// 播放解析
function play(flag, id) {
  try {
    let info = JSON.parse(id);
    let data = fetch("/api/mw-movie/anonymous/v2/video/episode/url", {
      clientType: "3",
      id: info.vodId,
      nid: info.nid
    });
    let urls = data.data?.list || [];
    let playUrls = [];
    for (let u of urls) {
      playUrls.push({
        name: u.title || u.resolution || "默认",
        url: u.url
      });
    }
    return JSON.stringify({
      parse: 0,
      header: headers,
      urls: playUrls
    });
  } catch (e) {
    return JSON.stringify({ parse: 0, urls: [] });
  }
}

/* 导出 TVBox 标准接口 */
module.exports = {
  home: home,
  category: category,
  search: search,
  detail: detail,
  play: play
};