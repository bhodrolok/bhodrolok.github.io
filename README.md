# Bhodrolok.github.io

🔍 Source code for my personal website 💻.

---

This site was created using the Rust-based Static Site Generator (SSG) [Zola](https://www.getzola.org/) with a modified version of the [Serene](https://github.com/isunjn/serene) theme applied.

**Setup**: Zola needs to be available on the system, the installation docs can be found from their [official site here](https://www.getzola.org/documentation/getting-started/installation/).

> [!TIP]  
> [Docker](https://www.getzola.org/documentation/getting-started/installation/#docker) might be the easiest way to get started if you want to keep Zola containerized (provided you already have [Docker installed](https://docs.docker.com/get-started/get-docker/) on your system of course): `docker pull ghcr.io/getzola/zola:v0.22.1`

> [!WARNING]
> Use Zola version 0.22.1 as [0.23.0](https://github.com/getzola/zola/blob/master/CHANGELOG.md#0230-2026-08-05) introduced some breaking changes which haven't been incorporated into this project yet

**Building**: `zola --config config.toml build`

- Update the 'config.toml' argument as required if using a different config file 

**Serving**: `zola --config config.toml serve --port $YOUR_PORT`

- Recommended to use an [ephemeral port](https://en.wikipedia.org/wiki/Ephemeral_port)

Detailed documentation for creating a site like this of your own can be found [here](https://www.getzola.org/documentation/getting-started/overview/).

Zola is part of the `Jamstack` (JavaScript, APIs, and Markup) _ecosystem_, which is a modern, simple, cross-platform, web development *approach* that emphasizes _pre-building_ websites and serving them as static files really fast.

> [!NOTE]
> This is different from sites built using Server-Side Rendering (SSR) where the output HTML pages are rendered dynamically on a server for each new user request, instead of serving pre-rendered/built pages. 

You can read more about Jamstack [here](https://jamstack.org/) along with a list of other similar SSGs [here](https://jamstack.org/generators/).