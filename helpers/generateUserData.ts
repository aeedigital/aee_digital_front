/**
 * Gera uma senha aleatória com 12 caracteres
 * Inclui maiúsculas, minúsculas, números e caracteres especiais
 */
export function generateRandomPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;

    let password = '';
    // Garante pelo menos um de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Preenche o resto aleatoriamente
    for (let i = password.length; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralha a senha
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

/**
 * Gera um username aleatório
 * Formato: user_<8 caracteres aleatórios>
 */
export function generateRandomUsername(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = 'user_';

    for (let i = 0; i < 8; i++) {
        username += chars[Math.floor(Math.random() * chars.length)];
    }

    return username;
}
