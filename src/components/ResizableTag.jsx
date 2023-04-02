import { Resizable } from "react-resizable";
import React from "react";
import { useLocalStorage } from "react-use";

function ResizableTag({ defaultWidth, localKey, setResizing, ...restProps }) {
  const [width, setWidth] = useLocalStorage(localKey, defaultWidth);

  const onResize = (e, { size }) => {
    setWidth(size.width);
    window.localStorage.setItem(localKey, size.width);
  };

  if (!width) {
    return <div {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      onResizeStart={() => setResizing(true)}
      onResizeStop={() => setResizing(false)}
    >
      <div {...restProps} style={{ width }} />
    </Resizable>
  );
}

export default ResizableTag;
