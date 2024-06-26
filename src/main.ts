import { WindowState } from "./types";
import { getWindowCenter } from "./windowState";
import { WindowWorkerHandler } from "./workerHandler";
import "./style.css";

type Coordinates = {
  x: number;
  y: number;
};

const baseChange = ({
  currentWindowOffset,
  targetWindowOffset,
  targetPosition,
}: {
  currentWindowOffset: Coordinates;
  targetWindowOffset: Coordinates;
  targetPosition: Coordinates;
}) => {
  const monitorCoordinate = {
    x: targetPosition.x + targetWindowOffset.x,
    y: targetPosition.y + targetWindowOffset.y,
  };

  const currentWindowCoordinate = {
    x: monitorCoordinate.x - currentWindowOffset.x,
    y: monitorCoordinate.y - currentWindowOffset.y,
  };

  return currentWindowCoordinate;
};

const drawMainCircle = (ctx: CanvasRenderingContext2D, center: Coordinates) => {
  const { x, y } = center;
  ctx.strokeStyle = "#eeeeee";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(x, y, 100, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.closePath();
};

const drawConnectingLine = ({
  ctx,
  hostWindow,
  targetWindow,
}: {
  ctx: CanvasRenderingContext2D;
  hostWindow: WindowState;
  targetWindow: WindowState;
}) => {
  ctx.strokeStyle = "#ff0000";
  ctx.lineCap = "round";
  const currentWindowOffset: Coordinates = {
    x: hostWindow.screenX,
    y: hostWindow.screenY,
  };
  const targetWindowOffset: Coordinates = {
    x: targetWindow.screenX,
    y: targetWindow.screenY,
  };

  const origin = getWindowCenter(hostWindow);
  const target = getWindowCenter(targetWindow);

  const targetWithBaseChange = baseChange({
    currentWindowOffset,
    targetWindowOffset,
    targetPosition: target,
  });

  ctx.strokeStyle = "#ff0000";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(targetWithBaseChange.x, targetWithBaseChange.y);
  ctx.stroke();
  ctx.closePath();
};

function displayDebugInfo(ctx: CanvasRenderingContext2D, center: Coordinates) {
  console.log(center);
  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(
    `x: ${window.screenX} y: ${window.screenY} width: ${window.innerWidth} height: ${window.innerHeight}`,
    10,
    30,
  );
}

function main() {
  const workerHandler = new WindowWorkerHandler();
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const currentWindow = workerHandler.currentWindow;
  const currentId = workerHandler.id;
  const center = getWindowCenter(currentWindow);

  workerHandler.onSync((windows) => {
    ctx.reset();
    drawMainCircle(ctx, getMyCenter());
    displayDebugInfo(ctx, getMyCenter());
    windows
      .filter((w) => w.id !== currentId)
      .forEach(({ windowState: targetWindow }) => {
        drawConnectingLine({
          ctx,
          hostWindow: workerHandler.currentWindow,
          targetWindow,
        });
      });
  });

  setInterval(() => {
    workerHandler.windowHasChanged();
  }, 100);

  window.addEventListener("resize", () => {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  });
}

function getWindow(): WindowState {
  console.log(
    window.screenX,
    window.screenY,
    window.innerWidth,
    window.innerHeight,
  );
  return {
    screenX: window.screenX,
    screenY: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getMyCenter(): Coordinates {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

main();
