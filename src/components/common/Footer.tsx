export default function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-6 mt-auto">
      <div className="flex flex-col items-center justify-between mx-96 gap-4 md:flex-row md:gap-0">
        <div className="flex gap-20">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Всі права захищені.
          </p>
          <a
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Політика конфіденційності
          </a>
          <a
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Умови використання
          </a>
        </div>
      </div>
    </footer>
  );
}
