// 刺蝟角色類別
class Hedgehog {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // 物理屬性
        this.velocityY = 0;
        this.gravity = 0.6;
        this.jumpForce = -12;
        this.groundY = y;
        
        // 動畫屬性
        this.isJumping = false;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        
        // 簡化跳躍
        this.jumpForce = -12;
        
        // 行走動畫圖片載入
        this.walkImages = [];
        this.walkImagesLoaded = 0;
        this.currentWalkFrame = 0;
        
        // 載入3張行走動畫圖片
        for (let i = 0; i < 3; i++) {
            const img = new Image();
            img.onload = () => {
                this.walkImagesLoaded++;
                console.log(`刺蝟行走圖片 ${i + 1} 載入完成`);
            };
            img.onerror = () => {
                console.warn(`刺蝟行走圖片 ${i + 1} 載入失敗`);
            };
            img.src = `assets/images/hedgehog_walk_${i + 1}.png`;
            this.walkImages.push(img);
        }
        
        // 跳躍時使用的圖片（第一張）
        this.jumpImage = new Image();
        this.jumpImageLoaded = false;
        this.jumpImage.onload = () => {
            this.jumpImageLoaded = true;
            console.log('刺蝟跳躍圖片載入完成');
        };
        this.jumpImage.onerror = () => {
            console.warn('刺蝟跳躍圖片載入失敗');
        };
        this.jumpImage.src = 'assets/images/hedgehog_walk_1.png';
    }

    // 跳躍
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }
    

    // 更新位置和物理
    update(deltaTime) {
        // 應用重力
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // 地面碰撞檢測
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // 更新行走動畫（只有在地面時才播放）
        if (!this.isJumping) {
            this.animationFrame += this.animationSpeed * (deltaTime / 16.67);
            if (this.animationFrame >= 3) {
                this.animationFrame = 0;
            }
            this.currentWalkFrame = Math.floor(this.animationFrame);
        }
    }

    // 繪製刺蝟
    draw(ctx) {
        ctx.save();
        
        if (this.isJumping) {
            // 跳躍時使用第一張圖片
            if (this.jumpImageLoaded) {
                ctx.drawImage(this.jumpImage, this.x, this.y, this.width, this.height);
            } else {
                this.drawFallback(ctx);
            }
        } else {
            // 行走時使用動畫
            if (this.walkImagesLoaded === 3 && this.walkImages[this.currentWalkFrame]) {
                ctx.drawImage(this.walkImages[this.currentWalkFrame], this.x, this.y, this.width, this.height);
            } else {
                this.drawFallback(ctx);
            }
        }

        ctx.restore();
    }
    
    // 備用繪製方法
    drawFallback(ctx) {
        // 如果圖片未載入，顯示簡潔的矩形
        ctx.fillStyle = '#535353';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 簡潔的眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + this.width * 0.3, this.y + this.height * 0.3, 2, 2);
        ctx.fillRect(this.x + this.width * 0.7, this.y + this.height * 0.3, 2, 2);
    }

    // 重置位置
    reset() {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isJumping = false;
        this.animationFrame = 0;
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
