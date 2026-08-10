
export const formatErrorMessage = (err: any): string => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror')) {
        return '서버와의 네트워크 통신에 실패했습니다. 연결 상태를 확인 후 다시 시도해 주세요.';
    }
    if (message.includes('429') || message.toLowerCase().includes('resource_exhausted') || message.toLowerCase().includes('quota')) {
        return '현재 AI 서비스 이용량이 많아 할당량이 일시적으로 소진되었습니다. 약 1분 후 다시 시도해 주세요.';
    }
    try {
        const parsed = JSON.parse(message);
        if (parsed.error?.code === 429 || parsed.status === 'RESOURCE_EXHAUSTED') {
            return '현재 AI 서비스 이용량이 많아 할당량이 일시적으로 소진되었습니다. 약 1분 후 다시 시도해 주세요.';
        }
    } catch {
        // Not JSON
    }
    return message;
};
