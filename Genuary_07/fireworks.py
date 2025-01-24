#!/usr/bin/env python3
from asciimatics.effects import Stars, Print
from asciimatics.particles import RingFirework, SerpentFirework, StarFirework, PalmFirework
from asciimatics.renderers import Rainbow, Fire
from asciimatics.scene import Scene
from asciimatics.screen import Screen
from asciimatics.exceptions import ResizeScreenError
from random import randint, choice
import sys
import time

class EnhancedFireworkShow:
    def __init__(self, density=50, duration=500):
        self.density = density
        self.duration = duration
        
    def create_effects(self, screen):
        # Create a denser star background
        effects = [
            Stars(screen, screen.width * 2),  # Doubled star density
            Stars(screen, screen.width * 2, start_frame=20)  # Second layer of stars
        ]
        
        # Enhanced firework types with varied parameters
        firework_types = [
            # Traditional palm pattern
            (PalmFirework, 30, 40, "Large Palm"),
            (PalmFirework, 20, 35, "Quick Palm"),
            # Star burst pattern
            (StarFirework, 25, 45, "Big Star"),
            (StarFirework, 20, 30, "Fast Star"),
            # Ring pattern
            (RingFirework, 30, 40, "Large Ring"),
            (RingFirework, 20, 35, "Quick Ring"),
            # Serpentine pattern
            (SerpentFirework, 35, 45, "Long Snake"),
            (SerpentFirework, 25, 35, "Fast Snake"),
        ]
        
        # Create multiple layers of fireworks
        for layer in range(3):  # Three layers of fireworks
            for _ in range(self.density):
                firework, min_life, max_life, _ = choice(firework_types)
                
                # Vary positions based on layer
                x = randint(0, screen.width)
                y = randint(screen.height // (4 + layer), 
                          screen.height * (3 + layer) // 4)
                
                # Stagger start times for continuous show
                start_frame = randint(0, self.duration - max_life)
                
                # Add some variation to firework properties
                size_variation = randint(-5, 5)
                
                effects.append(
                    firework(
                        screen,
                        x, y,
                        randint(min_life + size_variation, 
                               max_life + size_variation),
                        start_frame=start_frame
                    )
                )
                
                # Add extra bursts for more density
                if randint(0, 1) == 1:
                    effects.append(
                        firework(
                            screen,
                            x + randint(-10, 10),
                            y + randint(-5, 5),
                            randint(min_life, max_life),
                            start_frame=start_frame + randint(5, 15)
                        )
                    )
        
        return effects

def run_show(screen):
    # Create an enhanced show
    show = EnhancedFireworkShow(density=50, duration=500)
    effects = show.create_effects(screen)
    scenes = [Scene(effects, -1)]
    screen.play(scenes, stop_on_resize=True, repeat=False)

def main():
    print("\n🎆 Starting Enhanced Fireworks Show! 🎆\n")
    while True:
        try:
            print("\033[2J\033[H")  # Clear screen
            Screen.wrapper(run_show)
            
            response = input("\n✨ Press ENTER for another show or 'q' to quit: ")
            if response.lower() == 'q':
                print("\n🎆 Thanks for watching! 🎆\n")
                sys.exit(0)
                
        except ResizeScreenError:
            pass
        except KeyboardInterrupt:
            print("\n\n🎆 Show ended! 🎆\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
