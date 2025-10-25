// 本地儲存系統
class GameStorage {
    constructor() {
        this.HIGH_SCORE_KEY = 'hedgehog_game_high_score';
        this.MUTE_STATE_KEY = 'hedgehog_game_mute_state';
    }

    // 儲存最高分
    saveHighScore(score) {
        try {
            localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
        } catch (error) {
            console.warn('無法儲存最高分:', error);
        }
    }

    // 讀取最高分
    getHighScore() {
        try {
            const score = localStorage.getItem(this.HIGH_SCORE_KEY);
            return score ? parseInt(score, 10) : 0;
        } catch (error) {
            console.warn('無法讀取最高分:', error);
            return 0;
        }
    }

    // 儲存靜音狀態
    saveMuteState(isMuted) {
        try {
            localStorage.setItem(this.MUTE_STATE_KEY, isMuted.toString());
        } catch (error) {
            console.warn('無法儲存靜音狀態:', error);
        }
    }

    // 讀取靜音狀態
    getMuteState() {
        try {
            const muteState = localStorage.getItem(this.MUTE_STATE_KEY);
            return muteState === 'true';
        } catch (error) {
            console.warn('無法讀取靜音狀態:', error);
            return false;
        }
    }

    // 清除所有儲存資料
    clearAll() {
        try {
            localStorage.removeItem(this.HIGH_SCORE_KEY);
            localStorage.removeItem(this.MUTE_STATE_KEY);
        } catch (error) {
            console.warn('無法清除儲存資料:', error);
        }
    }
}
