// 전역 변수 선언
let words = [];
let currentIndex = 0;
let startTime;
let repeatCount = 2;
let currentAudio = null;
let isAutoMode = false;
let autoPlayTimer = null;

let studyData = {
    totalStudyTime: 0,
    totalWords: 0,
    dailyStudy: {},
    lastStudyDate: null
};

// DOM 요소
const mainPage = document.getElementById('mainPage');
const cardPage = document.getElementById('cardPage');
const resultPage = document.getElementById('resultPage');
const autoStartBtn = document.getElementById('autoStartBtn');
const manualStartBtn = document.getElementById('manualStartBtn');
const nextBtn = document.getElementById('nextBtn');
const replayBtn = document.getElementById('replayBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');

// 단어 데이터 로드
async function loadWords() {
    try {
        const response = await fetch('./words.json');
        const data = await response.json();
        words = data.words;
        console.log('단어 데이터 로드 완료:', words.length + '개의 단어');
    } catch (error) {
        console.error('Error loading words:', error);
        alert('단어 데이터를 불러오는데 실패했습니다.');
    }
}

// 오디오 반복 재생 함수
function playAudioWithRepeat(audioFile, repeat, onComplete) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    let count = 0;
    currentAudio = new Audio(`/khu/audio/${audioFile}`);
    
    currentAudio.addEventListener('ended', function() {
        count++;
        if (count < repeat) {
            setTimeout(() => {
                currentAudio.currentTime = 0;
                currentAudio.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            }, 1000);
        } else if (onComplete) {
            onComplete();
        }
    });

    currentAudio.play().catch(error => {
        console.log('Audio playback failed:', error);
        if (onComplete) onComplete();
    });
}
// 단어 로드 함수
function loadWord(index) {
    if (index >= words.length) {
        showResult();
        return;
    }

    const word = words[index];
    
    const cardContent = `
        <div class="word-card">
            <div class="english">${word.english}</div>
            <div class="pronunciation">${word.pronunciation}</div>
            <div class="korean">${word.korean}</div>
        </div>
        <div class="progress-info">
            <span>${index + 1} / ${words.length}</span>
        </div>
    `;
    
    document.getElementById('cardContent').innerHTML = cardContent;
    updateProgress();

    if (word.audioFile) {
        playAudioWithRepeat(word.audioFile, repeatCount, () => {
            if (isAutoMode && currentIndex < words.length - 1) {
                autoPlayTimer = setTimeout(() => {
                    nextBtn.click();
                }, 1000);
            }
        });
    }
}

// 자동 모드 시작
autoStartBtn.addEventListener('click', () => {
    isAutoMode = true;
    const repeatSelect = document.getElementById('repeatCount');
    repeatCount = parseInt(repeatSelect.value) || 2;
    startTime = new Date();
    mainPage.style.display = 'none';
    cardPage.style.display = 'block';
    document.getElementById('manualControls').style.display = 'none'; // 수동 컨트롤 숨기기
    currentIndex = 0;
    loadWord(0);
});

// 수동 모드 시작
manualStartBtn.addEventListener('click', () => {
    isAutoMode = false;
    const repeatSelect = document.getElementById('repeatCount');
    repeatCount = parseInt(repeatSelect.value) || 2;
    startTime = new Date();
    mainPage.style.display = 'none';
    cardPage.style.display = 'block';
    document.getElementById('manualControls').style.display = 'flex'; // 수동 컨트롤 표시
    currentIndex = 0;
    loadWord(0);
});

// 다음 버튼 클릭
nextBtn.addEventListener('click', () => {
    if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    currentIndex++;
    if (currentIndex < words.length) {
        loadWord(currentIndex);
    } else {
        showResult();
    }
});

// 다시 듣기 버튼 클릭
replayBtn.addEventListener('click', () => {
    if (currentIndex < words.length) {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
        }
        loadWord(currentIndex);
    }
});

// 중단 버튼 클릭
stopBtn.addEventListener('click', () => {
    if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);
    saveStudyData(duration, currentIndex + 1);
    showResult();
});