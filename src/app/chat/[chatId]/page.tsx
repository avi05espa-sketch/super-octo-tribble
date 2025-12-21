
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useFirebase, useUser } from '@/firebase';
import { getChat, sendMessage } from '@/lib/data';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Chat, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


function ChatHeader({ chat, otherUserName }: { chat: Chat | null, otherUserName: string | null }) {
    if (!chat) {
        return (
             <div className="flex items-center justify-between p-3 border-b bg-background/95">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/account/messages"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="flex flex-col">
                         <div className="h-5 w-24 bg-muted rounded-md animate-pulse" />
                         <div className="h-4 w-32 bg-muted rounded-md animate-pulse mt-1" />
                    </div>
                </div>
             </div>
        )
    }

    return (
        <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/account/messages"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                 <div className="flex flex-col">
                    <p className="font-bold">{otherUserName}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{chat.productTitle}</p>
                 </div>
            </div>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Detalles del producto</SheetTitle>
                        <SheetDescription className="sr-only">
                            Información sobre el producto {chat.productTitle} del cual trata esta conversación.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        <Link href={`/product/${chat.productId}`} className="block group">
                            <div className="aspect-video relative rounded-lg overflow-hidden">
                                <Image src={chat.productImage} alt={chat.productTitle} fill className="object-cover" />
                            </div>
                            <p className="font-semibold mt-2 group-hover:underline">{chat.productTitle}</p>
                        </Link>
                         <p className="text-sm text-muted-foreground">Conversación sobre este artículo.</p>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default function ChatPage() {
    const { chatId } = useParams() as { chatId: string };
    const { firestore } = useFirebase();
    const { user: currentUser, loading: userLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentUser && !userLoading) {
            toast({ variant: "destructive", title: "Acceso denegado", description: "Debes iniciar sesión para ver tus mensajes."});
            router.push('/auth');
        }
    }, [currentUser, userLoading, router, toast]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!firestore || !chatId || !currentUser) return;

        const fetchChatData = async () => {
            try {
                const chatData = await getChat(firestore, chatId);
                if (!chatData || !chatData.participants.includes(currentUser.uid)) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Chat no encontrado o no tienes permiso para verlo.'})
                    router.push('/account/messages');
                    return;
                }
                setChat(chatData);
            } catch (error) {
                console.error("Error fetching chat data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el chat.'})
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();

        const messagesRef = collection(firestore, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const newMessages = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Message));
                setMessages(newMessages);
            }, 
            (error) => {
                console.error("Error listening to messages:", error);
                // The error will be caught by the global listener, but we can also log a specific error here
                // or update local state to show a UI error.
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: messagesRef.path,
                    operation: 'list',
                }));
                toast({ variant: "destructive", title: "Error de permisos", description: "No se pudieron cargar los mensajes." });
            }
        );

        return () => unsubscribe();

    }, [firestore, chatId, currentUser, toast, router]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !chatId || !currentUser || !newMessage.trim()) return;
        
        const textToSend = newMessage.trim();
        setNewMessage("");

        // This function is now fire-and-forget from the UI perspective.
        // It handles its own errors via the errorEmitter.
        sendMessage(firestore, chatId, currentUser.uid, textToSend);
        
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (loading || userLoading) {
        return (
            <div className="flex flex-col h-screen">
                <ChatHeader chat={null} otherUserName={null} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    const otherUserId = chat?.participants.find(p => p !== currentUser?.uid);
    const otherUserName = otherUserId ? chat?.participantDetails[otherUserId]?.name : "Usuario";

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
           <ChatHeader chat={chat} otherUserName={otherUserName} />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === currentUser?.uid;
                    const messageDate = msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : new Date();

                    return (
                        <div key={msg.id || index} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                            {!isCurrentUser && (
                                 <Avatar className="h-8 w-8">
                                    <AvatarImage src={chat?.participantDetails[msg.senderId]?.avatar} />
                                    <AvatarFallback>{otherUserName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-card border")}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                    {messageDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..." 
                        className="flex-1"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
