import { Navbar } from "../components/Navbar";

export function Home() {
  return (
    <div className="flex flex-1 flex-col bg-base-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Hello World</h1>
          <p className="text-base-content/70">You are signed in</p>
        </div>
      </main>
    </div>
  );
}
