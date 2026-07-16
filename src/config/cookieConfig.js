export const COOKIE_CONFIG = {
    httpOnly: false,
    secure: false, // Set to true in production
    maxAge: 1000 * 20, // Adjust based on your needs
    sameSite: 'lax',
    path: '/'
};