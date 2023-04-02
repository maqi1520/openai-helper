export function getPointerPosition(event: TouchEvent | MouseEvent) {
  if ("targetTouches" in event) {
    return {
      x: event.targetTouches[0].clientX,
      y: event.targetTouches[0].clientY,
    };
  }
  return { x: event.clientX, y: event.clientY };
}
