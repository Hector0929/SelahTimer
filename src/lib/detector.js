/**
 * 偵測是否在內建瀏覽器（In-App Browser）中
 * 
 * 主要針對 LINE, Facebook, Instagram 等會封鎖 Google OAuth 的環境
 */
export function isInAppBrowser() {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent || navigator.vendor || window.opera;

    // 檢查常見的內建瀏覽器特徵
    const isLine = /Line/i.test(ua);
    const isFacebook = /FBAV|FBAN/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);

    // 如果需要更廣泛的偵測，可以考慮加入這類判斷：
    // const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

    return isLine || isFacebook || isInstagram;
}

/**
 * 取得當前完整網址（用於複製）
 */
export function getCurrentUrl() {
    if (typeof window === 'undefined') return '';
    return window.location.href;
}
