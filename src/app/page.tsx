"use client";

import React, { useState } from 'react';
import AstroCatchGame from '@/components/astro-catch/AstroCatchGame';
import HoneyBearGame from '@/components/honey-bear/HoneyBearGame';
import TicTacToeGame from '@/components/tic-tac-toe/TicTacToeGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Rocket, Swords } from 'lucide-react';

type Game = 'astro-catch' | 'honey-bear' | 'tic-tac-toe';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const renderGame = () => {
    switch (selectedGame) {
      case 'astro-catch':
        return <AstroCatchGame onBack={() => setSelectedGame(null)} />;
      case 'honey-bear':
        return <HoneyBearGame onBack={() => setSelectedGame(null)} />;
      case 'tic-tac-toe':
        return <TicTacToeGame onBack={() => setSelectedGame(null)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-6xl font-headline text-primary mb-8">Select a Game</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-card/70 hover:bg-card transition-all duration-200 cursor-pointer transform hover:scale-105" onClick={() => setSelectedGame('astro-catch')}>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Rocket className="w-20 h-20 text-primary mb-4" />
                  <h2 className="text-3xl font-headline text-primary">Astro Catch</h2>
                  <p className="text-foreground/80 mt-2">Catch stars, avoid asteroids!</p>
                </CardContent>
              </Card>
              <Card className="bg-card/70 hover:bg-card transition-all duration-200 cursor-pointer transform hover:scale-105" onClick={() => setSelectedGame('honey-bear')}>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <PawPrint className="w-20 h-20 text-accent mb-4" />
                  <h2 className="text-3xl font-headline text-accent">Honey Bear</h2>
                  <p className="text-foreground/80 mt-2">Catch honey, avoid bees!</p>
                </CardContent>
              </Card>
              <Card className="bg-card/70 hover:bg-card transition-all duration-200 cursor-pointer transform hover:scale-105" onClick={() => setSelectedGame('tic-tac-toe')}>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Swords className="w-20 h-20 text-destructive mb-4" />
                  <h2 className="text-3xl font-headline text-destructive">Tic Tac Toe</h2>
                  <p className="text-foreground/80 mt-2">A classic game of X's and O's.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
      {renderGame()}
    </main>
  );
}
