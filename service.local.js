/**
 * Created by zhangliqing on 2017/9/15.
 */
module.exports = {
  rancher: {
    endpoint: 'http://117.50.1.134:8080/v2-beta',
    wsaddr: 'ws://api.cloudwarehub.com:8888',
    env: '1a3504',
    lbid: '1s1050',
    username:'F7CF51191860EA07636F',
    password:'tNUiFkJKiXjcbLkJxpdSH15kfTJ6FgHxm7wSMo25'

  },
  etcd: {
    server: process.env.ETCD_SERVER
  },

  proxy: {
    server: process.env.PROXY_SERVER
  },

}