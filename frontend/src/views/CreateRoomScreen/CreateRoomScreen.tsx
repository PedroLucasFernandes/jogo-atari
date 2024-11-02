import './CreateRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { Dispatch, SetStateAction } from 'react';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const CreateRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {

  return (
    <Box id="create-room">
      <h2>Criar sala</h2>


      <Box sx={{ mt: 2 }}>
        <Input type="text" placeholder="Código da sala" />
      </Box>
      <Button variant="solid" size="md" onClick={() => console.log('Criar sala')}>Criar sala</Button>
      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>Voltar ao menu</Button>

    </Box>
  );
}