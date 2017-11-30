/**
 * Created by zhangliqing on 2017/9/15.
 */
module.exports = {
  rancher: {
    endpoint: 'http://bigdata.tongji.edu.cn/:8080/v2-beta',//去单引号
    user: process.env.RANCHER_USER,
    pass: process.env.RANCHER_PASS,
    env: '1a1235',
    lbid: '1s41',
    wsprefix: 'ws://bigdata.tongji.edu.cn:8080',
    stackid: '1st14'
  },
  etcd: {
    server: process.env.ETCD_SERVER
  },

  proxy: {
    server: process.env.PROXY_SERVER
  },
}