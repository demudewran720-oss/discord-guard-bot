const DEFAULT_PROFANITY_WORDS = [
    'amk',
    'aq',
    'amina',
    'anan',
    'anani',
    'sik',
    'siktir',
    'sikik',
    'orospu',
    'pic',
    'yarrak',
    'yarak',
    'serefsiz',
    'ibne',
    'got',
    'fuck',
    'shit',
    'bitch',
    'asshole',
    'dick',
    'cunt'
];

function normalize(value) {
    return String(value || '')
        .toLocaleLowerCase('tr-TR')
        .replace(/[ıİ]/g, 'i')
        .replace(/[şŞ]/g, 's')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[üÜ]/g, 'u')
        .replace(/[öÖ]/g, 'o')
        .replace(/[çÇ]/g, 'c');
}

function containsProfanity(content, configuredWords = []) {
    const words = configuredWords.length > 0
        ? configuredWords
        : DEFAULT_PROFANITY_WORDS;
    const normalizedContent = normalize(content);
    const tokens = new Set(normalizedContent.match(/[a-z0-9]+/g) || []);

    for (const configuredWord of words) {
        const word = normalize(configuredWord).replace(/[^a-z0-9]/g, '');
        if (!word) continue;

        if (tokens.has(word)) {
            return configuredWord;
        }

        // Also catch simple punctuation-separated forms such as "a.m.k".
        const compactContent = normalizedContent.replace(/[^a-z0-9]/g, '');
        if (compactContent.includes(word)) {
            return configuredWord;
        }
    }

    return null;
}

module.exports = {
    DEFAULT_PROFANITY_WORDS,
    containsProfanity
};