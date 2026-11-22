---
title: "Analysis of JavaScript Package Managers"
description: "This post examines a few of the best or most popular JavaScript package management tools. I tell you why you shoud use JSR.io and compare it to the other tools out there like npm and pnpm etc."
publishDate: "2026-10-04T08:23:00Z"
tags: ["seedling", "jsr", "npm", "javascript", "nodejs", "deno"]
status: ["seedling", "draft"]
---

# **Technical Report: JavaScript Package Managers, Registries, and Ecosystem Interoperability**

## **Landscape Overview and Architectural Evolution**

The JavaScript and TypeScript ecosystem relies on a sophisticated web of package management tools, package registries, and runtime engines1. What began as a single-runtime environment centered around Node.js and the official npm registry has expanded into a multi-runtime, multi-registry landscape1. Software developers now deploy applications across diverse server, edge, and browser execution layers—including Node.js, Deno, Bun, Cloudflare Workers, and modern web browsers—requiring package managers and registries to adapt to varying module systems, dependency resolution strategies, and security guarantees2.  
The architectural evolution of package management in JavaScript can be categorized into four distinct eras:

> 1. **The Monolithic Dependency Tree Era (npm v1–v2)**: Dependencies were nested recursively inside local project directories. This approach created deep file system paths, excessive disk duplication, and file path length collisions on certain operating systems.  
> 2. **The Flattened Dependency Tree Era (npm v3–v6, Yarn Classic)**: Package managers transitioned to flattened dependency trees through hoisting algorithms. While this strategy resolved path depth limits and reduced duplication, it introduced "phantom dependencies"—a flaw where application code can successfully import transitive packages that are not explicitly declared in the project manifest1.  
> 3. **The Global Storage and Strict Graph Era (pnpm, Yarn Berry)**: Modern tools introduced content-addressable global stores, symlink/hard-link directory topologies, and virtual filesystem layers such as Plug'n'Play (PnP)4. These architectures enforce strict dependency boundaries, save gigabytes of local storage, and accelerate continuous integration pipelines4.  
> 4. **The Native Runtime and Registry Optimization Era (Bun, JSR, Rust Rewrites)**: Integrated runtimes featuring native package managers written in compiled languages like Zig and Rust deliver sub-second installation speeds, while modern registries like the JavaScript Registry (JSR) remove build and transpilation friction for TypeScript authors1.

Alongside performance improvements, supply chain security has become an urgent priority across client tools and registry platforms3. Automated supply chain attacks—such as the Shai-Hulud worm waves and targeted compromises of widely used utilities like debug and chalk—have driven the adoption of defensive controls8. Modern package managers now offer default blocks on untrusted lifecycle execution scripts (such as preinstall and postinstall), release quarantine cooldown windows (minimumReleaseAge), and cryptographic build provenance attestations8.

## **Comparative Architecture and Performance of Package Managers**

Modern package management tools differ in their underlying execution binaries, storage layouts, dependency resolution safety, and runtime compatibility.

### **Package Manager Tool Deep Dives**

#### **npm (Node Package Manager)**

Bundled by default with every Node.js distribution, npm prioritizes backward compatibility and ecosystem ubiquity1. The client utilizes a flattened directory layout generated via hoisting algorithms1. Modern iterations (npm 11 and npm 12\) have improved resolution caching and added supply chain defenses—including configurable release cooldown gates via min-release-age5. However, because npm copies dependency packages directly into each local project directory, it uses significantly more disk space and exhibits slower cold installation speeds than content-addressable alternatives4.

#### **pnpm (Performant npm)**

pnpm uses a global content-addressable store (\~/.local/share/pnpm/store) combined with a symlinked directory layout4. Dependencies are downloaded once per machine; individual projects then create hard links to this central store, eliminating file redundancy across multiple repositories4. pnpm enforces a strict dependency graph, permitting code to import only packages explicitly listed in its manifest, which prevents phantom dependency bugs5. pnpm 12 introduced a core engine rewrite in Rust, further optimizing dependency graph calculations7. Additionally, pnpm enforces consumer-side supply chain security through strict build controls (strictDepBuilds) and automated release quarantine windows8.

