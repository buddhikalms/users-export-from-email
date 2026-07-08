module.exports = {
  apps: [
    {
      name: "omazync",
      cwd: "/var/www/omazync",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "750M",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      error_file: "/var/log/pm2/omazync-error.log",
      out_file: "/var/log/pm2/omazync-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 10000,
      wait_ready: false,
    },
  ],
};
