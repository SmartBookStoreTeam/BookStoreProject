import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User as UserIcon, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getBooks } from "../api/booksApi";

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(() => {
    return sessionStorage.getItem("chatbotHasBeenOpened") === "true";
  });
  const [books, setBooks] = useState([]);

  const firstName = user?.name?.split(" ")[0];
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `${t("Hello")}${
        firstName ? ` ${firstName}` : ""
      }! ${t("How can I help you today?")}`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showText, setShowText] = useState(false);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await getBooks();
        const booksData = Array.isArray(response.data) ? response.data : [];

        // Map books to chatbot format
        const formattedBooks = booksData.map((book) => ({
          id: book._id || book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          category: book.category,
          desc: book.description || book.desc,
          rate: book.ratings || book.rate || 0,
        }));

        setBooks(formattedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        // Books will remain empty array on error
      }
    };

    fetchBooks();
  }, []);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* focus input */
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  /* scroll detection to show/hide label */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowLabel(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* delay text appearance after button appears */
  useEffect(() => {
    let textTimer;

    if (showLabel) {
      // Show text 1 second after button appears
      textTimer = setTimeout(() => {
        setShowText(true);
      }, 500);
    } else {
      setShowText(false);
    }

    return () => {
      if (textTimer) clearTimeout(textTimer);
    };
  }, [showLabel]);

  const toggleChat = () => {
    setIsOpen((v) => {
      if (!v) {
        setHasBeenOpened(true);
        sessionStorage.setItem("chatbotHasBeenOpened", "true");
      }
      return !v;
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userText,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: generateBotResponse(userText),
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    const hasArabic = /[\u0600-\u06FF]/.test(userInput);
    const lng = hasArabic ? "ar" : "en";

    // 1. Check for specific greetings/thanks first
    if (input.includes("thank")) return "You're welcome!";
    if (input.includes("شكرا")) return "على الرحب والسعه";

    // 2. Collect all matching books
    const matches = [];
    const isPriceQuery =
      input.includes("price") ||
      input.includes("سعر") ||
      input.includes("اسعار");

    for (const book of books) {
      const bookTitle = book.title.toLowerCase();
      const titleWords = bookTitle.split(" ");
      const isMatch =
        input.includes(bookTitle) ||
        bookTitle.includes(input) ||
        titleWords.some((word) => input.includes(word) && word.length > 2);

      if (isMatch) {
        matches.push(book);
      }
    }

    // Deduplicate matches based on ID
    const uniqueMatches = Array.from(
      new Map(matches.map((item) => [item.id, item])).values(),
    );

    // 3. Handle matches
    if (uniqueMatches.length === 1) {
      const book = uniqueMatches[0];
      if (isPriceQuery) {
        return hasArabic
          ? `سعر كتاب ${book.title} هو ${book.price} جنيه`
          : `The price of the book ${book.title} is ${book.price} EGP`;
      }
      const categoryName =
        typeof book.category === "object" ? book.category?.name : book.category;

      return hasArabic
        ? `اسم الكتاب: ${book.title}
المؤلف: ${book.author}
السعر: ${book.price} جنيه
التصنيف: ${t(categoryName, { lng })}
الوصف: ${book.desc}
التقييم: ${book.rate}`
        : `Book: ${book.title}
Author: ${book.author}
Price: ${book.price} EGP
Category: ${categoryName}
Description: ${book.desc}
Rate: ${book.rate}`;
    }

    if (uniqueMatches.length > 1) {
      // Limit to 5 matches to avoid huge messages
      const limitedMatches = uniqueMatches.slice(0, 5);
      const titles = limitedMatches.map((b) => `• ${b.title}`).join("\n");
      const moreCount = uniqueMatches.length - 5;

      if (hasArabic) {
        let msg = `وجدت ${uniqueMatches.length} كتب تطابق بحثك:\n${titles}`;
        if (moreCount > 0) msg += `\n...و ${moreCount} كتب أخرى.`;
        msg += "\n\nهل يمكنك توضيح سؤالك أكثر؟";
        return msg;
      } else {
        let msg = `I found ${uniqueMatches.length} books matching your search:\n${titles}`;
        if (moreCount > 0) msg += `\n...and ${moreCount} more.`;
        msg += "\n\nCould you please be more specific?";
        return msg;
      }
    }

    // 4. No matches found, check generic queries
    if (input.includes("سعر") || input.includes("اسعار"))
      return "يمكنك العثور على أسعار الكتب في صفحات التفاصيل. هل تريد مساعدتي في إيجاد كتاب معين؟";
    if (input.includes("price"))
      return "You can find book prices on their detail pages. Would you like me to help you find a specific book?";
    else if (input.includes("book"))
      return "I can help you find books! What genre are you interested in?";
    else if (input.includes("hello") || input.includes("hi"))
      return "Hello! How can I assist you with finding books today?";
    else if (input.includes("اهلا") || input.includes("مرحبا"))
      return "مرحباً! انا هنا كيف يمكنني مساعدتك اليوم؟";
    else if (input.includes("كتاب"))
      return "يمكنني مساعدتك في إيجاد الكتب! ما هو النوع الذي تهتم به؟";
    if (input.includes("help")) return "I'm here to help! Ask me anything.";
    if (input.includes("مساعدة") || input.includes("مساعده"))
      return "انا هنا للمساعدة اسألني على اي شئ";

    // 5. Default response
    if (hasArabic) {
      return `أفهم أنك تسأل عن "${userInput}"، كيف يمكنني مساعدتك بشكل أفضل؟`;
    }

    return `${t("I understand you're asking about")} "${userInput}"`;
  };

  return (
    <>
      {/* CHAT WINDOW */}
      <div
        className={`fixed bottom-24 right-6 z-[100] transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 pointer-events-none"
        }`}
        style={{ width: "min(380px, calc(100vw - 3rem))" }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col h-[500px] max-h-[calc(100vh-10rem)] overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <span className="text-white font-semibold text-sm">
                Bookfly {t("Assistant")}
              </span>
            </div>
            <button
              onClick={toggleChat}
              className="touch-area text-white cursor-pointer bg-indigo-700 hover:bg-indigo-900 active:bg-indigo-800 p-2 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950 custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#818cf8 transparent",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                  {m.sender === "bot" ? (
                    <Bot size={14} />
                  ) : (
                    <UserIcon size={14} />
                  )}
                </div>
                <div
                  dir="auto"
                  className={`whitespace-pre-wrap px-4 py-2 rounded-2xl text-sm max-w-[75%] ${
                    m.sender === "bot"
                      ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-xs opacity-60 text-zinc-600 dark:text-zinc-400">
                Typing…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex gap-2">
              <div className="touch-area rounded-full">
                <input
                  ref={inputRef}
                  dir={i18n.dir()}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("Type your message...")}
                  className="flex-1 w-[95%] sm:w-full px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
                />
              </div>
              <button
                type="button"
                className="touch-area w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-200 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                title={t("Voice input")}
              >
                <Mic size={16} />
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="touch-area w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FLOATING BUTTON */}
      <div
        className={`fixed bottom-36 right-6 z-[100] flex items-center gap-3 transition-all duration-300 ${
          isOpen
            ? "scale-0 opacity-0"
            : showLabel
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
        }`}
      >
        {/* Label Text */}
        <div
          className={`transition-all duration-300 ${
            showText && !isOpen && !hasBeenOpened
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <div
            dir={i18n.dir()}
            className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap border border-zinc-200 dark:border-zinc-700"
          >
            {t("Welcome")}! {t("How can I assist you")}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={toggleChat}
          className="touch-area w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 cursor-pointer transition-colors"
        >
          <Bot size={24} />
        </button>
      </div>
    </>
  );
};

export default Chatbot;
