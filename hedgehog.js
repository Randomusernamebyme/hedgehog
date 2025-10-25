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
        
        // 圖片載入
        this.image = new Image();
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.src = 'assets/images/character.png';
    }

    // 跳躍
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }

    // 更新位置和物理
    update() {
        // 應用重力
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // 地面碰撞檢測
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // 更新動畫
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }

    // 繪製刺蝟
    draw(ctx) {
        ctx.save();
        
        if (this.imageLoaded) {
            // 使用上傳的刺蝟圖片
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // 如果圖片未載入，顯示簡潔的矩形
            ctx.fillStyle = '#535353';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 簡潔的眼睛
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + this.width * 0.3, this.y + this.height * 0.3, 2, 2);
            ctx.fillRect(this.x + this.width * 0.7, this.y + this.height * 0.3, 2, 2);
        }

        ctx.restore();
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
