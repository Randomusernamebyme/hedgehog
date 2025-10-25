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
        
        // 顏色（暫時用矩形代替圖片）
        this.color = '#8B4513'; // 棕色
        this.eyeColor = '#000000';
        this.spikeColor = '#654321';
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

    // 繪製刺蝟（簡化版，像 Chrome 恐龍）
    draw(ctx) {
        ctx.save();
        
        // 簡潔的刺蝟身體
        ctx.fillStyle = '#535353';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 簡潔的刺
        ctx.fillStyle = '#535353';
        for (let i = 0; i < 5; i++) {
            const spikeX = this.x + (i * this.width / 4);
            const spikeY = this.y - 3;
            ctx.fillRect(spikeX, spikeY, 3, 6);
        }

        // 簡潔的眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + this.width * 0.3, this.y + this.height * 0.3, 2, 2);
        ctx.fillRect(this.x + this.width * 0.7, this.y + this.height * 0.3, 2, 2);

        ctx.restore();
    }
    
    // 繪製刺蝟的刺
    drawSpikes(ctx) {
        const spikeCount = 7;
        for (let i = 0; i < spikeCount; i++) {
            const spikeX = this.x + (i * this.width / (spikeCount - 1));
            const spikeY = this.y - 3;
            const spikeHeight = 8 + Math.sin(i * 0.5) * 2;
            
            // 刺的漸層
            const spikeGradient = ctx.createLinearGradient(spikeX, spikeY, spikeX, spikeY - spikeHeight);
            spikeGradient.addColorStop(0, '#654321');
            spikeGradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = spikeGradient;
            
            ctx.beginPath();
            ctx.moveTo(spikeX, spikeY);
            ctx.lineTo(spikeX + 2, spikeY - spikeHeight);
            ctx.lineTo(spikeX + 4, spikeY);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // 繪製臉部
    drawFace(ctx) {
        // 繪製眼睛
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.3, this.y + this.height * 0.3, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.3, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 眼睛高光
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.3 + 1, this.y + this.height * 0.3 - 1, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.7 + 1, this.y + this.height * 0.3 - 1, 1, 0, 2 * Math.PI);
        ctx.fill();

        // 繪製鼻子
        const noseGradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height * 0.6, 0,
            this.x + this.width/2, this.y + this.height * 0.6, 3
        );
        noseGradient.addColorStop(0, '#FF69B4');
        noseGradient.addColorStop(1, '#FF1493');
        ctx.fillStyle = noseGradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height * 0.6, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 繪製嘴巴
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height * 0.75, 5, 0, Math.PI);
        ctx.stroke();
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
