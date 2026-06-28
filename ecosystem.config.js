module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "./apps/backend",
      script: "dist/main.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
      },
    },
    {
      name: "frontend",
      cwd: "./apps/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
