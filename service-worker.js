const CACHE_NAME = 'dance-terms-v1';

// 기본 파일 목록
const baseFiles = [
    '/khu/',
    '/khu/index.html',
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
    event.respondWith(
        (async () => {
            // 캐시에서 응답 확인
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                // 네트워크 요청
                const response = await fetch(event.request);
                
                // 유효한 응답인 경우에만 캐시에 저장
                if (response && response.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, response.clone());
                }
                
                return response;
            } catch (error) {
                console.warn('Fetch failed:', error);
                // 오프라인이고 캐시에도 없는 경우
                return new Response('Offline and not cached');
            }
        })()
    );
});

// activate 이벤트
self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // 이전 버전의 캐시 삭제
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
            
            // 새로운 서비스 워커가 즉시 페이지 제어하도록 설정
            await clients.claim();
        })()
    );
});

// 캐시 상태 확인을 위한 메시지 리스너
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
                // 결과를 모든 클라이언트에 전송
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
