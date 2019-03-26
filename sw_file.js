// assign cache version Name
const cacheName = 'resV1';

// target initial file for caching
const cacheAssests = [
    'offline/ohno.gif',
    'offline/index.html'
];

// Install Service Worker
self.addEventListener('install', e =>{
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                console.log('cached files')
                cache.addAll(cacheAssests);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.log(`Service Error: ${err}`))
    );
});

// Activate Service worker => cleanup  old catches
self.addEventListener('activate', (e) => {
    console.log('Service Worker: Activated')
    // removing unwanted caches
    e.waitUntil(
        caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cache => {
                if(cache !== cacheName){
                    console.log('Service Worker: Deleting old Caches')
                    return caches.delete(cache)
                }
            })
        )
    })
    )
});

// update fetch data
function fetchUpdate(request){
    return fetch(request)
        .then(res => {
            if(res){
                return caches.open(cacheName)
                .then(cache => {
                    return cache.put(request, res.clone())
                    .then(() => {
                        return res
                    })
                })
            }
        })
};

// call fetch event
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
        .then(res => {
            if(res){
                return res;
            }
            if(!navigator.onLine){
                return caches.match(new Request('offline/index.html'))
            }
            return fetchUpdate(e.request)
        })
    );
});