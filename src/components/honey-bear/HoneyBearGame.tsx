"use client";

import React from 'react';
import GameEngine from '@/components/game-engine/GameEngine';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const gameConfig = {
    player: {
        component: BearIcon,
        size: 60,
        speed: 10,
        className: "w-full h-full text-foreground drop-shadow-[0_0_8px_hsl(var(--primary))]",
        style: { color: 'hsl(30 60% 50%)' }
    },
    items: [
        {
            type: 'honey',
            component: HoneyPotIcon,
            size: 30,
            className: "w-full h-full text-yellow-400 drop-shadow-[0_0_8px_#facc15]"
        },
        {
            type: 'bee',
            component: BeeIcon,
            size: 30,
            className: "w-full h-full text-slate-400"
        }
    ],
    itemTypes: {
        good: 'honey',
        bad: 'bee'
    },
    spawnInterval: 800,
    itemSpeed: 4,
    goodItemChance: 0.7,
    sounds: {
        catch: 'https://cdn.pixabay.com/audio/2022/03/15/audio_5b36ba8059.mp3',
        gameOver: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c82f5923.mp3',
        start: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c6686a.mp3',
    }
};

export default function HoneyBearGame({ onBack }: { onBack: () => void }) {
    return (
        <GameEngine
            gameConfig={gameConfig}
            onBack={onBack}
            title="Honey Bear"
            instructions="Use arrow keys to catch honey & avoid bees!"
            theme="accent"
        >
            {(score) => (
                <>
                    <div className="absolute top-4 left-4 text-2xl font-headline text-accent z-10 drop-shadow-md">
                        Score: {score}
                    </div>
                    <Button onClick={onBack} variant="ghost" size="icon" className="absolute top-2 right-2 z-30">
                        <ArrowLeft />
                    </Button>
                </>
            )}
        </GameEngine>
    );
}
