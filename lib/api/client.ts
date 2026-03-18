const API_BASE_URL = "http://13.127.115.121:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
    requireAuth?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = "GET", headers = {}, body, requireAuth = true } = options;

    const performRequest = async (tokenOverride?: string) => {
        const requestHeaders: Record<string, string> = {
            ...headers,
        };

        if (!(typeof FormData !== "undefined" && body instanceof FormData)) {
            if (!requestHeaders["Content-Type"]) {
                requestHeaders["Content-Type"] = "application/json";
            }
        }
        console.log("requestHeaders", requestHeaders);
        if (requireAuth) {
            if (typeof window !== "undefined") {
                const token = tokenOverride || localStorage.getItem("accessToken");
                if (token) {
                    requestHeaders["Authorization"] = `Bearer ${token}`;
                }
            }
        }

        const config: RequestInit = {
            method,
            headers: requestHeaders,
        };
        console.log("bodyb ", body);
        if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
            if (typeof FormData !== "undefined" && body instanceof FormData) {
                config.body = body;
            } else {
                config.body = JSON.stringify(body);
            }
        }
        console.log("config", config);
        return fetch(`${API_BASE_URL}${endpoint}`, config);
    };

    try {
        let response = await performRequest();

        // Handle Token Expiration (401)
        if (response.status === 401 && requireAuth && typeof window !== "undefined") {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    // Attempt to refresh
                    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${refreshToken}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        const newAccessToken = refreshData.data.access_token;

                        localStorage.setItem("accessToken", newAccessToken);

                        // Retry the original request
                        response = await performRequest(newAccessToken);
                    } else {
                        // Refresh failed (e.g. refresh token also expired)
                        handleLogout();
                    }
                } catch (refreshErr) {
                    handleLogout();
                }
            } else {
                // No refresh token found
                handleLogout();
            }
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "An error occurred");
        }

        return data as T;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

function handleLogout() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("pos-cart");
        window.location.href = "/login";
    }
}
