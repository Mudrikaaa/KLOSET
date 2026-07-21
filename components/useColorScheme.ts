// why forced dark: the Crimson design is a dark-only system (crimson-to-onyx
// gradients, frosted glass). Following the OS light scheme produced mixed
// light-pink surfaces that clash with every other screen, so the app pins to
// the design's dark palette regardless of system setting.
export const useColorScheme = (): 'light' | 'dark' => 'dark';
