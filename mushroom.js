// 蘑菇障礙物類別
class Mushroom {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        
        // 4種蘑菇類型（隨機選擇）
        const types = ['red', 'brown', 'purple', 'yellow'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // 動畫屬性
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        
        // 計分標記
        this.scored = false;
        
        // 圖片載入 - 根據類型選擇不同蘑菇圖片
        this.image = new Image();
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.warn(`蘑菇圖片載入失敗: ${this.type}`);
        };
        
        // 根據蘑菇類型選擇圖片
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
                this.image.src = 'assets/images/mushroom1.png'; // 使用mushroom1作為黃色
                break;
        }
        
        // 根據類型設定特殊屬性
        this.setTypeProperties();
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
        }
    }

    // 更新位置
    update() {
        this.x -= this.speed;
        
        // 更新動畫
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }

    // 繪製蘑菇
    draw(ctx) {
        ctx.save();
        
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
        this.spawnInterval = 2000; // 2秒生成一個
        this.minSpawnInterval = 1000; // 最小間隔1秒
        this.speed = 3;
        this.maxSpeed = 8;
        this.comboChance = 0.3; // 30% 機率生成組合蘑菇
    }

    // 更新所有蘑菇
    update(deltaTime) {
        // 更新現有蘑菇
        for (let i = this.mushrooms.length - 1; i >= 0; i--) {
            this.mushrooms[i].update();
            
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
        }
    }

    // 生成新蘑菇
    spawnMushroom() {
        const canvasHeight = window.innerHeight;
        const groundY = canvasHeight - 50;
        
        // 決定是否生成組合蘑菇
        if (Math.random() < this.comboChance) {
            this.spawnComboMushrooms(groundY);
        } else {
            this.spawnSingleMushroom(groundY);
        }
    }
    
    // 生成單個蘑菇
    spawnSingleMushroom(groundY) {
        // 隨機大小
        const size = Math.random() < 0.3 ? 'small' : Math.random() < 0.7 ? 'medium' : 'large';
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

        const mushroom = new Mushroom(window.innerWidth, groundY - height, width, height, this.speed);
        this.mushrooms.push(mushroom);
    }
    
    // 生成組合蘑菇
    spawnComboMushrooms(groundY) {
        const comboCount = Math.floor(Math.random() * 3) + 2; // 2-4個蘑菇
        const spacing = 60; // 蘑菇間距
        
        for (let i = 0; i < comboCount; i++) {
            const size = Math.random() < 0.5 ? 'small' : 'medium';
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
            }
            
            const x = window.innerWidth + (i * spacing);
            const mushroom = new Mushroom(x, groundY - height, width, height, this.speed);
            this.mushrooms.push(mushroom);
        }
    }

    // 繪製所有蘑菇
    draw(ctx) {
        this.mushrooms.forEach(mushroom => mushroom.draw(ctx));
    }

    // 增加難度
    increaseDifficulty() {
        this.speed = Math.min(this.speed + 0.5, this.maxSpeed);
        this.spawnInterval = Math.max(this.spawnInterval * 0.95, this.minSpawnInterval);
    }

    // 重置
    reset() {
        this.mushrooms = [];
        this.spawnTimer = 0;
        this.speed = 3;
        this.spawnInterval = 2000;
    }

    // 獲取所有蘑菇
    getMushrooms() {
        return this.mushrooms;
    }
}
