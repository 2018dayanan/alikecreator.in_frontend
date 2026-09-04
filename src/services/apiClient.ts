// src/services/apiClient.ts

export const handleAuthResponse = async (response: Response) => {
    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Import toast dynamically if available
            try {
                const { default: toast } = await import('react-hot-toast');
                toast.error('Session expired. Please log in again.');
            } catch (e) {
                console.warn('Toast not available', e);
            }

            const currentPath = window.location.pathname + window.location.search;
            const redirectParam = currentPath && !currentPath.includes('/login') 
                ? `&redirect=${encodeURIComponent(currentPath)}` 
                : '';

            // Immediately redirect to login
            setTimeout(() => {
                window.location.href = `/login?expired=true${redirectParam}`;
            }, 600);
        }
        throw new Error('Unauthorized: Session expired. Please log in again.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok || data.status === false) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        return data;
    } else {
        const text = await response.text();
        if (!response.ok) {
            throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
        }
        return { status: true, raw: text };
    }
};
