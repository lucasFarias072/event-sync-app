

module.exports = {
  theme: {
    extend: {
      colors: {
        // Adicionando uma nova cor simples
        'petroleo': '#006D6D',

        // Adicionando uma cor com diferentes "níveis" (como o Tailwind faz nativamente)
        'azul-claro': {
          100: '#E0F2F2',
          300: '#80BABA',
          500: '#008080',
          700: '#004D4D',
          900: '#002626',
        },
      },
    },
  },
  plugins: [],
}
