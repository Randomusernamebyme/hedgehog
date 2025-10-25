// 蘑菇障礙物類別
class Mushroom {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        
        // 7種蘑菇類型（隨機選擇）
        const types = ['red', 'brown', 'purple', 'yellow', 'blue', 'green', 'orange'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // 動畫屬性
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        
        // 計分標記
        this.scored = false;
        
        // 圖片載入
        this.image = new Image();
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.warn(`蘑菇圖片載入失敗: ${this.type}`);
        };
        
        // 根據類型設定特殊屬性
        this.setTypeProperties();
        
        // 根據類型選擇圖片
        this.setMushroomImage();
    }
    
    // 設定不同類型的特殊屬性
    setTypeProperties() {
        switch(this.type) {
            case 'red':
                this.points = 1;
                this.dangerLevel = 'low';
                break;
            case 'brown':
                this.points = 2;
                this.dangerLevel = 'medium';
                break;
            case 'purple':
                this.points = 3;
                this.dangerLevel = 'high';
                break;
            case 'yellow':
                this.points = 5;
                this.dangerLevel = 'extreme';
                break;
            case 'blue':
                this.points = 2;
                this.dangerLevel = 'medium';
                break;
            case 'green':
                this.points = 3;
                this.dangerLevel = 'high';
                break;
            case 'orange':
                this.points = 4;
                this.dangerLevel = 'high';
                break;
        }
    }
    
    // 設定蘑菇圖片
    setMushroomImage() {
        switch(this.type) {
            case 'red':
                this.image.src = 'assets/images/mushroom1.png';
                break;
            case 'brown':
                this.image.src = 'assets/images/mushroom2.png';
                break;
            case 'purple':
                this.image.src = 'assets/images/mushroom3.png';
                break;
            case 'yellow':
                this.image.src = 'assets/images/mushroom4.png';
                break;
            case 'blue':
                this.image.src = 'assets/images/mushroom5.png';
                break;
            case 'green':
                this.image.src = 'assets/images/mushroom6.png';
                break;
            case 'orange':
                this.image.src = 'assets/images/mushroom1.png'; // 使用mushroom1作為橙色
                break;
        }
    }

    // 更新位置
    update(deltaTime) {
        // 確保 deltaTime 是有效的數值
        if (!deltaTime || deltaTime <= 0) {
            deltaTime = 16.67; // 預設 60fps
        }
        
        // 使用 deltaTime 確保移動速度一致
        this.x -= this.speed * (deltaTime / 16.67); // 16.67ms = 60fps
        
        // 更新動畫
        this.animationFrame += this.animationSpeed * (deltaTime / 16.67);
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }

    // 繪製蘑菇
    draw(ctx) {
        ctx.save();
        
        // 確保蘑菇在正確的位置
        if (this.x < -200 || this.x > 800) {
            console.warn(`蘑菇位置異常: X=${this.x}, Y=${this.y}, 速度=${this.speed}`);
            ctx.restore();
            return; // 不繪製異常位置的蘑菇
        }
        
        // 確保蘑菇在正確的圖層
        ctx.globalCompositeOperation = 'source-over';
        
        if (this.imageLoaded) {
            // 使用上傳的蘑菇圖片
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // 如果圖片未載入，顯示簡潔的矩形
            // 簡潔的蘑菇莖
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + this.width * 0.4, this.y + this.height * 0.6, 
                        this.width * 0.2, this.height * 0.4);

            // 簡潔的蘑菇帽
            let capColor;
            switch(this.type) {
                case 'red':
                    capColor = '#FF4444';
                    break;
                case 'brown':
                    capColor = '#8B4513';
                    break;
                case 'purple':
                    capColor = '#8A2BE2';
                    break;
                case 'yellow':
                    capColor = '#FFD700';
                    break;
            }
            
            ctx.fillStyle = capColor;
            ctx.fillRect(this.x, this.y, this.width, this.height * 0.6);
        }

        ctx.restore();
    }

    // 檢查是否離開螢幕
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    // 檢查是否通過刺蝟位置
    hasPassedHedgehog(hedgehogX) {
        return this.x + this.width < hedgehogX;
    }

    // 獲取碰撞邊界
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// 蘑菇管理器
class MushroomManager {
    constructor() {
        this.mushrooms = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1500; // 1.5秒生成一個
        this.minSpawnInterval = 800; // 最小間隔0.8秒
        this.baseSpeed = 3; // 基礎速度
        this.currentSpeed = 3; // 當前速度
        this.targetSpeed = 3; // 目標速度
        this.maxSpeed = 8;
        this.lastSpawnX = 600; // 記錄最後生成蘑菇的X位置
        this.speedTransitionRate = 0.01; // 速度過渡速率
    }

