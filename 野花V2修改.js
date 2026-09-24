// @name Flower音源
// @description 洛雪音乐Flower第三方音源
// @version 1.0.0
// @author pdone
// @platform kw,kg,tx,wy,mg
// @actions search,musicUrl,lyric,pic

const { EVENT_NAMES, request, on, send } = globalThis.lx
const httpRequest = (url, options) => new Promise((resolve, reject) => {
  request(url, options, (err, resp) => {
    if (err) return reject(err)
    resolve(resp.body)
  })
})
// 音源接口逻辑（兼容新版LX规则）
const apis = {
  flower: {
    musicUrl(info, quality) {
      return httpRequest(`https://api.example.com/url?id=${info.songmid}&quality=${quality}`).then(data => {
        return data.url
      })
    },
    pic(info) {
      return httpRequest(`https://api.example.com/pic?id=${info.songmid}`).then(data => {
        return data.url
      })
    },
    lyric(info) {
      return httpRequest(`https://api.example.com/lyric?id=${info.songmid}`).then(data => {
        return {
          lyric: data.lyric,
          tlyric: data.tlyric || null,
          rlyric: null,
          lxlyric: null
        }
      })
    }
  }
}
// 注册请求事件
on(EVENT_NAMES.request, ({ source, action, info }) => {
  switch (action) {
    case 'musicUrl':
      return apis[source].musicUrl(info.musicInfo, info.type).catch(err => {
        console.error(err)
        return Promise.reject(err)
      })
    case 'lyric':
      return apis[source].lyric(info.musicInfo).catch(err => {
        console.error(err)
        return Promise.reject(err)
      })
    case 'pic':
      return apis[source].pic(info.musicInfo).catch(err => {
        console.error(err)
        return Promise.reject(err)
      })
  }
})
// 【关键修复】新版LX必须添加初始化事件（解决导入报错）
send(EVENT_NAMES.inited, {
  openDevTools: false,
  sources: {
    flower: {
      name: "Flower音源",
      type: "music",
      actions: ["musicUrl", "lyric", "pic"],
      qualitys: ["128k", "320k", "flac"]
    }
  }
})
