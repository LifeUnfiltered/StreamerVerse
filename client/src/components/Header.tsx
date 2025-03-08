import { SiYoutube } from "react-icons/si";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <div className="flex items-center gap-2">
          <SiYoutube className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Video Stream
          </h1>
        </div>
      </div>
    </header>
  );
}
