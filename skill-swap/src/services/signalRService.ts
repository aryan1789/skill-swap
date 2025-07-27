import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export interface ChatMessage {
  id: string;
  skillSwapRequestId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

class SignalRService {
  private connection: HubConnection | null = null;
  private readonly hubUrl = "http://localhost:5209/chathub";

  // Initialize connection
  public async startConnection(): Promise<void> {
    if (this.connection?.state === "Connected") {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log("SignalR connection established");
    } catch (error) {
      console.error("Error starting SignalR connection:", error);
      throw error;
    }
  }

  // Stop connection
  public async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log("SignalR connection stopped");
    }
  }

  // Join a specific chat
  public async joinChat(skillSwapRequestId: string, userId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("Connection not established. Call startConnection() first.");
    }

    try {
      await this.connection.invoke("JoinChat", skillSwapRequestId, userId);
      console.log(`Joined chat: ${skillSwapRequestId}`);
    } catch (error) {
      console.error("Error joining chat:", error);
      throw error;
    }
  }

  // Leave a specific chat
  public async leaveChat(skillSwapRequestId: string): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.invoke("LeaveChat", skillSwapRequestId);
      console.log(`Left chat: ${skillSwapRequestId}`);
    } catch (error) {
      console.error("Error leaving chat:", error);
    }
  }

  // Send a message
  public async sendMessage(
    skillSwapRequestId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    if (!this.connection) {
      throw new Error("Connection not established. Call startConnection() first.");
    }

    try {
      await this.connection.invoke("SendMessage", skillSwapRequestId, senderId, content);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Mark message as read
  public async markAsRead(messageId: string): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.invoke("MarkAsRead", messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  // Listen for incoming messages
  public onReceiveMessage(callback: (message: ChatMessage) => void): void {
    if (!this.connection) {
      throw new Error("Connection not established. Call startConnection() first.");
    }

    this.connection.on("ReceiveMessage", callback);
  }

  // Listen for errors
  public onError(callback: (error: string) => void): void {
    if (!this.connection) {
      throw new Error("Connection not established. Call startConnection() first.");
    }

    this.connection.on("Error", callback);
  }

  // Remove event listeners
  public removeEventListeners(): void {
    if (this.connection) {
      this.connection.off("ReceiveMessage");
      this.connection.off("Error");
    }
  }

  // Get connection state
  public getConnectionState(): string {
    return this.connection?.state || "Disconnected";
  }
}

// Export a singleton instance
export const signalRService = new SignalRService();
export default signalRService;
