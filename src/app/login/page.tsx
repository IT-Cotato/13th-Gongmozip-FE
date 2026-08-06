import { Sulphur_Point } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/http";

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: "400",
});

export default function LoginPage() {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white">
      <Image
        src="/images/home/login-background.svg"
        alt=""
        fill
        aria-hidden="true"
        className="pointer-events-none object-cover"
      />
      <Image
        src="/images/home/login-character.png"
        alt=""
        aria-hidden="true"
        width={246}
        height={249}
        className="pointer-events-none absolute top-[19%] left-[calc(50%-10px)] h-auto w-[63%] max-w-[246px] -translate-x-1/2"
      />

      <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-9 bg-gradient-to-b from-white/0 to-white to-40% px-6 pt-16 pb-10">
        <div className="flex w-full max-w-[269px] flex-col items-center gap-1 text-center">
          <h1
            className={`${sulphurPoint.className} w-full bg-gradient-to-r from-[#FF7658] to-[#FFAD62] bg-clip-text text-[36px] leading-normal font-normal tracking-[-1.44px] text-transparent`}
          >
            gongmo.zip
          </h1>
          <p className="w-full text-[13px] leading-[1.35] text-[#616161]">
            공모전 수상을 위한 최고의 팀 매칭 서비스
          </p>
        </div>

        <div className="flex w-full max-w-[300px] flex-col items-center gap-4">
          <a
            href={`${API_BASE_URL}/oauth2/authorization/kakao`}
            className="relative flex h-12 w-full items-center justify-center rounded-[6px] bg-[#FEE500] px-3.5"
          >
            <Image
              alt=""
              className="absolute left-3.5 h-[18px] w-auto"
              height={18}
              width={18}
              src="/icons/auth/kakao.svg"
            />
            <span className="text-[15px] font-semibold text-black/85">카카오 로그인</span>
          </a>

          <a
            href={`${API_BASE_URL}/oauth2/authorization/google`}
            className="relative flex h-12 w-full items-center justify-center rounded-[6px] border border-[#E7E7E7] bg-white px-4"
          >
            <Image
              alt=""
              className="absolute left-4 h-5 w-5"
              height={20}
              width={20}
              src="/icons/auth/Google.svg"
            />
            <span className="text-[14px] font-medium text-[#121212]">Google 계정으로 로그인</span>
          </a>

          <div className="flex items-center gap-3 text-[13px] font-semibold text-[#616161]">
            <Link href="/signup">회원가입</Link>
            <span className="h-3 w-px bg-[#e7e7e7]" />
            <Link href="/login/email">이메일 로그인</Link>
            <span className="h-3 w-px bg-[#e7e7e7]" />
            <Link href="/contact">문의하기</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
