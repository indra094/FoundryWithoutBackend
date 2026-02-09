export const getOnboardingProgress = (step?: number): number => {
    const progressMap = [0, 20, 40, 60, 80, 100];
    return progressMap[Math.min(step ?? 0, 5)];
};