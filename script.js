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

// 학습 기록 로드
function loadStudyHistory() {
    const savedHistory = localStorage.getItem('studyHistory');
    if (savedHistory) {
        studyHistory = JSON.parse(savedHistory);
    }
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
    document.getElementById('currentWord').textContent = word.english;
    document.getElementById('pronunciation').textContent = word.pronunciation;
    document.getElementById('meaning').textContent = word.korean;
    document.getElementById('currentNumber').textContent = index + 1;
    
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
}

// 다시 시작 버튼 클릭 이벤트
restartBtn.addEventListener('click', () => {
    currentIndex = 0;
    resultPage.style.display = 'none';
    mainPage.style.display = 'block';
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadWords();
    loadStudyHistory();
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
