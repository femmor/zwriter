import { Button } from "@/components/ui/button";

export default function Home() {

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold">Welcome to ZWriter</h1>
        <p>Your AI-powered writing assistant.</p>
        <Button>Get Started</Button>
      </div>
    </div>
  );
}
