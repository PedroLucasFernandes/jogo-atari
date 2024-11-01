import { Router } from 'express';
const router = Router();

router.get('/game', (req, res) => {
    res.json({ message: 'Bem-vindo ao jogo!' });
});

export default router;