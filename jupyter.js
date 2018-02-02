module.exports = {
  create: function(data,req,res,request,service,serviceName,auth) {
    switch (req.body.cloudwareType) {
      case 'jupyter_python':
        data.launchConfig.imageUuid = "docker:jupyter/base-notebook"
        break
      default:
        data.launchConfig.imageUuid = "docker:cloudwarelabs/base:v2.0"
        break
    }
    data.launchConfig.dataVolumes = [req.body.userId + ":/home/jovyan"]
    data.launchConfig.command=["start-notebook.sh", "--NotebookApp.token=''"]

    request.post({
      url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/service',
      auth:auth,
      json: data
    }, function(err, httpResponse, serviceBodyWithoutInstance) {
      if (err) {
        res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'post to rancher error.'}))
        return
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
              url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/services/' + serviceBodyWithoutInstance.id,
              auth:auth,
            }, function(err, httpResponse, serviceBodyWithInstance) {
              var serviceBody = JSON.parse(serviceBodyWithInstance)
              if (serviceBody.type == 'error' || !serviceBody.instanceIds || serviceBody.instanceIds.length == 0) {
                startService()
              }
              else {
                request.get({
                  url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid,
                  auth:auth,
                }, function(err, httpResponse, lbBody) {

                  var proxyData = JSON.parse(lbBody)

                  proxyData.lbConfig.portRules.push({
                    "backendName": null,
                    "hostname": serviceName+".cloudwarehub.com",
                    "selector": null,
                    "protocol": "http",
                    "type": "portRule",
                    "path": "",
                    "priority": 12,
                    "serviceId": serviceBodyWithoutInstance.id,
                    "sourcePort": 83,
                    "targetPort": 8888,
                  })

                  if (proxyData.launchConfig.ports.indexOf("83:83/tcp") === -1) {
                    proxyData.launchConfig.ports.push("83:83/tcp")
                  }

                  request.put({
                    url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid,
                    auth:auth,
                    json: proxyData
                  }, function(err, httpResponse, body3) {
                    setTimeout(function() {
                      res.send(JSON.stringify({
                        errorCode: 0,
                        ws: serviceName+".cloudwarehub.com:83",
                        service_name: serviceName,
                        service_id: serviceBodyWithoutInstance.id,
                        pulsar_id: ''
                      }))
                    },3000)

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

  delete: function(req,res,request,lbUrl,serviceUrl,auth) {

    //remove lb rule
    request.get({
      url:lbUrl,
      auth:auth,
    },function(err, httpResponse, body) {
      var proxyData = JSON.parse(body)
      for (var i = 0; i < proxyData.lbConfig.portRules.length; i++) {
        if (proxyData.lbConfig.portRules[i].hostname != null && proxyData.lbConfig.portRules[i].hostname.indexOf(req.body.serviceName) != -1) {
          proxyData.lbConfig.portRules.splice(i, 1) //删除该规则
          break
        }
      }
      request.put({
        url:lbUrl,
        auth:auth,
        body: proxyData,
        json: true},function() {
        //delete service
        request.delete({
          url: serviceUrl + req.body.serviceId,
          auth:auth,
        },function (err, httpResponse, body) {
          if(err){
            res.send(500,{errorCode: 1, errorMessage: 'delete service error.'})
          }else {
            res.send(200, {errorCode: 0})
          }
        })
      })
    })
  }
}