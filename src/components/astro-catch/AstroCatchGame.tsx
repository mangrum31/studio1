"use client";

import React from 'react';
import GameEngine from '@/components/game-engine/GameEngine';
import { Rocket, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AsteroidIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.864 3.652c.632-.303 1.346.164 1.374.876l.248 6.42a.4.4 0 0 0 .54.392l5.48-2.51c.693-.317 1.4.244 1.25 1.01l-1.39 7.02a1 1 0 0 1-1.222.75l-6.17-1.742a.4.4 0 0 0-.44.44l1.743 6.17c.25.877-.52 1.647-1.398 1.398l-7.02-1.39c-.766-.15-1.327-.857-1.01-1.25l2.51-5.48a.4.4 0 0 0-.392-.54l-6.42-.248c-.712-.028-1.18-0.742-.876-1.374l3.65-7.56C8.2 3.96 8.96 3.5 9.78 3.5c1.292 0 2.585.15 3.084.152z" />
    </svg>
);

const gameConfig = {
    player: {
        component: Rocket,
        size: 60,
        speed: 10,
        className: "w-full h-full drop-shadow-[0_0_8px_hsl(var(--primary))]"
    },
    items: [
        {
            type: 'star',
            component: Star,
            size: 30,
            className: "w-full h-full text-accent drop-shadow-[0_0_8px_hsl(var(--accent))]",
            fill: "currentColor"
        },
        {
            type: 'asteroid',
            component: AsteroidIcon,
            size: 30,
            className: "w-full h-full text-muted-foreground"
        }
    ],
    itemTypes: {
        good: 'star',
        bad: 'asteroid'
    },
    baseSpawnInterval: 1200,
    baseItemSpeed: 2,
    goodItemChance: 0.7,
    sounds: {
        catch: 'https://cdn.pixabay.com/audio/2022/03/15/audio_5b36ba8059.mp3',
        gameOver: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c82f5923.mp3',
        start: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c6686a.mp3',
    }
};

export default function AstroCatchGame({ onBack }: { onBack: () => void }) {
    return (
        <GameEngine
            gameConfig={gameConfig}
            onBack={onBack}
            title="Astro Catch"
            instructions="Use arrow keys to catch stars & avoid asteroids!"
            showDifficulty
        >
            {(score, level) => (
                <>
                    <div className="absolute top-4 left-4 text-lg md:text-2xl font-headline text-primary z-10 drop-shadow-md flex items-center gap-4">
                        <span>Score: {score}</span>
                        <span>Level: {level}</span>
                    </div>
                    <Button onClick={onBack} variant="ghost" size="icon" className="absolute top-2 right-2 z-30">
                        <ArrowLeft />
                    </Button>
                </>
            )}
        </GameEngine>
    );
}

    