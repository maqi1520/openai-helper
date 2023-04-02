const VIRTUAL_SOURCE_PATH = "/sourcePath";

let current;

addEventListener("message", async (event) => {
  const [tailwindcss, postcss, autoprefixer] = (
    await Promise.all(
      [
        () => import("tailwindcss"),
        () => import("postcss"),
        () => import("autoprefixer"),
      ].map((x) => x())
    )
  ).map((x) => x.default || x);

  const html = event.data.html;
  self["/htmlInput"] = html;
  const config = {
    darkMode: "class",
    content: ["/htmlInput"],
    theme: {
      extend: {
        // ...
      },
    },
    plugins: [],
  };
  let result = await postcss(
    [tailwindcss(config), autoprefixer()].filter(Boolean)
  ).process(
    `@tailwind base;
@tailwind components;
@tailwind utilities;
      `,
    {
      from: VIRTUAL_SOURCE_PATH,
    }
  );
  postMessage({ ...event.data, css: result.css });
});
