"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Circle, RotateCcw, ArrowLeft, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type Player = 'X' | 'O';
type Square = Player | null;
type GameMode = 'player' | 'computer';

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const checkWinner = (board: Square[]): Player | null => {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const minimax = (newBoard: Square[], player: Player, level: number, human: Player, computer: Player): { score: number, index?: number } => {
  const availableSpots = newBoard.map((s, i) => s === null ? i : null).filter(s => s !== null);
  
  const winner = checkWinner(newBoard);
  if (winner === human) {
    return { score: -10 };
  } else if (winner === computer) {
    return { score: 10 };
  } else if (availableSpots.length === 0) {
    return { score: 0 };
  }

  // AI makes a mistake based on level
  if (Math.random() > level / 100) {
    const randomIndex = availableSpots[Math.floor(Math.random() * availableSpots.length)] as number;
    return { score: 0, index: randomIndex };
  }

  const moves: { score: number, index: number }[] = [];
  for (const spot of availableSpots) {
    const move = { index: spot as number, score: 0 };
    newBoard[spot as number] = player;

    if (player === computer) {
      const result = minimax(newBoard, human, level, human, computer);
      move.score = result.score;
    } else {
      const result = minimax(newBoard, computer, level, human, computer);
      move.score = result.score;
    }
    
    newBoard[spot as number] = null;
    moves.push(move);
  }

  let bestMove: { score: number, index: number };
  if (player === computer) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }
  return bestMove!;
};


const TicTacToeGame = ({ onBack }: { onBack: () => void }) => {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const [humanPlayer, setHumanPlayer] = useState<Player>('X');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Square>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('computer');
  const [difficulty, setDifficulty] = useState(50);
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  
  const computerPlayer = humanPlayer === 'X' ? 'O' : 'X';

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  }, []);
  
  const startGame = () => {
    resetGame();
    setGameState('playing');
  }

  const computerMove = useCallback((currentBoard: Square[]) => {
    if (winner || currentBoard.every(s => s !== null)) return;
    
    const bestMove = minimax(currentBoard, computerPlayer, difficulty, humanPlayer, computerPlayer);
    
    if (bestMove.index !== undefined) {
      const newBoard = [...currentBoard];
      newBoard[bestMove.index] = computerPlayer;
      setBoard(newBoard);
      setCurrentPlayer(humanPlayer);
    }
  }, [computerPlayer, humanPlayer, difficulty, winner]);

  useEffect(() => {
    const newWinner = checkWinner(board);
    if (newWinner) {
      setWinner(newWinner);
    } else if (board.every(square => square !== null)) {
      setIsDraw(true);
    } else if (gameMode === 'computer' && currentPlayer === computerPlayer) {
      // Add a small delay for the computer's move to feel more natural
      const timeoutId = setTimeout(() => computerMove(board), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [board, gameMode, currentPlayer, computerPlayer, computerMove]);

  const handleClick = (index: number) => {
    if (winner || board[index] || (gameMode === 'computer' && currentPlayer !== humanPlayer) || gameState !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <Button
        key={index}
        variant="outline"
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-4xl md:text-6xl flex items-center justify-center bg-card hover:bg-card/80 disabled:opacity-100 disabled:cursor-not-allowed"
        onClick={() => handleClick(index)}
        disabled={!!value || !!winner}
      >
        {value === 'X' && <X className="w-12 h-12 md:w-16 md:h-16 text-primary" />}
        {value === 'O' && <Circle className="w-12 h-12 md:w-16 md:h-16 text-accent" />}
      </Button>
    );
  };
  
  const getStatusMessage = () => {
    if (winner) return `Winner: ${winner === humanPlayer ? 'You' : 'Computer'}!`;
    if (isDraw) return "It's a Draw!";
    const next = gameMode === 'computer'
      ? (currentPlayer === humanPlayer ? 'Your' : "Computer's")
      : `Player ${currentPlayer}'s`
    return `${next} turn`;
  }

  if (gameState === 'start') {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-6xl font-headline text-destructive mb-8">Tic Tac Toe</h1>
            <Card className="p-4 md:p-6 bg-card/70 w-full max-w-sm">
                <CardContent className="flex flex-col gap-6 pt-6">
                    <div>
                        <Label className="text-lg">Game Mode</Label>
                        <RadioGroup defaultValue="computer" onValueChange={(val) => setGameMode(val as GameMode)} className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="computer" id="computer"/>
                                <Label htmlFor="computer" className="flex items-center gap-2"><Bot /> vs Computer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="player" id="player"/>
                                <Label htmlFor="player" className="flex items-center gap-2"><User /> vs Player</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     {gameMode === 'computer' && (
                        <>
                            <div>
                                <Label className="text-lg">Choose your side</Label>
                                <RadioGroup defaultValue="X" onValueChange={(val) => setHumanPlayer(val as Player)} className="flex gap-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="X" id="X"/>
                                        <Label htmlFor="X" className="flex items-center gap-2"><X className="w-5 h-5 text-primary"/> Player X</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="O" id="O"/>
                                        <Label htmlFor="O" className="flex items-center gap-2"><Circle className="w-5 h-5 text-accent"/> Player O</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="w-full">
                                <Label htmlFor="difficulty" className="text-lg">AI Difficulty: {difficulty}</Label>
                                <Slider
                                    id="difficulty"
                                    min={1} max={100} step={1}
                                    value={[difficulty]}
                                    onValueChange={(value) => setDifficulty(value[0])}
                                    className="mt-2"
                                />
                            </div>
                        </>
                    )}
                    <Button onClick={startGame} size="lg" className="font-headline bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-4">Start Game</Button>
                     <Button onClick={onBack} variant="link">Back to Home</Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
       <div className="absolute top-4 right-4 flex gap-2">
            <Button onClick={resetGame} variant="ghost" size="icon" title="Reset Game">
                <RotateCcw />
                <span className="sr-only">Reset Game</span>
            </Button>
            <Button onClick={() => setGameState('start')} variant="ghost" size="icon" title="Back to Settings">
                <ArrowLeft />
                <span className="sr-only">Back</span>
            </Button>
        </div>
      <h1 className="text-4xl md:text-5xl font-headline text-destructive mb-4">Tic Tac Toe</h1>
      
      <div className={cn("text-xl md:text-2xl font-semibold mb-4 h-8", winner || isDraw ? 'text-green-400' : 'text-foreground')}>
        {getStatusMessage()}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {Array.from({ length: 9 }).map((_, i) => renderSquare(i))}
      </div>

      {(winner || isDraw) && (
        <Button onClick={startGame} size="lg" className="font-headline bg-destructive text-destructive-foreground hover:bg-destructive/90">Play Again</Button>
      )}

    </div>
  );
};

export default TicTacToeGame;
