import './Chat.css';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { IChatMessage } from '../../interfaces/game';
import ChatMessage from '../ChatMessage/ChatMessage';
import { useUser } from '../../context/UserContext';

interface ChatProps {
  roomId: string;
}

const Chat: React.FC<ChatProps> = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const { lastChatMessage, setLastChatMessage, sendChatMessage } = useWebSocket();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastChatMessage) return;

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, lastChatMessage];
      return updatedMessages;
    });

    setLastChatMessage(null);
  }, [lastChatMessage]);

  useEffect(() => {
    //Por algum motivo ao entrar na sala o componente é montado e desmontado duas vezes, com isso a mensagem de "entrou" é armazenada duas vezes
    //Essa é uma solução temporário, se não causar nenhum problema posteriormente, ficará permanente.
    return () => {
      //Limpando mensagem após desmontar
      setMessages([]);
    }
  }, []);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return
    if (message.trim() === '') return;

    const ownMessage: IChatMessage = {
      type: 'message',
      username: user.username,
      content: message,
      color: user.color,
    }
    sendChatMessage(roomId, message.trim());
    setMessages((prevMessages) => [...prevMessages, ownMessage]);
    setMessage('');
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  // Sempre rolar para o final quando uma nova mensagem chegar
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div id="chat-container">
      <div id="messages" ref={messagesEndRef}>

        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            username={msg.username}
            content={msg.content}
            color={msg.color}
          />
        ))}
      </div>
      <form name="publish" onSubmit={handleSendMessage}>
        <input type="text" id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <input type="submit" id="send-button" value="Chat" />
      </form>
    </div>
  );
};

export default Chat;