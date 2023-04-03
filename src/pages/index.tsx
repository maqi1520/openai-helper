import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown from "../components/DropDown";
import Footer from "../components/Footer";
import ResizableTag from "../components/ResizableTag";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import { Preview } from "../components/Preview";
import { requestResponse } from "../utils/worker";

type InjectContent = {
  html: string;
  css: string;
};

const DEFAULT_RESPONSIVE_SIZE = { width: 540, height: 720 };

const tags = [
  { name: "按钮", code: "button" },
  { name: "输入框", code: "input" },
  { name: "下拉列表", code: "select" },
  { name: "复选框", code: "checkbox" },
  { name: "单选框", code: "radio-button" },
  { name: "标签页", code: "tabs" },
  { name: "弹出框", code: "modal" },
  { name: "菜单", code: "menu" },
  { name: "进度条", code: "progress-bar" },
  { name: "图片轮播", code: "image-slider" },
  { name: "图片放大器", code: "image-zoom" },
  { name: "日历", code: "calendar" },
  { name: "表格", code: "table" },
  { name: "分页", code: "pagination" },
  { name: "标签", code: "tag" },
  { name: "树形控件", code: "tree-view" },
  { name: "图表", code: "chart" },
  { name: "列表", code: "list" },
  { name: "瀑布流", code: "masonry" },
  { name: "文字滚动", code: "marquee" },
];

const Home: NextPage = () => {
  const worker = useRef<Worker>();
  const previewRef = useRef<HTMLIFrameElement>(null);
  const refHtml = useRef<string>("");
  const [resizing, setResizing] = useState(false);
  const [responsiveDesignMode, setResponsiveDesignMode] = useState(false);
  const [responsiveSize, setResponsiveSize] = useState<{
    width: number;
    height: number;
  }>(DEFAULT_RESPONSIVE_SIZE);
  useEffect(() => {
    worker.current = new Worker(
      new URL("../utils/postcss.worker.js", import.meta.url)
    );
    return () => {
      worker.current?.terminate();
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [primaryColor, setPrimaryColor] = useState<string>("");
  const [generatedDesc, setGeneratedDesc] = useState<string>("");
  const defaultDesc = "一个登录页面包括（邮箱、密码）";
  let text = desc || defaultDesc;

  const noExplanation = `
  只需要返回 html 代码，不需要解释`;

  const messages = [
    {
      role: "system",
      content: "你是一名精通 Tailwind css 的前端工程师。" + noExplanation,
    },
    { role: "user", content: "使用 Tailwind css 写一个按钮。" + noExplanation },
    {
      role: "assistant",
      content: `<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      点我
    </button>`,
    },
    {
      role: "user",
      content: `${text}，${
        primaryColor ? `主色是${primaryColor}，` : ""
      }${noExplanation}`,
    },
  ];

  const inject = useCallback(async (content: InjectContent) => {
    previewRef.current?.contentWindow?.postMessage(content, "*");
  }, []);

  const compile = async (html: string) => {
    const res = await requestResponse(worker.current, {
      html,
    });
    inject(res);
  };

  const generateDesc = async (e: any) => {
    e.preventDefault();
    setGeneratedDesc("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedDesc((prev) => {
        refHtml.current = prev + chunkValue;

        return prev + chunkValue;
      });
    }

    setLoading(false);

    compile(refHtml.current);
  };

  return (
    <div className="flex h-screen">
      <ResizableTag
        setResizing={setResizing}
        defaultWidth={400}
        localKey={"localKeyWidth"}
        className="flex-none border-right"
      >
        <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
          <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-2 sm:mt-4">
            <h1 className="sm:text-3xl text-2xl max-w-1xl font-bold text-slate-900">
              Tailwind CSS 代码生成器
            </h1>
            <div className="max-w-xl w-full">
              <div className="flex mt-4 items-center space-x-3 mb-3">
                <Image src="/1-black.png" width={30} height={30} alt="1 icon" />
                <p className="text-left font-medium">请输入你想要实现的效果</p>
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-2"
                placeholder={"e.g. " + defaultDesc}
              />
              <div className="grid grid-cols-4 gap-4 mb-5">
                {tags.map((tag) => {
                  return (
                    <span
                      key={tag.code}
                      onClick={() => setDesc(tag.code)}
                      className="bg-blue-100 text-blue-700 font-medium py-1 px-2 rounded cursor-pointer"
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
              <div className="flex mb-5 items-center space-x-3">
                <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
                <p className="text-left font-medium">请选择主色.</p>
              </div>
              <div className="block">
                <DropDown value={primaryColor} onChange={setPrimaryColor} />
              </div>

              <div className="flex py-5">
                <label className="flex items-center">
                  <input
                    checked={responsiveDesignMode}
                    onChange={() =>
                      setResponsiveDesignMode(!responsiveDesignMode)
                    }
                    type="checkbox"
                  />
                  <span className="ml-2">手机预览</span>
                </label>
              </div>

              {!loading && (
                <button
                  className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-4 mt-3 hover:bg-black/80 w-full"
                  onClick={(e) => generateDesc(e)}
                >
                  生成代码 &rarr;
                </button>
              )}
              {loading && (
                <button
                  className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-4 mt-3 hover:bg-black/80 w-full"
                  disabled
                >
                  <LoadingDots color="white" style="large" />
                </button>
              )}
            </div>
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{ duration: 2000 }}
            />
            <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
            <ResizablePanel>
              <AnimatePresence mode="wait">
                <motion.div className="space-y-10 my-4">
                  {generatedDesc && (
                    <>
                      <div>
                        <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                          生成的代码
                        </h2>
                      </div>
                      <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto  whitespace-pre-wrap">
                        <div
                          className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border text-left"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedDesc);
                            toast("复制成功！", {
                              icon: "✂️",
                            });
                          }}
                        >
                          <p>{generatedDesc}</p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </ResizablePanel>
          </main>
          <Footer />
        </div>
      </ResizableTag>

      <div className="flex-auto relative border-l">
        <Preview
          ref={previewRef}
          responsiveDesignMode={responsiveDesignMode}
          responsiveSize={responsiveSize}
          onChangeResponsiveSize={setResponsiveSize}
          iframeClassName={resizing ? "pointer-events-none" : ""}
        />
      </div>
    </div>
  );
};

export default Home;
