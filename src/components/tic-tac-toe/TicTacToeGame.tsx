"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Circle, RotateCcw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Player = 'X' | 'O' | null;

const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  useEffect(() => {
    const checkWinner = () => {
      for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    };

    const newWinner = checkWinner();
    if (newWinner) {
      setWinner(newWinner);
    } else if (board.every(square => square !== null)) {
      setIsDraw(true);
    }
  }, [board, winningCombos]);

  const handleClick = (index: number) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <Button
        variant="outline"
        className="w-24 h-24 md:w-32 md:h-32 text-4xl md:text-6xl flex items-center justify-center bg-card hover:bg-card/80"
        onClick={() => handleClick(index)}
      >
        {value === 'X' && <X className="w-16 h-16 text-primary" />}
        {value === 'O' && <Circle className="w-16 h-16 text-accent" />}
      </Button>
    );
  };
  
  const getStatusMessage = () => {
    if (winner) return `Winner: Player ${winner}!`;
    if (isDraw) return "It's a Draw!";
    return `Next Player: ${currentPlayer}`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
       <div className="absolute top-4 right-4 flex gap-2">
            <Button onClick={resetGame} variant="ghost" size="icon">
                <RotateCcw />
                <span className="sr-only">Reset Game</span>
            </Button>
            <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft />
                <span className="sr-only">Back</span>
            </Button>
        </div>
      <h1 className="text-5xl font-headline text-destructive mb-8">Tic Tac Toe</h1>
      
      <div className="grid grid-cols-3 gap-2 mb-8">
        {Array.from({ length: 9 }).map((_, i) => renderSquare(i))}
      </div>

      <div className="text-2xl font-semibold text-foreground">
        {getStatusMessage()}
      </div>

    </div>
  );
};

export default TicTacToeGame;
