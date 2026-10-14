```javascript
// CloudShare Pro - File Management

const CloudFiles = (() => {
    let files = [];
    let activities = [];

    const sampleFiles = [
        {
            id: "sample-1",
            name: "Project_Report.pdf",
            size: 245760,
            type: "application/pdf",
            sample: true,
            favorite: false,
            date: Date.now() - 3600000
        },
        {
            id: "sample-2",
            name: "Presentation.pptx",
            size: 1843200,
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            sample: true,
            favorite: false,
            date: Date.now() - 7200000
        },
        {
            id: "sample-3",
            name: "Workspace_Image.png",
            size: 524288,
            type: "image/png",
            sample: true,
            favorite: false,
            date: Date.now() - 86400000
        }
    ];

    function formatSize(bytes) {
        if (!bytes) return "0 KB";

        const units = ["B", "KB", "MB", "GB"];
        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        const value = bytes / Math.pow(1024, index);

        return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
    }

    function getCategory(file) {
        const name = file.name.toLowerCase();
        const type = (file.type || "").toLowerCase();

        if (type.startsWith("image/") ||
            /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(name)) {
            return "image";
        }

        if (type === "application/pdf" || name.endsWith(".pdf")) {
            return "pdf";
        }

        if (
            type.includes("document") ||
            type.includes("word") ||
            type.includes("text") ||
            /\.(docx?|txt|rtf|odt)$/.test(name)
        ) {
            return "document";
        }

        return "other";
    }

    function getFileIcon(file) {
        const category = getCategory(file);

        if (category === "pdf") return "PDF";
        if (category === "image") return "IMG";
        if (category === "document") return "DOC";

        const extension = file.name.split(".").pop();
        return extension && extension !== file.name
            ? extension.slice(0, 4).toUpperCase()
            : "FILE";
    }

    function addActivity(message, icon = "✓") {
        activities.unshift({
            message,
            icon,
            time: new Date()
        });

        activities = activities.slice(0, 6);

        renderActivity();
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    }

    function getFilteredFiles() {
        const search = (
            document.getElementById("searchInput")?.value || ""
        ).trim().toLowerCase();

        const filter =
            document.getElementById("typeFilter")?.value || "all";

        const sort =
            document.getElementById("sortSelect")?.value || "name";

        let result = files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(search);

            const matchesType =
                filter === "all" || getCategory(file) === filter;

            return matchesSearch && matchesType;
        });

        if (sort === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === "size") {
            result.sort((a, b) => b.size - a.size);
        } else if (sort === "newest") {
            result.sort((a, b) => b.date - a.date);
        }

        return result;
    }

    function renderFiles() {
        const body = document.getElementById("fileTableBody");
        const emptyState = document.getElementById("emptyState");
        const summary = document.getElementById("tableSummary");

        if (!body) return;

        const visibleFiles = getFilteredFiles();

        body.innerHTML = "";

        visibleFiles.forEach(file => {
            const row = document.createElement("tr");
            const category = getCategory(file);

            const fileCell = document.createElement("td");
            const fileInfo = document.createElement("div");
            fileInfo.className = "file-cell";

            const icon = document.createElement("div");
            icon.className = `file-icon ${category}`;
            icon.textContent = getFileIcon(file);

            const details = document.createElement("div");

            const name = document.createElement("div");
            name.className = "file-name";
            name.textContent = file.name;
            name.title = file.name;

            const subtitle = document.createElement("div");
            subtitle.className = "file-subtitle";
            subtitle.textContent = file.sample
                ? "Example file"
                : "Added in this session";

            details.append(name, subtitle);
            fileInfo.append(icon, details);
            fileCell.append(fileInfo);

            const sizeCell = document.createElement("td");
            sizeCell.textContent = file.sample
                ? formatSize(file.size)
                : formatSize(file.size);

            const typeCell = document.createElement("td");
            typeCell.textContent = category.toUpperCase();

            const statusCell = document.createElement("td");
            const status = document.createElement("span");
            status.className = file.sample
                ? "file-status sample"
                : "file-status";
            status.textContent = file.sample ? "Sample" : "Selected";
            statusCell.append(status);

            const actionsCell = document.createElement("td");
            const actions = document.createElement("div");
            actions.className = "row-actions";

            const favoriteButton = document.createElement("button");
            favoriteButton.className = "icon-button" +
                (file.favorite ? " favorite" : "");
            favoriteButton.textContent = file.favorite ? "★" : "☆";
            favoriteButton.title = file.favorite
                ? "Remove from favorites"
                : "Add to favorites";
            favoriteButton.setAttribute("aria-label", favoriteButton.title);

            favoriteButton.addEventListener("click", () => {
                file.favorite = !file.favorite;
                addActivity(
                    `${file.favorite ? "Favorited" : "Unfavorited"} ${file.name}`,
                    "☆"
                );
                render();
            });

            const downloadButton = document.createElement("button");
            downloadButton.className = "icon-button";
            downloadButton.textContent = "↓";
            downloadButton.title = "Download file";
            downloadButton.setAttribute("aria-label", "Download file");

            downloadButton.addEventListener("click", () => {
                if (file.sample || !file.blob) {
                    showToast("Select a real file to download.");
                    return;
                }

                const url = URL.createObjectURL(file.blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                link.remove();

                setTimeout(() => URL.revokeObjectURL(url), 1000);

                addActivity(`Downloaded ${file.name}`, "↓");
                showToast("Download started.");
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "icon-button danger";
            deleteButton.textContent = "×";
            deleteButton.title = "Remove file";
            deleteButton.setAttribute("aria-label", "Remove file");

            deleteButton.addEventListener("click", () => {
                if (file.sample || !file.blob) {
                    showToast("Example files cannot be removed.");
                    return;
                }

                files = files.filter(item => item.id !== file.id);
                addActivity(`Removed ${file.name}`, "×");
                showToast("File removed from this session.");
                render();
            });

            actions.append(favoriteButton, downloadButton, deleteButton);
            actionsCell.append(actions);

            row.append(
                fileCell,
                sizeCell,
                typeCell,
                statusCell,
                actionsCell
            );

            body.append(row);
        });

        if (emptyState) {
            emptyState.hidden = visibleFiles.length > 0;
        }

        if (summary) {
            summary.textContent =
                `Showing ${visibleFiles.length} of ${files.length} files`;
        }

        updateStats();
    }

    function updateStats() {
        const totalFiles = document.getElementById("totalFiles");
        const totalSize = document.getElementById("totalSize");
        const categoryCount = document.getElementById("categoryCount");
        const favoriteCount = document.getElementById("favoriteCount");

        // Sample files illustrate the dashboard but do not count as uploaded data.
        const realFiles = files.filter(file => !file.sample);
        const bytes = realFiles.reduce((sum, file) => sum + file.size, 0);
        const categories = new Set(realFiles.map(getCategory));
        const favorites = files.filter(file => file.favorite).length;

        if (totalFiles) totalFiles.textContent = files.length;
        if (totalSize) totalSize.textContent = formatSize(bytes);
        if (categoryCount) categoryCount.textContent = categories.size;
        if (favoriteCount) favoriteCount.textContent = favorites;

        const percentage = Math.min((bytes / (100 * 1024 * 1024)) * 100, 100);
        const progress = document.getElementById("storageProgress");
        const percentLabel = document.getElementById("storagePercent");
        const caption = document.getElementById("storageCaption");

        if (progress) progress.style.width = `${percentage}%`;
        if (percentLabel) percentLabel.textContent =
            `${percentage.toFixed(1)}% used`;

        if (caption) {
            caption.textContent =
                `${formatSize(bytes)} selected · Illustrative 100 MB display limit`;
        }
    }

    function renderActivity() {
        const container = document.getElementById("activityList");
        if (!container) return;

        container.innerHTML = "";

        if (activities.length === 0) {
            const empty = document.createElement("p");
            empty.className = "activity-empty";
            empty.textContent = "Your recent actions will appear here.";
            container.append(empty);
            return;
        }

        activities.forEach(activity => {
            const item = document.createElement("div");
            item.className = "activity-item";

            const icon = document.createElement("div");
            icon.className = "activity-icon";
            icon.textContent = activity.icon;

            const details = document.createElement("div");
            details.className = "activity-details";

            const message = document.createElement("strong");
            message.textContent = activity.message;

            const time = document.createElement("span");
            time.textContent = activity.time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

            details.append(message, time);
            item.append(icon, details);
            container.append(item);
        });
    }

    function addFiles(fileList) {
        const selectedFiles = Array.from(fileList || []);

        if (selectedFiles.length === 0) return;

        selectedFiles.forEach(file => {
            files.push({
                id: `file-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                blob: file,
                sample: false,
                favorite: false,
                date: Date.now()
            });

            addActivity(`Added ${file.name}`, "↑");
        });

        render();
        showToast(`${selectedFiles.length} file(s) added to this session.`);
    }

    function render() {
        renderFiles();
        renderActivity();
    }

    function init() {
        files = [...sampleFiles];

        const fileInput = document.getElementById("fileInput");
        const browseButton = document.getElementById("browseButton");
        const uploadTopButton = document.getElementById("uploadTopButton");
        const uploadZone = document.getElementById("uploadZone");
        const searchInput = document.getElementById("searchInput");
        const typeFilter = document.getElementById("typeFilter");
        const sortSelect = document.getElementById("sortSelect");
        const clearSearch = document.getElementById("clearSearch");

        browseButton?.addEventListener("click", () => fileInput?.click());
        uploadTopButton?.addEventListener("click", () => fileInput?.click());

        fileInput?.addEventListener("change", event => {
            addFiles(event.target.files);
            event.target.value = "";
        });

        searchInput?.addEventListener("input", renderFiles);
        typeFilter?.addEventListener("change", renderFiles);
        sortSelect?.addEventListener("change", renderFiles);

        clearSearch?.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (typeFilter) typeFilter.value = "all";
            renderFiles();
        });

        uploadZone?.addEventListener("dragover", event => {
            event.preventDefault();
            uploadZone.classList.add("dragging");
        });

        uploadZone?.addEventListener("dragleave", () => {
            uploadZone.classList.remove("dragging");
        });

        uploadZone?.addEventListener("drop", event => {
            event.preventDefault();
            uploadZone.classList.remove("dragging");
            addFiles(event.dataTransfer.files);
        });

        render();
    }

    return { init, showToast };
})();

window.CloudFiles = CloudFiles;

document.addEventListener("DOMContentLoaded", CloudFiles.init);
```
