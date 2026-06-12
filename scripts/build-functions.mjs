import * as esbuild from "esbuild";
import { mkdirSync, existsSync, rmSync, copyFileSync, cpSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INPUT_DIR = join(ROOT, "functions");
const OUTPUT_DIR = join(ROOT, "dist");

/**
 * 打包 Functions 到 dist 目录
 * Cloudflare Workers 支持打包后的代码
 */
async function buildFunctions() {
  console.log("🔨 Building Functions...\n");

  // 打包主要 API 文件
  await esbuild.build({
    entryPoints: [join(INPUT_DIR, "api", "[[path]].ts")],
    bundle: true,
    platform: "browser",
    target: ["es2020"],
    format: "esm",
    outfile: join(OUTPUT_DIR, "functions", "api", "[[path]].js"),
    minify: false,
    sourcemap: false, // 关闭 sourceMap 减少体积
    external: [],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    logLevel: "info",
  });

  // 打包 AI 创建功能
  await esbuild.build({
    entryPoints: [join(INPUT_DIR, "api", "decisions", "ai-create.ts")],
    bundle: true,
    platform: "browser",
    target: ["es2020"],
    format: "esm",
    outfile: join(OUTPUT_DIR, "functions", "api", "decisions", "ai-create.js"),
    minify: false,
    sourcemap: false,
    external: [],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    logLevel: "info",
  });

  console.log("\n✅ Functions built and copied to dist/functions!");
}

// 运行构建
buildFunctions().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});