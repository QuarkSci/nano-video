// Brand tokens — Science | MuhammadYusuf (@nano_scientist)
export const brand = {
  bg: '#07090D',
  bg2: '#0D1118',
  ink: '#F2F0EB',      // warm white (logo white)
  dim: 'rgba(242,240,235,0.45)',
  line: 'rgba(242,240,235,0.14)',
  handle: '@nano_scientist',
  series: 'SCIENCE',
};
// accent per topic — base stays black/white
export const accents = {
  sun: {main: '#FFB547', hot: '#FFE2A8', deep: '#E8590C'},
  bio: {main: '#5BE3A6', hot: '#C9FFE6', deep: '#0E9F6E'},
  space: {main: '#9B8CFF', hot: '#E0DBFF', deep: '#5B3FD9'},
  water: {main: '#46D3F0', hot: '#C8F5FF', deep: '#0B7FA6'},
};
export type Accent = typeof accents.sun;
