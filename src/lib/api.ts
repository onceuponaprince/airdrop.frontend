const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API Error ${status}`)
    this.name = "ApiError"
  }
}

class ApiClient {
  private accessToken: string | null = null

  setToken(token: string | null) {
    this.accessToken = token
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    if (typeof window !== "undefined") {
      const activeTenant = window.localStorage.getItem("spore_active_tenant")
      if (activeTenant && !headers["X-SPORE-TENANT"]) {
        headers["X-SPORE-TENANT"] = activeTenant
      }
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      let errorData: unknown
      try {
        errorData = await res.json()
      } catch {
        errorData = { detail: res.statusText }
      }
      throw new ApiError(res.status, errorData)
    }

    // Handle empty responses (204 No Content)
    if (res.status === 204) return null as T

    return res.json() as T
  }

  get<T>(path: string) {
    return this.request<T>(path)
  }

  post<T>(path: string, data?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  patch<T>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" })
  }
}

export const api = new ApiClient()
export { ApiError }
