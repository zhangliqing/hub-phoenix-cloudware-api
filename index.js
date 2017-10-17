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
var verifyToken = function (req,res,next) {
  if(req.headers.secret != 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1MDU4MTM0NTd9.Ftw1yHeUrqdNvymFZcIpuEoS0RHBFZqu4MfUZON9Zm0'){
    res.send(401,'Authentication failed.');
    return;
  }
  next();
}

app.use(bodyParser.urlencoded({extended: true}));
app.use( bodyParser.json());
app.use(cors())
app.use('/', router);
router.use(verifyToken);

// shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-');
// router.route('/token').get(function (req,res) {//登录时调用，获取token
//   var token = jwt.sign({ foo: 'bar' }, 'shhhguanshanhh');
//   res.send(200,token);
// })
router.route('/volumes').post(function (req,res) { //user_id
  var data = {
    "type":"volume",
    "driver":"rancher-nfs",
    "name":req.body.user_id,
    "driverOpts":{}
  }

  request.post({
    url:service.rancher.endpoint + '/projects/1a3504/volume',
    json: data
  },function (err,httpResponse,body) {
    if(err){
      res.send(500, 'post to rancher error.')
      return
    }else {
      res.send(201,'OK')
    }
  })
})

router.route('/services').post(function (req, res) {  //req.body: cloudware,user_id    res: ws
  var serviceName = shortid.generate()
  serviceName = serviceName.replace('_', 'aa')
  serviceName = serviceName.replace('-', 'bb')
  console.log('create service: ' + serviceName)
  var data = {
    "scale": 1,
    "assignServiceIpAddress": false,
    "startOnCreate": true,
    "type": "service",
    "stackId": "1st15",
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
        "io.rancher.container.pull_image": "always",
        "io.rancher.scheduler.affinity:host_label": "cloudware=true"
      },
      "restartPolicy": {"name": "always"},
      "secrets": [],
      "dataVolumes": [req.body.user_id+":/data"],
      "dataVolumesFrom": [],
      "dns": [],
      "dnsSearch": [],
      "capAdd": [],
      "capDrop": [],
      "devices": [],
      "logConfig": {"driver": "", "config": {}},
      "dataVolumesFromLaunchConfigs": [],
      "imageUuid": "docker:daocloud.io/guodong/xfce4-pulsar-ide-xterm",
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
    case 'rstudio':
      data.launchConfig.imageUuid = "docker:daocloud.io/guodong/xfce4-pulsar-ide-rstudio"
      break;
    case 'xterm':
      data.launchConfig.imageUuid = "docker:daocloud.io/guodong/xfce4-pulsar-ide-xterm"
      break;
  }
  request.post({
    url: service.rancher.endpoint + '/projects/1a3504/service',
    json: data
  }, function (err, httpResponse, body) {
    if (err) {
      res.send(500, 'post to rancher error.')
      return;
    }
    request.get({
      url: service.rancher.endpoint + '/projects/1a3504/loadbalancerservices/1s18'
    }, function (err, httpResponse, body1) {
      var proxyData = JSON.parse(body1)
      proxyData.lbConfig.portRules.push({
        "protocol": "http",
        "type": "portRule",
        "hostname": serviceName + ".ex-lab.org",
        "priority": 12,
        "serviceId": body.id,
        "sourcePort": 80,
        "targetPort": 5678
      })
      request.put({
        url: service.rancher.endpoint + '/projects/1a3504/loadbalancerservices/1s18',
        json: proxyData
      }, function (err, httpResponse, body2) {
        setTimeout(function () {
          var cloudware_id = '';
          request.get({url:service.rancher.endpoint+'/projects/1a3504/services/'+body.id},function (err,httpResponse,body3) {
            body3_json = JSON.parse(body3);
            cloudware_id = body3_json.instanceIds.pop();
            res.send(200,JSON.stringify({
              ws: 'ws://' + serviceName + '.ex-lab.org',
              service_id: body.id,
              instance_id: cloudware_id
            }));
          })
        },2000)
      })
    })
  });
})
router.route('/services').delete(function (req, res) {
  request.del({url: service.rancher.endpoint + '/projects/1a3504/services/' + req.headers.service_id}, function (err, httpResponse, body) {
    if (err) {
      res.send(500, 'Internal error.');
      return;
    }else {
      res.send(204,'Delete service successful.')
    }
  });
})

router.route('/terminals').get(function (req,res) {
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
    url:service.rancher.endpoint + '/projects/1a3504/containers/'+req.headers.instance_id+'/?action=execute',
    json:data
  },function (err,hr,body) {
    if(err){
      res.send(500,'internal error.')
    }else {
      res.send(200,{token:body.token})
    }
  })
})

app.listen(port);
console.log('listening on port ' + port);