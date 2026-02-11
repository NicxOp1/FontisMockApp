const recentCalls = new Map();

export function isDuplicate(customerId, type) {
    const key = `${customerId}-${type}`;
    const last = recentCalls.get(key);
    const now = Date.now();

    if (last && now - last < 86400000) return true;

    recentCalls.set(key, now);
    return false;
}

export function clearDuplicates() {
    recentCalls.clear();
}
