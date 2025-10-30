import AstroCatchGame from '@/components/astro-catch/AstroCatchGame';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
      <AstroCatchGame />
    </main>
  );
}