#### **Yarn (Yarn Berry / v4)**

Originally created by Facebook to resolve early npm performance limitations, Yarn has evolved into Yarn Berry (v4.x)4. Yarn supports two operational modes: a traditional directory mode using hard links, and Plug'n'Play (PnP) mode4. PnP eliminates local dependency folders entirely by generating a single .pnp.cjs mapping file that points directly to compressed zip archives in a global cache1. This enables zero-install repository architectures where dependencies are committed directly to version control1. While PnP offers reproducible builds, it occasionally requires compatibility shims for developer tools that expect a traditional node modules directory structure4.

#### **Bun (bun install)**

Integrated directly into the Bun runtime and written in Zig, bun install operates both as a full runtime toolchain and as a standalone package manager for standard Node.js projects1. It uses custom binary lockfiles (bun.lockb or text-based bun.lock), system-level file cloning (copyfile / clonefile), and a centralized cache (\~/.bun/install/cache)1. bun install completes fresh installs up to 18 times faster than legacy npm configurations by leveraging native multithreading and fast HTTP socket management4. Although designed for the Bun runtime, its package manager CLI can resolve npm registry dependencies for projects running under standard Node.js environments7.

| Feature / Metric | npm (v11/v12) | pnpm (v11/v12) | Yarn Berry (v4) | Bun (v1.4) |
| :---- | :---- | :---- | :---- | :---- |
| Core Engine Language | JavaScript | Rust / TypeScript7 | TypeScript7 | Zig1 |
| Storage Architecture | Local Flat Duplication1 | Global Content-Addressable Hard-Links4 | Virtual PnP Zip Archives or Flat1 | Global Fast-Clone Cache1 |
| Resolution Safety | Hoisted (Phantom Risk)1 | Strict Symlinked Graph (No Phantoms)5 | Strict Map (PnP) or Hoisted1 | Hoisted / Hard-Link Compatible1 |
| Cold Install Speed | 14.0s – 18.1s7 | 4.0s – 7.5s5 | 5.0s – 8.5s1 | 1.2s – 1.4s4 |
| Warm Install Speed | \~4.8s6 | \<0.8s6 | \~1.0s1 | \<0.3s1 |
| Disk Efficiency | Low (Duplicates files)4 | High (50%–70% disk savings)4 | High in PnP Mode1 | High (Shared global cache)1 |
| Monorepo Workspaces | Native (workspaces)1 | Advanced Filtering (--filter)1 | Native (workspaces)1 | Native Workspaces1 |
| Security Cooldown Gate | min-release-age \[cite: 10\] | minimumReleaseAge \[cite: 10\] | npmMinimalAgeGate \[cite: 10\] | minimumReleaseAge \[cite: 10\] |
| CLI Download Volume | \~15.6M weekly7 | \~177.2M weekly (transitive)7 | \~9.5M weekly7 | \~3.5M weekly7 |
| Supported Runtimes | Node.js (Primary)1 | Node.js, Bun, Deno5 | Node.js, Bun7 | Bun, Node.js7 |

## **Technical Analysis of Package Registries and CDNs**

Package registries serve as centralized or distributed repositories hosting source code archives, binary artifacts, and metadata manifests12.

### **Primary Registries**

#### **Official npm Registry (registry.npmjs.org)**

The standard public registry for the JavaScript ecosystem, hosting over 4.04 million package documents and logging hundreds of millions of daily downloads5. It supports universal runtime usage and cryptographic provenance attestations via GitHub Actions11. However, because it hosts legacy CommonJS modules alongside modern ES modules, package authors must build, bundle, and maintain complex type definitions (.d.ts) manually3.

#### **JSR (JavaScript Registry \- jsr.io)**

