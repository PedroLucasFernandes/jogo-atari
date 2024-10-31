import './MainMenu.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import React, { useEffect } from "react";
import { useWebSocket } from '../context/WebSocketContext';




const MainMenu: React.FC = () => {

  const { webSocketService, socketId } = useWebSocket();

  useEffect(() => {
    webSocketService.registerCallback('something', (data) => {
      console.log(`Something: ${data}`);
    });

  }, [webSocketService]);


  return (
    <Box id="main-menu" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1>Welcome to Main Menu!</h1>
      {socketId ? 'Socket Connected' : 'Socket not Connected'}
      <Button>Play</Button>
    </Box>
  );

};

export default MainMenu;
