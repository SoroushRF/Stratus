export function Footer() {
    return (
        <footer className="mt-auto border-t border-white/5 bg-black/20 py-8 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Stratus Project. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Terms
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Support
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
