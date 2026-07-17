import { Sulphur_Point } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <main className="relative flex h-full w-full flex-col overflow-y-auto bg-white">
        <section className="relative h-[320px] overflow-hidden bg-white">
          <Image
            src="/images/Vector.svg"
            alt=""
            className="absolute top-0 left-0 w-[172px]"
            height={172}
            width={172}
          />
          <Image
            src="/images/Vector%20(1).svg"
            alt=""
            className="absolute top-[19px] left-[252px] w-[138px]"
            height={138}
            width={138}
          />
          <Image
            src="/images/Vector%20(2).svg"
            alt=""
            className="absolute top-[101px] left-[92px] w-[121px]"
            height={121}
            width={121}
          />
          <Image
            src="/images/Vector%20(3).svg"
            alt=""
            className="absolute bottom-0 left-0 w-24"
            height={96}
            width={96}
          />
          <Image
            src="/images/character.svg"
            alt="Gongmozip mascot"
            className="absolute top-1/2 left-1/2 w-52 -translate-x-1/2 -translate-y-1/2"
            height={208}
            width={208}
          />
        </section>

        <section className="flex flex-col items-center px-6 pt-2 pb-10">
          <h1
            className={`${sulphurPoint.className} self-stretch bg-gradient-to-r from-[#FF7658] to-[#FFAD62] bg-clip-text text-center text-[36px] leading-normal font-normal tracking-[-1.44px] text-transparent`}
          >
            gongmo.zip
          </h1>
          <p className="mt-2 mb-6 text-sm text-gray-500">
            공모전 수상을 위한 최고의 팀 매칭 서비스
          </p>

          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              className="relative flex w-full items-center justify-center rounded-xl bg-[#FEE500] py-3.5 text-sm font-medium text-black"
            >
              <Image
                alt=""
                className="absolute left-4 h-4 w-auto"
                height={16}
                src="/images/icons/kakao.svg"
                width={16}
              />
              <span>카카오 로그인</span>
            </button>

            <button
              type="button"
              className="relative flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-800"
            >
              <Image
                alt=""
                className="absolute left-4 h-5 w-auto"
                height={20}
                src="/images/icons/Google.svg"
                width={20}
              />
              <span>Google 계정으로 로그인</span>
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
            <Link href="/signup">회원가입</Link>
            <span className="text-gray-200">|</span>
            <Link href="/login/email">이메일 로그인</Link>
            <span className="text-gray-200">|</span>
            <Link href="/contact">문의하기</Link>
          </div>
        </section>
    </main>
  );
}
