import React, { useEffect, useState, useRef } from 'react';
import { Volume2, Play, Pause, Music, Radio, Zap, Waves, Headphones, Speaker, Mic, ArrowDown, Instagram, Twitter, Youtube, SkipBack, SkipForward, Shuffle, Repeat, Heart, Share2, Download, List, Syringe as Lyrics, X } from 'lucide-react';
import Footer from './Footer';



export const audioTracks = [
  {
    name: "Digital Dreams",
    artist: "MELSCALE Universe",
    album: "Electronic Nights",
    duration: "4:32",
    url: "/audios/digital-dreams-291145.mp3", 
    cover: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
    lyrics: `[Verse 1]
In the neon glow of midnight screens
Where reality fades and nothing's as it seems
Digital dreams are calling out my name
In this virtual world, we're all the same`
  },
  {
    name: "Neon Pulse",
    artist: "Cyber Collective",
    album: "Future Sounds",
    duration: "3:47",
    url: "/audios/upbeat.mp3", // Using same fallback for consistency
    cover: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400",
    lyrics: `[Verse 1]
City lights paint the sky in shades of blue
Neon pulse running through and through
Electric heartbeat of the night
Everything's gonna be alright`
  },
  {
    name: "Aya Toofan",
    artist: "Cyber Collective",
    album: "Future Sounds",
    duration: "3:47",
    url: "/audios/toofan.mp3", // Using same fallback for consistency
    cover: "https://swarajya.gumlet.io/swarajya/2025-01-28/zxs4tnzw/Screenshot-78.png?w=610&q=50&compress=true&format=auto",
    lyrics: `[Verse 1]
City lights paint the sky in shades of blue
Neon pulse running through and through
Electric heartbeat of the night
Everything's gonna be alright`
  },
 
];


