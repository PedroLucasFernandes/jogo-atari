import './JoinRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { Dispatch, SetStateAction } from 'react';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const JoinRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {

  return (
    <Box id="join-room">
      <h2>Procurar sala</h2>

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>Voltar ao menu</Button>

    </Box>
  );
}