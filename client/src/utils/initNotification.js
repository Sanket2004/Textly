// in your zustand store or a separate util
let notificationAudio;

export const initNotificationSound = () => {
    if (!notificationAudio) {
        notificationAudio = new Audio("/sounds/notification.mp3");
    }

    // Try to unlock audio on first click
    document.addEventListener("click", () => {
        notificationAudio.play().then(() => {
            notificationAudio.pause();
            notificationAudio.currentTime = 0;
        }).catch(() => { });
    }, { once: true });
};

export const playNotificationSound = () => {
    if (notificationAudio) {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch((err) => {
            console.warn("Failed to play notification sound:", err);
        });
    }
};
