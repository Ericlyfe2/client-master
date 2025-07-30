import { prisma } from "./prisma";
import { MessageType } from "@prisma/client";

export interface CreateMessageData {
  chatId: string;
  userId: string;
  content: string;
  type?: MessageType;
}

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  type: MessageType;
  createdAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

// Create a new message
export const createMessage = async (
  data: CreateMessageData
): Promise<Message> => {
  try {
    const message = await prisma.message.create({
      data: {
        chatId: data.chatId,
        userId: data.userId,
        content: data.content,
        type: data.type || "TEXT",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return message;
  } catch (error: unknown) {
    throw new Error("Failed to create message");
  }
};

// Get message by ID
export const getMessage = async (
  messageId: string
): Promise<Message | null> => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return message;
  } catch (error: unknown) {
    console.error("Error getting message:", error);
    return null;
  }
};

// Get messages by chat ID
export const getMessagesByChatId = async (
  chatId: string
): Promise<Message[]> => {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return messages;
  } catch (error: unknown) {
    throw new Error("Failed to get messages");
  }
};

// Get messages by user ID
export const getMessagesByUser = async (userId: string): Promise<Message[]> => {
  try {
    const messages = await prisma.message.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return messages;
  } catch (error: unknown) {
    throw new Error("Failed to get user messages");
  }
};

// Update message
export const updateMessage = async (
  messageId: string,
  updates: Partial<
    Omit<Message, "id" | "chatId" | "userId" | "createdAt" | "user">
  >
): Promise<Message> => {
  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return message;
  } catch (error: unknown) {
    throw new Error("Failed to update message");
  }
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await prisma.message.delete({
      where: { id: messageId },
    });
  } catch (error: unknown) {
    throw new Error("Failed to delete message");
  }
};

// Delete all messages in a chat
export const deleteChatMessages = async (chatId: string): Promise<void> => {
  try {
    await prisma.message.deleteMany({
      where: { chatId },
    });
  } catch (error: unknown) {
    throw new Error("Failed to delete chat messages");
  }
};

// Get recent messages (for chat history)
export const getRecentMessages = async (
  limit: number = 50
): Promise<Message[]> => {
  try {
    const messages = await prisma.message.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return messages.reverse(); // Return in chronological order
  } catch (error: unknown) {
    throw new Error("Failed to get recent messages");
  }
};

// Get message statistics
export const getMessageStats = async () => {
  try {
    const stats = await prisma.message.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    });

    return stats;
  } catch (error: unknown) {
    throw new Error("Failed to get message statistics");
  }
};
