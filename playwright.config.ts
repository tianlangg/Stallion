import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir:'./e2e', testMatch:'*.e2e.ts', use:{ ...devices['iPhone 13'], viewport:{width:375,height:812}, browserName:'chromium', channel:'chrome', baseURL:'http://127.0.0.1:3000' }, reporter:'list' });
