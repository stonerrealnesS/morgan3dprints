module.exports = {
  apps: [
    {
      name: "morgan3dprints",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/morgan3dprints",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Restart if memory exceeds 512MB
      max_memory_restart: "512M",
      // Log files
      out_file: "/var/log/pm2/morgan3dprints-out.log",
      error_file: "/var/log/pm2/morgan3dprints-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      restart_delay: 2000,
    },
  ],
};
