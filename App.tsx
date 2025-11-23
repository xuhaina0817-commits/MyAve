
import React, { useState, useEffect, useRef } from 'react';
import { CHARACTERS, initializeCharacterChat, initializeGroupChat, sendMessage } from './services/gemini';
import { Message, Sender, Session, Character } from './types';

// --- Constants ---
const STORAGE_KEY = 'mutsumi_chat_sessions_v4';
const USER_AVATAR_KEY = 'user_avatar_global';
const CHAR_AVATAR_KEY = 'char_avatars_map';
const GROUP_THEME_COLOR = '#6b4c9a'; // Starlight Purple for groups

// --- Icons ---
const Icons = {
  Send: () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  Scan: () => <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7V5a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 3h2a2 2 0 012 2v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 17v2a2 2 0 01-2 2h-2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21H5a2 2 0 01-2-2v-2" /><circle cx="12" cy="12" r="3" /><path d="M12 16v3m0-14v3m4 5h3m-14 0h3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Camera: () => <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>,
  Info: () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  // Stylized Icons
  Cucumber: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17.5 5.5c2.5 2.5 2.5 6.5 0 9l-8 8c-2.5 2.5-6.5 2.5-9 0s-2.5-6.5 0-9l8-8c2.5-2.5 6.5-2.5 9 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 11l.01 0M11 14l.01 0M14 11l.01 0M11 8l.01 0" /></svg> ),
  Tea: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M6 2v2M10 2v2M14 2v2" /></svg> ),
  Stone: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19.07 10.93a4 4 0 0 0-.66-3.5C17.23 5.76 15.71 5 13.5 5c-3.07 0-5.08 1.64-6.1 3.08a6 6 0 0 0-2.37 4.35c-.21 2.1 1.2 4.57 4.97 4.57h7.5c3.2 0 4.8-2.8 4.8-4.8 0-.63-.1-1.27-.23-1.27z" /></svg> ),
  Heart: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> ),
  Parfait: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M6 8h12l-1.5 10a4 4 0 01-4 3.5h-1a4 4 0 01-4-3.5L6 8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M6 8c0-1.5 1.5-3 3-3s1.5-1 3-3 1.5 1.5 3 3 3 1.5 3 3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 12h-2" /></svg> ),
  Coffee: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 8h1a3 3 0 010 6h-1M4 8h15v9a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M7 4V3M12 4V2M17 4V3" /></svg> ),
  Piano: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><rect x="2" y="4" width="20" height="16" rx="2" strokeWidth={1.2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M7 4v9M12 4v9M17 4v9M7 13h2v7H7v-7zM15 13h2v7h-2v-7z" /></svg> ),
  Star: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> ),
  Chocolate: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><rect x="4" y="3" width="16" height="18" rx="2" strokeWidth={1.2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 9h16M4 15h16M12 3v18" /></svg> ),
  Camcorder: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> ),
  Guitar: () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 9l3 3M12 12l6-6-6-4-9 9 4 6 6-6M12 12l6 6a2 2 0 003-3l-6-6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 9L6 12" /></svg> )
};

// --- Utilities ---
const compressImage = (file: File, maxWidth = 600, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } } 
        else { if (height > maxWidth) { width *= maxWidth / height; height = maxWidth; } }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality)); } 
        else { reject(new Error("Canvas context failed")); }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

// --- Visual Components ---

