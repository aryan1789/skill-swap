import * as signalR from "@microsoft/signalr";
import type { ChatMessage } from "../api/chatService";

class ChatConnectionService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5209/chathub")
      .withAutomaticReconnect()
      .build();

    // Set up message receiving
    this.connection.on("ReceiveMessage", (message: ChatMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // Set up error handling
    this.connection.on("Error", (error: string) => {
      console.error("Chat error:", error);
      this.errorCallbacks.forEach(callback => callback(error));
    });

    try {
      await this.connection.start();
      console.log("Connected to chat hub");
    } catch (error) {
      console.error("Failed to connect to chat hub:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async joinChat(skillSwapRequestId: string, userId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Not connected to chat hub");
    }
    await this.connection.invoke("JoinChat", skillSwapRequestId, userId);
  }

  async leaveChat(skillSwapRequestId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Not connected to chat hub");
    }
    await this.connection.invoke("LeaveChat", skillSwapRequestId);
  }

  async sendMessage(skillSwapRequestId: string, senderId: string, content: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Not connected to chat hub");
    }
    await this.connection.invoke("SendMessage", skillSwapRequestId, senderId, content);
  }

  async markAsRead(messageId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Not connected to chat hub");
    }
    await this.connection.invoke("MarkAsRead", messageId);
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  removeMessageCallback(callback: (message: ChatMessage) => void): void {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  removeErrorCallback(callback: (error: string) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  get connectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }
}

// Export a singleton instance
export const chatConnection = new ChatConnectionService();
