/**
 * Created by zhangliqing on 2017/9/15.
 */
module.exports = {
  rancher: {
    endpoint: 'http://117.50.1.134:8080/v2-beta',
    wsaddr: 'ws://api.cloudwarehub.com:8888',

    user: process.env.RANCHER_USER,
    pass: process.env.RANCHER_PASS,
    env: '1a3504',
    lbid: '1s1050'
  },
  etcd: {
    server: process.env.ETCD_SERVER
  },

  proxy: {
    server: process.env.PROXY_SERVER
  },

}