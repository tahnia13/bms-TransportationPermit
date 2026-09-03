const API_URL = "http://127.0.0.1:8000/api";

async function handleResponse(response) {
    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {
        const error = new Error(
            result.message ||
                "Terjadi kesalahan pada server."
        );

        error.status = response.status;
        error.errors = result.errors || {};

        throw error;
    }

    return result;
}

export const api = {
    // =====================================================
    // PERMIT
    // =====================================================

    async getPermits() {
        const response = await fetch(
            `${API_URL}/permits`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async getPermit(id) {
        const response = await fetch(
            `${API_URL}/permits/${id}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async createPermit(data) {
        const response = await fetch(
            `${API_URL}/permits`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async updatePermit(id, data) {
        const response = await fetch(
            `${API_URL}/permits/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async deletePermit(id) {
        const response = await fetch(
            `${API_URL}/permits/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    // =====================================================
    // VEHICLE
    // =====================================================

    async getVehicles() {
        const response = await fetch(
            `${API_URL}/vehicles`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async getVehicle(id) {
        const response = await fetch(
            `${API_URL}/vehicles/${id}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async createVehicle(data) {
        const response = await fetch(
            `${API_URL}/vehicles`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async updateVehicle(id, data) {
        const response = await fetch(
            `${API_URL}/vehicles/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async deleteVehicle(id) {
        const response = await fetch(
            `${API_URL}/vehicles/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    // =====================================================
    // DRIVER
    // =====================================================

    async getDrivers() {
        const response = await fetch(
            `${API_URL}/drivers`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async getDriver(id) {
        const response = await fetch(
            `${API_URL}/drivers/${id}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async createDriver(data) {
        const response = await fetch(
            `${API_URL}/drivers`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async updateDriver(id, data) {
        const response = await fetch(
            `${API_URL}/drivers/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async deleteDriver(id) {
        const response = await fetch(
            `${API_URL}/drivers/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    // =====================================================
    // TRIP
    // =====================================================

    async getTrips() {
        const response = await fetch(
            `${API_URL}/trips`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async getTrip(id) {
        const response = await fetch(
            `${API_URL}/trips/${id}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async createTrip(data) {
        const response = await fetch(
            `${API_URL}/trips`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async updateTrip(id, data) {
        const response = await fetch(
            `${API_URL}/trips/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async deleteTrip(id) {
        const response = await fetch(
            `${API_URL}/trips/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    // =====================================================
    // ARCHIVE
    // =====================================================

    async getArchives(params = {}) {
        const query = new URLSearchParams();

        if (params.search) {
            query.append(
                "search",
                params.search
            );
        }

        if (params.year) {
            query.append(
                "year",
                params.year
            );
        }

        if (params.month) {
            query.append(
                "month",
                params.month
            );
        }

        if (params.status) {
            query.append(
                "status",
                params.status
            );
        }

        const queryString =
            query.toString();

        const response = await fetch(
            `${API_URL}/archive${
                queryString
                    ? `?${queryString}`
                    : ""
            }`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

        // =====================================================
    // ARCHIVE
    // =====================================================

    async getArchives() {
        const response = await fetch(
            `${API_URL}/archives`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async getArchive(id) {
        const response = await fetch(
            `${API_URL}/archives/${id}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async createArchive(data) {
        const response = await fetch(
            `${API_URL}/archives`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async updateArchive(id, data) {
        const response = await fetch(
            `${API_URL}/archives/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async deleteArchive(id) {
        const response = await fetch(
            `${API_URL}/archives/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async uploadArchive(formData) {
        const response = await fetch(
            `${API_URL}/archives`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: formData,
            }
        );

        return handleResponse(response);
    },

    async updateArchiveWithFile(id, formData) {
        // Laravel handles multipart PUT via POST + _method=PUT
        formData.append('_method', 'PUT');
        const response = await fetch(
            `${API_URL}/archives/${id}`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: formData,
            }
        );

        return handleResponse(response);
    },

    async downloadArchive(id, defaultFileName = "document.pdf") {
        const response = await fetch(`${API_URL}/archives/${id}/download`);
        if (!response.ok) {
            throw new Error("Gagal mengunduh berkas fisik.");
        }

        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition');
        let filename = defaultFileName;
        if (disposition && disposition.includes('filename=')) {
            const matches = disposition.match(/filename="?([^"]+)"?/);
            if (matches && matches[1]) {
                filename = matches[1];
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        return true;
    },

    // =====================================================
    // APPROVAL WORKFLOW
    // =====================================================

    async approvePermit(id, data = {}) {
        const response = await fetch(
            `${API_URL}/permits/${id}/approve`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    async rejectPermit(id, data = {}) {
        const response = await fetch(
            `${API_URL}/permits/${id}/reject`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    // =====================================================
    // AUDIT LOGS
    // =====================================================

    async getAuditLogs(params = {}) {
        const query = new URLSearchParams();
        if (params.search) query.append("search", params.search);
        if (params.module) query.append("module", params.module);
        if (params.action) query.append("action", params.action);
        if (params.date) query.append("date", params.date);

        const qs = query.toString();
        const response = await fetch(
            `${API_URL}/audit-logs${qs ? `?${qs}` : ""}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async createAuditLog(data) {
        const response = await fetch(
            `${API_URL}/audit-logs`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },

    // =====================================================
    // NOTIFICATIONS & EMAIL
    // =====================================================

    async getAlertNotifications() {
        const response = await fetch(
            `${API_URL}/notifications/alerts`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        return handleResponse(response);
    },

    async sendEmailNotification(data) {
        const response = await fetch(
            `${API_URL}/notifications/email`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse(response);
    },
};