function App() {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLiked, setIsLiked] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Enhanced audio tracks with working URLs and full songs
  
  
  // Audio event handlers with better error handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(false);
    };
    const handleError = () => {
      setIsLoading(false);
      setAudioError(true);
      console.error('Audio loading error');
    };
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        // Auto-play next track
        if (currentTrack < audioTracks.length - 1) {
          setCurrentTrack(prev => prev + 1);
        } else if (isShuffled) {
          setCurrentTrack(Math.floor(Math.random() * audioTracks.length));
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, audioTracks.length, isRepeating, isShuffled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = audioTracks[currentTrack].url;
      audio.volume = volume;
      audio.load(); // Force reload
      if (isPlaying) {
        // Add a small delay to ensure audio is loaded
        setTimeout(() => {
          audio.play().catch(console.error);
        }, 100);
      }
    }
  }, [currentTrack, audioTracks, volume]);

  // Play/pause functionality with better error handling
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        setAudioError(false);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsLoading(false);
      setAudioError(true);
      // Try to create a simple tone as fallback
      createFallbackAudio();
    }
  };

  // Create a simple tone as fallback when audio fails
  const createFallbackAudio = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2); // Play for 2 seconds
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    } catch (error) {
      console.error('Fallback audio creation failed:', error);
    }
  };

  // Track navigation
  const nextTrack = () => {
    if (isShuffled) {
      let newTrack;
      do {
        newTrack = Math.floor(Math.random() * audioTracks.length);
      } while (newTrack === currentTrack && audioTracks.length > 1);
      setCurrentTrack(newTrack);
    } else {
      setCurrentTrack(prev => (prev + 1) % audioTracks.length);
    }
    setCurrentTime(0);
  };

  const prevTrack = () => {
    if (isShuffled) {
      let newTrack;
      do {
        newTrack = Math.floor(Math.random() * audioTracks.length);
      } while (newTrack === currentTrack && audioTracks.length > 1);
      setCurrentTrack(newTrack);
    } else {
      setCurrentTrack(prev => (prev - 1 + audioTracks.length) % audioTracks.length);
    }
    setCurrentTime(0);
  };

  // Seek functionality
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Format time helper
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle functions
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => setIsRepeating(!isRepeating);
  const toggleLike = () => {
    setIsLiked(prev => ({
      ...prev,
      [currentTrack]: !prev[currentTrack]
    }));
  };

  // Get current lyrics with timing
  const getCurrentLyrics = () => {
    const lyrics = audioTracks[currentTrack].lyrics;
    return lyrics.split('\n').filter(line => line.trim() !== '');
  };

  const visualElements = [
    {
      title: "Immersive Audio",
      description: "Experience sound in its purest form with cutting-edge audio technology",
      image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "Studio Quality",
      description: "Professional-grade equipment for creators and audiophiles",
      image: "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "Wireless Freedom",
      description: "Unleash your creativity without the constraints of cables",
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* Lyrics Modal */}
      {showLyrics && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Lyrics</h3>
              <button 
                onClick={() => setShowLyrics(false)}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold">{audioTracks[currentTrack].name}</h4>
              <p className="text-gray-400">{audioTracks[currentTrack].artist}</p>
            </div>
            <div className="space-y-2 text-gray-300 leading-relaxed">
              {getCurrentLyrics().map((line, index) => (
                <p key={index} className="hover:text-white transition-colors cursor-pointer">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playlist Modal */}
      {showPlaylist && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Playlist</h3>
              <button 
                onClick={() => setShowPlaylist(false)}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {audioTracks.map((track, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    setCurrentTrack(index);
                    setCurrentTime(0);
                    setShowPlaylist(false);
                  }}
                  className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-800 ${
                    currentTrack === index ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' : ''
                  }`}
                >
                  <img src={track.cover} alt={track.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{track.name}</h4>
                    <p className="text-gray-400 text-sm">{track.artist} • {track.album}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{track.duration}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(prev => ({
                        ...prev,
                        [index]: !prev[index]
                      }));
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isLiked[index] ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isLiked[index] ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Orbs */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
            style={{
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Sound Wave Lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="flex space-x-2">
            {[...Array(80)].map((_, i) => (
              <div
                key={`wave-${i}`}
                className="w-0.5 bg-gradient-to-t from-blue-400 via-purple-400 to-pink-400 rounded-full"
                style={{
                  height: `${30 + Math.random() * 120}px`,
                  animation: `wave ${0.8 + Math.random() * 1.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.03}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section with Stunning Banner */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={audioTracks[currentTrack].cover}
            alt="Audio Studio"
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-purple-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Animated Audio Visualizer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center space-x-1 opacity-30">
          {[...Array(60)].map((_, i) => (
            <div
              key={`viz-${i}`}
              className={`w-2 bg-gradient-to-t from-blue-400 to-purple-400 rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
              style={{
                height: `${20 + Math.random() * 80}px`,
                animation: isPlaying ? `visualizer ${0.5 + Math.random() * 1}s ease-in-out infinite alternate` : 'none',
                animationDelay: `${i * 0.02}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Now Playing Card */}
          <div className="inline-flex items-center space-x-4 bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 mb-8 border border-white/20">
            <img src={audioTracks[currentTrack].cover} alt={audioTracks[currentTrack].name} className="w-12 h-12 rounded-lg object-cover" />
            <div className="text-left">
              <h3 className="font-semibold">{audioTracks[currentTrack].name}</h3>
              <p className="text-sm text-gray-300">{audioTracks[currentTrack].artist}</p>
            </div>
            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              isLoading ? 'bg-yellow-400 animate-pulse' : 
              audioError ? 'bg-red-400' :
              isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`} />
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-none">
            <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-pulse-slow">
              MELSCALE
            </span>
            <span className="block text-5xl md:text-7xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-4">
              UNIVERSE
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Dive into an immersive world where sound becomes art and technology meets creativity
          </p>
          
          {/* Enhanced Music Controls */}
          <div className="flex flex-col items-center space-y-8">
            <div className="flex items-center space-x-6">
              <button 
                onClick={toggleShuffle}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isShuffled ? 'bg-green-600 text-white' : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              
              <button 
                onClick={prevTrack}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={togglePlayPause}
                disabled={isLoading}
                className="group relative w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-opacity duration-300 ${isPlaying ? 'animate-ping opacity-20' : 'opacity-0'}`} />
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
              
              <button 
                onClick={nextTrack}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              <button 
                onClick={toggleRepeat}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRepeating ? 'bg-green-600 text-white' : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>
            
            {/* Additional Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLike}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isLiked[currentTrack] ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className="w-5 h-5" fill={isLiked[currentTrack] ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={() => setShowLyrics(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Lyrics className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowPlaylist(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <List className="w-5 h-5" />
              </button>
              
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {audioError && (
              <div className="bg-red-900/50 border border-red-500/50 rounded-lg px-4 py-2 text-sm text-red-200">
                Audio playback failed. Click play to try a fallback tone.
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </section>

      {/* Animated Gallery Section */}
      <section id="gallery" className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible.gallery ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Visual Symphony
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Where technology meets artistry in perfect harmony
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {visualElements.map((element, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl transform transition-all duration-1000 hover:scale-105 ${isVisible.gallery ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ transitionDelay: `${index * 300}ms` }}
              >
                <div className="aspect-[4/5] relative">
                  <img 
                    src={element.image}
                    alt={element.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Animated Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl font-bold mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {element.title}
                    </h3>
                    <p className="text-gray-300 text-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      {element.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Audio Controls Section */}
      <section id="controls" className="py-32 px-4 bg-gradient-to-br from-gray-900 via-black to-purple-900/20">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible.controls ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Audio Control
              </span>
            </h2>
          </div>

          <div className={`bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 transform transition-all duration-1000 ${isVisible.controls ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            {/* Album Art and Track Info */}
            <div className="flex items-center space-x-6 mb-12">
              <img 
                src={audioTracks[currentTrack].cover} 
                alt={audioTracks[currentTrack].name}
                className="w-24 h-24 rounded-2xl object-cover shadow-2xl"
              />
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-2">{audioTracks[currentTrack].name}</h3>
                <p className="text-gray-400 text-lg mb-1">{audioTracks[currentTrack].artist}</p>
                <p className="text-gray-500 text-sm">{audioTracks[currentTrack].album}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleLike}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isLiked[currentTrack] ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Heart className="w-6 h-6" fill={isLiked[currentTrack] ? 'currentColor' : 'none'} />
                </button>
                <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <Download className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Equalizer Visualization */}
            <div className="flex justify-center items-end space-x-2 mb-12 h-32">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`eq-${i}`}
                  className={`w-4 bg-gradient-to-t from-green-400 via-blue-400 to-purple-400 rounded-t-full transition-all duration-300 ${isPlaying ? '' : 'opacity-50'}`}
                  style={{
                    height: `${30 + Math.random() * 70}%`,
                    animation: isPlaying ? `equalizer ${0.5 + Math.random() * 1}s ease-in-out infinite alternate` : 'none',
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div 
                className="w-full bg-gray-700 rounded-full h-3 mb-4 cursor-pointer group"
                onClick={handleSeek}
              >
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full relative transition-all duration-300 group-hover:h-4"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{audioTracks[currentTrack].duration}</span>
              </div>
            </div>

            {/* Enhanced Control Buttons */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <button 
                onClick={toggleShuffle}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isShuffled ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              
              <button 
                onClick={prevTrack}
                className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              
              <button 
                onClick={nextTrack}
                className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              <button 
                onClick={toggleRepeat}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRepeating ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume and Additional Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-400 w-8">{Math.round(volume * 100)}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowLyrics(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Lyrics className="w-4 h-4" />
                  <span className="text-sm">Lyrics</span>
                </button>
                
                <button
                  onClick={() => setShowPlaylist(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">Playlist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Features Grid */}
      <section id="features" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Sound Innovation
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Headphones className="w-12 h-12" />, title: "Premium Audio", color: "from-blue-500 to-cyan-500" },
              { icon: <Speaker className="w-12 h-12" />, title: "Spatial Sound", color: "from-purple-500 to-pink-500" },
              { icon: <Mic className="w-12 h-12" />, title: "Studio Quality", color: "from-green-500 to-emerald-500" },
              { icon: <Radio className="w-12 h-12" />, title: "Wireless Tech", color: "from-orange-500 to-red-500" }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 hover:border-gray-600 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 ${isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl"
                     style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${feature.color} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    <Footer/>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }

        @keyframes wave {
          0% { height: 30px; }
          100% { height: 120px; }
        }

        @keyframes visualizer {
          0% { height: 20px; }
          100% { height: 100px; }
        }

        @keyframes equalizer {
          0% { height: 30%; }
          100% { height: 90%; }
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

export default App;