/**
 * Created by zhangliqing on 2017/9/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var rp = require('request-promise');
var service = require('./service.local');
var shortid = require('shortid');
var cors = require('cors')

var app = express();
var router = express.Router();
var port = process.env.PORT || 8080;
var verifyToken = function (req, res, next) {
  if (req.body.secret != 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1MDU4MTM0NTd9.Ftw1yHeUrqdNvymFZcIpuEoS0RHBFZqu4MfUZON9Zm0') {
    res.send(401, JSON.stringify({errorCode: 1, errorMessage: 'Authentication failed.'}))
    return;
  }
  next();
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors())
app.use('/', router);
router.use(verifyToken);
////ddsgdh

// shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-');
// router.route('/token').get(function (req,res) {//登录时调用，获取token
//   var token = jwt.sign({ foo: 'bar' }, 'shhhguanshanhh');
//   res.send(200,token);
// })

//创建用户对应文件夹
//req.body user_id
router.route('/volumes').post(function (req, res) {
  console.log('recive post to /volumes')
  var data = {
    "type": "volume",
    "driver": "rancher-nfs",
    "name": req.body.userId,
    "driverOpts": {}
  }
  var openContainer = function (user_id) {
    var tmpData = {
      "instanceTriggeredStop": "stop",
      "startOnCreate": true,
      "publishAllPorts": false,
      "privileged": false,
      "stdinOpen": true,
      "tty": true,
      "readOnly": false,
      "runInit": false,
      "networkMode": "managed",
      "type": "container",
      "requestedHostId": "1h5",
      "secrets": [],
      "dataVolumes": [
        user_id + ":/data"
      ],
      "dataVolumesFrom": [],
      "dns": [],
      "dnsSearch": [],
      "capAdd": [],
      "capDrop": [],
      "devices": [],
      "logConfig": {
        "driver": "",
        "config": {}
      },
      //"cmd":["echo","1"],
      "dataVolumesFromLaunchConfigs": [],
      "imageUuid": "docker:busybox",
      "ports": [],
      "instanceLinks": {},
      "labels": {"container_type": "cloudware"},
      "name": "test" + user_id,
      "count": null,
      "createIndex": null,
      "created": null,
      "deploymentUnitUuid": null,
      "description": null,
      "externalId": null,
      "firstRunning": null,
      "healthState": null,
      "hostname": null,
      "kind": null,
      "memoryReservation": null,
      "milliCpuReservation": null,
      "removed": null,
      "startCount": null,
      "uuid": null,
      "volumeDriver": null,
      "workingDir": null,
      "user": null,
      "domainName": null,
      "memorySwap": null,
      "memory": null,
      "cpuSet": null,
      "cpuShares": null,
      "pidMode": null,
      "blkioWeight": null,
      "cgroupParent": null,
      "usernsMode": null,
      "pidsLimit": null,
      "diskQuota": null,
      "cpuCount": null,
      "cpuPercent": null,
      "ioMaximumIOps": null,
      "ioMaximumBandwidth": null,
      "cpuPeriod": null,
      "cpuQuota": null,
      "cpuSetMems": null,
      "isolation": null,
      "kernelMemory": null,
      "memorySwappiness": null,
      "shmSize": null,
      "uts": null,
      "ipcMode": null,
      "stopSignal": null,
      "oomScoreAdj": null,
      "ip": null,
      "ip6": null,
      "healthInterval": null,
      "healthTimeout": null,
      "healthRetries": null
    }
    request.post({
      url: service.rancher.endpoint + '/projects/1a3504/container',
      json: tmpData
    })
  }

  rp({method: 'POST', uri: 'http://117.50.1.134:8080/v2-beta/projects/1a3504/volume', body: data, json: true})
    .then(function () {
      openContainer(req.body.userId)
      console.log('create volume success')
      res.send(201, {errorCode: 0})
    })
    .catch(function (err) {
      console.log('create volume fialed')
      res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error.'}))
    })
})

//启动云件
//req.body: cloudware_type user_id
//res: ws service_name service_id pulsar_id
router.route('/services').post(function (req, res) {
  console.log('recive post to /service')
  var serviceName = shortid.generate()
  serviceName = serviceName.replace('_', 'aa')
  serviceName = serviceName.replace('-', 'bb')
  var pulsarId = ''

  //create service
  var data = {
    "scale": 1,
    "assignServiceIpAddress": false,
    "startOnCreate": true,
    "type": "service",
    "stackId": "1st15",
    "launchConfig": {
      //"environment": {"DISPLAY": ":0"},
      //"command": "startxfce4",
      "instanceTriggeredStop": "stop",
      "kind": "container",
      "networkMode": "managed",
      "privileged": false,
      "publishAllPorts": false,
      "readOnly": false,
      "runInit": false,
      "startOnCreate": true,
      "stdinOpen": true,
      "tty": true,
      "vcpu": 1,
      "type": "launchConfig",
      "labels": {
        //"io.rancher.container.pull_image": "always",
        "io.rancher.scheduler.affinity:host_label": "cloudware=true"
      },
      "restartPolicy": {"name": "always"},
      "secrets": [],
      "dataVolumes": [req.body.user_id + ":/root/Desktop/myFile"],
      "dataVolumesFrom": [],
      "dns": [],
      "dnsSearch": [],
      "capAdd": [],
      "capDrop": [],
      "devices": [],
      "logConfig": {"driver": "", "config": {}},
      "dataVolumesFromLaunchConfigs": [],
      "imageUuid": "docker:cloudwarelabs/xfce4-min",
      "ports": [],
      "blkioWeight": null,
      "cgroupParent": null,
      "count": null,
      "cpuCount": null,
      "cpuPercent": null,
      "cpuPeriod": null,
      "cpuQuota": null,
      "cpuSet": null,
      "cpuSetMems": null,
      "cpuShares": null,
      "createIndex": null,
      "created": null,
      "deploymentUnitUuid": null,
      "description": null,
      "diskQuota": null,
      "domainName": null,
      "externalId": null,
      "firstRunning": null,
      "healthInterval": null,
      "healthRetries": null,
      "healthState": null,
      "healthTimeout": null,
      "hostname": null,
      "ioMaximumBandwidth": null,
      "ioMaximumIOps": null,
      "ip": null,
      "ip6": null,
      "ipcMode": null,
      "isolation": null,
      "kernelMemory": null,
      "memory": null,
      "memoryMb": null,
      "memoryReservation": null,
      "memorySwap": null,
      "memorySwappiness": null,
      "milliCpuReservation": null,
      "oomScoreAdj": null,
      "pidMode": null,
      "pidsLimit": null,
      "removed": null,
      "requestedIpAddress": null,
      "shmSize": null,
      "startCount": null,
      "stopSignal": null,
      "user": null,
      "userdata": null,
      "usernsMode": null,
      "uts": null,
      "uuid": null,
      "volumeDriver": null,
      "workingDir": null,
      "networkLaunchConfig": null
    },
    "secondaryLaunchConfigs": [],
    "name": serviceName,
    "createIndex": null,
    "created": null,
    "description": null,
    "externalId": null,
    "healthState": null,
    "kind": null,
    "removed": null,
    "selectorContainer": null,
    "selectorLink": null,
    "uuid": null,
    "vip": null,
    "fqdn": null
  };
  switch (req.body.cloudware_type) {
    case 'python':
      data.launchConfig.imageUuid = "docker:cloudwarelabs/python:v2.0"
      break;
    case 'base':
      data.launchConfig.imageUuid = "docker:cloudwarelabs/base:v2.0"
      break;
    case 'rstudio':
      data.launchConfig.imageUuid = "docker:cloudwarelabs/rstudio:v3.0"
      break;
    case 'hadoop':
      data.launchConfig.imageUuid = "docker:cloudwarelabs/hadoop:v3.0"
      break;
    default:
      data.launchConfig.imageUuid = "docker:cloudwarelabs/base:v2.0"
      break;
  }
  data.launchConfig.entryPoint = ["startxfce4"]
  request.post({
    url: service.rancher.endpoint + '/projects/1a5/service',
    json: data
  }, function (err, httpResponse, body) {
    if (err) {
      res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error 1.'}))
      return;
    }
    console.log('create service successfully')
    var i = 0
    var p = setInterval(function () {
      request.get({
        url: service.rancher.endpoint + '/projects/1a5/services/' + body.id
      }, function (err, httpResponse, body) {
        var parsed = JSON.parse(body);
        if (parsed.type == 'error' || parsed.instanceIds.length == 0) {
          i++
          if(i == 10){
            clearInterval(p)
            res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error 2.'}))
          }
        }
        else {
          var xfce4Id = parsed.instanceIds[0]
          cb(xfce4Id)
          var data = {
            "instanceTriggeredStop": "stop",
            "startOnCreate": true,
            "publishAllPorts": false,
            "privileged": false,
            "stdinOpen": true,
            "tty": true,
            "readOnly": false,
            "runInit": false,
            "networkMode": "container",
            "type": "container",
            "requestedHostId": "1h5",
            "restartPolicy": {name: "always"},
            "secrets": [],
            "dataVolumes": ["/" + req.body.user_id + ":/root/Desktop/myFile"],
            "dataVolumesFrom": [],
            "dns": [],
            "dnsSearch": [],
            "capAdd": [],
            "capDrop": [],
            "devices": [],
            "logConfig": {"driver": "", "config": {}},
            "dataVolumesFromLaunchConfigs": [],
            "imageUuid": "docker:cloudwarelabs/pulsar",
            "ports": [],
            "instanceLinks": {},
            "labels": {
              "container_type": "cloudware"
            },
            "name": serviceName + '-pulsar',
            "networkContainerId": xfce4Id,
            "command": ["pulsar"],
            "count": null,
            "createIndex": null,
            "created": null,
            "deploymentUnitUuid": null,
            "description": null,
            "externalId": null,
            "firstRunning": null,
            "healthState": null,
            "hostname": null,
            "kind": null,
            "memoryReservation": null,
            "milliCpuReservation": null,
            "removed": null,
            "startCount": null,
            "uuid": null,
            "volumeDriver": null,
            "workingDir": null,
            "user": null,
            "domainName": null,
            "memorySwap": null,
            "memory": null,
            "cpuSet": null,
            "cpuShares": null,
            "pidMode": null,
            "blkioWeight": null,
            "cgroupParent": null,
            "usernsMode": null,
            "pidsLimit": null,
            "diskQuota": null,
            "cpuCount": null,
            "cpuPercent": null,
            "ioMaximumIOps": null,
            "ioMaximumBandwidth": null,
            "cpuPeriod": null,
            "cpuQuota": null,
            "cpuSetMems": null,
            "isolation": null,
            "kernelMemory": null,
            "memorySwappiness": null,
            "shmSize": null,
            "uts": null,
            "ipcMode": null,
            "stopSignal": null,
            "oomScoreAdj": null,
            "ip": null,
            "ip6": null,
            "healthInterval": null,
            "healthTimeout": null,
            "healthRetries": null
          }
          request.post({
            url: service.rancher.endpoint + '/projects/1a5/container',
            json: data
          }, function (err, httpResponse, pulsarBody) {
            pulsarId = pulsarBody.id
            console.log('create pulsar successfully')
          })
          res.send(200,JSON.stringify({
            errorCode: 0,
            ws: service.rancher.wsaddr + '/' + serviceName,
            service_name: serviceName,
            service_id: body.id,
            pulsar_id: pulsarId
          }))
          return
        }
      })
    },1000)




    /*request.get({
      url: service.rancher.endpoint + '/projects/1a5/loadbalancerservices/1s18'
    }, function (err, httpResponse, body1) {
      var proxyData = JSON.parse(body1)
      proxyData.lbConfig.portRules.push({
        "protocol": "http",
        "type": "portRule",
        "hostname": serviceName + ".ex-lab.local",
        "priority": 12,
        "serviceId": body.id,
        "sourcePort": 80,
        "targetPort": 5678
      })
      request.put({
        url: service.rancher.endpoint + '/projects/1a5/loadbalancerservices/1s18',
        json: proxyData
      }, function (err, httpResponse, body2) {
        // ensure pulsar created
        setTimeout(function () {
          res.send(JSON.stringify({
            errorCode: 0,
            ws: 'ws://' + serviceName + '.ex-lab.local',
            service_name: serviceName,
            service_id: body.id,
            pulsar_id: pulsarId
          }))
        }, 3000)
      })
    })*/
  });
})

