// 主遊戲類別
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲狀態
        this.gameState = 'waiting'; // waiting, playing, gameOver
        this.score = 0;
        this.highScore = 0;
        this.isMuted = false;
        
        // 遊戲物件
        this.hedgehog = null;
        this.mushroomManager = null;
        this.collisionDetector = null;
        this.storage = null;
        
        // 音效
        this.audioContext = null;
        this.sounds = {};
        
        // 動畫
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        // UI 元素
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalHighScoreElement = document.getElementById('final-high-score');
        
        this.init();
    }

    // 初始化遊戲
    init() {
        // 初始化遊戲物件
        this.hedgehog = new Hedgehog(100, 300, 40, 40);
        this.mushroomManager = new MushroomManager();
        this.collisionDetector = new CollisionDetector();
        this.storage = new GameStorage();
        
        // 載入最高分
        this.highScore = this.storage.getHighScore();
        this.highScoreElement.textContent = this.highScore;
        
        // 載入靜音狀態
        this.isMuted = this.storage.getMuteState();
        this.updateMuteButton();
        
        // 初始化音效
        this.initAudio();
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 繪製初始畫面
        this.draw();
    }

    // 初始化音效
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.warn('音效初始化失敗:', error);
        }
    }

    // 創建音效
    createSounds() {
        // 跳躍音效
        this.sounds.jump = this.createTone(400, 0.1, 'sine');
        
        // 碰撞音效
        this.sounds.collision = this.createTone(200, 0.3, 'sawtooth');
        
        // 得分音效
        this.sounds.score = this.createTone(600, 0.2, 'square');
    }

    // 創建音調
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (this.isMuted || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // 播放音效
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleJump();
            }
        });

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });

        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleJump();
        });

        // 按鈕事件
        this.startBtn.addEventListener('click', () => this.start());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // 處理跳躍
    handleJump() {
        if (this.gameState === 'playing') {
            this.hedgehog.jump();
            this.playSound('jump');
        } else if (this.gameState === 'waiting') {
            this.start();
        }
    }

    // 開始遊戲
    start() {
        this.gameState = 'playing';
        this.score = 0;
        this.updateScore();
        
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'none';
        this.gameOverElement.style.display = 'none';
        
        this.hedgehog.reset();
        this.mushroomManager.reset();
        
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    // 重新開始遊戲
    restart() {
        this.start();
    }

    // 遊戲結束
    gameOver() {
        this.gameState = 'gameOver';
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.storage.saveHighScore(this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
        
        // 顯示遊戲結束畫面
        this.finalScoreElement.textContent = this.score;
        this.finalHighScoreElement.textContent = this.highScore;
        this.gameOverElement.style.display = 'block';
        this.restartBtn.style.display = 'inline-block';
        
        this.playSound('collision');
    }

    // 切換靜音
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.storage.saveMuteState(this.isMuted);
        this.updateMuteButton();
    }

    // 更新靜音按鈕
    updateMuteButton() {
        this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
    }

    // 更新分數
    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    // 增加分數
    addScore(points = 1) {
        this.score += points;
        this.updateScore();
        this.playSound('score');
        
        // 每15分增加難度（因為現在分數增加更快）
        if (this.score % 15 === 0 && this.score > 0) {
            this.mushroomManager.increaseDifficulty();
        }
    }

    // 遊戲主循環
    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop);
    }

    // 更新遊戲狀態
    update(deltaTime) {
        // 更新刺蝟
        this.hedgehog.update();
        
        // 更新蘑菇
        this.mushroomManager.update(deltaTime);
        
        // 檢查碰撞
        const mushrooms = this.mushroomManager.getMushrooms();
        for (let mushroom of mushrooms) {
            if (this.collisionDetector.checkHedgehogMushroomCollision(
                this.hedgehog.getBounds(), 
                mushroom.getBounds()
            )) {
                this.gameOver();
                return;
            }
        }
        
        // 檢查得分（蘑菇離開螢幕）
        for (let i = mushrooms.length - 1; i >= 0; i--) {
            if (mushrooms[i].isOffScreen()) {
                this.addScore(mushrooms[i].points);
            }
        }
    }

    // 繪製遊戲畫面
    draw() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製背景
        this.drawBackground();
        
        // 繪製地面
        this.drawGround();
        
        // 繪製遊戲物件
        this.hedgehog.draw(this.ctx);
        this.mushroomManager.draw(this.ctx);
        
        // 繪製雲朵
        this.drawClouds();
    }

    // 繪製背景
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#8FBC8F');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 繪製地面
    drawGround() {
        const groundY = this.canvas.height - 50;
        
        // 地面
        this.ctx.fillStyle = '#8FBC8F';
        this.ctx.fillRect(0, groundY, this.canvas.width, 50);
        
        // 地面線條
        this.ctx.strokeStyle = '#7BA05B';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.canvas.width, groundY);
        this.ctx.stroke();
    }

    // 繪製雲朵
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // 簡單的雲朵
        for (let i = 0; i < 3; i++) {
            const x = 150 + i * 250;
            const y = 50 + i * 20;
            this.drawCloud(x, y);
        }
    }

    // 繪製單個雲朵
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, 2 * Math.PI);
        this.ctx.arc(x + 25, y, 25, 0, 2 * Math.PI);
        this.ctx.arc(x + 50, y, 20, 0, 2 * Math.PI);
        this.ctx.arc(x + 25, y - 15, 20, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}

// 當頁面載入完成時啟動遊戲
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
