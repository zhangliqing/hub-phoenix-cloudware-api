/**
 * Created by zhangliqing on 2017/9/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var rp = require('request-promise');
var service = require('./service.local');
var shortid = require('shortid');
var cors = require('cors');
var cloudware = require('./cloudware');
var jupyter = require('./jupyter');
var ide = require('./ide')

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
var auth = {
  user:service.rancher.username,
  pass:service.rancher.password
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors())
app.use('/', router);
router.use(verifyToken);

//创建用户对应文件夹
//req.body userId
router.route('/volumes').post(function (req, res) {
  console.log('recive post to /volumes')

  var userId = req.body.userId || req.body.user_id;

  var data = {
    "type": "volume",
    "driver": "rancher-nfs",
    "name": userId,
    "driverOpts": {}
  }
  var openContainer = function (userId) {
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
        userId + ":/data"
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
      "name": "test" + userId,
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
      openContainer(userId)
      console.log('create volume success')
      res.send(201, {errorCode: 0})
    })
    .catch(function (err) {
      console.log('create volume fialed')
      res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error.'}))
    })
})

//启动云件
//req.body: cloudwareType userId
//res: ws serviceName serviceId pulsarId
router.route('/services').post(function (req, res) {
  console.log('recive post to /service')

  var cloudwareType = req.body.cloudwareType || req.body.cloudware_type;
  var userId = req.body.userId || req.body.user_id

  var serviceName = shortid.generate()
  serviceName = serviceName.replace('_', 'aa')
  serviceName = serviceName.replace('-', 'bb')

  //create cloudware service
  var data = {
    "scale": 1,
    "assignServiceIpAddress": false,
    "startOnCreate": true,
    "type": "service",
    "stackId": "1st31",
    "launchConfig": {
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
      "dataVolumes": [userId + ":/root/Desktop/myFile"],
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

  if(cloudwareType !== undefined){
    if(cloudwareType.indexOf('jupyter') !== -1){
      jupyter.create(data,cloudwareType,userId,res,request,service,serviceName,auth)
    }else if(cloudwareType.indexOf('ide') !== -1){
      ide.create(data,cloudwareType,res,request,service,serviceName,auth)
    }else {
      cloudware.create(data,cloudwareType,res,request,service,serviceName,auth)
    }
  }else {
    res.send(500,{errorCode: 1, errorMessage: 'no cloudware type'})
  }
})

//删除云件
//req.body: serviceName serviceId  pulsarIds(可选)
router.route('/homeworks').post(function (req, res) {
  console.log('recive post to /homeworks,req.body.pulsarId is '+req.body.pulsarId)

  lbUrl = service.rancher.endpoint + '/projects/'+service.rancher.env+'/loadbalancerservices/'+service.rancher.lbid;
  serviceUrl = service.rancher.endpoint + '/projects/'+service.rancher.env+'/services/'
  containerUrl = service.rancher.endpoint + '/projects/'+service.rancher.env+'/containers/'

  if(req.body.pulsarId){
    console.log('now delete cloudware')
    cloudware.delete(req,res,request,lbUrl,serviceUrl,containerUrl,auth)
  }else { //jupyter与ide相同
    console.log('now delete jupyter or ide')
    jupyter.delete(req,res,request,lbUrl,serviceUrl,auth)
  }
})

//开启云件对应terminal
//req.header serviceId
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
    url: service.rancher.endpoint + '/projects/1a3504/containers/' + req.headers.cloudwareId + '/?action=execute',
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