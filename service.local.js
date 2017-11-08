/**
 * Created by zhangliqing on 2017/9/15.
 */
module.exports = {
  rancher: {
    endpoint: 'http://10.2.253.121:8080/v2-beta',//去单引号
    user: process.env.RANCHER_USER,
    pass: process.env.RANCHER_PASS,
    env: '1a51',
    lbid: '1s16',
    wsprefix: 'ws://10.2.253.122:83',
    stackid: '1st16'
  },
  etcd: {
    server: process.env.ETCD_SERVER
  },

  proxy: {
    server: process.env.PROXY_SERVER
  },

}