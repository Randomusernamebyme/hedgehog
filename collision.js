// 碰撞檢測系統
class CollisionDetector {
    constructor() {
        // 碰撞檢測的容錯範圍（像素）
        this.tolerance = 5;
    }

    // 矩形碰撞檢測
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width - this.tolerance &&
               rect1.x + rect1.width - this.tolerance > rect2.x &&
               rect1.y < rect2.y + rect2.height - this.tolerance &&
               rect1.y + rect1.height - this.tolerance > rect2.y;
    }

    // 刺蝟與蘑菇碰撞檢測
    checkHedgehogMushroomCollision(hedgehog, mushroom) {
        // 使用矩形碰撞檢測
        return this.checkRectCollision(hedgehog, mushroom);
    }

    // 檢查是否在地面上
    isOnGround(object, groundY) {
        return object.y + object.height >= groundY;
    }

    // 檢查是否超出螢幕左側
    isOffScreenLeft(object) {
        return object.x + object.width < 0;
    }

    // 檢查是否超出螢幕右側
    isOffScreenRight(object) {
        return object.x > 800; // Canvas 寬度
    }

    // 檢查是否超出螢幕上方
    isOffScreenTop(object) {
        return object.y + object.height < 0;
    }

    // 檢查是否超出螢幕下方
    isOffScreenBottom(object) {
        return object.y > 400; // Canvas 高度
    }
}
