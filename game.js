// 主遊戲類別
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 設置全螢幕 Canvas
        this.setupFullscreenCanvas();
        
        // 遊戲狀態
        this.gameState = 'waiting'; // waiting, playing, gameOver
        this.score = 0;
        this.highScore = 0;
        this.gameStartTime = 0;
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
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverElement = document.getElementById('game-over');
        
        // 檢查必要的 UI 元素
        if (!this.scoreElement || !this.highScoreElement) {
            console.warn('某些 UI 元素未找到，但遊戲仍可運行');
        }
        
        this.init();
    }

    // 初始化遊戲
    init() {
        // 檢查 Canvas 元素是否存在
        if (!this.canvas) {
            throw new Error('找不到 Canvas 元素！');
        }
        
        // 檢查 Canvas 上下文
        if (!this.ctx) {
            throw new Error('無法取得 Canvas 2D 上下文！');
        }
        
        console.log('Canvas 尺寸:', this.canvas.width, 'x', this.canvas.height);
        
        // 預載入所有圖片
        this.preloadImages();
        
        // 初始化遊戲物件
        const groundY = 120; // 固定地面位置
        this.hedgehog = new Hedgehog(50, groundY - 30, 30, 30);
        this.mushroomManager = new MushroomManager();
        this.collisionDetector = new CollisionDetector();
        this.storage = new GameStorage();
        
        // 載入最高分
        this.highScore = this.storage.getHighScore();
        this.highScoreElement.textContent = `HI ${this.highScore.toString().padStart(5, '0')}`;
        
        // 載入靜音狀態
        this.isMuted = this.storage.getMuteState();
        this.updateMuteButton();
        
        // 初始化音效
        this.initAudio();
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 繪製初始畫面（Canvas 會在圖片載入完成後顯示）
        this.draw();
        
        console.log('遊戲初始化完成，等待圖片載入...');
    }
    
    // 設置 Canvas
    setupFullscreenCanvas() {
        // 設置固定尺寸，像 Chrome 恐龍
        this.canvas.width = 600;
        this.canvas.height = 150;
        this.canvas.style.width = '600px';
        this.canvas.style.height = '150px';
    }

    // 預載入所有圖片
    preloadImages() {
        const images = [
            'assets/images/character.png',
            'assets/images/mushroom1.png',
            'assets/images/mushroom2.png',
            'assets/images/mushroom3.png'
        ];
        
        let loadedCount = 0;
        const totalImages = images.length;
        const loadingProgress = document.getElementById('loading-progress');
        
        images.forEach((src, index) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                console.log(`圖片載入完成: ${src} (${loadedCount}/${totalImages})`);
                
                // 更新載入進度
                if (loadingProgress) {
                    loadingProgress.textContent = `載入圖片中... ${loadedCount}/${totalImages}`;
                }
                
                if (loadedCount === totalImages) {
                    console.log('所有圖片載入完成！');
                    // 隱藏載入指示器，顯示 Canvas
                    const loadingElement = document.getElementById('loading');
                    if (loadingElement) {
                        loadingElement.style.display = 'none';
                    }
                    this.canvas.style.display = 'block';
                    // 所有圖片載入完成後，重新繪製一次
                    this.draw();
                }
            };
            img.onerror = () => {
                console.warn(`圖片載入失敗: ${src}`);
                loadedCount++;
                if (loadingProgress) {
                    loadingProgress.textContent = `載入圖片中... ${loadedCount}/${totalImages}`;
                }
                if (loadedCount === totalImages) {
                    const loadingElement = document.getElementById('loading');
                    if (loadingElement) {
                        loadingElement.style.display = 'none';
                    }
                    this.canvas.style.display = 'block';
                    this.draw();
                }
            };
            img.src = src;
        });
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
        // 鍵盤事件 - 空格鍵開始/跳躍
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'waiting') {
                    this.start();
                } else if (this.gameState === 'playing') {
                    this.handleJumpStart();
                } else if (this.gameState === 'gameOver') {
                    this.start();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.handleJumpEnd();
            }
        });

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'waiting') {
                this.start();
            } else if (this.gameState === 'playing') {
                this.handleJumpStart();
            } else if (this.gameState === 'gameOver') {
                this.start();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.handleJumpEnd();
            }
        });

        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (this.gameState === 'waiting') {
                this.start();
            } else if (this.gameState === 'playing') {
                this.handleJumpStart();
            } else if (this.gameState === 'gameOver') {
                this.start();
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.handleJumpEnd();
            }
        });
        
        this.canvas.addEventListener('mouseleave', (e) => {
            if (this.gameState === 'playing') {
                this.handleJumpEnd();
            }
        });

        // 重新開始按鈕
        this.restartBtn.addEventListener('click', () => this.start());
    }

    // 處理跳躍開始
    handleJumpStart() {
        if (this.gameState === 'playing') {
            this.hedgehog.startJump();
        } else if (this.gameState === 'waiting') {
            this.start();
        }
    }
    
    // 處理跳躍結束
    handleJumpEnd() {
        if (this.gameState === 'playing') {
            this.hedgehog.endJump();
            this.playSound('jump');
        }
    }
    

    // 開始遊戲
    start() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameStartTime = Date.now();
        this.updateScore();
        
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
            this.highScoreElement.textContent = `HI ${this.highScore.toString().padStart(5, '0')}`;
        }
        
        // 顯示遊戲結束畫面
        this.gameOverElement.style.display = 'block';
        
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

    // 更新分數（基於存活時間）
    updateScore() {
        if (this.gameState === 'playing') {
            const currentTime = Date.now();
            this.score = Math.floor((currentTime - this.gameStartTime) / 100);
            this.scoreElement.textContent = this.score.toString().padStart(5, '0');
        }
    }

    // 增加分數（不再使用，改為時間計分）
    addScore(points = 1) {
        // 不再使用點數計分，改為時間計分
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
        // 更新分數（基於時間）
        this.updateScore();
        
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
        
        // 移除離開螢幕的蘑菇
        for (let i = mushrooms.length - 1; i >= 0; i--) {
            if (mushrooms[i].isOffScreen()) {
                mushrooms.splice(i, 1);
            }
        }
        
        // 根據時間增加難度
        if (this.score > 0 && this.score % 100 === 0) {
            this.mushroomManager.increaseDifficulty();
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
        // 簡潔的白色背景，像 Chrome 恐龍
        this.ctx.fillStyle = '#f7f7f7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 繪製地面
    drawGround() {
        const groundY = this.canvas.height - 50;
        
        // 簡潔的地面線條，像 Chrome 恐龍
        this.ctx.strokeStyle = '#535353';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.canvas.width, groundY);
        this.ctx.stroke();
    }

    // 繪製雲朵（簡化版）
    drawClouds() {
        // 移除雲朵，保持簡潔
    }
}

// 當頁面載入完成時啟動遊戲
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('正在初始化遊戲...');
        new Game();
        console.log('遊戲初始化完成！');
    } catch (error) {
        console.error('遊戲初始化失敗:', error);
        // 顯示錯誤訊息給用戶
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h2>遊戲載入失敗</h2>
                <p>請重新整理頁面或檢查瀏覽器控制台</p>
                <p>錯誤: ${error.message}</p>
            </div>
        `;
    }
});
