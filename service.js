/**
 * Created by zhangliqing on 2017/9/15.
 */
exports = {
  rancher: {
    endpoint: process.env.RANCHER_ENDPOINT,
    user: process.env.RANCHER_USER,
    pass: process.env.RANCHER_PASS,
    env: process.env.RANCHER_ENV,
    lbid: process.env.LOADBALANCE_ID,
    wsprefix: process.env.WS_PREFIX,
    stackid: process.env.STACK_ID
  },
  etcd: {
    server: process.env.ETCD_SERVER
  },

  proxy: {
    server: process.env.PROXY_SERVER
  },

}