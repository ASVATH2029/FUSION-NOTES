import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './ChatPage.module.css';
import type { Collaborator } from '../components/layout/SidePanels';

import { supabase } from '../lib/supabaseClient';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  username?: string;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  time: string;
  unread?: number;
  avatar: string;
  memberCount?: number;
  onlineCount?: number;
}

interface ChatPageProps {
  user: { id: string; email: string; username?: string } | null;
  collabs: Collaborator[];
  collabLoading: boolean;
}

const ChatPage: React.FC<ChatPageProps> = ({ user: activeUser, collabs, collabLoading }) => {
  const [activeConv, setActiveConv] = useState('main');
  const [input, setInput] = useState('');
  const [dbMessages, setDbMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Helper for unique DM identification
  const getDmId = (id1: string, id2: string) => {
    return ['dm', ...[id1, id2].sort()].join('_');
  };

  // Dynamically generate conversations based on collaborators
  const conversations = useMemo(() => {
    // Filter out the current user from the collaborators list to avoid chatting with yourself
    const otherCollabs = collabs.filter(c => {
      const isSelf = activeUser && (c.id === activeUser.id || c.user_id === activeUser.username);
      return !isSelf;
    });

    const list: Conversation[] = [
      {
        id: 'main',
        title: 'Main Study Group',
        preview: otherCollabs.length > 0 ? `${otherCollabs[0].user_id}: Hey anyone here?` : 'Welcome to the shared study group!',
        time: 'Now',
        avatar: '📚',
        memberCount: collabs.length, // Total members
        onlineCount: collabs.length,
      }
    ];

    // Individual chats with collaborators (excluding self)
    otherCollabs.forEach(c => {
      const dmId = activeUser ? getDmId(activeUser.id || activeUser.username || 'me', c.id || c.user_id) : c.user_id;
      list.push({
        id: dmId,
        title: c.user_id,
        preview: `Private message with ${c.user_id}`,
        time: 'Today',
        avatar: c.initial,
        onlineCount: 1,
      });
    });

    return list;
  }, [collabs, activeUser]);

  const activeConvData = conversations.find(c => c.id === activeConv);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', activeConv)
        .order('created_at', { ascending: true });

      if (error) console.error('Fetch history error:', error);
      else if (data) {
        setDbMessages(data.map(m => ({
          id: m.id,
          role: m.role || 'user',
          text: m.text,
          time: m.time,
          username: m.username
        })));
      }
    };
    fetchHistory();
  }, [activeConv]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${activeConv}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `group_id=eq.${activeConv}` 
      }, (payload) => {
        const newMessage = payload.new;
        setDbMessages(prev => {
          // Prevent duplicates
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, {
            id: newMessage.id,
            role: newMessage.role || 'user',
            text: newMessage.text,
            time: newMessage.time,
            username: newMessage.username
          }];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dbMessages, activeConv]);

  const send = async () => {
    if (!input.trim() || !activeUser) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentInput = input;
    setInput('');

    const { error } = await supabase.from('messages').insert({
      username: activeUser.username || activeUser.email.split('@')[0],
      text: currentInput,
      group_id: activeConv,
      time: now,
      role: 'user',
      user_id: activeUser.id
    });

    if (error) {
      console.error('Send error:', error);
      alert('Failed to send message properly. Make sure you ran the SQL editor commands!');
    }
  };

  return (
    <div className={styles.layout}>
      {/* Conversation List */}
      <div className={styles.convList}>
        <div className={styles.convHeader}>
          <span className={styles.convTitle}>Messages</span>
          <button className="icon-btn" id="new-chat-btn" title="New chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div className={styles.convItems}>
          {collabLoading ? (
            <div className={styles.loadingState}>Loading study group...</div>
          ) : conversations.map(conv => (
            <button
              key={conv.id}
              className={`${styles.convItem} ${activeConv === conv.id ? styles.convActive : ''}`}
              onClick={() => setActiveConv(conv.id)}
              id={`conv-${conv.id}`}
            >
              <div className={styles.convAvatar}>{conv.avatar}</div>
              <div className={styles.convInfo}>
                <div className={styles.convName}>{conv.title}</div>
                <div className={styles.convPreview}>{conv.preview}</div>
              </div>
              <div className={styles.convRight}>
                <span className={styles.convTime}>{conv.time}</span>
                {conv.unread && <span className={styles.badge}>{conv.unread}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={styles.chatWindow}>
        {!activeConvData ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a conversation to start studying together!
          </div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.headerAvatar}>{activeConvData.avatar}</div>
              <div>
                <div className={styles.headerName}>{activeConvData.title}</div>
                <div className={styles.headerSub}>
                  {activeConvData.memberCount && activeConvData.memberCount > 1
                    ? `${activeConvData.memberCount} members · `
                    : ''}
                  {activeConvData.onlineCount != null && activeConvData.onlineCount > 0
                    ? <span style={{ color: 'var(--success)' }}>{activeConvData.onlineCount} online</span>
                    : <span style={{ color: 'var(--text-muted)' }}>Away</span>}
                </div>
              </div>
            </div>

            <div className={styles.messages}>
              {dbMessages.length === 0 ? (
                <div className={styles.emptyChat}>
                  <p>Starting conversation in {activeConvData.title}...</p>
                </div>
              ) : dbMessages.map(msg => {
                const isOwn = activeUser && (msg.username === activeUser.username || msg.username === activeUser.email.split('@')[0]);
                return (
                  <div key={msg.id} className={`${styles.msgRow} ${isOwn ? styles.msgUser : styles.msgAI}`}>
                    {!isOwn && <div className={styles.msgAvatar}>{activeConvData.avatar}</div>}
                    <div className={styles.bubble}>
                      {!isOwn && <span className={styles.senderName}>{msg.username}</span>}
                      <p className={styles.bubbleText}>{msg.text}</p>
                      <span className={styles.bubbleTime}>{msg.time}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <div className={styles.inputRow}>
              <button className="icon-btn" title="Attach file" id="attach-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input
                id="chat-input"
                className={styles.chatInput}
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              />
              <button className={`btn-accent ${styles.sendBtn}`} onClick={send} id="send-btn" disabled={!input.trim()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
