/**
 * Created by zhangliqing on 2017/9/15.
 */
module.exports = {
  rancher: {
    endpoint: '192.168.1.132:8080/v2-beta',//去单引号
    user: process.env.RANCHER_USER,
    pass: process.env.RANCHER_PASS,
    env: '1a1235',
    lbid: '1s41',
    wsprefix: 'ws://192.168.1.133:83',
    stackid: '1st18'
  },
  etcd: {
    server: process.env.ETCD_SERVER
  },

  proxy: {
    server: process.env.PROXY_SERVER
  },
}
transwarp