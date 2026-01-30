# Publishing Orshot CLI to Homebrew

This guide explains how to make `orshot-cli` installable via Homebrew (e.g., `brew install orshot`).

## Prerequisites

1. The package must be published to NPM registry (`npm publish`).
2. You need a GitHub repository to host the Homebrew Tap (e.g., `orshot/homebrew-tap`).

## Step 1: Create a Homebrew Tap Repository

Create a new public repository on GitHub named `homebrew-tap`.
Clone it locally:

```bash
git clone https://github.com/orshot/homebrew-tap.git
cd homebrew-tap
```

## Step 2: Create the Formula

Create a file named `orshot.rb` in your tap repository:

```ruby
require "language/node"

class Orshot < Formula
  desc "CLI for Orshot - Automated Image Generation"
  homepage "https://orshot.com"
  url "https://registry.npmjs.org/orshot-cli/-/orshot-cli-1.0.0.tgz"
  sha256 "REPLACE_WITH_SHA256_OF_TARBALL"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "Usage: orshot [options] [command]", shell_output("#{bin}/orshot --help")
  end
end
```

### Important: Update URL and SHA256
Every time you release a new version on NPM:
1. Update usage `url` to match the new version tarball.
2. Calculate the SHA256 checksum of the tarball:
   ```bash
   curl -sL https://registry.npmjs.org/orshot-cli/-/orshot-cli-1.0.0.tgz | shasum -a 256
   ```
3. Update `sha256` in the formula.

## Step 3: Publish the Tap

Push the `orshot.rb` file to your GitHub repository:

```bash
git add orshot.rb
git commit -m "Add orshot formula"
git push origin main
```

## Step 4: Installation for Users

Users can now install the CLI using:

```bash
brew tap orshot/tap
brew install orshot
```

## Automating Updates (Optional)

You can use GitHub Actions in your `orshot-cli` repo to automatically update the Homebrew formula when you publish to NPM.

1. Add a workflow file `.github/workflows/homebrew.yml`:

```yaml
name: Update Homebrew Formula
on:
  release:
    types: [published]

jobs:
  homebrew:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update Homebrew Formula
        uses: mislav/bump-homebrew-formula-action@v2
        with:
          # A PR will be sent to orshot/homebrew-tap to update this formula:
          formula-name: orshot
          homebrew-tap: orshot/homebrew-tap
          download-url: https://registry.npmjs.org/orshot-cli/-/orshot-cli-${{ github.event.release.tag_name }}.tgz
        env:
          COMMITTER_TOKEN: ${{ secrets.COMMITTER_TOKEN }}
```

## Verification

After pushing, test the installation locally:

```bash
brew install orshot/tap/orshot
orshot --version
```
