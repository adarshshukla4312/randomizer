import MeowsSelector from '@/components/meows-selector';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center animated-gradient-bg py-12 px-4">
      <div className="w-full max-w-2xl">
        <MeowsSelector />
      </div>
    </main>
  );
}
