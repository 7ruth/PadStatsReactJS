var config = {};


config.twitter.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || 'AUTH0_CLIENT_ID';
config.twitter.AUTH0_DOMAIN=  process.env.AUTH0_DOMAIN || 'AUTH0_DOMAIN';
config.GAPI_KEY=  process.env.GAPI_KEY || 'GAPI_KEY';

module.exports = config;