const AmbientBackground = ({ themeColor }: { themeColor: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeColorRef = useRef(themeColor);
  const currentRgbRef = useRef(hexToRgb(themeColor));

  useEffect(() => {
    themeColorRef.current = themeColor;
  }, [themeColor]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationId: number;
    
    // Layer 1: Large Fluid Blobs (Ambient Light)
    const blobs = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 400 + 200, // Very large
      vx: (Math.random() - 0.5) * 0.5, // Slow movement
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2
    }));

    // Layer 2: Small Dust/Spore Particles (Detail)
    const dust = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2 - 0.1, // Slight upward drift
      opacity: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2
    }));

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      // Color Interpolation
      const targetRgb = hexToRgb(themeColorRef.current);
      const currentRgb = currentRgbRef.current;
      const lerpFactor = 0.02; // Very smooth transition
      
      currentRgb.r += (targetRgb.r - currentRgb.r) * lerpFactor;
      currentRgb.g += (targetRgb.g - currentRgb.g) * lerpFactor;
      currentRgb.b += (targetRgb.b - currentRgb.b) * lerpFactor;
      
      const rgbString = `${Math.round(currentRgb.r)}, ${Math.round(currentRgb.g)}, ${Math.round(currentRgb.b)}`;

      // Base dark fill
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw Blobs
      blobs.forEach(blob => {
        blob.x += blob.vx + Math.sin(time * 0.0002 + blob.phase) * 0.5;
        blob.y += blob.vy + Math.cos(time * 0.0003 + blob.phase) * 0.5;
        
        // Bounce loosely
        if (blob.x < -blob.size) blob.vx = Math.abs(blob.vx);
        if (blob.x > width + blob.size) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -blob.size) blob.vy = Math.abs(blob.vy);
        if (blob.y > height + blob.size) blob.vy = -Math.abs(blob.vy);

        // Pulse
        const pulse = Math.sin(time * 0.0005 + blob.phase) * 0.1 + 1;
        const currentSize = blob.size * pulse;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, currentSize);
        gradient.addColorStop(0, `rgba(${rgbString}, ${blob.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalCompositeOperation = 'screen'; // Vivid mixing
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      });

      // Draw Dust
      ctx.fillStyle = `rgba(255, 255, 255, 0.3)`; // White dust
      dust.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Twinkle
        const twinkle = Math.sin(time * 0.003 + p.phase) * 0.5 + 0.5;
        const currentOpacity = p.opacity * twinkle;

        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      
      // Global Tint Overlay for cohesion
      ctx.fillStyle = `rgba(${rgbString}, 0.05)`;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(render);
    };

    render(0);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

const Avatar = ({ className = "", customSrc, character }: { className?: string, customSrc?: string | null, character?: Character }) => {
  const bgColor = character ? character.color : '#6b9c8a';
  const placeholder = character ? character.avatarPlaceholder : 'U';
  
  return (
    <div 
      className={`flex items-center justify-center glass-capsule rounded-full overflow-hidden shadow-md transition-colors duration-500 ${className}`}
      style={{ borderColor: `${bgColor}30`, boxShadow: `inset 0 0 10px ${bgColor}10` }}
    >
      {customSrc ? (
        <img src={customSrc} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs md:text-sm tracking-widest font-bold opacity-90 text-white/90" style={{ textShadow: `0 0 10px ${bgColor}` }}>{placeholder}</span>
      )}
    </div>
  );
};

const ChatHeader = ({ character, session, onToggleSidebar, charAvatars }: { character: Character | null, session: Session | undefined, onToggleSidebar: () => void, charAvatars: Record<string, string> }) => {
  const isGroup = session?.type === 'group';
  const themeColor = character?.color || (isGroup ? GROUP_THEME_COLOR : '#6b9c8a');
  const title = character ? character.name : (session?.title || 'Chat');
  const subtitle = character ? character.band : (isGroup ? `${session?.members?.length || 0} Members` : 'Online');

  return (
    <div 
      className="absolute top-4 left-4 right-4 h-16 z-30 flex items-center justify-between px-6 rounded-[2rem] glass-panel transition-colors duration-500"
      style={{ border: `1px solid ${themeColor}20` }}
    >
       <div className="flex items-center gap-4 overflow-hidden">
          <button onClick={onToggleSidebar} className="md:hidden text-white/70 hover:text-white transition-colors">
             <Icons.Menu />
          </button>
          
          <div className="flex items-center gap-4 overflow-hidden">
             <div className="relative shrink-0">
               <Avatar character={character || undefined} customSrc={character ? charAvatars[character.id] : undefined} className="w-10 h-10" />
               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black/50 animate-pulse shadow-[0_0_8px_currentColor]" style={{ backgroundColor: themeColor, color: themeColor }}></span>
             </div>
             <div className="flex flex-col justify-center min-w-0">
                <h1 className="font-serif text-lg font-bold text-white truncate leading-tight flex items-center gap-2 tracking-wide drop-shadow-md">
                   {title}
                   {isGroup && <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-sans tracking-wide border border-white/10">GROUP</span>}
                </h1>
                <p className="text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase opacity-70 truncate flex items-center gap-2" style={{ color: themeColor, textShadow: `0 0 10px ${themeColor}40` }}>{subtitle}</p>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Interactive Widgets (Refined Layout) ---

const WidgetWrapper = ({ color, title, children }: { color: string, title: string, children?: React.ReactNode }) => (
    <div className="mt-6 p-5 rounded-[2rem] glass-capsule relative overflow-hidden group select-none transition-colors duration-500 hover:border-white/20 flex flex-col min-h-[140px]" 
         style={{ borderColor: `${color}30` }}>
        <div className="flex items-center justify-between mb-4 z-20">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 transition-colors duration-500" style={{ color }}>{title}</span>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500 shadow-[0_0_5px_currentColor]" style={{ backgroundColor: color, color: color }}></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
            {children}
        </div>
    </div>
);

const MutsumiGarden = ({ color }: { color: string }) => {
    const [cucumbers, setCucumbers] = useState<{id: number, left: number}[]>([]);
    const plant = () => {
        const id = Date.now();
        const left = Math.random() * 60 + 20;
        setCucumbers(p => [...p, {id, left}]);
        setTimeout(() => setCucumbers(p => p.filter(c => c.id !== id)), 1000);
    };
    return (
        <WidgetWrapper color={color} title="Greenhouse">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={plant}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <Icons.Cucumber />
                 </div>
                 {cucumbers.map(c => (
                     <div key={c.id} className="absolute bottom-0 animate-float-up-fade pointer-events-none" style={{ left: `${c.left}%` }}>
                         <span className="text-lg opacity-80">🥒</span>
                     </div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const SoyoTea = ({ color }: { color: string }) => {
    const [steams, setSteams] = useState<{id: number, left: number}[]>([]);
    const sip = () => {
        const id = Date.now();
        const left = Math.random() * 40 + 30;
        setSteams(p => [...p, {id, left}]);
        setTimeout(() => setSteams(p => p.filter(c => c.id !== id)), 1500);
    };
    return (
        <WidgetWrapper color={color} title="Tea Time">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={sip}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <Icons.Tea />
                 </div>
                 {steams.map(s => (
                     <div key={s.id} className="absolute -top-4 animate-float-up-fade pointer-events-none opacity-50" style={{ left: `${s.left}%` }}>
                         <div className="w-1.5 h-4 bg-white/30 blur-[3px] rounded-full"></div>
                     </div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const TomoriCollection = ({ color }: { color: string }) => {
    const items = ['🪨', '🍂', '💊', '🪲', '💎'];
    const [collection, setCollection] = useState<{id: number, char: string}[]>([]);
    const collect = () => {
        const item = items[Math.floor(Math.random() * items.length)];
        const id = Date.now();
        setCollection(prev => [...prev.slice(-4), { id, char: item }]);
    };
    return (
        <WidgetWrapper color={color} title="Collection">
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex justify-center gap-4 w-full h-8 mb-1">
                    {collection.map((c) => (
                        <span key={c.id} className="animate-pop text-2xl filter drop-shadow-md">{c.char}</span>
                    ))}
                </div>
                <button onClick={collect} className="w-full py-2 text-xs bg-white/5 hover:bg-white/10 rounded-full text-center text-white/80 transition-colors border border-white/5">
                    寻找
                </button>
            </div>
        </WidgetWrapper>
    );
};

const AnonSocial = ({ color }: { color: string }) => {
    const [likes, setLikes] = useState(1240);
    const [hearts, setHearts] = useState<{id:number, x:number, y: number}[]>([]);
    const post = (e: React.MouseEvent) => {
        setLikes(l => l + Math.floor(Math.random() * 50) + 10);
        const id = Date.now();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const newHearts = Array.from({length: 3}, (_, i) => ({
            id: id + i,
            x: e.clientX - rect.left + (Math.random() * 40 - 20),
            y: e.clientY - rect.top
        }));
        setHearts(h => [...h, ...newHearts]);
        setTimeout(() => setHearts(h => h.filter(item => item.id < id)), 1000);
    };
    return (
        <WidgetWrapper color={color} title="Kitagram">
            <div className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={post}>
                 <span className="text-4xl font-bold drop-shadow-lg tracking-tight mb-1">{likes.toLocaleString()}</span>
                 <span className="text-[10px] opacity-50 uppercase tracking-[0.3em]">Likes</span>
                 {hearts.map(h => (
                     <span key={h.id} className="absolute text-pink-500 animate-float-up-fade pointer-events-none text-xl" style={{ left: h.x, top: h.y }}>♥</span>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const MortisGuitar = ({ color }: { color: string }) => {
    const [strum, setStrum] = useState(false);
    const handleClick = () => {
        setStrum(true);
        setTimeout(() => setStrum(false), 200);
    };
    return (
        <WidgetWrapper color={color} title="Seven-String">
            <div onClick={handleClick} className={`w-full h-full flex items-center justify-center relative cursor-pointer ${strum ? 'animate-shake' : ''}`}>
                <div className={`w-16 h-16 transition-colors relative z-10 filter drop-shadow-lg ${strum ? 'text-red-600' : 'text-white/80 hover:text-white'}`}>
                    <Icons.Guitar />
                </div>
                {strum && <div className="absolute inset-0 bg-red-500/10 animate-slash pointer-events-none rounded-xl"></div>}
                <span className={`absolute bottom-0 text-[10px] font-serif z-10 transition-colors ${strum ? 'text-red-500' : 'text-transparent'}`}>DIE</span>
            </div>
        </WidgetWrapper>
    );
};

const WidgetPlaceholder = ({ color, icon, label }: any) => (
    <WidgetWrapper color={color} title={label}>
        <div className="w-16 h-16 flex items-center justify-center text-4xl opacity-90 hover:scale-110 transition-transform cursor-pointer active:scale-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{icon}</div>
    </WidgetWrapper>
);

const RanaParfait = ({ color }: { color: string }) => {
    const [sparkles, setSparkles] = useState<{id: number, left: number}[]>([]);
    const eat = () => {
        const id = Date.now();
        const left = Math.random() * 60 + 20;
        setSparkles(p => [...p, {id, left}]);
        setTimeout(() => setSparkles(p => p.filter(c => c.id !== id)), 1000);
    };
    return (
        <WidgetWrapper color={color} title="Matcha Parfait">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={eat}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10">
                    <Icons.Parfait />
                 </div>
                 {sparkles.map(c => (
                     <div key={c.id} className="absolute bottom-4 animate-float-up-fade pointer-events-none text-yellow-300 text-xl" style={{ left: `${c.left}%` }}>✨</div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const TakiCoffee = ({ color }: { color: string }) => {
    const [steams, setSteams] = useState<{id: number, left: number}[]>([]);
    const brew = () => {
        const id = Date.now();
        const left = Math.random() * 40 + 30;
        setSteams(p => [...p, {id, left}]);
        setTimeout(() => setSteams(p => p.filter(c => c.id !== id)), 1500);
    };
    return (
        <WidgetWrapper color={color} title="Coffee Brew">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={brew}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10">
                    <Icons.Coffee />
                 </div>
                 {steams.map(s => (
                     <div key={s.id} className="absolute bottom-8 animate-float-up-fade pointer-events-none opacity-60" style={{ left: `${s.left}%` }}>
                         <div className="w-1.5 h-4 bg-white/30 blur-[3px] rounded-full"></div>
                     </div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const SakikoPiano = ({ color }: { color: string }) => {
    const [notes, setNotes] = useState<{id: number, left: number, symbol: string}[]>([]);
    const play = () => {
        const id = Date.now();
        const left = Math.random() * 60 + 20;
        const symbols = ['♩', '♪', '♫', '♬'];
        setNotes(p => [...p, {id, left, symbol: symbols[Math.floor(Math.random()*symbols.length)]}]);
        setTimeout(() => setNotes(p => p.filter(c => c.id !== id)), 1000);
    };
    return (
        <WidgetWrapper color={color} title="Moonlight">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={play}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10">
                    <Icons.Piano />
                 </div>
                 {notes.map(c => (
                     <div key={c.id} className="absolute bottom-4 animate-float-up-fade pointer-events-none text-white/80" style={{ left: `${c.left}%` }}>
                         <span className="text-xl font-serif">{c.symbol}</span>
                     </div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const UikaStar = ({ color }: { color: string }) => {
    const [stars, setStars] = useState<{id: number, left: number, top: number}[]>([]);
    const gaze = () => {
        const id = Date.now();
        const newStars = Array.from({length: 3}, (_, i) => ({
            id: id + i,
            left: Math.random() * 80 + 10,
            top: Math.random() * 40
        }));
        setStars(p => [...p, ...newStars]);
        setTimeout(() => setStars(p => p.filter(c => c.id < id)), 1200);
    };
    return (
        <WidgetWrapper color={color} title="Stargaze">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={gaze}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10 animate-pulse-slow">
                    <Icons.Star />
                 </div>
                 {stars.map(c => (
                     <div key={c.id} className="absolute animate-float-up-fade pointer-events-none text-yellow-200 text-lg" style={{ left: `${c.left}%`, top: `${c.top}%` }}>✦</div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const UmiriChoco = ({ color }: { color: string }) => {
    const [energy, setEnergy] = useState<{id: number, left: number}[]>([]);
    const eat = () => {
        const id = Date.now();
        const left = Math.random() * 60 + 20;
        setEnergy(p => [...p, {id, left}]);
        setTimeout(() => setEnergy(p => p.filter(c => c.id !== id)), 800);
    };
    return (
        <WidgetWrapper color={color} title="Energy Charge">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={eat}>
                 <div className="w-16 h-16 text-white/90 hover:text-white transition-colors relative z-10">
                    <Icons.Chocolate />
                 </div>
                 {energy.map(c => (
                     <div key={c.id} className="absolute bottom-6 animate-float-up-fade pointer-events-none text-yellow-400 text-lg" style={{ left: `${c.left}%` }}>⚡</div>
                 ))}
            </div>
        </WidgetWrapper>
    );
};

const NyamuStream = ({ color }: { color: string }) => {
    const [rec, setRec] = useState(false);
    const record = () => {
        setRec(true);
        setTimeout(() => setRec(false), 1000);
    };
    return (
        <WidgetWrapper color={color} title="Live Stream">
            <div className="w-full h-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform" onClick={record}>
                 <div className={`w-16 h-16 transition-colors relative z-10 ${rec ? 'text-red-500' : 'text-white/90 hover:text-white'}`}>
                    <Icons.Camcorder />
                 </div>
                 {rec && (
                     <div className="absolute top-0 right-0 animate-pulse text-[10px] font-bold text-red-500 tracking-widest border border-red-500 px-1.5 py-0.5 rounded">REC</div>
                 )}
            </div>
        </WidgetWrapper>
    );
};

const CharacterSpecialFeature = ({ charId, color }: { charId: string, color: string }) => {
    switch (charId) {
        case 'mutsumi': return <MutsumiGarden color={color} />;
        case 'mortis': return <MortisGuitar color={color} />;
        case 'tomori': return <TomoriCollection color={color} />;
        case 'anon': return <AnonSocial color={color} />;
        case 'rana': return <RanaParfait color={color} />;
        case 'soyo': return <SoyoTea color={color} />;
        case 'taki': return <TakiCoffee color={color} />;
        case 'sakiko': return <SakikoPiano color={color} />;
        case 'uika': return <UikaStar color={color} />;
        case 'umiri': return <UmiriChoco color={color} />;
        case 'nyamu': return <NyamuStream color={color} />;
        default: return null;
    }
};

// --- Sidebar & App Logic ---

const Sidebar = ({ 
  activeCharacterId, 
  onSelectCharacter,
  userAvatar,
  onUploadUserAvatar,
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateGroup,
  onDeleteSession,
  onUploadCharAvatar,
  charAvatars
}: { 
  activeCharacterId: string | null, 
  onSelectCharacter: (id: string) => void,
  userAvatar: string | null,
  onUploadUserAvatar: () => void,
  sessions: Session[],
  currentSessionId: string | null,
  onSelectSession: (session: Session) => void,
  onCreateGroup: () => void,
  onDeleteSession: (id: string) => void,
  onUploadCharAvatar: (id: string) => void,
  charAvatars: Record<string, string>
}) => {
  const activeCharacter = activeCharacterId ? CHARACTERS[activeCharacterId] : null;
  const bands = ['MyGO!!!!!', 'Ave Mujica'];
  const charactersByBand = Object.values(CHARACTERS).filter(c => !c.hidden).reduce((acc, char) => {
    if (!acc[char.band]) acc[char.band] = []; acc[char.band].push(char); return acc;
  }, {} as Record<string, Character[]>);

  const clickCountRef = useRef(0);
  const [shake, setShake] = useState(false);

  const handleAvatarClick = () => {
      if (activeCharacterId === 'mutsumi') {
          clickCountRef.current += 1;
          if (clickCountRef.current >= 10) {
              setShake(true);
              setTimeout(() => {
                  onSelectCharacter('mortis');
                  setShake(false);
                  clickCountRef.current = 0;
              }, 500);
          }
      } else if (activeCharacterId === 'mortis') {
           clickCountRef.current += 1;
           if (clickCountRef.current >= 10) {
              setShake(true);
              setTimeout(() => {
                  onSelectCharacter('mutsumi');
                  setShake(false);
                  clickCountRef.current = 0;
              }, 500);
           }
      }
  };

  return (
    <div className="flex flex-col h-full p-6 text-gray-200 overflow-y-auto custom-scrollbar relative z-10 pb-24">
      <div className="flex flex-col items-center pt-2 mb-8">
         <div className="relative group">
             <div 
                onClick={handleAvatarClick}
                className={`w-28 h-28 rounded-full p-1.5 relative shadow-2xl transition-all duration-700 cursor-pointer ${shake ? 'animate-shake' : 'hover:scale-105'}`}
                style={{ background: `linear-gradient(135deg, ${activeCharacter ? activeCharacter.color : GROUP_THEME_COLOR}20, transparent)` }}
             >
                 <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center glass-capsule border border-white/20">
                     {activeCharacter ? (
                         <div className="w-full h-full">
                             {charAvatars[activeCharacter.id] ? (
                                <img src={charAvatars[activeCharacter.id]} alt={activeCharacter.name} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                    <span className="text-4xl font-serif font-bold opacity-90 transition-colors duration-500" style={{ color: activeCharacter.color, textShadow: `0 0 15px ${activeCharacter.color}60` }}>{activeCharacter.avatarPlaceholder}</span>
                                </div>
                             )}
                         </div>
                     ) : (
                         <Icons.Users />
                     )}
                 </div>
             </div>
             {activeCharacter && (
                 <button 
                     onClick={(e) => { e.stopPropagation(); onUploadCharAvatar(activeCharacter.id); }}
                     className="absolute bottom-0 right-0 p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 text-white z-20 shadow-lg hover:scale-110"
                     title="Change Avatar"
                 >
                     <Icons.Camera />
                 </button>
             )}
         </div>
         <h2 className="mt-4 font-serif text-xl font-bold transition-colors duration-500 tracking-wide" style={{ color: activeCharacter?.color || 'white', textShadow: `0 0 20px ${activeCharacter?.color || 'white'}40` }}>
            {activeCharacter ? activeCharacter.name : 'Group Chat'}
         </h2>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

      <div className="space-y-8 mb-8">
          {bands.map(band => (
             <div key={band}>
                  <div className="flex items-center gap-3 mb-4 px-2 opacity-80">
                    <h3 className="text-[10px] font-serif uppercase tracking-[0.2em] text-white/60 font-bold">{band}</h3>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                      {charactersByBand[band]?.map(char => (
                          <button
                            key={char.id}
                            onClick={() => onSelectCharacter(char.id)}
                            className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border relative group overflow-hidden ${activeCharacterId === char.id ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10 border-white/30' : 'opacity-60 hover:opacity-100 hover:scale-105 hover:bg-white/5 border-transparent'}`}
                          >
                               {charAvatars[char.id] ? (
                                   <img src={charAvatars[char.id]} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                               ) : (
                                   <span className="text-[10px] font-bold z-10 transition-colors duration-300" style={{ color: activeCharacterId === char.id ? char.color : '#9ca3af' }}>{char.avatarPlaceholder}</span>
                               )}
                          </button>
                      ))}
                  </div>
             </div>
          ))}
      </div>

      {activeCharacter && <CharacterSpecialFeature charId={activeCharacter.id} color={activeCharacter.color} />}

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"></div>

      <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-[10px] font-serif uppercase tracking-widest opacity-60 transition-colors duration-500" style={{ color: GROUP_THEME_COLOR }}>Groups</h3>
              <button onClick={onCreateGroup} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"><Icons.Plus /></button>
          </div>
          <div className="space-y-2">
              {sessions.filter(s => s.type === 'group').sort((a, b) => b.lastModified - a.lastModified).map(s => {
                  const isCurrent = currentSessionId === s.id;
                  const lastMsg = s.messages.length > 0 ? s.messages[s.messages.length - 1] : null;
                  return (
                    <div key={s.id} className="group relative flex items-center">
                        <button 
                          onClick={() => onSelectSession(s)}
                          className="w-full text-left p-3 pr-10 rounded-2xl text-xs transition-all flex items-start gap-3 relative overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/5"
                          style={isCurrent ? { backgroundColor: `${GROUP_THEME_COLOR}15`, borderColor: `${GROUP_THEME_COLOR}30`, color: 'white' } : { color: '#9ca3af' }}
                        >
                            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-white/5 flex items-center justify-center shadow-[0_0_5px_currentColor]" style={{ color: GROUP_THEME_COLOR }}>
                                <Icons.Users />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex justify-between items-baseline w-full">
                                    <span className="truncate font-medium">{s.title}</span>
                                    {lastMsg && <span className="text-[9px] opacity-40 ml-2 whitespace-nowrap">{new Date(lastMsg.timestamp).getHours()}:{new Date(lastMsg.timestamp).getMinutes().toString().padStart(2, '0')}</span>}
                                </div>
                                <span className="text-[10px] opacity-50 truncate text-left w-full mt-0.5">
                                    {lastMsg ? lastMsg.text : '暂无消息'}
                                </span>
                            </div>
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteSession(s.id); }} 
                            className="absolute right-2 top-3 p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-50"
                        >
                            <Icons.Trash />
                        </button>
                    </div>
                )
              })}
              {sessions.filter(s => s.type === 'group').length === 0 && (
                  <div className="text-[10px] text-white/20 px-4 italic">No active groups</div>
              )}
          </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
             <h3 className="text-[10px] font-serif uppercase tracking-widest opacity-60">History / 历史记录</h3>
             {sessions.filter(s => s.type === 'single').length > 0 && (
                 <span className="text-[9px] opacity-30">{sessions.filter(s => s.type === 'single').length} chats</span>
             )}
        </div>

        <div className="space-y-2 px-1">
            {sessions.filter(s => s.type === 'single').length === 0 && (
                 <div className="text-[10px] text-white/20 px-2 italic py-4 text-center border border-white/5 rounded-xl">
                     No conversation history
                 </div>
            )}

            {sessions.filter(s => s.type === 'single').sort((a, b) => b.lastModified - a.lastModified).map(s => {
                const char = s.characterId ? CHARACTERS[s.characterId] : null;
                const color = char?.color || '#666';
                const isCurrent = currentSessionId === s.id;
                const lastMsg = s.messages.length > 0 ? s.messages[s.messages.length - 1] : null;

                return (
                    <div key={s.id} className="group relative flex items-center">
                        <button 
                            onClick={() => onSelectSession(s)}
                            className={`w-full text-left p-3 pr-10 rounded-2xl text-xs transition-all flex items-start gap-3 relative overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/5`}
                            style={isCurrent ? { backgroundColor: `${color}15`, borderColor: `${color}30`, color: 'white' } : { color: '#9ca3af' }}
                        >
                            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden shadow-[0_0_5px_currentColor] mt-0.5 flex items-center justify-center bg-black/20" style={{ borderColor: `${color}40`, borderWidth: '1px' }}>
                                {char && charAvatars[char.id] ? (
                                    <img src={charAvatars[char.id]} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold" style={{ color: color }}>{char?.avatarPlaceholder}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex justify-between items-baseline w-full">
                                    <span className="truncate font-medium">{char?.name || 'Chat'}</span>
                                    {lastMsg && <span className="text-[9px] opacity-40 ml-2 whitespace-nowrap">{new Date(lastMsg.timestamp).getHours()}:{new Date(lastMsg.timestamp).getMinutes().toString().padStart(2, '0')}</span>}
                                </div>
                                <span className="text-[10px] opacity-50 truncate text-left w-full mt-0.5">
                                    {lastMsg ? lastMsg.text : '暂无消息'}
                                </span>
                            </div>
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteSession(s.id); }} 
                            className="absolute right-2 top-3 p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-50"
                        >
                            <Icons.Trash />
                        </button>
                    </div>
                );
            })}
        </div>
      </div>

      <div className="mt-auto pt-6 text-center">
           <a href="https://b23.tv/5v3enDD" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/30 hover:text-white/60 transition-colors block mb-4 tracking-wide font-serif italic">
               Bilibili @-Alisss-
           </a>
           <div className="pt-3 border-t border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 p-3 rounded-2xl transition-colors group" onClick={onUploadUserAvatar}>
               <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-white/30 transition-colors">
                       {userAvatar ? <img src={userAvatar} alt="Me" className="w-full h-full object-cover" /> : <Icons.User />}
                   </div>
                   <span className="text-xs text-gray-400 group-hover:text-white transition-colors">User</span>
               </div>
           </div>
      </div>
    </div>
  );
};

const GroupCreateModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (members: string[], title: string) => void }) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  
  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(prev => prev.filter(m => m !== id));
    } else {
      setSelectedMembers(prev => [...prev, id]);
    }
  };

  const handleCreate = () => {
    if (selectedMembers.length === 0 || !title.trim()) return;
    onCreate(selectedMembers, title);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md bg-[#1a1c1b] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative animate-scale-in overflow-hidden glass-panel">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <button onClick={onClose} className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
          <Icons.X />
        </button>
        
        <h2 className="text-xl font-serif font-bold text-white mb-8 tracking-wide">New Group</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Group Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-white/30 transition-all focus:bg-black/40 text-sm"
              placeholder="Name your group..."
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Select Members</label>
            <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 pb-1">
              {Object.values(CHARACTERS).filter(c => !c.hidden).map(char => (
                <button
                  key={char.id}
                  onClick={() => toggleMember(char.id)}
                  className={`aspect-square rounded-xl relative overflow-hidden transition-all duration-300 border group ${selectedMembers.includes(char.id) ? 'border-white/50 opacity-100 bg-white/10' : 'border-transparent opacity-50 hover:opacity-100 hover:bg-white/5'}`}
                  title={char.name}
                >
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${char.color}15` }}>
                      <span className="text-[10px] font-bold" style={{ color: char.color }}>{char.avatarPlaceholder}</span>
                  </div>
                  {selectedMembers.includes(char.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] animate-fade-in">
                      <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: char.color }}></div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 text-right px-1">{selectedMembers.length} selected</p>
          </div>
          
          <button 
            onClick={handleCreate}
            disabled={selectedMembers.length === 0 || !title.trim()}
            className={`w-full py-4 rounded-xl font-bold tracking-widest text-xs uppercase transition-all mt-2 relative overflow-hidden group ${selectedMembers.length > 0 && title.trim() ? 'text-white shadow-lg hover:shadow-xl hover:scale-[1.01]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            style={selectedMembers.length > 0 && title.trim() ? { backgroundColor: GROUP_THEME_COLOR } : {}}
          >
             {selectedMembers.length > 0 && title.trim() && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
             <span className="relative z-10">Create Group Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [draftCharacterId, setDraftCharacterId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [charAvatars, setCharAvatars] = useState<Record<string, string>>({});
  const [tempCharIdForAvatar, setTempCharIdForAvatar] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Logic to prevent saving empty array on initial render
  const isInitialized = useRef(false);

  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const charAvatarInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  // Determine active character: Draft takes precedence over null session, else session's char
  const activeCharacterId = draftCharacterId || (currentSession?.type === 'single' ? currentSession.characterId : null);
  const activeCharacter = activeCharacterId ? CHARACTERS[activeCharacterId] : null;
  const themeColor = activeCharacter?.color || (currentSession?.type === 'group' ? GROUP_THEME_COLOR : '#6b9c8a');

  useEffect(() => {
    const storedSessions = localStorage.getItem(STORAGE_KEY);
    const storedUserAvatar = localStorage.getItem(USER_AVATAR_KEY);
    const storedCharAvatars = localStorage.getItem(CHAR_AVATAR_KEY);

    if (storedUserAvatar) setUserAvatar(storedUserAvatar);
    if (storedCharAvatars) setCharAvatars(JSON.parse(storedCharAvatars));

    if (storedSessions) {
        try {
            const parsed = JSON.parse(storedSessions);
            setSessions(parsed);
            if (parsed.length > 0) {
                const first = parsed[0];
                setCurrentSessionId(first.id);
                if (first.type === 'single' && first.characterId) {
                    initializeCharacterChat(first.characterId, first.messages);
                } else if (first.type === 'group' && first.members) {
                    initializeGroupChat(first.members, first.messages);
                }
            } else {
                // No sessions? Enter draft mode for default char
                setDraftCharacterId('mutsumi');
                initializeCharacterChat('mutsumi', []);
            }
        } catch (e) {
            setDraftCharacterId('mutsumi');
            initializeCharacterChat('mutsumi', []);
        }
    } else {
        setDraftCharacterId('mutsumi');
        initializeCharacterChat('mutsumi', []);
    }
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, isSending, draftCharacterId]);

  const handleSendMessage = async () => {
      if (!inputText.trim() && !isSending) return;
      // Must have either a valid session OR be in draft mode
      if (!currentSessionId && !draftCharacterId) return;
      
      const text = inputText;
      setInputText("");
      setIsSending(true);

      const userMsg: Message = {
          id: Date.now().toString(),
          text: text,
          sender: Sender.USER,
          timestamp: new Date()
      };

      let activeSessionId = currentSessionId;

      // If in draft mode, create session NOW
      if (!activeSessionId && draftCharacterId) {
          const newSessionId = Date.now().toString();
          const newSession: Session = {
              id: newSessionId,
              type: 'single',
              characterId: draftCharacterId,
              title: CHARACTERS[draftCharacterId].name,
              lastModified: Date.now(),
              messages: [userMsg]
          };
          setSessions(prev => [newSession, ...prev]);
          setCurrentSessionId(newSessionId);
          setDraftCharacterId(null);
          activeSessionId = newSessionId;
      } else {
          // Append to existing
          setSessions(prev => prev.map(s => 
              s.id === activeSessionId 
              ? { ...s, messages: [...s.messages, userMsg], lastModified: Date.now() }
              : s
          ));
      }

      try {
          const responses = await sendMessage(text);
          setSessions(prev => prev.map(s => 
              s.id === activeSessionId
              ? { ...s, messages: [...s.messages, ...responses], lastModified: Date.now() }
              : s
          ));
      } catch (error) {
          console.error("Send failed", error);
      } finally {
          setIsSending(false);
      }
  };

  const handleSelectSession = async (session: Session) => {
      if (currentSessionId === session.id) {
          setIsSidebarOpen(false);
          return;
      }
      
      setCurrentSessionId(session.id);
      setDraftCharacterId(null); // Clear draft
      setIsSidebarOpen(false);
      
      try {
          if (session.type === 'group' && session.members) {
              await initializeGroupChat(session.members, session.messages);
          } else if (session.characterId) {
              await initializeCharacterChat(session.characterId, session.messages);
          }
      } catch (e) {
          console.error("Failed to switch session", e);
      }
  };

  const handleSelectCharacter = (charId: string) => {
      const existing = sessions.find(s => s.type === 'single' && s.characterId === charId);
      if (existing) {
          handleSelectSession(existing);
      } else {
          // Enter Draft Mode instead of creating session immediately
          setCurrentSessionId(null);
          setDraftCharacterId(charId);
          setIsSidebarOpen(false);
          initializeCharacterChat(charId, []);
      }
  };

  const handleCreateGroup = (members: string[], title: string) => {
      const newSession: Session = {
          id: Date.now().toString(),
          type: 'group',
          members,
          title,
          lastModified: Date.now(),
          messages: []
      };
      setSessions(prev => [newSession, ...prev]);
      handleSelectSession(newSession);
      setShowGroupModal(false);
  };

  const handleDeleteSession = (id: string) => {
      setSessions(prev => {
          const filtered = prev.filter(s => s.id !== id);
          // If we just deleted the current session
          if (currentSessionId === id) {
              if (filtered.length > 0) {
                  // We can't easily trigger the async init here, so we just set the ID to the first available
                  // The effect or next user action will handle specifics, or we default to draft
                  // Ideally we should switch to the first one.
                  // For now, let's go back to default draft to be safe.
                  setCurrentSessionId(null);
                  setDraftCharacterId('mutsumi');
              } else {
                 setCurrentSessionId(null);
                 setDraftCharacterId('mutsumi');
              }
          }
          return filtered;
      });
  };
  
  const handleUserAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await compressImage(file, 150);
          setUserAvatar(base64);
          localStorage.setItem(USER_AVATAR_KEY, base64);
      }
  };

  const handleCharAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && tempCharIdForAvatar) {
          const base64 = await compressImage(file, 150);
          const updated = { ...charAvatars, [tempCharIdForAvatar]: base64 };
          setCharAvatars(updated);
          localStorage.setItem(CHAR_AVATAR_KEY, JSON.stringify(updated));
          setTempCharIdForAvatar(null);
      }
  };

  const displayMessages = currentSession ? currentSession.messages : [];
  
  return (
    <div className="flex h-screen bg-[#0a0c0b] text-gray-100 font-sans overflow-hidden relative selection:bg-white/20">
        <AmbientBackground themeColor={themeColor} />

        {isSidebarOpen && (
            <div 
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md md:hidden animate-fade-in"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        <div className={`fixed inset-y-4 left-4 z-40 w-72 glass-panel rounded-[2.5rem] transform transition-transform duration-500 border border-white/5 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}`}>
             <Sidebar 
                activeCharacterId={activeCharacterId || null}
                onSelectCharacter={handleSelectCharacter}
                userAvatar={userAvatar}
                onUploadUserAvatar={() => userAvatarInputRef.current?.click()}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={handleSelectSession}
                onCreateGroup={() => setShowGroupModal(true)}
                onDeleteSession={handleDeleteSession}
                onUploadCharAvatar={(id) => { setTempCharIdForAvatar(id); charAvatarInputRef.current?.click(); }}
                charAvatars={charAvatars}
             />
        </div>

        <div className="flex-1 flex flex-col relative md:ml-80 h-full w-full md:w-[calc(100%-20rem)] p-4">
            <ChatHeader 
                character={activeCharacter || null} 
                session={currentSession}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                charAvatars={charAvatars}
            />
            
            <div className="flex-1 overflow-y-auto px-4 py-20 custom-scrollbar space-y-8 mask-gradient" onClick={() => setIsSidebarOpen(false)}>
                {!currentSession && !draftCharacterId && (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-6">
                        <div className="p-6 rounded-full glass-capsule"><Icons.Scan /></div>
                        <p className="text-sm font-serif tracking-[0.3em] uppercase opacity-50">Initialize Link</p>
                    </div>
                )}
                
                {draftCharacterId && !currentSession && displayMessages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-6 animate-fade-in">
                          <div className="w-32 h-32 mb-6 rounded-full overflow-hidden flex items-center justify-center glass-capsule grayscale opacity-60 shadow-2xl">
                               {activeCharacter && charAvatars[activeCharacter.id] ? (
                                   <img src={charAvatars[activeCharacter.id]} className="w-full h-full object-cover" />
                               ) : (
                                   <span className="text-5xl font-serif font-bold">{activeCharacter?.avatarPlaceholder}</span>
                               )}
                          </div>
                          <p className="text-sm font-serif tracking-[0.2em] text-white/50">Start a conversation with {activeCharacter?.name}</p>
                     </div>
                )}

                {displayMessages.map((msg, idx) => {
                    const isUser = msg.sender === Sender.USER;
                    const showAvatar = !isUser && (idx === 0 || displayMessages[idx-1].sender === Sender.USER || displayMessages[idx-1].characterId !== msg.characterId);
                    const msgChar = !isUser && msg.characterId ? CHARACTERS[msg.characterId] : activeCharacter;

                    return (
                        <div key={msg.id} className={`flex items-end gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
                             <div className="w-10 h-10 shrink-0 flex flex-col items-center">
                                 {!isUser && showAvatar && (
                                     <Avatar 
                                        character={msgChar || undefined}
                                        customSrc={msgChar ? charAvatars[msgChar.id] : undefined}
                                        className="w-10 h-10 text-xs shadow-lg" 
                                     />
                                 )}
                             </div>

                             <div className={`max-w-[75%] md:max-w-[65%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                                 {!isUser && showAvatar && currentSession?.type === 'group' && (
                                     <span className="text-[10px] opacity-60 ml-2 tracking-wide font-bold" style={{ color: msgChar?.color }}>{msgChar?.name}</span>
                                 )}
                                 
                                 <div 
                                    className={`px-6 py-4 rounded-[1.5rem] text-[15px] leading-relaxed shadow-lg backdrop-blur-md border
                                        ${isUser 
                                            ? 'text-white rounded-br-md border-white/10 bg-gradient-to-br from-white/10 to-white/5' 
                                            : 'text-gray-100 rounded-bl-md border-white/5 bg-black/20'
                                        }
                                    `}
                                    style={!isUser && msgChar 
                                        ? { boxShadow: `inset 2px 0 0 ${msgChar.color}40` } 
                                        : { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)` }
                                    }
                                 >
                                     {/* Removed image rendering logic for chat messages */}
                                     {msg.text}
                                 </div>
                                 <span className="text-[9px] opacity-40 px-2 font-sans tracking-wide">
                                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </span>
                             </div>
                        </div>
                    );
                })}
                {isSending && (
                    <div className="flex items-end gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5"></div>
                        <div className="px-6 py-4 bg-black/20 rounded-[1.5rem] rounded-bl-md border border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-6 left-4 right-4 z-30 md:left-0 md:right-0 md:px-0">
                <div 
                    className="max-w-4xl mx-auto flex items-center gap-2 glass-capsule p-2 rounded-full transition-all duration-500 ease-out hover:border-white/20"
                    style={{
                        boxShadow: isInputFocused ? `0 0 40px -10px ${themeColor}30` : '0 10px 30px -10px rgba(0,0,0,0.5)',
                        borderColor: isInputFocused ? `${themeColor}50` : 'rgba(255,255,255,0.1)',
                    }}
                >
                    <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder={activeCharacter ? `Message ${activeCharacter.name}...` : "Type a message..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-base placeholder-white/30 text-white px-4 outline-none font-sans h-12"
                        disabled={isSending || (!currentSessionId && !draftCharacterId)}
                    />

                    <button 
                        onClick={handleSendMessage}
                        disabled={(!inputText.trim() && !isSending) || (!currentSessionId && !draftCharacterId)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 shadow-lg ${inputText.trim() ? 'text-black scale-100 rotate-0' : 'bg-white/5 text-white/20 cursor-not-allowed scale-90 rotate-90'}`}
                        style={inputText.trim() && activeCharacter ? { backgroundColor: activeCharacter.color, color: '#fff', boxShadow: `0 0 20px ${activeCharacter.color}60` } : {}}
                    >
                        <Icons.Send />
                    </button>
                </div>
            </div>
        </div>

        {showGroupModal && (
            <GroupCreateModal 
                onClose={() => setShowGroupModal(false)} 
                onCreate={handleCreateGroup}
            />
        )}
        
        <input type="file" ref={userAvatarInputRef} className="hidden" accept="image/*" onChange={handleUserAvatarUpload} />
        <input type="file" ref={charAvatarInputRef} className="hidden" accept="image/*" onChange={handleCharAvatarUpload} />
    </div>
  );
};

export default App;
