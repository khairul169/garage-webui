{
  description = "Garage Web UI - an admin web UI for Garage object storage";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        inherit (pkgs) lib;

        version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
        src = lib.cleanSource ./.;

        # The Vite/React UI. pnpmConfigHook installs the locked dependencies
        # from the pnpm store populated by fetchPnpmDeps.
        frontend = pkgs.stdenvNoCC.mkDerivation {
          pname = "garage-webui-frontend";
          inherit version src;

          nativeBuildInputs = with pkgs; [
            nodejs_22
            pnpm_10
            pnpmConfigHook
          ];

          pnpmDeps = pkgs.fetchPnpmDeps {
            pname = "garage-webui";
            inherit version src;
            pnpm = pkgs.pnpm_10;
            fetcherVersion = 5;
            hash = "sha256-+TLHwealIXo4jdD10D6cdCxQl5iR7G7QC5BTNi9Bd5k=";
          };

          buildPhase = ''
            runHook preBuild
            pnpm run build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist $out/dist
            runHook postInstall
          '';
        };

        # The Go backend, built in prod mode so the UI is embedded into the
        # binary via go:embed. The binary is the complete application.
        clean = pkgs.writeShellScriptBin "clean" ''
          export ROOT="$PWD"
          exec ${pkgs.bash}/bin/bash ${./scripts/clean.sh} "$@"
        '';

        garage-webui = pkgs.buildGoModule {
          pname = "garage-webui";
          inherit version;
          src = lib.cleanSource ./backend;

          vendorHash = "sha256-7z6r6w/SbBlYYHMxm11xFl/QEYZc2KebnOJZRgYRUYk=";
          subPackages = [ "." ];
          tags = [ "prod" ];
          env.GOTOOLCHAIN = "local";

          preBuild = ''
            mkdir -p ui/dist
            cp -r ${frontend}/dist/. ui/dist/
          '';

          checkPhase = ''
            runHook preCheck
            go test ./...
            runHook postCheck
          '';

          meta = with lib; {
            description = "Web UI for Garage object storage";
            homepage = "https://github.com/khairul169/garage-webui";
            license = licenses.mit;
            mainProgram = "garage-webui";
            platforms = platforms.unix;
          };
        };
      in
      {
        packages = {
          default = garage-webui;
          inherit frontend garage-webui;
        };

        apps = {
          default = flake-utils.lib.mkApp { drv = garage-webui; };
          clean = {
            type = "app";
            program = "${clean}/bin/clean";
          };
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            air
            curl
            garage_2
            go
            gopls
            jq
            nodejs_22
            pnpm_10
          ];

          shellHook = ''
            export PATH="$PWD/scripts:$PATH"
            echo "garage-webui development shell"
            echo "  pnpm install  # install frontend dependencies"
            echo "  dev           # start local Garage, API and Vite"
          '';
        };

        formatter = pkgs.nixfmt;

        checks = {
          inherit garage-webui;
        };
      }
    );
}
