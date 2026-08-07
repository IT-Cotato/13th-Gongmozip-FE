"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { COLLABORATION_RESULT_TYPES } from "../../_data/collaborationTest";

type CollaborationResult = (typeof COLLABORATION_RESULT_TYPES)[number];

type CollaborationTypeResultPageContentProps = {
  result: CollaborationResult;
};

const RESULT_CARD_WIDTH = 318;
const RESULT_CARD_HEIGHT = 462;
const RESULT_CARD_PADDING_X = 16;
const COLLABORATION_TYPE_RETURN_TO_STORAGE_KEY = "collaborationTypeReturnTo";

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawCenteredText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  context.fillText(text, x, y, maxWidth);
}

function drawDescriptions(
  context: CanvasRenderingContext2D,
  descriptions: readonly string[],
  x: number,
  startY: number,
) {
  descriptions.forEach((description, index) => {
    context.fillText(`· ${description}`, x, startY + index * 20);
  });
}

async function loadImage(src: string) {
  const image = document.createElement("img");

  image.decoding = "async";
  image.src = src;

  await image.decode();

  return image;
}

async function saveResultImage(result: CollaborationResult) {
  await document.fonts.ready;

  const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  canvas.width = RESULT_CARD_WIDTH * pixelRatio;
  canvas.height = RESULT_CARD_HEIGHT * pixelRatio;
  canvas.style.width = `${RESULT_CARD_WIDTH}px`;
  canvas.style.height = `${RESULT_CARD_HEIGHT}px`;

  context.scale(pixelRatio, pixelRatio);
  context.textBaseline = "middle";

  drawRoundRect(context, 1, 1, RESULT_CARD_WIDTH - 2, RESULT_CARD_HEIGHT - 2, 12);
  context.fillStyle = "#FFFFFF";
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = result.borderColor;
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = result.nameColor;
  context.font = "700 30px Pretendard, sans-serif";
  drawCenteredText(context, result.name, RESULT_CARD_WIDTH / 2, 36, 286);

  const quoteBoxX = (RESULT_CARD_WIDTH - result.quoteBoxWidth) / 2;
  drawRoundRect(context, quoteBoxX, 63, result.quoteBoxWidth, 32, 16);
  context.fillStyle = result.quoteBoxColor;
  context.fill();

  context.fillStyle = "#FFFFFF";
  context.font = "600 13px Pretendard, sans-serif";
  drawCenteredText(context, result.quote, RESULT_CARD_WIDTH / 2, 79, result.quoteBoxWidth - 24);

  const characterImage = await loadImage(result.imageSrc);
  context.drawImage(characterImage, 89, 103, 140, 140);

  context.fillStyle = result.hashtagColor;
  context.font = "600 12px Pretendard, sans-serif";
  drawCenteredText(context, result.hashtags.join(" "), RESULT_CARD_WIDTH / 2, 261, 286);

  const featureBoxX = RESULT_CARD_PADDING_X;
  const featureBoxY = 278;
  const featureBoxWidth = RESULT_CARD_WIDTH - RESULT_CARD_PADDING_X * 2;
  const featureBoxHeight = 166;

  drawRoundRect(context, featureBoxX, featureBoxY, featureBoxWidth, featureBoxHeight, 8);
  context.fillStyle = "#F9F8F4";
  context.fill();

  context.textAlign = "left";
  context.fillStyle = result.featureTitleColor;
  context.font = "600 13px Pretendard, sans-serif";
  context.fillText("당신의 협업스타일의 특징은?", featureBoxX + 14, featureBoxY + 18);

  result.traits.forEach((trait, traitIndex) => {
    const y = featureBoxY + 45 + traitIndex * 23;
    const barX = featureBoxX + 62;
    const barY = y - 3;
    const barWidth = 144;
    const segmentWidth = barWidth / 5;

    context.fillStyle = result.traitLabelColor;
    context.font = "600 12px Pretendard, sans-serif";
    context.textAlign = "left";
    context.fillText(trait.left, featureBoxX + 14, y);

    drawRoundRect(context, barX, barY, barWidth, 7, 4);
    context.fillStyle = "rgba(97, 97, 97, 0.1)";
    context.fill();

    for (let index = 0; index < 4; index += 1) {
      const segmentX = barX + index * segmentWidth;

      context.fillStyle = result.traitBarColor;
      context.fillRect(segmentX, barY, segmentWidth - 1, 7);
    }

    context.fillStyle = "#949494";
    context.font = "500 13px '42dot Sans', Pretendard, sans-serif";
    context.textAlign = "right";
    context.fillText(trait.right, featureBoxX + featureBoxWidth - 14, y);
  });

  context.fillStyle = "#555555";
  context.font = "400 13px Pretendard, sans-serif";
  context.textAlign = "left";
  drawDescriptions(context, result.descriptions, featureBoxX + 14, featureBoxY + 111);

  const imageUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");

  link.href = imageUrl;
  link.download = `gongmozip-${result.id}-runner.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function CollaborationTypeResultPageContent({
  result,
}: CollaborationTypeResultPageContentProps) {
  const router = useRouter();

  const handleLeave = () => {
    const returnTo = window.sessionStorage.getItem(COLLABORATION_TYPE_RETURN_TO_STORAGE_KEY);

    if (
      returnTo?.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.startsWith("/collaboration-type")
    ) {
      window.sessionStorage.removeItem(COLLABORATION_TYPE_RETURN_TO_STORAGE_KEY);
      router.push(returnTo);

      return;
    }

    if (window.history.length > 1) {
      router.back();

      return;
    }

    router.push("/collaboration-type");
  };

  const handleSave = () => {
    void saveResultImage(result);
  };

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <header className="z-10 flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <span className="h-6 w-6" aria-hidden="true" />
        <h1 className="text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
          협업 유형 검사
        </h1>
        <button
          aria-label="협업 유형 검사 닫기"
          className="flex h-6 w-6 items-center justify-center"
          onClick={handleLeave}
          type="button"
        >
          <Image alt="" height={24} priority src="/icons/contests/x.svg" width={24} />
        </button>
      </header>

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-7 pt-[38px]">
        <section
          className="mx-auto flex w-[318px] max-w-full flex-col items-center justify-center rounded-[12px] border-2 bg-white py-4"
          style={{ borderColor: result.borderColor }}
        >
          <h2
            className="flex h-[39px] self-stretch items-center justify-center text-center font-[Pretendard] text-[30px] font-bold leading-[135%]"
            style={{ color: result.nameColor }}
          >
            {result.name}
          </h2>

          <p
            className="mt-2 flex h-8 max-w-full items-center justify-center gap-2.5 rounded-[75px] px-[13px] py-2 text-center font-[Pretendard] text-[13px] font-semibold leading-[125%] whitespace-nowrap text-white"
            style={{ width: `${result.quoteBoxWidth}px`, backgroundColor: result.quoteBoxColor }}
          >
            {result.quote}
          </p>

          <div className="mt-2 flex aspect-square h-[140px] w-[140px] items-center justify-center">
            <Image
              alt={`${result.name} 캐릭터`}
              className="h-full w-full object-contain"
              height={140}
              priority
              src={result.imageSrc}
              width={140}
            />
          </div>

          <p
            className="mt-2 w-[286px] max-w-[calc(100%-24px)] text-center font-[Pretendard] text-[12px] font-semibold leading-[135%]"
            style={{ color: result.hashtagColor }}
          >
            {result.hashtags.join(" ")}
          </p>

          <div className="mt-2 flex w-[286px] max-w-[calc(100%-24px)] flex-col items-start justify-center gap-[8px] rounded-[8px] bg-[#F9F8F4] px-[14px] py-4">
            <h3
              className="h-4 self-stretch font-[Pretendard] text-[13px] font-semibold leading-[125%]"
              style={{ color: result.featureTitleColor }}
            >
              당신의 협업스타일의 특징은?
            </h3>

            <div className="flex w-full flex-col gap-[8px]">
              {result.traits.map((trait) => (
                <div
                  className="grid grid-cols-[40px_1fr_40px] items-center gap-[8px]"
                  key={trait.left}
                >
                  <span
                    className="font-[Pretendard] text-[12px] font-semibold leading-[135%]"
                    style={{ color: result.traitLabelColor }}
                  >
                    {trait.left}
                  </span>
                  <div
                    aria-hidden="true"
                    className="relative top-[3px] flex h-[7px] shrink-0 self-stretch overflow-hidden rounded-[90px] bg-[rgba(97,97,97,0.1)]"
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        className="h-full flex-1 border-r border-[#F9F8F4] last:border-r-0"
                        key={index}
                        style={{
                          backgroundColor:
                            index < 4 ? result.traitBarColor : "rgba(97, 97, 97, 0.1)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-right font-['42dot_Sans'] text-[13px] font-medium leading-[125%] text-[#949494]">
                    {trait.right}
                  </span>
                </div>
              ))}
            </div>

            <ul className="w-[258px] max-w-full font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#555555]">
              {result.descriptions.map((description) => (
                <li key={description}>· {description}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#EFEFEF] px-8 py-[9px] font-[Roboto] text-[15px] font-bold leading-none text-[#616161]"
          onClick={handleLeave}
          type="button"
        >
          나가기
        </button>
        <button
          className="mt-[10px] flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[15px] font-bold leading-none text-white"
          onClick={handleSave}
          type="button"
        >
          저장하기
        </button>
      </div>
    </main>
  );
}
