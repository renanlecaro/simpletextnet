module.exports = {
  servers: {
    magicpaperone: {
      host: '188.166.160.106',
      username: 'root',
      pem: '~/.ssh/id_rsa',
    },
  },

  app: {
    name: 'magicpaper',
    path: '../',

    servers: {
      magicpaperone: {},
    },

    deployCheckWaitTime: 300,
    buildOptions: {
      serverOnly: true,
    },

    env: {
      ROOT_URL: 'https://txt.lecaro.me',
      MONGO_URL: 'mongodb://mongodb/meteor',
      MONGO_OPLOG_URL: 'mongodb://mongodb/local',
      ENV: 'PRODUCTION',
    },

    docker: {
      image: 'abernix/meteord:node-12-base',
    },

    enableUploadProgressBar: true,
  },

  mongo: {
    version: '4.2.5',
    servers: {
      magicpaperone: {},
    },
  },
  proxy: {
    domains: 'txt.lecaro.me'
  }

};
