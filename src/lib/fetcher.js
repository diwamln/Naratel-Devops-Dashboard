// Universal fetcher function for SWR
export const fetcher = (url) => fetch(url).then(res => {
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.status = res.status;
        throw error;
    }
    return res.json();
});
