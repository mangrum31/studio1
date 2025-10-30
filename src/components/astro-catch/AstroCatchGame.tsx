"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rocket, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"

// Asteroid Icon
const AsteroidIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.864 3.652c.632-.303 1.346.164 1.374.876l.248 6.42a.4.4 0 0 0 .54.392l5.48-2.51c.693-.317 1.4.244 1.25 1.01l-1.39 7.02a1 1 0 0 1-1.222.75l-6.17-1.742a.4.4 0 0 0-.44.44l1.743 6.17c.25.877-.52 1.647-1.398 1.398l-7.02-1.39c-.766-.15-1.327-.857-1.01-1.25l2.51-5.48a.4.4 0 0 0-.392-.54l-6.42-.248c-.712-.028-1.18-0.742-.876-1.374l3.65-7.56C8.2 3.96 8.96 3.5 9.78 3.5c1.292 0 2.585.15 3.084.152z" />
    </svg>
);


// Constants
const PLAYER_SIZE = 60;
const PLAYER_SPEED = 10;
const ITEM_SIZE = 30;
const ITEM_SPEED = 4;
const ITEM_SPAWN_INTERVAL = 800;

type Item = {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'asteroid';
};

export default function AstroCatchGame() {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
    const [score, setScore] = useState(0);
    const [renderPlayerPos, setRenderPlayerPos] = useState({ x: 0, y: 0 });
    const [renderItems, setRenderItems] = useState<Item[]>([]);

    const playerPos = useRef({ x: 0, y: 0 });
    const items = useRef<Item[]>([]);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const dimensions = useRef({ width: 0, height: 0 });
    const gameLoopRef = useRef<number>();
    const lastItemSpawn = useRef<number>(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const resetGame = useCallback(() => {
        if (!gameAreaRef.current) return;
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        dimensions.current = { width, height };

        setScore(0);
        const initialPlayerPos = { x: width / 2 - PLAYER_SIZE / 2, y: height - PLAYER_SIZE - 20 };
        playerPos.current = initialPlayerPos;
        items.current = [];

        setRenderPlayerPos(initialPlayerPos);
        setRenderItems([]);
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (gameAreaRef.current) {
                const { width, height } = gameAreaRef.current.getBoundingClientRect();
                dimensions.current = { width, height };
                if (gameState !== 'playing') {
                   resetGame();
                }
            }
        };
        window.addEventListener('resize', onResize);
        onResize();
        return () => window.removeEventListener('resize', onResize);
    }, [gameState, resetGame]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        setGameState('playing');
    }, [resetGame]);

    const gameLoop = useCallback(() => {
        let newX = playerPos.current.x;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) { newX -= PLAYER_SPEED; }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) { newX += PLAYER_SPEED; }
        playerPos.current.x = Math.max(0, Math.min(dimensions.current.width - PLAYER_SIZE, newX));

        if (Date.now() - lastItemSpawn.current > ITEM_SPAWN_INTERVAL) {
            items.current.push({
                id: Date.now() + Math.random(),
                x: Math.random() * (dimensions.current.width - ITEM_SIZE),
                y: -ITEM_SIZE,
                type: Math.random() > 0.3 ? 'star' : 'asteroid',
            });
            lastItemSpawn.current = Date.now();
        }

        const updatedItems: Item[] = [];
        let isGameOver = false;

        const playerRect = { ...playerPos.current, width: PLAYER_SIZE, height: PLAYER_SIZE };

        for (const item of items.current) {
            item.y += ITEM_SPEED;
            const itemRect = { x: item.x, y: item.y, width: ITEM_SIZE, height: ITEM_SIZE };

            if (playerRect.x < itemRect.x + itemRect.width && playerRect.x + playerRect.width > itemRect.x && playerRect.y < itemRect.y + itemRect.height && playerRect.y + playerRect.height > itemRect.y) {
                if (item.type === 'star') {
                    setScore(s => s + 10);
                } else {
                    isGameOver = true;
                    updatedItems.push(item);
                }
            } else if (item.y < dimensions.current.height) {
                updatedItems.push(item);
            }
        }

        items.current = updatedItems;
        setRenderPlayerPos({ ...playerPos.current });
        setRenderItems([...items.current]);
        
        if (isGameOver) {
            setGameState('over');
        } else {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
    }, []);

    useEffect(() => {
        if (gameState === 'playing') {
            lastItemSpawn.current = Date.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, gameLoop]);

    return (
        <div className="relative w-full max-w-4xl aspect-[4/3] bg-background/50 rounded-lg shadow-2xl overflow-hidden border-2 border-border select-none" ref={gameAreaRef}>
            <div className="absolute top-4 left-4 text-2xl font-headline text-primary z-10 drop-shadow-md">
                Score: {score}
            </div>

            {gameState === 'start' && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-headline text-primary mb-4">Astro Catch</h1>
                    <p className="text-lg text-foreground/80 mb-8">Use arrow keys to catch stars & avoid asteroids!</p>
                    <Button onClick={startGame} size="lg" className="font-headline bg-primary text-primary-foreground hover:bg-primary/90">Start Game</Button>
                </div>
            )}
            {gameState === 'over' && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4 text-center">
                    <Menubar className="absolute top-4 right-4 bg-transparent border-none">
                        <MenubarMenu>
                            <MenubarTrigger>Menu</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={startGame}>Home</MenubarItem>
                                <MenubarItem onClick={startGame}>Quit</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                    <h1 className="text-5xl md:text-6xl font-headline text-destructive mb-4">Game Over</h1>
                    <p className="text-2xl text-foreground mb-2">Final Score: <span className="text-primary font-bold">{score}</span></p>
                    <Button onClick={startGame} size="lg" className="font-headline mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Play Again</Button>
                </div>
            )}

            <div
                className="absolute text-foreground"
                style={{ width: PLAYER_SIZE, height: PLAYER_SIZE, left: renderPlayerPos.x, top: renderPlayerPos.y }}
            >
                <Rocket className="w-full h-full drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </div>
            
            {renderItems.map(item => (
                <div
                    key={item.id}
                    className={cn("absolute", item.type === 'star' ? 'text-accent' : 'text-muted-foreground')}
                    style={{ width: ITEM_SIZE, height: ITEM_SIZE, left: item.x, top: item.y }}
                >
                    {item.type === 'star' ? <Star fill="currentColor" className="w-full h-full drop-shadow-[0_0_8px_hsl(var(--accent))]" /> : <AsteroidIcon className="w-full h-full" />}
                </div>
            ))}
        </div>
    );
}
