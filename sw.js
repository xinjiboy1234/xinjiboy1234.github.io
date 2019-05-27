var cacheStorageKey='pwa-demo01-v1' //版本号，当想更新缓存资源（文件、数据等）
var cacheList=[
    './',
    './index.html',
    './main.css',
    './pwaicon.jpg'
] //需要缓存的文件路径
//当脚本加载完毕执行
self.addEventListener('install',function(e){
    e.waitUntil(
        //创建缓存并缓存cacheList的所以文件
            caches.open(cacheStorageKey)
            .then(function(cache){
                return cache.addAll(cacheList)
            })
            .then(function(){
                //使用了一个方法那就是 self.skipWaiting( ) ，为了在页面更新的过程当中，新的 SW 脚本能够立刻激活和生效
                return self.skipWaiting()
            })
        )
})
//缓存通过fetch获取的数据
self.addEventListener('fetch',function(e){
    e.respondWith(
        caches.match(e.request).then(function(response){
            if(response!=null){
                return response
            }
            // 因为 event.request 流已经在 caches.match 中使用过一次，
            // 那么该流是不能再次使用的。我们只能得到它的副本，拿去使用。
            var fetchRequest = e.request.clone();
            return fetch(fetchRequest)
                        .then(function(res){
                            // 检查是否成功
                            //失败了
                            if(!res || res.status !==200||res.type!=='basic'){
                                return res
                            }
                            // 如果成功，该 response 一是要拿给浏览器渲染，二是要进行缓存。
                            // 不过需要记住，由于 caches.put 使用的是文件的响应流，一旦使用，
                            // 那么返回的 response 就无法访问造成失败，所以，这里需要复制一份。
                            var responseToCache = res.clone()
                            caches
                                .open(cacheStorageKey)
                                .then(function(cache){
                                    cache.put(e.request,responseToCache)
                                });
                            return res
                }
            )       
        })
    )
})
//当被激活时，检查版本资源，移除旧版本的资源
self.addEventListener('activate',function(e){
    e.waitUntil(
        //获取所有cache名称
        caches.keys().then(function(cacheNames){
            return Promise.all(
                //移除不是该版本的所有资源
                cacheNames.filter(function(cacheName){
                    return cacheName !==cacheStorageKey
                }).map(function(cacheName){
                    return caches.delete(cacheName)
                })
            )

        }).then(function(){
            return self.clients.claim() //在新安装的 SW 中通过调用 self.clients.claim( ) 取得页面的控制权，这样之后打开页面都会使用版本更新的缓存。
        })
    )
})