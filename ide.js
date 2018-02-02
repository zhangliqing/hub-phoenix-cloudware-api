/**
 * Created by zhangliqing on 2018/1/16.
 */
module.exports = {
  create: function(data,cloudwareType,res,request,service,serviceName,auth) {
    switch (cloudwareType) {
      case 'ide_java':
        data.launchConfig.imageUuid = "docker:ide/java"
        break
      default:
        data.launchConfig.imageUuid = "docker:ide/java"
        break
    }
    data.launchConfig.dataVolumes = ["javaSrc:/srcData"]

    //
    request.post({
      url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/service',
      auth:auth,
      json: data
    }, function(err, httpResponse, serviceBodyWithoutInstance) {
      if (err) {
        res.send(500, JSON.stringify({errorCode: 1, errorMessage: 'create service on rancher error'}))
        return
      }
      console.log('create service successfully')

      //
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
                    "sourcePort": 84,
                    "targetPort": 8080,
                  })

                  if (proxyData.launchConfig.ports.indexOf("84:84/tcp") === -1) {
                    proxyData.launchConfig.ports.push("84:84/tcp")
                  }

                  request.put({
                    url: service.rancher.endpoint + '/projects/' + service.rancher.env + '/loadbalancerservices/' + service.rancher.lbid,
                    auth:auth,
                    json: proxyData
                  }, function(err, httpResponse, body3) {
                    setTimeout(function() {
                      res.send(JSON.stringify({
                        errorCode: 0,
                        ws: serviceName+".cloudwarehub.com:84",
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
}