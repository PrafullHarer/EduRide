import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { messagesAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Loader2, Mail, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Message {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'read' | 'unread';
    createdAt: string;
}

const Messages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const data = await messagesAPI.getAll();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await messagesAPI.markRead(id);
            setMessages(messages.map(msg => msg._id === id ? { ...msg, status: 'read' } : msg));
            toast.success("Marked as read");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            await messagesAPI.delete(id);
            setMessages(messages.filter(msg => msg._id !== id));
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Messages">
                <div className="flex justify-center items-center h-64">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Messages" subtitle="View and manage customer inquiries">
            <div className="space-y-6">
                {messages.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Mail className="h-12 w-12 mb-4 opacity-20" />
                            <p>No messages found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <Card key={msg._id} className={`transition-all ${msg.status === 'unread' ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex gap-2 items-center">
                                        <CardTitle className="text-base font-semibold">{msg.subject}</CardTitle>
                                        {msg.status === 'unread' && <Badge variant="default">New</Badge>}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(msg.createdAt), 'PPP p')}
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-sm">{msg.name}</p>
                                                <p className="text-xs text-muted-foreground">{msg.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {msg.status === 'unread' && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleMarkRead(msg._id)} title="Mark as read">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(msg._id)} title="Delete">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm border-t pt-4 whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Messages;
