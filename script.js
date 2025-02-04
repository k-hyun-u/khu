let words = [];
let currentIndex = 0;
let startTime;
let timePerWord = 5;
let timer;
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
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');

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

// 학습 데이터 저장 함수
function saveStudyData(studyTime, wordCount) {
    const today = new Date().toISOString().split('T')[0];
    
    let data = JSON.parse(localStorage.getItem('studyData')) || studyData;
    
    data.totalStudyTime += studyTime;
    data.totalWords += wordCount;
    data.lastStudyDate = today;
    
    if (!data.dailyStudy[today]) {
        data.dailyStudy[today] = {
            studyTime: 0,
            wordCount: 0
        };
    }
    data.dailyStudy[today].studyTime += studyTime;
    data.dailyStudy[today].wordCount += wordCount;
    
    localStorage.setItem('studyData', JSON.stringify(data));
}

// 학습 통계 표시 함수
function displayStudyStats() {
    const data = JSON.parse(localStorage.getItem('studyData')) || studyData;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const statsHTML = `
        <div class="study-stats">
            <h3>학습 통계</h3>
            <div class="stat-item">
                <span class="stat-label">총 학습 시간:</span>
                <span class="stat-value">${formatTime(data.totalStudyTime)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">총 학습 단어:</span>
                <span class="stat-value">${data.totalWords}개</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">오늘 학습한 단어:</span>
                <span class="stat-value">${data.dailyStudy[today]?.wordCount || 0}개</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">어제 학습한 단어:</span>
                <span class="stat-value">${data.dailyStudy[yesterday]?.wordCount || 0}개</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">마지막 학습일:</span>
                <span class="stat-value">${formatDate(data.lastStudyDate)}</span>
            </div>
        </div>
    `;
    
    document.getElementById('statsContainer').innerHTML = statsHTML;
}

// 시간 포맷 함수
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

// 날짜 포맷 함수
function formatDate(dateString) {
    if (!dateString) return '없음';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 숫자 패딩 함수
function pad(num) {
    return num.toString().padStart(2, '0');
}

// 시작 버튼 클릭 이벤트
startBtn.addEventListener('click', () => {
    timePerWord = parseInt(document.getElementById('timePerWord').value);
    startTime = new Date();
    mainPage.style.display = 'none';
    cardPage.style.display = 'block';
    loadWord(0);
});

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
}

// 진행률 업데이트
function updateProgress() {
    const progress = ((currentIndex + 1) / words.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// 다음 버튼 클릭 이벤트
nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < words.length) {
        loadWord(currentIndex);
    } else {
        showResult();
    }
});

// 중단 버튼 클릭 이벤트
stopBtn.addEventListener('click', showResult);

// 결과 표시 함수
function showResult() {
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    saveStudyData(duration, currentIndex + 1);

    cardPage.style.display = 'none';
    resultPage.style.display = 'block';
    
    const summaryHTML = `
        <div class="result-summary">
            <h3>학습 결과</h3>
            <p>학습한 단어: ${currentIndex + 1}개</p>
            <p>학습 시간: ${minutes}분 ${seconds}초</p>
        </div>
    `;
    
    document.getElementById('summary').innerHTML = summaryHTML;
    displayStudyStats();
}

// 다시 시작 버튼 클릭 이벤트
restartBtn.addEventListener('click', () => {
    currentIndex = 0;
    resultPage.style.display = 'none';
    mainPage.style.display = 'block';
});

// 키보드 이벤트 처리
document.addEventListener('keydown', (event) => {
    if (cardPage.style.display === 'block') {
        if (event.code === 'Space' || event.code === 'ArrowRight') {
            event.preventDefault();
            nextBtn.click();
        }
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadWords();
    displayStudyStats();
});
