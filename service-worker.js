const CACHE_NAME = 'dance-terms-v1';
const urlsToCache = [
    '/khu/',
    '/khu/index.html',
    '/khu/script.js',
    '/khu/manifest.json',
    '/khu/words.json',
    '/khu/audio/balancestep.mp3',
    '/khu/audio/brush.mp3',
    '/khu/audio/bump.mp3',
    '/khu/audio/chachacha.mp3',
    '/khu/audio/charleston.mp3',
    '/khu/audio/clap.mp3',
    '/khu/audio/coaster.mp3',
    '/khu/audio/count.mp3',
    '/khu/audio/cross.mp3',
    '/khu/audio/dragdraw.mp3',
    '/khu/audio/flick.mp3',
    '/khu/audio/grapevine.mp3',
    '/khu/audio/hitch.mp3',
    '/khu/audio/hold.mp3',
    '/khu/audio/hook.mp3',
    '/khu/audio/jazzbox.mp3',
    '/khu/audio/kick.mp3',
    '/khu/audio/kickballchange.mp3',
    '/khu/audio/lockstep.mp3',
    '/khu/audio/lunge.mp3',
    '/khu/audio/manbo.mp3',
    '/khu/audio/montereyturn.mp3',
    '/khu/audio/overvine.mp3',
    '/khu/audio/pivotturn.mp3',
    '/khu/audio/point.mp3',
    '/khu/audio/restart.mp3',
    '/khu/audio/reverseturn.mp3',
    '/khu/audio/rockandrecover.mp3',
    '/khu/audio/rockingchair.mp3',
    '/khu/audio/rockturn.mp3',
    '/khu/audio/rollingturn.mp3',
    '/khu/audio/ronde.mp3',
    '/khu/audio/sailorstep.mp3',
    '/khu/audio/scissorstep.mp3',
    '/khu/audio/scuff.mp3',
    '/khu/audio/shimmy.mp3',
    '/khu/audio/shufflestep.mp3',
    '/khu/audio/skatestep.mp3',
    '/khu/audio/slide.mp3',
    '/khu/audio/snap.mp3',
    '/khu/audio/step.mp3',
    '/khu/audio/stomp.mp3',
    '/khu/audio/strut.mp3',
    '/khu/audio/sugarfoot.mp3',
    '/khu/audio/sway.mp3',
    '/khu/audio/sweep.mp3',
    '/khu/audio/swivel.mp3',
    '/khu/audio/syncopation.mp3',
    '/khu/audio/tag.mp3',
    '/khu/audio/tap.mp3',
    '/khu/audio/together.mp3',
    '/khu/audio/touch.mp3',
    '/khu/audio/twinkle.mp3',
    '/khu/audio/waltzstep.mp3',
    '/khu/audio/weave.mp3',
    '/khu/icons/icon-192x192.png',
    '/khu/icons/icon-512x512.png'
];

// 설치 시 캐시
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 있으면 캐시된 버전 반환
                if (response) {
                    return response;
                }
                // 캐시에 없으면 네트워크 요청
                return fetch(event.request)
                    .then(response => {
                        // 유효한 응답인지 확인
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답을 복제하여 캐시에 저장
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // 오프라인이고 캐시에도 없는 경우
                console.log('Fetch failed; returning offline page instead.');
            })
    );
});

// 캐시 업데이트
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // 오래된 캐시 삭제
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});