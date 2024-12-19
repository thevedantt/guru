const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;

const API_KEY = "AIzaSyBlnlUtKKR-bQ0xp-igdaVRBX0BwpXxzUs";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Utility to create a message element
const createMessageElement = (content, className, loading = false) => {
    const div = document.createElement("div");
    div.classList.add("message", className);
    if (loading) {
        div.classList.add("loading");
    }
    div.innerHTML = content;
    return div;
};

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById("send-button");
    const optionalHeaders = document.getElementById("optional-headers");
});

// Typing effect for displaying text
const showTypingEffect = (text, textElement) => {
    const words = text.split(" ");
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? " " : " ") + words[currentWordIndex++];

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
        }
    }, 75);
};

// Function to generate the API response
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: userMessage }],
                    },
                ],
            }),
        });

        const data = await response.json();

        // Validate response and safely access data
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response available.";
        showTypingEffect(apiResponse, textElement);

        // Add the response text to the element for copying
        incomingMessageDiv.setAttribute("data-text", apiResponse);

        // Add a copy button
        const copyButton = incomingMessageDiv.querySelector(".icon");
        copyButton.addEventListener("click", () => {
            const textToCopy = incomingMessageDiv.getAttribute("data-text");
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    alert(`Copied to clipboard: "${textToCopy}"`);
                })
                .catch(err => {
                    console.error("Failed to copy text: ", err);
                });
        });

    } catch (error) {
        console.error("Error generating API response:", error);
        textElement.innerText = "Failed to connect to the API.";
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
};

// Loading animation for incoming messages
const showLoadingAnimation = () => {
    const html =
        '<div class="message-content">' +
        '<img src="static/images/gemini.svg" alt="user" class="avatar" />' +
        '<div class="loading-indicator">' +
        '<div class="loading-bar"></div>' +
        '<div class="loading-bar"></div>' +
        '<span class="icon material-symbols-rounded">content_copy</span>' +
        '</div>' +
        '<p class="text"></p>' +
        '</div>';

    const incomingMessageDiv = createMessageElement(html, "incoming", true);
    chatList.appendChild(incomingMessageDiv);

    generateAPIResponse(incomingMessageDiv);
};

// Handle outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if (!userMessage) return;

    const html =
        '<div class="message-content">' +
        '<img src="static/images/user.jpg" alt="user" class="avatar" />' +
        `<p class="text">${userMessage}</p>` +
        "</div>";

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header")
    setTimeout(showLoadingAnimation,500);
};

// Function to handle delete chat functionality
const handleDeleteChat = () => {
    chatList.innerHTML = "";  // Clears all the chat messages
};

// Event listener for delete button
deleteChatButton.addEventListener("click", handleDeleteChat);

// Event listener for form submission
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
