import { Link } from "react-router-dom";
// import LetterGlitch from "../shadcn/LetterGlitch";

interface AppStatusPageProps {
  code: string;
  message: string;
  actionTo?: string;
  actionLabel?: string;
}

export function AppStatusPage({
  code,
  message,
  actionTo = "/",
  actionLabel = "Return to Home",
}: AppStatusPageProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        {/* <LetterGlitch
          glitchColors={["#0ea5e9", "#14b8a6", "#38bdf8"]}
          glitchSpeed={80}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        /> */}
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          {code}
        </h1>

        <p className="mt-2 max-w-md text-base sm:text-lg md:text-xl lg:text-2xl">
          {message}
        </p>

        <Link
          to={actionTo}
          className="group mt-4 flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md sm:px-5 sm:py-2.5 sm:text-base"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
