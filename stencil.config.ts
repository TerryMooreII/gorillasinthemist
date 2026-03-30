import * as dotenv from 'dotenv'
dotenv.config()
import { Config } from '@stencil/core';
import tailwind, { tailwindHMR } from 'stencil-tailwind-plugin';
// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  plugins: [
    tailwind({ tailwindCssPath: './src/tailwind.css' }),
    tailwindHMR(),
  ],
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: process.env.BASE_URL || 'https://myapp.local/',
      copy: [
        { src: 'CNAME', dest: 'CNAME', warn: false },
        { src: '.nojekyll', dest: '.nojekyll' }
      ]
    },
  ],
  env: {
    baseUrl: process.env.BASE_URL,
    teamId: process.env.TEAM_ID,
    leagueId: process.env.LEAGUE_ID,
    teamName: process.env.TEAM_NAME,
    teamDescription: process.env.TEAM_DESCRIPTION,
    logo: process.env.LOGO_FILE,
    beerRules: process.env.BEER_RULES_MD_FILE,
    beerCsv: process.env.BEER_CSV,
    roster: process.env.ROSTER_MD
  }
};
