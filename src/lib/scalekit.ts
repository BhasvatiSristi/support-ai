import { Scalekit } from '@scalekit-sdk/node';

console.log(process.env.SCALEKIT_ENVIRONMENT_URL)
console.log(process.env.SCALEKIT_CLIENT_ID)
console.log(process.env.SCALEKIT_CLIENT_SECRET)

// Initialize the Scalekit client with your credentials
export const scalekit = new Scalekit(
  process.env.SCALEKIT_ENVIRONMENT_URL!,
  process.env.SCALEKIT_CLIENT_ID!,
  process.env.SCALEKIT_CLIENT_SECRET!
);