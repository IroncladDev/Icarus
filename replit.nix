{ pkgs }: {
  deps = [
    pkgs.nodePackages_latest.pnpm
    pkgs.nodejs_20
  ];
}