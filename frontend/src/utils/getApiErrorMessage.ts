type ErrorLike = {
    message?: string;
    response?: {
        status?: number;
        data?: {
            message?: string;
        } | string;
    };
};

const AI_BUSY_MESSAGE = 'AI service is currently busy. Please try again in a minute.';

const normalizeMessage = (value: unknown): string => {
    if (typeof value !== 'string') return '';

    const raw = value.trim();
    if (!raw) return '';

    const normalized = raw.replace(/<EOL>/g, ' ').replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();

    if (
        lower.includes('this model is currently experiencing high demand') ||
        lower.includes('"status":"unavailable"') ||
        lower.includes('503 service unavailable') ||
        lower.includes('status 503')
    ) {
        return AI_BUSY_MESSAGE;
    }

    const jsonMessageMatch = normalized.match(/"message"\s*:\s*"([^"]+)"/i);
    if (jsonMessageMatch?.[1]) {
        const extracted = jsonMessageMatch[1].trim();
        if (extracted) return extracted;
    }

    const statusPrefixMatch = normalized.match(/^\d{3}\s+[A-Za-z ]+:\s*(.+)$/);
    if (statusPrefixMatch?.[1]) {
        const extracted = statusPrefixMatch[1].trim();
        if (extracted) return extracted;
    }

    return normalized;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
    const typedError = (typeof error === 'object' && error !== null ? error : {}) as ErrorLike;
    const responseData = typedError.response?.data;

    const responseMessage = typeof responseData === 'string'
        ? normalizeMessage(responseData)
        : normalizeMessage(responseData?.message);
    if (responseMessage) return responseMessage;

    const errorMessage = normalizeMessage(typedError.message);
    if (errorMessage) return errorMessage;

    return fallback;
};
