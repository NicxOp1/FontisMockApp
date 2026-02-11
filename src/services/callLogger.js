const callLogs = [];

export function logCall(entry) {
    callLogs.push({
        id: Date.now(),
        ...entry,
        timestamp: new Date()
    });
}

export function getLogs() {
    return callLogs;
}

export function clearLogs() {
    callLogs.length = 0;
}
