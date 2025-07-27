import React, { useEffect, useState, useRef } from "react";
import { getChatMessages, markMessagesAsRead, type ChatMessage } from "../api/chatService";
import { chatConnection } from "../services/chatConnectionService";
import { useAppSelector } from "../store/hooks";
import * as signalR from "@microsoft/signalr";

interface ChatWindowProps {
  skillSwapRequestId: string;
  otherUserName: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  skillSwapRequestId,
  otherUserName,
  onClose,
}) => {
  const userGuid = useAppSelector((state) => state.user.userGuid);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat messages and set up real-time connection
  useEffect(() => {
    const setupChat = async () => {
      if (!userGuid) return;

      try {
        setLoading(true);
        setError(null);

        // Load existing messages
        const chatMessages = await getChatMessages(skillSwapRequestId, userGuid);
        setMessages(chatMessages);

        // Connect to SignalR if not already connected
        if (chatConnection.connectionState === signalR.HubConnectionState.Disconnected) {
          await chatConnection.connect();
        }

        // Join this specific chat
        await chatConnection.joinChat(skillSwapRequestId, userGuid);

        // Mark messages as read
        await markMessagesAsRead(skillSwapRequestId, userGuid);

        // Set up message listener
        const handleNewMessage = (message: ChatMessage) => {
          if (message.skillSwapRequestId === skillSwapRequestId) {
            setMessages(prev => {
              // Normalize GUIDs for comparison
              const normalizedSenderId = message.senderId?.toLowerCase().replace(/-/g, '');
              const normalizedUserGuid = userGuid?.toLowerCase().replace(/-/g, '');
              
              // If this is from the current user, replace any temporary message
              if (normalizedSenderId === normalizedUserGuid) {
                // Remove temporary messages with the same content (more efficient check)
                const withoutTemp = prev.filter(msg => 
                  !(msg.id.startsWith('temp-') && msg.content === message.content && msg.senderId === userGuid)
                );
                // Only add if we don't already have this exact message
                const hasMessage = withoutTemp.some(msg => msg.id === message.id);
                if (!hasMessage) {
                  return [...withoutTemp, message];
                }
                return withoutTemp;
              } else {
                // For other users, check if we already have this message
                const hasMessage = prev.some(msg => msg.id === message.id);
                if (!hasMessage) {
                  return [...prev, message];
                }
                return prev;
              }
            });
            
            // Mark as read if it's not from current user
            const normalizedSenderId = message.senderId?.toLowerCase().replace(/-/g, '');
            const normalizedUserGuid = userGuid?.toLowerCase().replace(/-/g, '');
            if (normalizedSenderId !== normalizedUserGuid) {
              markMessagesAsRead(skillSwapRequestId, userGuid);
            }
          }
        };

        chatConnection.onMessage(handleNewMessage);

        // Cleanup function
        return () => {
          chatConnection.removeMessageCallback(handleNewMessage);
          chatConnection.leaveChat(skillSwapRequestId);
        };
      } catch (err) {
        console.error("Failed to setup chat:", err);
        setError("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    const cleanup = setupChat();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [skillSwapRequestId, userGuid]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userGuid || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setNewMessage(""); // Clear input immediately

    try {
      setSending(true);
      
      // Create a temporary message for immediate display
      const tempMessage: ChatMessage = {
        id: tempId,
        skillSwapRequestId,
        senderId: userGuid,
        senderName: "You",
        content: messageContent,
        sentAt: new Date().toISOString(),
        isRead: true
      };

      // Add message to UI immediately (optimistic update)
      setMessages(prev => [...prev, tempMessage]);

      // Send via SignalR
      await chatConnection.sendMessage(skillSwapRequestId, userGuid, messageContent);
      
      // Message sent successfully - the real message will come back via SignalR
      
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
      setNewMessage(messageContent); // Restore message on error
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>{otherUserName}</h3>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div style={styles.loading}>Loading chat...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>{otherUserName}</h3>
        <button style={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {error && <div style={styles.error}>{error}</div>}
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            // Normalize both IDs for comparison (remove dashes, convert to lowercase)
            const normalizedSenderId = message.senderId?.toLowerCase().replace(/-/g, '');
            const normalizedUserGuid = userGuid?.toLowerCase().replace(/-/g, '');
            const isOwnMessage = normalizedSenderId === normalizedUserGuid;
            return (
              <div
                key={message.id}
                style={{
                  ...styles.messageWrapper,
                  ...(isOwnMessage
                    ? styles.ownMessageWrapper
                    : styles.otherMessageWrapper),
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(isOwnMessage
                      ? styles.ownMessage
                      : styles.otherMessage),
                  }}
                >
                  <div style={styles.messageContent}>{message.content}</div>
                  <div style={styles.messageTime}>
                    {formatTime(message.sentAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <textarea
          style={{
            ...styles.messageInput,
            borderColor: newMessage ? "#0077cc" : "var(--border)",
          }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          disabled={sending}
        />
        <button
          style={{
            ...styles.sendButton,
            ...(sending || !newMessage.trim() ? styles.sendButtonDisabled : {}),
          }}
          onClick={handleSendMessage}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--card)", // Use normal card color
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderBottom: "2px solid var(--border)",
    backgroundColor: "var(--card)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  headerTitle: {
    margin: 0,
    color: "var(--text)",
    fontWeight: 600,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "var(--text-secondary)",
    padding: "0.25rem",
    lineHeight: 1,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    color: "var(--text-secondary)",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#ffe6e6",
    color: "#d32f2f",
    margin: "0.5rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  emptyState: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    color: "var(--text-secondary)",
    fontStyle: "italic",
  },
  messageWrapper: {
    display: "flex",
    maxWidth: "70%",
  },
  ownMessageWrapper: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  message: {
    padding: "0.75rem 1rem",
    borderRadius: "1rem",
    wordWrap: "break-word",
  },
  ownMessage: {
    backgroundColor: "#0077cc",
    color: "white",
  },
  otherMessage: {
    backgroundColor: "#f1f3f4",
    color: "#1a1a1a",
  },
  messageContent: {
    marginBottom: "0.25rem",
    lineHeight: 1.4,
  },
  messageTime: {
    fontSize: "0.75rem",
    opacity: 0.7,
  },
  inputContainer: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    borderTop: "1px solid var(--border)",
    backgroundColor: "var(--card)", // Use normal card color
    minHeight: "80px", // Ensure input area is always visible
  },
  messageInput: {
    flex: 1,
    padding: "0.75rem",
    border: "2px solid var(--border)",
    borderRadius: "1rem",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    maxHeight: "100px",
    backgroundColor: "var(--card)",
    color: "var(--text)",
    transition: "border-color 0.2s",
  },
  sendButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0077cc",
    color: "white",
    border: "2px solid #0077cc",
    borderRadius: "1rem",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
};

export default ChatWindow;