    // 更新所有蘑菇
    update(deltaTime) {
        // 平滑速度過渡
        if (Math.abs(this.currentSpeed - this.targetSpeed) > 0.01) {
            this.currentSpeed += (this.targetSpeed - this.currentSpeed) * this.speedTransitionRate;
        } else {
            this.currentSpeed = this.targetSpeed;
        }
        
        // 確保所有蘑菇速度同步
        for (let mushroom of this.mushrooms) {
            mushroom.speed = this.currentSpeed;
        }
        
        // 更新現有蘑菇
        for (let i = this.mushrooms.length - 1; i >= 0; i--) {
            this.mushrooms[i].update(deltaTime);
            
            // 移除離開螢幕的蘑菇
            if (this.mushrooms[i].isOffScreen()) {
                this.mushrooms.splice(i, 1);
            }
        }

        // 生成新蘑菇
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnMushroom();
            this.spawnTimer = 0;
            
            // 隨機生成第二個蘑菇（增加挑戰性）
            if (Math.random() < 0.3 && this.mushrooms.length < 3) {
                setTimeout(() => {
                    if (this.mushrooms.length < 3) {
                        this.spawnMushroom();
                    }
                }, 200 + Math.random() * 300);
            }
        }
    }

    // 生成新蘑菇
    spawnMushroom() {
        const canvasHeight = 150;
        const groundY = 120;
        
        // 隨機大小
        const size = Math.random() < 0.4 ? 'small' : Math.random() < 0.8 ? 'medium' : 'large';
        let width, height;
        
        switch (size) {
            case 'small':
                width = 25;
                height = 30;
                break;
            case 'medium':
                width = 35;
                height = 40;
                break;
            case 'large':
                width = 45;
                height = 50;
                break;
        }

        // 從螢幕右邊生成蘑菇，確保不會重疊
        const spawnX = Math.max(600, this.lastSpawnX + 100);
        const mushroom = new Mushroom(spawnX, groundY - height, width, height, this.currentSpeed);
        this.mushrooms.push(mushroom);
        this.lastSpawnX = spawnX;
        
        // 調試信息
        console.log(`生成蘑菇: X=${spawnX}, Y=${groundY - height}, 速度=${this.currentSpeed}`);
    }

    // 繪製所有蘑菇
    draw(ctx) {
        // 確保蘑菇在正確的圖層
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        this.mushrooms.forEach(mushroom => mushroom.draw(ctx));
        ctx.restore();
    }

    // 增加難度
    increaseDifficulty() {
        // 更平緩的速度增加，使用目標速度
        this.targetSpeed = Math.min(this.targetSpeed + 0.1, this.maxSpeed);
        this.spawnInterval = Math.max(this.spawnInterval * 0.95, this.minSpawnInterval);
    }
    
    // 增加遊戲速度
    increaseSpeed() {
        // 更平緩的速度增加，使用目標速度
        this.targetSpeed = Math.min(this.targetSpeed + 0.2, this.maxSpeed);
    }

    // 重置
    reset() {
        this.mushrooms = [];
        this.spawnTimer = 0;
        this.currentSpeed = 3;
        this.targetSpeed = 3;
        this.spawnInterval = 1500;
        this.lastSpawnX = 600;
    }

    // 獲取所有蘑菇
    getMushrooms() {
        return this.mushrooms;
    }
}
