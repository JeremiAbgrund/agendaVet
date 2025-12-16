import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
    baseUrl: 'http://localhost:8080',
    supportFile: false
  },
  video: false,
  screenshotOnRunFailure: true
})
