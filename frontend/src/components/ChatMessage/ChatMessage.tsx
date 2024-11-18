import './ChatMessage.css'

interface ChatMessageProps {
  username: string;
  content: string;
  color: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ username, content, color }) => {
  return (
    <div id="message-container">
      {/* <span className="author" style={{ color: `${color}` }}>{`${username}: `}</span>{'\u00A0'}<span className="content">{content}</span> */}
      <span className="content"><span className="author" style={{ color: `${color}` }}>{`${username}: `}</span>{content}</span>

    </div>
  )
}


export default ChatMessage;