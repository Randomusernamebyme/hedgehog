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
        
        // 圖片載入
        this.image = new Image();
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.src = 'assets/images/mushroom1.png';
        
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
    
    // 繪製蘑菇帽
    drawMushroomCap(ctx) {
        const capGradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height * 0.4, 0,
            this.x + this.width/2, this.y + this.height * 0.4, this.width/2
        );
        
        let capColor, spotColor, spotCount;
        
        switch(this.type) {
            case 'red':
                capColor = '#FF4444';
                spotColor = '#FFFFFF';
                spotCount = 3;
                break;
            case 'brown':
                capColor = '#8B4513';
                spotColor = '#FFFFFF';
                spotCount = 2;
                break;
            case 'purple':
                capColor = '#8A2BE2';
                spotColor = '#FFD700';
                spotCount = 4;
                break;
            case 'yellow':
                capColor = '#FFD700';
                spotColor = '#FF4500';
                spotCount = 5;
                break;
        }
        
        capGradient.addColorStop(0, this.lightenColor(capColor, 0.3));
        capGradient.addColorStop(1, capColor);
        ctx.fillStyle = capGradient;
        
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height * 0.4, 
                   this.width/2, this.height * 0.3, 0, 0, 2 * Math.PI);
        ctx.fill();

        // 繪製蘑菇斑點
        ctx.fillStyle = spotColor;
        for (let i = 0; i < spotCount; i++) {
            const spotX = this.x + (i + 1) * this.width / (spotCount + 1);
            const spotY = this.y + this.height * 0.3;
            const spotSize = this.type === 'yellow' ? 4 : 3;
            ctx.beginPath();
            ctx.arc(spotX, spotY, spotSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    // 顏色變亮函數
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 * factor));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 * factor));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 * factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
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
        const canvasHeight = 400;
        const groundY = canvasHeight - 50;
        
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

        const mushroom = new Mushroom(800, groundY - height, width, height, this.speed);
        this.mushrooms.push(mushroom);
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
