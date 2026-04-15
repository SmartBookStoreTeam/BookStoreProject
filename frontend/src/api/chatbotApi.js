import api from "./api";

// Send a message to the chatbot
export const sendChatbotMessage = async (message) => {
  try {
    const response = await api.post("/chatbot/message", { message });
    return response;
  } catch (error) {
    console.error("Error sending chatbot message:", error);
    throw error;
  }
};
