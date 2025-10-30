"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type ItemConfig = {
    type: string;
    component: React.ElementType;
    size: number;
    className?: string;
    fill?: string;
};

type PlayerConfig = {
    component: React.ElementType;
    size: number;
    speed: number;
    className?: string;
    style?: React.CSSProperties;
};

type GameConfig = {
    player: PlayerConfig;
    items: ItemConfig[];
    itemTypes: {
        good: string;
        bad: string;
    };
    baseSpawnInterval: number;
    baseItemSpeed: number;
    goodItemChance: number;
    sounds: {
        catch: string;
        gameOver: string;
        start: string;
    };
};

type Item = {
  id: number;
  x: number;
  y: number;
  type: string;
};

type GameEngineProps = {
    gameConfig: GameConfig;
    onBack: () => void;
    title: string;
    instructions: string;
    theme?: 'primary' | 'accent';
    showDifficulty?: boolean;
    children: (score: number, difficulty: number) => React.ReactNode;
};

const useGameSounds = (soundUrls: GameConfig['sounds']) => {
    const sounds = useRef<{ [key: string]: HTMLAudioElement | null }>({});

    useEffect(() => {
        Object.entries(soundUrls).forEach(([name, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.load();
            sounds.current[name] = audio;
        });

        return () => {
             Object.values(sounds.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });
        };
    }, [soundUrls]);

    const playSound = useCallback((name: keyof GameConfig['sounds']) => {
        const sound = sounds.current[name];
        if (sound) {
            sound.currentTime = 0;
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => console.error(`Error playing sound ${name}:`, error));
            }
        }
    }, []);

    return playSound;
};

export default function GameEngine({ gameConfig, onBack, title, instructions, theme = 'primary', showDifficulty = false, children }: GameEngineProps) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState(50);
    const [renderPlayerPos, setRenderPlayerPos] = useState({ x: 0, y: 0 });
    const [renderItems, setRenderItems] = useState<Item[]>([]);

    const playerPos = useRef({ x: 0, y: 0 });
    const items = useRef<Item[]>([]);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const dimensions = useRef({ width: 0, height: 0 });
    const gameLoopRef = useRef<number>();
    const lastItemSpawn = useRef<number>(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const playSound = useGameSounds(gameConfig.sounds);

    const { player: playerConfig, items: itemConfigs, itemTypes, baseSpawnInterval, baseItemSpeed, goodItemChance } = gameConfig;
    
    const spawnInterval = baseSpawnInterval / (1 + (difficulty - 1) / 5);
    const itemSpeed = baseItemSpeed * (1 + (difficulty - 1) / 5);

    const resetGame = useCallback(() => {
        if (!gameAreaRef.current) return;
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        dimensions.current = { width, height };

        setScore(0);
        const initialPlayerPos = { x: width / 2 - playerConfig.size / 2, y: height - playerConfig.size - 20 };
        playerPos.current = initialPlayerPos;
        items.current = [];

        setRenderPlayerPos(initialPlayerPos);
        setRenderItems([]);
    }, [playerConfig.size]);

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
        playSound('start');
    }, [resetGame, playSound]);

    const gameLoop = useCallback(() => {
        let newX = playerPos.current.x;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) { newX -= playerConfig.speed; }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) { newX += playerConfig.speed; }
        playerPos.current.x = Math.max(0, Math.min(dimensions.current.width - playerConfig.size, newX));

        if (Date.now() - lastItemSpawn.current > spawnInterval) {
            const itemType = Math.random() > (1 - goodItemChance) ? itemTypes.good : itemTypes.bad;
            const config = itemConfigs.find(c => c.type === itemType);
            if(config) {
                items.current.push({
                    id: Date.now() + Math.random(),
                    x: Math.random() * (dimensions.current.width - config.size),
                    y: -config.size,
                    type: itemType,
                });
                lastItemSpawn.current = Date.now();
            }
        }

        const updatedItems: Item[] = [];
        let isGameOver = false;

        const playerRect = { ...playerPos.current, width: playerConfig.size, height: playerConfig.size };

        for (const item of items.current) {
            item.y += itemSpeed;
            const itemConfig = itemConfigs.find(c => c.type === item.type);
            if (!itemConfig) continue;

            const itemRect = { x: item.x, y: item.y, width: itemConfig.size, height: itemConfig.size };

            if (playerRect.x < itemRect.x + itemRect.width && playerRect.x + playerRect.width > itemRect.x && playerRect.y < itemRect.y + itemRect.height && playerRect.y + playerRect.height > itemRect.y) {
                if (item.type === itemTypes.good) {
                    setScore(s => s + 10);
                    playSound('catch');
                } else {
                    isGameOver = true;
                    playSound('gameOver');
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
    }, [playerConfig, itemConfigs, itemTypes, spawnInterval, itemSpeed, goodItemChance, playSound]);

    useEffect(() => {
        if (gameState === 'playing') {
            lastItemSpawn.current = Date.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, gameLoop]);

    const renderItem = (item: Item) => {
        const config = itemConfigs.find(c => c.type === item.type);
        if (!config) return null;
        const IconComponent = config.component;
        return (
            <div
                key={item.id}
                className={cn("absolute", config.className)}
                style={{ width: config.size, height: config.size, left: item.x, top: item.y }}
            >
                <IconComponent className="w-full h-full" fill={config.fill} />
            </div>
        );
    }
    
    const PlayerComponent = playerConfig.component;

    return (
        <div className="relative w-full max-w-4xl aspect-[4/3] bg-background/50 rounded-lg shadow-2xl overflow-hidden border-2 border-border select-none" ref={gameAreaRef}>
            {children(score, difficulty)}

            {gameState === 'start' && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4 text-center">
                    <h1 className={cn("text-5xl md:text-7xl font-headline mb-4", theme === 'primary' ? 'text-primary' : 'text-accent')}>{title}</h1>
                    <p className="text-lg text-foreground/80 mb-8">{instructions}</p>
                    {showDifficulty && (
                         <div className="w-64 mb-8">
                            <Label htmlFor="difficulty" className="text-foreground/80 mb-2 block">Difficulty: {difficulty}</Label>
                            <Slider
                                id="difficulty"
                                min={1}
                                max={100}
                                step={1}
                                value={[difficulty]}
                                onValueChange={(value) => setDifficulty(value[0])}
                            />
                        </div>
                    )}
                    <Button onClick={startGame} size="lg" className={cn("font-headline", theme === 'primary' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-accent text-accent-foreground hover:bg-accent/90')}>Start Game</Button>
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
                    <p className="text-2xl text-foreground mb-2">Final Score: <span className={cn("font-bold", theme === 'primary' ? 'text-primary' : 'text-accent')}>{score}</span></p>
                    <Button onClick={startGame} size="lg" className={cn("font-headline mt-6", theme === 'primary' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-accent text-accent-foreground hover:bg-accent/90')}>Play Again</Button>
                </div>
            )}

            <div
                className={cn("absolute text-foreground", playerConfig.className)}
                style={{ width: playerConfig.size, height: playerConfig.size, left: renderPlayerPos.x, top: renderPlayerPos.y, ...playerConfig.style }}
            >
                <PlayerComponent className="w-full h-full" />
            </div>
            
            {renderItems.map(renderItem)}
        </div>
    );
}
