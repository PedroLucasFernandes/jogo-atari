import './Chat.css';
import { useEffect, useState } from 'react';
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
  const { lastChatMessage, sendChatMessage } = useWebSocket();
  const { user } = useUser();


  useEffect(() => {
    if (lastChatMessage) {
      console.log("lastChatMessage", lastChatMessage);
      setMessages((prevMessages) => [...prevMessages, lastChatMessage]);
    }
  }, [lastChatMessage]);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return
    if (message.trim() === '') return;

    const ownMessage: IChatMessage = {
      type: 'message',
      username: user.username,
      content: message,
      color: 'black',
    }

    sendChatMessage(roomId, message.trim());
    setMessages((prevMessages) => [...prevMessages, ownMessage]);
    setMessage('');
  }

  return (
    <div id="chat-container">
      <div id="messages">

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