An open-source, TypeScript-first registry created by the Deno team to modernise package distribution2. JSR stores raw TypeScript source files2. When accessed by Node.js or Bun applications, JSR automatically transpiles source files to JavaScript and generates type definition files via its @jsr compatibility endpoint (npm.jsr.io)2. It enforces ES-module standards, package version immutability, auto-generated documentation, and automated quality scoring2. It requires strict "slow-type" explicit annotations on exported signatures and disallows CommonJS dependencies11.

#### **GitHub Packages (npm.pkg.github.com)**

An enterprise package hosting service integrated into GitHub repository permissions and organization billing13. It simplifies governance for private corporate libraries by reusing GitHub Personal Access Tokens (PATs) and repository controls13. Downstream consumers must configure scoped registry credentials in a local .npmrc file, creating adoption friction for open-source public packages19.

### **ESM Edge CDNs and On-Demand Registries**

Edge CDNs serve web browsers and serverless runtimes by transforming registry packages into browser-native ES modules20.

> * **esm.sh**: A specialized edge CDN worker that converts npm and JSR packages into browser-native ES modules on demand20. It rewrites bare specifiers, handles CJS-to-ESM conversion, compiles .ts, .tsx, .vue, and .svelte files on the fly, and appends X-TypeScript-Types headers for editor autocompletion20.  
> * **jsDelivr**: A global multi-CDN infrastructure featuring DNS-level health probes and dynamic traffic steering20. It mirrors the public npm registry and GitHub releases, delivering low latency across international edge locations20.  
> * **unpkg**: A lightweight CDN fronting the npm registry, designed for quick prototyping and browser script tags20. Cold cache misses can incur latency penalties due to on-demand tarball extraction22.

| Feature / Metric | npm Registry | JSR (jsr.io) | GitHub Packages | ESM CDNs (esm.sh / jsDelivr) |
| :---- | :---- | :---- | :---- | :---- |
| Primary Hosting Target | Universal JS/TS Libraries11 | Modern TS & Native ESM2 | Private Enterprise Packages13 | Edge Browsers & Serverless20 |
| TypeScript Integration | Manual build / @types/\* \[cite: 11, 15\] | Native TS source auto-transpiled2 | Manual build setup13 | On-the-fly conversion & headers20 |
| Module System | CommonJS & ESM3 | Strict ESM-Only2 | CommonJS & ESM13 | Web-Standard ESM20 |
| Version Immutability | Restricted unpublishing15 | Fully Immutable3 | Enterprise Permission Controls17 | Pinned Build Cache20 |
| Publishing DX | Requires build script (tsup/tsc)11 | Zero-config source upload (deno/npx jsr publish)11 | Requires scoped .npmrc PAT setup19 | Automated mirror from npm/JSR20 |
| Total Package Index | \~4.04 Million Packages14 | \>40,000 Packages15 | Private / Organizational13 | Mirrors npm & JSR20 |
| Supported Runtimes | Node, Deno, Bun, Edge11 | Node, Deno, Bun, Workers2 | Node, Bun, Deno13 | Browsers, Deno, Edge20 |

## **Cross-Runtime Compatibility and Ecosystem Interoperability**

Modern application development requires interoperability across disparate runtime execution models2.  
Node.js relies on package.json manifest configurations and traditional file system search algorithms1. Node.js supports npm, pnpm, Yarn, and Bun CLI managers7. JSR packages are integrated into Node.js projects through the @jsr compatibility layer via npx jsr add @scope/pkg or direct pnpm/Yarn scope configurations16. This layer points to https\://npm.jsr.io, which dynamically transpiles TypeScript source files into npm-compatible tarballs containing JavaScript files and type declarations16.  
Deno executes TypeScript directly without requiring an intermediate build step2. Deno uses deno.json or package.json manifests and resolves dependencies via explicit specifiers, such as jsr:@scope/pkg or npm:package-name24. It downloads modules directly into a global system cache rather than requiring a local project directory, though it can create a local folder when interfacing with legacy npm packages24.  
The Bun runtime resolves dependencies using package.json manifests, inline npm: specifiers, or JSR scopes1. Bun directly executes TypeScript and JSX files natively, combining runtime execution with native package management speed1.  
Cloudflare Workers and serverless edge platforms require ECMAScript Modules (ESM) and small footprint sizes3. Edge deployment pipelines benefit from JSR packages and esm.sh edge transformations due to their strict ESM compliance and absence of Node.js-specific native binary bindings3.