//删除云件
//req.body: serviceName serviceId pulsarId
router.route('/homeworks').post(function (req, res) {
  //delete lb rule
  console.log('recive post to /homeworks')
  rp({uri: service.rancher.endpoint + '/projects/1a5/loadbalancerservices/1s18'})
    .then(function (repos) {
      var proxyData = JSON.parse(repos)
      for (var i = 0; i < proxyData.lbConfig.portRules.length; i++) {
        if (proxyData.lbConfig.portRules[i].hostname != null && proxyData.lbConfig.portRules[i].hostname.indexOf(req.body.serviceName) != -1) {
          proxyData.lbConfig.portRules.splice(i, 1)
          break
        }
      }
      rp({
        method: 'PUT',
        uri: service.rancher.endpoint + '/projects/1a5/loadbalancerservices/1s18',
        body: proxyData,
        json: true
      })
        .then(function () {
          //delete service and container
          rp({method: 'DELETE', uri: service.rancher.endpoint + '/projects/1a5/services/' + req.body.serviceId})
            .then(function () {
              rp({method: 'DELETE', uri: service.rancher.endpoint + '/projects/1a5/containers/' + req.body.pulsarId})
                .then(function () {
                  res.send(200, {errorCode: 0})
                })
                .catch(function () {
                  res.send(500, {errorCode: 1, errorMessage: 'delete pulsar container error.'})
                })
            })
            .catch(function () {
              res.send(500, {errorCode: 1, errorMessage: 'delete service error.'})
            })
        })
        .catch(function () {
          res.send(500, {errorCode: 1, errorMessage: 'delete loadBalance rule error.'})

        })
    })
    .catch(function (err) {
      res.send(500, {errorCode: 1, errorMessage: 'get loadBalancer rules error'})
    })
})

//开启云件对应terminal
//req.header service_id
router.route('/terminals').get(function (req, res) {
  var data = {
    attachStdin: true,
    attachStdout: true,
    tty: true,
    command: [
      "/bin/sh",
      "-c",
      "TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c \"/bin/bash\" /dev/null || exec /bin/bash) || exec /bin/sh"
    ]
  }
  request.post({
    url: service.rancher.endpoint + '/projects/1a5/containers/' + req.headers.cloudware_id + '/?action=execute',
    json: data
  }, function (err, hr, body) {
    if (err) {
      res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'open terminal error.'}))
    } else {
      res.send(200, JSON.stringify({errorCode: 0, token: body.token}))
    }
  })
})

app.listen(port);
console.log('listening on port ' + port);