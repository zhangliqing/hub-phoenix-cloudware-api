module.exports = {
  create: function(data,jupyterType,request,userId,res,service,serviceName) {
    switch (jupyterType) {
      case 'jupyterPython':
        data.launchConfig.imageUuid = "docker:jupyter/base-notebook"
        break
      default:
        data.launchConfig.imageUuid = "docker:cloudwarelabs/base:v2.0"
        break
    }
    data.launchConfig.dataVolumes = [userId + ":/home/jovyan/work"]
    data.launchConfig.command=["start-notebook.sh", "--NotebookApp.token=''"]

    request.post({
      url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/service',
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
              url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/services/' + serviceBodyWithoutInstance.id
            }, function(err, httpResponse, serviceBodyWithInstance) {
              var serviceBody = JSON.parse(serviceBodyWithInstance)
              if (serviceBody.type == 'error' || !serviceBody.instanceIds || serviceBody.instanceIds.length == 0) {
                startService()
              }
              else {
                request.get({
                  url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid
                }, function(err, httpResponse, lbBody) {

                  var proxyData = JSON.parse(lbBody)

                  proxyData.lbConfig.portRules.push({
                    "backendName": null,
                    "hostname": "api.cloudwarehub.com",
                    "selector": null,
                    "protocol": "http",
                    "type": "portRule",
                    "path": "",
                    "priority": 12,
                    "serviceId": serviceBodyWithoutInstance.id,
                    "sourcePort": 10001,
                    "targetPort": 8888,
                  })

                  if (proxyData.launchConfig.ports.indexOf("10001:10001/tcp") === -1) {
                    proxyData.launchConfig.ports.push("10001:10001/tcp")
                  }

                  request.put({
                    url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid,
                    json: proxyData
                  }, function(err, httpResponse, body3) {
                    res.send(JSON.stringify({
                      errorCode: 0,
                      ws: service.rancher.wsprefix + '/' + serviceName,
                      service_name: serviceName,
                      service_id: serviceBodyWithoutInstance.id,
                    }))
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
  }
}