## **CI/CD Pipeline Economics and Performance Benchmarks**

Package installation times directly impact continuous integration costs and software delivery speed5. When development teams run hundreds of automated builds daily, performance differences between package managers accumulate into measurable compute overhead5.  
The financial and operational impact can be calculated by evaluating installation duration across build frequencies:  
![][image1]  
In an enterprise environment executing 500 CI builds daily on a medium-sized web application:

> * **npm (v11/v12)**: Averaging a 4.8-second warm install yields 40 minutes of cumulative CI compute time spent strictly resolving dependencies each day5.  
> * **pnpm (v11/v12)**: Averaging a 0.75-second warm install reduces cumulative daily install compute time to 6.25 minutes6. This shift saves over 33 minutes of compute time daily—recovering roughly 3.8 compute hours weekly5.  
> * **Bun (bun install)**: Executing fresh cold installs in 1.2 to 1.4 seconds (compared to 18.1 seconds for npm) saves hours of build time during cold cache pipeline runs7.

For large engineering teams, migrating from npm to pnpm or Bun reduces cloud runner costs and speeds up developer feedback loops5.

## **Strategic Tool Rankings and Evaluation**

The following rankings evaluate tools and registries based on installation performance, disk efficiency, dependency safety, supply chain security, publishing developer experience (DX), and cross-runtime flexibility.

### **Package Manager Tool Rankings**

#### **1\. pnpm — Overall Winner**

pnpm provides the strongest balance of speed, strict dependency safety, and disk space efficiency4. Its symlinked directory architecture isolates workspace boundaries and prevents phantom dependency bugs, while its Rust-optimized core engine handles large enterprise monorepos efficiently without requiring teams to abandon the Node.js runtime1.

#### **2\. Bun (bun install) — Speed & Innovation Winner**

Bun delivers the fastest installation performance in the JavaScript ecosystem, installing packages up to 18 times faster than legacy npm configurations4. Its integrated toolchain—combining a runtime, test runner, bundler, and package manager—simplifies project setup1. It takes second place overall because its runtime ecosystem is newer than Node.js when handling legacy enterprise edge cases1.

#### **3\. Yarn Berry (v4) — Specialized Architecture Winner**

Yarn Berry offers advanced virtual filesystem capabilities through Plug'n'Play (PnP) mode and supports deterministic zero-install repository setups1. However, the initial setup overhead of PnP and occasional compatibility friction with third-party tools place it behind pnpm for general application development4.

#### **4\. npm (v11/v12) — Default Ubiquity Standard**

npm remains the universal default bundled with Node.js1. While recent updates have added useful supply chain security options and audit tools, its file-duplication model consumes significantly more disk space and results in slower installations than modern alternatives4.

### **Package Registry Rankings**

#### **1\. JSR (JavaScript Registry) — Best Developer Experience & Publishing DX**

JSR offers the most efficient publishing experience for TypeScript library authors11. By ingesting raw TypeScript source code directly, auto-generating .d.ts declaration files and documentation, enforcing ESM standards, and providing seamless backward compatibility with npm clients, JSR removes traditional build and bundling pipeline friction2.

#### **2\. npm Registry — Universal Distribution Standard**

The npm registry remains the central repository for the JavaScript ecosystem11. Although publishing TypeScript packages requires manual build scripts and transpilation setups, its massive package index and universal compatibility make it an essential distribution target for open-source software11.

