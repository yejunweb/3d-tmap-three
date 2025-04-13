export function TMapLoader(key) {
    return new Promise(function (resolve, reject) {
      window.init = function () {
        // eslint-disable-next-line no-undef
        resolve(TMap)
      }
      var script = document.createElement("script")
      script.type = "text/javascript"
      script.src = "https://map.qq.com/api/gljs?v=1.exp&callback=init&key=" + key + "&libraries=view,geometry,model,tools,visualization"
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  