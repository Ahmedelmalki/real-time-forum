// import { handleRoute } from "../main.js";
import { postComments } from "./comments.js";

export function debounce(func, wait) {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(
        /[&<>'"]/g,
        (tag) =>
        ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
        }[tag] || tag)
    );
}

// will use it to convert time
export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count > 0) {
            return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
        }
    }
    return "just now";
}

//toggleComments, toggleDetails

export function toggleComments(postId, button) {
    const commentSection = document.getElementById(`comment-section-${postId}`);
    console.log("Button clicked:", button.textContent);
    console.log(
        "Comment section hidden:",
        commentSection.classList.contains("hidden")
    );

    if (commentSection.classList.contains("hidden")) {
        console.log("Showing comments for post:", postId);
        commentSection.classList.remove("hidden");
        button.textContent = "Hide Comments";
        postComments(postId);
    } else {
        console.log("Hiding comments for post:", postId);
        commentSection.classList.add("hidden");
        button.textContent = "Show Comments";
    }
}

export function toggleDetails(toggleElement) {
    const meta = toggleElement.nextElementSibling;
    meta.classList.toggle("hidden");
    const detailsText = toggleElement.querySelector(".details-text");
    detailsText.textContent = meta.classList.contains("hidden")
        ? "Details"
        : "Hide Details";
}


window.toggleDetails = toggleDetails;
