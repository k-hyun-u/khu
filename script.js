// 전역 변수 선언
let words = [];
let currentIndex = 0;
let startTime;
let timePerWord = 5;
let timer;
let studyHistory = [];

// DOM 요소
const mainPage = document.getElementById('mainPage');
const cardPage = document.getElementById('cardPage');
const resultPage = document.getElementById('resultPage');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const audioBtn = document.getElementById('audioBtn');
const progressBar = document.getElementById('progressBar');

// 단어 데이터 로드
async function loadWords() {
    try {
        const response = await fetch('./words.json');
        const data = await response.json();
        words = data.words;
    } catch (error) {
        console.error('Error loading words:', error);
        alert('단어 데이터를 불러오는데 실패했습니다.');
    }
}

// localStorage에서 학습 기록 불러오기
function loadStudyHistory() {
    const savedHistory = localStorage.getItem('studyHistory');
    if (savedHistory) {
        studyHistory = JSON.parse(savedHistory);
    }
}

// 학습 기록 저장하기
function saveStudyHistory(wordsStudied, duration) {
    const studyRecord = {
        date: new Date().toISOString().split('T')[0],
        wordsStudied: wordsStudied,
        duration: duration,
        timestamp: new Date().getTime()
    };

    studyHistory.push(studyRecord);
    if (studyHistory.length > 30) {
        studyHistory = studyHistory.slice(-30);
    }

    localStorage.setItem('studyHistory', JSON.stringify(studyHistory));
}

// 오늘의 학습 통계 계산
function getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = studyHistory.filter(record => record.date === today);
    
    const totalWordsToday = todayRecords.reduce((sum, record) => sum + record.wordsStudied, 0);
    const totalDurationToday = todayRecords.reduce((sum, record) => sum + record.duration, 0);
    
    return {
        wordsToday: totalWordsToday,
        durationToday: totalDurationToday
    };
}

// 시간 형식 변환 함수
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
}

// 학습 시작 함수
function startStudy() {
    timePerWord = parseInt(document.getElementById('timePerWord').value);
    startTime = new Date();
    mainPage.style.display = 'none';
    cardPage.style.display = 'block';
    currentIndex = 0;
    loadWord(currentIndex);
    updateProgress();
}

// 단어 로드 함수
function loadWord(index) {
    if (index >= words.length) {
        showResult();
        return;
    }

    const word = words[index];
    document.getElementById('currentWord').textContent = word.english;
    document.getElementById('pronunciation').textContent = word.pronunciation;
    document.getElementById('meaning').textContent = word.korean;
    document.getElementById('currentNumber').textContent = index + 1;
    
    // 자동 재생 타이머 설정
    clearTimeout(timer);
    timer = setTimeout(() => {
        if (currentIndex < words.length - 1) {
            nextBtn.click();
        } else {
            showResult();
        }
    }, timePerWord * 1000);

    // 진행률 업데이트
    updateProgress();
}

// 진행률 업데이트 함수
function updateProgress() {
    const progress = ((currentIndex + 1) / words.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// 결과 표시 함수
function showResult() {
    clearTimeout(timer);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    // 학습 기록 저장
    saveStudyHistory(currentIndex + 1, duration);

    // 오늘의 총 학습 통계 계산
    const todayStats = getTodayStats();

    cardPage.style.display = 'none';
    resultPage.style.display = 'block';

    // 결과 페이지 업데이트
    const summaryHTML = `
        <div class="result-summary">
            <h3>이번 학습 결과</h3>
            <p>학습한 단어: ${currentIndex + 1}개</p>
            <p>학습 시간: ${formatTime(duration)}</p>
            <h3>오늘의 총 학습량</h3>
            <p>총 학습 단어: ${todayStats.wordsToday}개</p>
            <p>총 학습 시간: ${formatTime(todayStats.durationToday)}</p>
        </div>
    `;
    
    document.getElementById('summary').innerHTML = summaryHTML;
}

// 오디오 재생 함수
function playAudio() {
    const word = words[currentIndex];
    const audio = new Audio(`audio/${word.audio}`);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('오디오 재생에 실패했습니다.');
    });
}

// 학습 재시작 함수
function restartStudy() {
    currentIndex = 0;
    resultPage.style.display = 'none';
    mainPage.style.display = 'block';
    updateTodayStats();
}

// 오늘의 학습 현황 업데이트 함수
function updateTodayStats() {
    const todayStats = getTodayStats();
    const statsHTML = `
        <div class="today-stats">
            <h3>오늘의 학습 현황</h3>
            <p>학습한 단어: ${todayStats.wordsToday}개</p>
            <p>총 학습 시간: ${formatTime(todayStats.durationToday)}</p>
        </div>
    `;
    
    const existingStats = mainPage.querySelector('.today-stats');
    if (existingStats) {
        existingStats.remove();
    }
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    statsContainer.innerHTML = statsHTML;
    mainPage.insertBefore(statsContainer, startBtn);
}

// 이벤트 리스너 등록
startBtn.addEventListener('click', startStudy);
nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < words.length) {
        loadWord(currentIndex);
    } else {
        showResult();
    }
});
stopBtn.addEventListener('click', showResult);
audioBtn.addEventListener('click', playAudio);
restartBtn.addEventListener('click', restartStudy);

// 키보드 이벤트 처리
document.addEventListener('keydown', (event) => {
    if (cardPage.style.display === 'block') {
        if (event.code === 'Space' || event.code === 'ArrowRight') {
            event.preventDefault();
            nextBtn.click();
        } else if (event.code === 'KeyP') {
            event.preventDefault();
            audioBtn.click();
        }
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadWords();
    loadStudyHistory();
    updateTodayStats();
});

// 에러 처리를 위한 전역 에러 핸들러
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    return false;
};