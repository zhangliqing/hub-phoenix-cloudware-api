module.exports = {
  create: function(data,req,res,request,service,serviceName) {
    switch (req.body.cloudware_type) {
      case 'python':
        data.launchConfig.imageUuid = "docker:cloudwarelabs/python:v2.0"
        break;
      case 'base':
        data.launchConfig.imageUuid = "docker:cloudwarelabs/base:v2.0"
        break;
      case 'rstudio':
        data.launchConfig.imageUuid = "docker:cloudwarelabs/rstudio:v1.0"
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
      url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/service',
      json: data
    }, function (err, httpResponse, serviceWithoutInstance) {
      if (err) {
        res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error 1.'}))
        return;
      }
      console.log('create service successfully')

      var i = 0
      var startService = function() {
          if (i > 10) {
            res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error.'}))
            return
          } else {
            setTimeout(function() {
              request.get({
                url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/services/' + serviceWithoutInstance.id
              }, function(err, httpResponse, serviceWithInstance) {
                var serviceBody = JSON.parse(serviceWithInstance)
                if (serviceBody.type == 'error' || !serviceBody.instanceIds || serviceBody.instanceIds.length == 0) {
                  startService()
                }
                else {
                  var xfce4Id = serviceBody.instanceIds[0] //获得服务对应容器的id
                  request.get({url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/containers/' + xfce4Id}, function(err, httpResponse, xfce4Body) {
                    var parsedContainer = JSON.parse(xfce4Body)
                    var hostId = parsedContainer.hostId
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
                      "requestedHostId": hostId,
                      "restartPolicy": {name: "always"},
                      "secrets": [],
                      "dataVolumes": [],
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

                    //创建pulsar容器
                    request.post({
                      url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/container',
                      json: data
                    }, function(err, httpResponse, pulsarBody) {
                      var pulsarId = pulsarBody.id
                      console.log('create pulsar successfully')

                      request.get({
                        url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid
                      }, function(err, httpResponse, lbBody) {
                        var proxyData = JSON.parse(lbBody)
                        proxyData.lbConfig.portRules.push({
                          "backendName": null,
                          "hostname": null,
                          "selector": null,
                          "protocol": "http",
                          "type": "portRule",
                          "path": "/" + serviceName,
                          "priority": 12,
                          "serviceId": serviceBody.id,
                          "sourcePort": 8888,
                          "targetPort": 5678
                        })

                        request.put({
                          url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid,
                          json: proxyData
                        }, function(err, httpResponse, body3) {

                          // ensure pulsar created
                          setTimeout(function() {
                            res.send(JSON.stringify({
                              errorCode: 0,
                              ws: service.rancher.wsaddr + '/' + serviceName,
                              service_name: serviceName,
                              service_id: serviceBody.id,
                              pulsar_id: pulsarId
                            }))
                          }, 3000)
                        })
                      })
                    })
                  })
                }
              })
            }, 1000)
            i = i + 1
          }
        }
      startService()
      })
  },
  delete: function(req,res,request,lbUrl,serviceUrl,containerUrl) {

    //remove lb rule
    request.get({url:lbUrl},function(err, httpResponse, body) {
      var proxyData = JSON.parse(body)
      for (var i = 0; i < proxyData.lbConfig.portRules.length; i++) {
        if (proxyData.lbConfig.portRules[i].path != null && proxyData.lbConfig.portRules[i].path.indexOf(req.body.serviceName) != -1) {
          proxyData.lbConfig.portRules.splice(i, 1) //删除该规则
          break
        }
      }
      request.put({
        url:lbUrl,
        body: proxyData,
        json: true},function() {
        //delete service and pulsar
        request.delete({url: serviceUrl + req.body.serviceId},function (err, httpResponse, body) {
          if(err){
            res.send(500,{errorCode: 1, errorMessage: 'delete service error.'})
          }else {
            request.delete({url: containerUrl + req.body.pulsarId},function(err, httpResponse, body) {
              if(err){
                res.send(500,{errorCode: 1, errorMessage: 'delete pulsar error.'})
              }else {
                res.send(200, {errorCode: 0})
              }
            })
          }
        })
      })
    })



  }
}