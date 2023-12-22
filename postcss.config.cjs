// postcss.config.cjs
module.exports = {
  plugins: [
    require('postcss-nesting'), // Assuming you've installed postcss-nesting
    require('tailwindcss'), // require tailwindcss
    require('autoprefixer'), // require autoprefixer
  ]
};


