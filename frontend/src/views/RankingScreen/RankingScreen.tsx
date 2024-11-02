import './RankingScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { Dispatch, SetStateAction } from 'react';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const RankingScreen: React.FC<ScreenProps> = ({ setScreen }) => {

  return (
    <Box id="ranking-room">
      <h2>Ranking de jogadores</h2>

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>Voltar ao menu</Button>

    </Box>
  );
}