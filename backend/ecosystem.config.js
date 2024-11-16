module.exports = {
    apps: [
        {
            name: 'jogo-atari-server',
            script: 'dist/index.js',
            interpreter: 'ts-node',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};