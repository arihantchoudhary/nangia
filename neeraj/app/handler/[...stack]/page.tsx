import { StackHandler } from "@stackframe/stack";
import { StackServerApp } from "@stackframe/stack";

const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
});

export default function Handler(props: { params: { stack: string[] } }) {
  return <StackHandler fullPage app={stackServerApp} {...props} />;
}