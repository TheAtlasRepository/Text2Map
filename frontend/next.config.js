/** @type {import('next').NextConfig} */
const nextConfig = {}

const path = require('path');

module.exports = {
 webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
 },
};

module.exports = nextConfig
