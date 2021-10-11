module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'startersaas',
      script: './build.prod.js',
      output: '~/.pm2/logs/startersaas.log',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],
  deploy: {
    // "production" is the environment name
    production: {
      // SSH user
      user: 'ubuntu',
      // SSH host
      host: ['x.x.x.x'],
      // SSH options with no command-line flag, see 'man ssh'
      // can be either a single string or an array of strings
      ssh_options: 'StrictHostKeyChecking=no',
      // GIT remote/branch
      ref: 'origin/develop',
      // GIT remote
      repo: 'git@gitlab.com:devinterface/startersaas-node-api.git',
      // path in the server
      path: '/home/ubuntu/webapps/startersaas',
      // Post-setup commands or path to a script on the host machine
      // eg: placing configurations in the shared dir etc
      'post-deploy': 'npm install && pm2 startOrRestart startersaas.config.js --env production'
    }
  }
}
