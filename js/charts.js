```javascript
// CloudShare Pro - File Category Visualization

window.CloudCharts = (() => {
    function renderCategoryChart(files) {
        const container = document.getElementById("categoryChart");

        // The chart is optional in the current dashboard layout.
        if (!container) return;

        const categories = {
            PDF: 0,
            Images: 0,
            Documents: 0,
            Other: 0
        };

        files.forEach(file => {
            const name = file.name.toLowerCase();
            const type = (file.type || "").toLowerCase();

            if (type === "application/pdf" || name.endsWith(".pdf")) {
                categories.PDF++;
            } else if (
                type.startsWith("image/") ||
                /\.(png|jpe?g|gif|webp|svg|bmp)$/.test(name)
            ) {
                categories.Images++;
            } else if (
                type.includes("document") ||
                type.includes("word") ||
                type.includes("text") ||
                /\.(docx?|txt|rtf|odt)$/.test(name)
            ) {
                categories.Documents++;
            } else {
                categories.Other++;
            }
        });

        const total = Object.values(categories)
            .reduce((sum, count) => sum + count, 0);

        const colors = {
            PDF: "#e86a67",
            Images: "#24a77a",
            Documents: "#6475ee",
            Other: "#a47cf2"
        };

        container.innerHTML = "";

        if (total === 0) {
            const message = document.createElement("p");
            message.textContent = "Add files to see your category breakdown.";
            container.append(message);
            return;
        }

        Object.entries(categories).forEach(([name, count]) => {
            if (count === 0) return;

            const item = document.createElement("div");
            item.className = "category-chart-item";

            const heading = document.createElement("div");
            heading.className = "category-chart-heading";

            const label = document.createElement("span");
            label.textContent = name;

            const value = document.createElement("strong");
            value.textContent = `${count} (${Math.round(count / total * 100)}%)`;

            heading.append(label, value);

            const track = document.createElement("div");
            track.className = "category-chart-track";

            const bar = document.createElement("div");
            bar.className = "category-chart-bar";
            bar.style.width = `${count / total * 100}%`;
            bar.style.backgroundColor = colors[name];

            track.append(bar);
            item.append(heading, track);
            container.append(item);
        });
    }

    return { renderCategoryChart };
})();
```
