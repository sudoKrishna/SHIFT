export {};

declare global {
  interface Window {
    solana?: any; // or use PhantomProvider interface if typing strictly
  }
}