#### **3\. GitHub Packages — Best Enterprise Private Registry**

GitHub Packages excels at hosting private internal libraries by linking access management directly to GitHub organization permissions13. However, the need for downstream consumer authentication makes it less suitable for public open-source package distribution19.

#### **4\. esm.sh / Edge CDNs — Best No-Build Web Registry**

esm.sh provides on-the-fly module transpilation and type header generation for browser-native and serverless environments, serving as an effective distribution layer for no-build web prototyping and edge applications20.

## **Strategic Recommendations and Industry Outlook**

> * **Standardize Application Development on pnpm**: Development teams building Node.js applications or managing monorepos should adopt pnpm to reduce local disk usage, enforce clean dependency boundaries, and shorten continuous integration build times1.  
> * **Leverage Bun for Rapid Application Prototyping**: For modern, greenfield TypeScript services, adopting Bun speeds up development workflows by combining high-speed package management with native TypeScript execution1.  
> * **Adopt Dual-Publishing for Open-Source Libraries**: Maintainers of open-source TypeScript packages should consider publishing directly to JSR to take advantage of zero-config TypeScript ingestion, automated documentation, and cross-runtime support, while simultaneously publishing transpiled builds to the npm registry to maintain compatibility with legacy Node.js projects11.

#### **Works cited**

