import './WaitingRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { Dispatch, SetStateAction } from 'react';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const WaitingRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {

  return (
    <Box id="waiting-room">
      <h2>Sala de espera</h2>

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>Sair da sala</Button>

    </Box>
  );
}