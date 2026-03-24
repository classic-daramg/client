import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.join(__dirname, "../public/icons/classignul");
const OUTPUT_DIR = path.join(__dirname, "../public/icons/classignul-optimized");

const TARGET_WIDTH = 750; // 모바일 @2x 기준
const WEBP_QUALITY = 82;

if (!existsSync(OUTPUT_DIR)) {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

const files = (await readdir(INPUT_DIR)).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

console.log(`\n총 ${files.length}개 이미지 변환 시작...\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputName = file.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  const outputPath = path.join(OUTPUT_DIR, outputName);

  const { size: sizeBefore } = await import("fs").then((fs) =>
    fs.promises.stat(inputPath)
  );

  await sharp(inputPath)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const { size: sizeAfter } = await import("fs").then((fs) =>
    fs.promises.stat(outputPath)
  );

  const reduction = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1);
  const beforeMB = (sizeBefore / 1024 / 1024).toFixed(1);
  const afterKB = (sizeAfter / 1024).toFixed(0);

  console.log(`${file}`);
  console.log(`  ${beforeMB}MB → ${afterKB}KB  (${reduction}% 감소)\n`);

  totalBefore += sizeBefore;
  totalAfter += sizeAfter;
}

const totalReduction = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);
console.log("─────────────────────────────────────────");
console.log(`전체: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB (${totalReduction}% 감소)`);
console.log(`\n변환 완료: ${OUTPUT_DIR}`);
