"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Tictactoeboard from "@/components/game/Tictactoeboard";
import { OrbitControls } from "@react-three/drei";

import Circle from "./Circle";
import StarsSphere from "./Background";
import WinLine from "./WinLine";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Cross from "./Cross";
import Loader from "./Loader";

function MainGame() {
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [winner, setWinner] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [blinkOpacity, setBlinkOpacity] = useState(1);
  const [isFirstMove, setIsFirstMove] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [timer, setTimer] = useState(50);
  const [timerVisible, setTimerVisible] = useState(true);
  const turnToastId = useRef(null);

  const bounceSound = useRef(null);
  const victorySound = useRef(null);
  const bgMusic = useRef(null);
  const tieSound = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    bounceSound.current = new Audio("/bounce.mp3");
    victorySound.current = new Audio("/victory.mp3");
    bgMusic.current = new Audio("/game.mp3");
    tieSound.current = new Audio("/tie.mp3");
    bgMusic.current.loop = true;
  }, []);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      bgMusic.current.pause();
    } else {
      bgMusic.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const showGameInfo = () => {
    Swal.fire({
      title: "3D Tic Tac Toe Game",
      html: `
        <div style="text-align: left;">
          <p>Welcome to this immersive 3D Tic Tac Toe experience!</p>
          <p><strong>How to Play:</strong></p>
          <ul>
            <li>Player 1 (X) and Player 2 (O) take turns marking spaces</li>
            <li>The first player to get 3 marks in a row (horizontally, vertically, or diagonally) wins</li>
            <li>If all 9 squares are filled without a winner, the game ends in a tie</li>
          </ul>
          <p><strong>Features:</strong></p>
          <ul>
            <li>Fully interactive 3D environment - you can rotate the view by dragging the screen</li>
            <li>Visual effects for winning combinations</li>
            <li>Timer for turn management</li>
            <li>Background music and sound effects</li>
          </ul>
          <p>Enjoy the classic game with a modern 3D twist!</p>
        </div>
      `,
      width: isSmallScreen ? 300 : 500,
      padding: "1em",
      color: "white",
      background: "rgba(0, 0, 0, 0.8)",
      confirmButtonColor: "#3085d6",
    });
  };

  const positions = [
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [-1, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
  ];

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  useEffect(() => {
    if (turnToastId.current) {
      toast.dismiss(turnToastId.current);
    }
    turnToastId.current = toast(
      isXTurn ? "Player 1's Turn" : "Player 2's Turn",
      {
        position: "top-center",
        autoClose: 7000,
        theme: "dark",
        hideProgressBar: true,
        className: "centered-toast",
        bodyClassName: "centered-toast-body",
        closeButton: false,
      }
    );
  }, [isXTurn]);

  const handleCellClick = (index) => {
    if (gameState[index] || winner) {
      toast.warn("Invalid move!", { position: "top-center" });
      return;
    }

    if (isFirstMove) {
      setIsFirstMove(false);
      setTimeout(() => setBlinkOpacity(0), 10);
      startTimer();
    }

    const newState = [...gameState];
    newState[index] = isXTurn ? "O" : "X";
    setGameState(newState);
    setIsXTurn(!isXTurn);
    setLastClickedIndex(index);
    setShouldAnimate(true);

    bounceSound.current?.play();

    checkWinnerOrTie(newState);

    setTimeout(() => setShouldAnimate(false), 1000);

    if (!winner) resetTimer();
  };

  const checkWinnerOrTie = (state) => {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        setWinner(state[a]);
        setHighlightIndex(i);
        setTimerVisible(false);
        Swal.fire({
          title: `Player ${state[a]} wins! 🎉`,
          width: isSmallScreen ? 300 : 500,
          padding: "1em",
          color: "white",
          background: "rgba(0, 0, 0, 0.6) ",
          backdrop: `
            rgba(0,0,123,0.4)
            url("/cat-nyan-cat.gif")
            left top
            no-repeat
          `,
        });
        victorySound.current?.play();
        clearInterval(timerRef.current);
        return;
      }
    }

    if (state.every((cell) => cell !== null)) {
      setWinner("Tie");
      setTimerVisible(false);
      Swal.fire({
        title: "It's a tie!",
        icon: "error",
      });
      tieSound.current?.play();
      clearInterval(timerRef.current);
    }
  };

  const resetGame = () => {
    setGameState(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setHighlightIndex(null);
    setLastClickedIndex(null);
    setShouldAnimate(false);
    setIsFirstMove(true);
    setBlinkOpacity(1);
    setTimerVisible(true);
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimer(50);
    if (!winner) startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          playRandomMove();
          return 50;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const playRandomMove = () => {
    const availableMoves = gameState
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);

    if (availableMoves.length > 0) {
      const randomIndex =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      handleCellClick(randomIndex);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isFirstMove) {
      const interval = setInterval(() => {
        setBlinkOpacity((prev) => (prev === 1 ? 0 : 1));
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isFirstMove]);

  const yellowScale = isSmallScreen ? [0.35, 0.34, 0.34] : [0.36, 0.35, 0.35];
  const yellowPosition = isSmallScreen ? [0.01, -2.35, 0] : [0.01, -1.35, -0.2];
  const cameraPosition = isSmallScreen ? [0, 0.3, 0] : [0, 1.6, 1.2];
  const maxPolarAngle = isSmallScreen ? Math.PI / 8 : Math.PI / 6;
  const minPolarAngle = isSmallScreen ? Math.PI / 80 : Math.PI / 17;

  const fov = isSmallScreen ? 106 : 100;
  const boardPosition = isSmallScreen ? [0, 0.1, 0.2] : [0, 2, 0.7];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full h-screen relative">
      <button
        className="absolute top-20 font-choco sm:left-[50%] left-[40%] px-4 py-2 z-[1000] rounded-full text-white bg-blue-600 transition-transform duration-300 border-none ease-in-out hover:scale-110"
        onClick={showGameInfo}
      >
        Info
      </button>

      {timerVisible && (
        <div className="absolute bottom-24 sm:bottom-8 font-choco text-xl right-1/3 sm:right-[45%] bg-red-600/80 text-white px-4 py-2 rounded-md z-[1000]">
          Timer: {timer}
        </div>
      )}
      <button
        className={`absolute top-20 left-10 px-4 py-2 z-[1000] font-choco text-white bg-red-600 rounded-lg transition-transform duration-300 ease-in-out ${
          winner || gameState.every((cell) => cell !== null)
            ? "cursor-pointer opacity-100 hover:scale-110"
            : "cursor-not-allowed opacity-50"
        }`}
        onClick={resetGame}
        disabled={!winner && !gameState.every((cell) => cell !== null)}
      >
        Reset
      </button>

      <button
        className="absolute top-20 font-choco right-10 sm:right-12 px-4 py-2 z-[1000] rounded-full text-white bg-red-600 transition-transform duration-300 ease-in-out hover:scale-110"
        onClick={toggleMusic}
      >
        {isMusicPlaying ? "Music Off" : "Music On"}
      </button>

      <Canvas camera={{ position: cameraPosition, fov }}>
        <OrbitControls
          enableZoom={false}
          minPolarAngle={minPolarAngle}
          maxPolarAngle={maxPolarAngle}
          enableDamping
          dampingFactor={0.1}
        />
        <ambientLight intensity={0.1} />
        <group position={boardPosition}>
          <StarsSphere />
          <Tictactoeboard />

          <group
            scale={yellowScale}
            position={yellowPosition}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {gameState.map((cell, index) =>
              cell === "X" ? (
                <Cross
                  key={index}
                  position={positions[index]}
                  shouldAnimate={shouldAnimate && lastClickedIndex === index}
                />
              ) : cell === "O" ? (
                <Circle
                  key={index}
                  position={positions[index]}
                  shouldAnimate={shouldAnimate && lastClickedIndex === index}
                />
              ) : (
                <mesh
                  key={index}
                  position={positions[index]}
                  onClick={() => handleCellClick(index)}
                >
                  <planeGeometry args={[0.8, 0.8]} />
                  <meshBasicMaterial
                    color={"yellow"}
                    transparent
                    opacity={blinkOpacity}
                  />
                </mesh>
              )
            )}
          </group>

          <WinLine highlightIndex={highlightIndex} />
        </group>
      </Canvas>
    </div>
  );
}

export default MainGame;
