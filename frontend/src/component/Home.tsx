import { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constant";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface ResponseProps {
  expr: string;
  result: string;
  assign: boolean;
}
interface GenerateResultProps {
  expression: string;
  answer: string;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255,255,255");
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState<GenerateResultProps>();
  const [dictOfVars, setDictOfVars] = useState({});
  useEffect(() => {
    if (reset) {
      resetCanvas();
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
  }, []);
  async function sendData() {
    const canvas = canvasRef.current;
    if (canvas) {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/calculate`,
        {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        }
      );
      const resp = await response.data;
      console.log("Response: ", resp);
    }
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "black";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  }
  function stopDrawing() {
    setIsDrawing(false);
  }
  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  }
  function resetCanvas() {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Button onClick={() => setReset(true)}>reset</Button>
        <Group className="">
          {SWATCHES.map((swatchColor) => (
            <ColorSwatch
              color={swatchColor}
              onClick={() => setColor(swatchColor)}
              key={swatchColor}
            />
          ))}
        </Group>
        <Button onClick={sendData}>calculate</Button>
      </div>
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={startDrawing}
        onMouseOut={stopDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        className="absolute top-0 left-0  w-full h-full"
      ></canvas>
    </div>
  );
}
