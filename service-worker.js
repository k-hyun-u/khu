const CACHE_NAME = 'dance-terms-v2';

// 기본 파일 목록
const baseFiles = [
    '/khu/',
    '/khu/index.html',
    '/khu/dansce.html',
    '/khu/script.js',
    '/khu/manifest.json',
    '/khu/words.json',
    '/khu/icons/icon-192x192.png',
    '/khu/icons/icon-512x512.png'
];

// 오디오 파일 목록
const audioFiles = [
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
    '/khu/audio/weave.mp3'
];

// 비디오 파일 목록
const videoFiles = [
    '/khu/video/1.mp4',
    '/khu/video/2.mp4',
    '/khu/video/3.mp4',
    '/khu/video/4.mp4',
    '/khu/video/5.mp4',
    '/khu/video/6.mp4'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            
            // 기본 파일 캐시
            console.log('기본 파일 캐싱 시작...');
            await cache.addAll(baseFiles);
            console.log('기본 파일 캐싱 완료');

            // 오디오 파일 캐시
            console.log('오디오 파일 캐싱 시작...');
            let completed = 0;
            await Promise.all(
                audioFiles.map(async (audioUrl) => {
                    try {
                        const response = await fetch(audioUrl, { mode: 'no-cors' });
                        if (response) {
                            await cache.put(audioUrl, response);
                            completed++;
                            console.log(`오디오 파일 캐싱 진행: ${completed}/${audioFiles.length}`);
                        }
                    } catch (error) {
                        console.warn('오디오 파일 캐싱 실패:', audioUrl);
                    }
                })
            );
            console.log('오디오 파일 캐싱 완료');
        })()
    );
});

// fetch 이벤트
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 비디오 파일은 네트워크 우선
    if (url.pathname.includes('/video/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // 그 외 파일은 캐시 우선
    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const response = await fetch(event.request);
                
                if (response && response.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, response.clone());
                }
                
                return response;
            } catch (error) {
                console.warn('Fetch failed:', error);
                return new Response('Offline and not cached');
            }
        })()
    );
});

// activate 이벤트
self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
            
            await clients.claim();
        })()
    );
});

// 캐시 상태 확인
self.addEventListener('message', (event) => {
    if (event.data === 'CACHE_STATUS') {
        event.waitUntil(
            (async () => {
                const cache = await caches.open(CACHE_NAME);
                const keys = await cache.keys();
                const status = {
                    total: baseFiles.length + audioFiles.length,
                    cached: keys.length
                };
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CACHE_STATUS',
                        status
                    });
                });
            })()
        );
    }
});