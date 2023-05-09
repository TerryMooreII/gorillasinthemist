import { Config } from '@stencil/core';
import tailwind, { tailwindHMR, TailwindConfig } from 'stencil-tailwind-plugin';
import cfg from './tailwind.config';

const twConfigurationFn = (filename: string, config: TailwindConfig): TailwindConfig => {
    return {
      ...config,
      ...cfg,
      safelist: [
        'bg-red-500',
        'text-3xl',
        'lg:text-4xl',
        'lg:w-1/2'
      ]
    };
};
const opts = {
  tailwindConf: twConfigurationFn
};
// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  plugins: [
    tailwind(opts),
    tailwindHMR(),
  ],
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: 'https://myapp.local/',
      copy: [
        { src: 'CNAME', dest: 'CNAME' },
        { src: '.nojekyll', dest: '.nojekyll' }
      ]
    },
  ],
  env: {
    teamId: '5059',
    leagueId: '2502',
    teamName: 'Gorillas in the Mist Hockey Club',
    teamDescription: 'Just a Bunch of Beer League Knuckledraggers',
    logo: 'assets/logo.svg',
    beerRules: '/assets/beer-rules.md'
  //   teamId: '5148',
  //   leagueId: '2525',
  //   teamName: 'Fighting Moose Knuckles Hockey Club',
  //   teamDescription: '',
  //   logo: 'assets/logo.svg',
  //   beerRules: '/assets/beer-rules.md',
  //   beerURL: ''
  }
};
