import { NextRequest, NextResponse } from "next/server";
import { getMessagesByChatId, createMessage } from "@/lib/messageService";

interface ChatResponse {
  success: boolean;
  messages?: Array<{
    id: string;
    chatId: string;
    userId: string;
    content: string;
    type: string;
    createdAt: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }>;
  message?: {
    id: string;
    chatId: string;
    userId: string;
    content: string;
    type: string;
    createdAt: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
): Promise<NextResponse<ChatResponse>> {
  const { chatId } = await params;

  try {
    // Get messages for this chat
    const Messages = await getMessagesByChatId(chatId);
    console.log(Messages);

    if (Messages.length === 0) {
      return NextResponse.json({
        success: true,
        messages: [],
      });
    }

    return NextResponse.json({
      success: true,
      messages: Messages.map((message) => ({
        id: message.id,
        chatId: message.chatId,
        userId: message.userId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt.toISOString(),
        user: message.user,
      })),
    });
  } catch (_error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
): Promise<NextResponse<ChatResponse>> {
  const { chatId } = await params;

  try {
    const body = await request.json();
    const { content, userId, type } = body;

    if (!content?.trim() || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Content and userId are required",
        },
        { status: 400 }
      );
    }

    // Create new message
    const newMessage = await createMessage({
      chatId,
      userId,
      content: content.trim(),
      type: type || "TEXT",
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        chatId: newMessage.chatId,
        userId: newMessage.userId,
        content: newMessage.content,
        type: newMessage.type,
        createdAt: newMessage.createdAt.toISOString(),
        user: newMessage.user,
      },
    });
  } catch (_error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message",
      },
      { status: 500 }
    );
  }
}
