"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"

// Icons
const BearIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16.5 10.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-9 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm4.5 5.5c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
);

const HoneyPotIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20,8h-3.33C16.15,6.23,14.26,5,12,5S7.85,6.23,7.33,8H4C3.45,8,3,8.45,3,9v2c0,1.1,0.9,2,2,2h1v3.38 c-1.16,0.39-2,1.51-2,2.81V21h12v-2.81c0-1.3-0.84-2.42-2-2.81V13h1c1.1,0,2-0.9,2-2V9C21,8.45,20.55,8,20,8z M15,13v2.81 c-1.16,0.39-2,1.51-2,2.81V19h-2v-0.38c0-1.3-0.84-2.42-2-2.81V13h6V13z M12,7c1.1,0,2,0.9,2,2H10C10,7.9,10.9,7,12,7z" />
    </svg>
);

const BeeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.25,10H16v1.5H13.5v2H16v1.5H13.5v2H16v1.5H13.25A3.25,3.25,0,0,1,10,19.75V18.5a1.75,1.75,0,0,0,1.75-1.75v-2a1.75,1.75,0,0,0-1.75-1.75V11.5A3.25,3.25,0,0,1,13.25,8.25V7H11.5V5.5H13v-2A1.5,1.5,0,0,1,14.5,2h1a1.5,1.5,0,0,1,1.5,1.5v2h1.5V7H17v1.25A3.25,3.25,0,0,1,13.25,10M3,11.5a2,2,0,0,0,2,2h3a2,2,0,0,0,2-2v-1a2,2,0,0,0-2-2H5a2,2,0,0,0-2,2v1z" />
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
  type: 'honey' | 'bee';
};

export default function HoneyBearGame({ onBack }: { onBack: () => void }) {
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
                type: Math.random() > 0.3 ? 'honey' : 'bee',
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
                if (item.type === 'honey') {
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
            <div className="absolute top-4 left-4 text-2xl font-headline text-accent z-10 drop-shadow-md">
                Score: {score}
            </div>
             <Button onClick={onBack} variant="ghost" size="icon" className="absolute top-2 right-2 z-30">
                <ArrowLeft />
            </Button>

            {gameState === 'start' && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-headline text-accent mb-4">Honey Bear</h1>
                    <p className="text-lg text-foreground/80 mb-8">Use arrow keys to catch honey & avoid bees!</p>
                    <Button onClick={startGame} size="lg" className="font-headline bg-accent text-accent-foreground hover:bg-accent/90">Start Game</Button>
                </div>
            )}
            {gameState === 'over' && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4 text-center">
                    <Menubar className="absolute top-4 right-4 bg-transparent border-none">
                        <MenubarMenu>
                            <MenubarTrigger>Menu</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={onBack}>Home</MenubarItem>
                                <MenubarItem onClick={() => { setGameState('start'); resetGame(); }}>Quit</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                    <h1 className="text-5xl md:text-6xl font-headline text-destructive mb-4">Game Over</h1>
                    <p className="text-2xl text-foreground mb-2">Final Score: <span className="text-accent font-bold">{score}</span></p>
                    <Button onClick={startGame} size="lg" className="font-headline mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Play Again</Button>
                </div>
            )}

            <div
                className="absolute text-foreground"
                style={{ width: PLAYER_SIZE, height: PLAYER_SIZE, left: renderPlayerPos.x, top: renderPlayerPos.y, color: 'hsl(30 60% 50%)' }}
            >
                <BearIcon className="w-full h-full drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </div>
            
            {renderItems.map(item => (
                <div
                    key={item.id}
                    className={cn("absolute", item.type === 'honey' ? 'text-yellow-400' : 'text-slate-400')}
                    style={{ width: ITEM_SIZE, height: ITEM_SIZE, left: item.x, top: item.y }}
                >
                    {item.type === 'honey' ? <HoneyPotIcon className="w-full h-full drop-shadow-[0_0_8px_#facc15]" /> : <BeeIcon className="w-full h-full" />}
                </div>
            ))}
        </div>
    );
}
