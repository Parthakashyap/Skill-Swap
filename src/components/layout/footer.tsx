export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex-col md:flex-row flex items-center justify-between py-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground mt-2 md:mt-0">
          Designed with ❤️ for the community.
        </p>
      </div>
    </footer>
  );
}