> 1. Choosing the Right JavaScript Package Manager in 2025: npm vs, [https\://developersvoice.com/blog/js/npm-yarn-pnpm-bun-comparison/](https://developersvoice.com/blog/js/npm-yarn-pnpm-bun-comparison/)  
> 2. JSR: the JavaScript Registry, [https\://jsr.io/](https://jsr.io/)  
> 3. JSR: The JavaScript Package Registry We've Been Waiting For, [https\://lev.engineer/blog/jsr-the-javascript-package-registry-we-ve-been-waiting-for](https://lev.engineer/blog/jsr-the-javascript-package-registry-we-ve-been-waiting-for)  
> 4. pnpm vs npm vs Yarn vs Bun: Speed, Disk Usage and Benchmarks, [https\://www\.deployhq.com/blog/choosing-the-right-package-manager-npm-vs-yarn-vs-pnpm-vs-bun](https://www.deployhq.com/blog/choosing-the-right-package-manager-npm-vs-yarn-vs-pnpm-vs-bun)  
> 5. pnpm vs npm: 3x Faster Installs? \[2026\] Winner Revealed, [https\://tech-insider.org/pnpm-vs-npm-2026/](https://tech-insider.org/pnpm-vs-npm-2026/)  
> 6. pnpm 10 vs npm 11 vs Yarn 4 in 2026 — PkgPulse Guides, [https\://www\.pkgpulse.com/guides/pnpm-10-vs-npm-11-vs-yarn-4-2026](https://www.pkgpulse.com/guides/pnpm-10-vs-npm-11-vs-yarn-4-2026)  
> 7. pnpm vs npm vs Bun: 17x Faster Cold Installs \[2026\] \- Tech Insider, [https\://tech-insider.org/pnpm-vs-npm-vs-bun-2026/](https://tech-insider.org/pnpm-vs-npm-vs-bun-2026/)  
> 8. npm Supply Chain Security in 2026: What Your Package Manager, [https\://mondoo.com/blog/npm-supply-chain-security-package-manager-defenses-2026](https://mondoo.com/blog/npm-supply-chain-security-package-manager-defenses-2026)  
> 9. Why NPM Malware Keeps Reaching for Bun | Supply Chain Security, [https\://www\.endorlabs.com/learn/why-npm-malware-keeps-reaching-for-bun](https://www.endorlabs.com/learn/why-npm-malware-keeps-reaching-for-bun)  
> 10. The secure way to release an npm package in 2026 \- Evil Martians, [https\://evilmartians.com/chronicles/the-secure-way-to-release-an-npm-package](https://evilmartians.com/chronicles/the-secure-way-to-release-an-npm-package)  
> 11. JSR vs npm: JavaScript Package Registries 2026 \- PkgPulse, [https\://www\.pkgpulse.com/guides/jsr-vs-npm-javascript-package-registries-2026](https://www.pkgpulse.com/guides/jsr-vs-npm-javascript-package-registries-2026)  
> 12. Exploring JSR for JavaScript module management \- LogRocket Blog, [https\://blog.logrocket.com/exploring-jsr-javascript-module-management/](https://blog.logrocket.com/exploring-jsr-javascript-module-management/)  
> 13. Introduction to GitHub Packages, [https\://docs.github.com/packages/learn-github-packages/introduction-to-github-packages](https://docs.github.com/packages/learn-github-packages/introduction-to-github-packages)  
> 14. 20 Fastest-Growing npm Packages in 2026: Downloads, Rankings, [https\://www\.pkgpulse.com/guides/20-fastest-growing-npm-packages-2026](https://www.pkgpulse.com/guides/20-fastest-growing-npm-packages-2026)  
> 15. Publishing the Same Library to npm and JSR: One Was Pleasant, [https\://dev.to/gabrielanhaia/publishing-the-same-library-to-npm-and-jsr-one-was-pleasant-b9k](https://dev.to/gabrielanhaia/publishing-the-same-library-to-npm-and-jsr-one-was-pleasant-b9k)  
> 16. npm compatibility \- Docs \- JSR.io, [https\://jsr.io/docs/npm-compatibility](https://jsr.io/docs/npm-compatibility)  
> 17. github-terms-for-additional-products-and-features.md, [https\://github.com/github/docs/blob/main/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md](https://github.com/github/docs/blob/main/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md)  
> 18. 5 simple things you can do with GitHub Packages to level up your, [https\://github.blog/developer-skills/github/5-simple-things-you-can-do-with-github-packages-to-level-up-your-workflows/](https://github.blog/developer-skills/github/5-simple-things-you-can-do-with-github-packages-to-level-up-your-workflows/)  
> 19. Switching from NPM to GitHub Packages \- Stack Overflow, [https\://stackoverflow.com/questions/65493803/switching-from-npm-to-github-packages](https://stackoverflow.com/questions/65493803/switching-from-npm-to-github-packages)  
> 20. Best JavaScript CDN in 2026: jsDelivr vs unpkg vs cdnjs vs esm.sh, [https\://blog.blazingcdn.com/en-us/choose-best-js-cdn-compare-npm-alternatives-skypack-jsdelivr-unpkg](https://blog.blazingcdn.com/en-us/choose-best-js-cdn-compare-npm-alternatives-skypack-jsdelivr-unpkg)  
> 21. ESM\>CDN, [https\://esm.sh/](https://esm.sh/)  
> 22. JavaScript CDN Latency in 2026: cdnjs vs jsDelivr vs unpkg, [https\://blog.blazingcdn.com/en-us/javascript-cdn-latency-shootout-cdnjs-jsdelivr-unpkg-skypack](https://blog.blazingcdn.com/en-us/javascript-cdn-latency-shootout-cdnjs-jsdelivr-unpkg-skypack)  
> 23. How we built JSR | Deno, [https\://deno.com/blog/how-we-built-jsr](https://deno.com/blog/how-we-built-jsr)  
> 24. If you're not using npm specifiers, you're doing it wrong \- Deno, [https\://denoland.medium.com/if-youre-not-using-npm-specifiers-you-re-doing-it-wrong-7881afd2906b](https://denoland.medium.com/if-youre-not-using-npm-specifiers-you-re-doing-it-wrong-7881afd2906b)  
> 25. deno add | Deno Docs, [https\://docs.deno.com/runtime/reference/cli/add/](https://docs.deno.com/runtime/reference/cli/add/)

[image1]: <data:image/png;base64,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>