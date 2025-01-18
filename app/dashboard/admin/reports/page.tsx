async function fetchStatistics(procedureName: string, args: Record<string, any>) {
    const res = await fetch('/api/admin/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedureName, args }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
    }

    return res.json();
}

// Пример вызова:
fetchStatistics('get_requests_by_status', { start_date: '2025-01-01', end_date: '2025-01-31' })
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
