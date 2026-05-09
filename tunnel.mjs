import 'dotenv/config';
import ngrok from '@ngrok/ngrok';

const listener = await ngrok.forward({
  addr: 3000,
  authtoken: process.env.NGROK_AUTHTOKEN,
  domain: 'imply-enable-mobility.ngrok-free.dev',
});

console.log(`Tunnel: ${listener.url()}`);

process.stdin.resume();
