/**
 * @name 野花V2
 * @description 野花V2聚合音源，适配fnmusic-ext 2.3.0
 * @platform kw,kg,tx,wy,mg
 * @actions search,musicUrl,lyric,pic
 */
const { EVENT_NAMES, request, on, send } = globalThis.lx

const http = (url, opt) => new Promise((resolve, reject) => {
  request(url, opt, (err, res) => err ? reject(err) : resolve(res.body))
})

const sources = {
  kw: { name: "酷我", type: "music" },
  kg: { name: "酷狗", type: "music" },
  tx: { name: "QQ音乐", type: "music" },
  wy: { name: "网易云", type: "music" },
  mg: { name: "咪咕", type: "music" }
}

const api = {
  search: async (info) => {
    const keyword = info.keyword
    const page = info.page || 1
    const res = await http(`https://api.example.com/flower/search?kw=${encodeURIComponent(keyword)}&p=${page}`)
    return res.data
  },
  musicUrl: async (info, quality) => {
    const res = await http(`https://api.example.com/flower/url?id=${info.songmid}&q=${quality}`)
    return res.url
  },
  lyric: async (info) => {
    const res = await http(`https://api.example.com/flower/lyric?id=${info.songmid}`)
    return {
      lyric: res.lyric || "",
      tlyric: res.tlyric || null,
      rlyric: null,
      lxlyric: null
    }
  },
  pic: async (info) => {
    const res = await http(`https://api.example.com/flower/pic?id=${info.songmid}`)
    return res.pic
  }
}

on(EVENT_NAMES.request, async ({ source, action, info }) => {
  switch (action) {
    case "search":
      return api.search(info)
    case "musicUrl":
      return api.musicUrl(info.musicInfo, info.type)
    case "lyric":
      return api.lyric(info.musicInfo)
    case "pic":
      return api.pic(info.musicInfo)
  }
})

send(EVENT_NAMES.inited, {
  openDevTools: false,
  sources
})
