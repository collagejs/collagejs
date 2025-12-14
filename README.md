# <img src="src/logos/collagejs-48.svg" alt="Svelte Router Logo" width="48" height="48" align="left">&nbsp;CollageJS

> Micro library for framework-agnostic micro-frontends

**🚧🚧 YOU'RE EARLY.  WORK IN PROGRESS... 🚧🚧**

*If you would like to express youself, head to the [Discussions board](https://github.com/collagejs/core/discussions).*

[Full Documentation](https://collagejs.dev)

*CollageJS* is a very, very small library that enables the composition of a web user interface with micro-frontends created with any technology (Svelte, React, Vue, Solid, HTMX, etc.).  It is heavily inspired by the *parcel* concept in the excellent `single-spa` routing library.

## How It Works

*CollageJS* defines a contract that must be fulfilled by an object.  This contract is defined as the following TypeScript types (simplified):

```typescript
type UnmountFn = () => Promise<void>;
type MountFn<TProps> = (target: HTMLElement, props?: TProps) => Promise<UnmountFn>;
type Mount<TProps> = MountFn<TProps> | MountFn<TProps>[] | Mount<TProps>[];
type UpdateFn<TProps> = (props: TProps) => Promise<void>;
type Update<TProps> = UpdateFn<TProps> | UpdateFn<TProps>[] | Update[];

interface CorePiece<TProps> {
    mount: Mount<TProps>;
    update?: Update<TProps>;
};
```
> ℹ️ These types were simplified.  See the real ones after installing the library.

In short:  Micro-frontend creators must simply provide a way to generate an object that fulfills the above `CorePiece` interface, where:

- `mount` mounts the micro-frontend user interface in the document
- `update` updates the properties given to the micro-frontend

The `update` function is optional.  The `mount` function must return a cleanup function that, ideally, reverts the mounting process.

This object, once obtained by the consuming project/micro-frontend, is given to the `<Piece>` component.  The implementation of this component is framework-specific.  For example, the `<Piece>` component found in the `@collagejs/svelte` package is a **Svelte** component.

## Router Needs

As you may (or may not) know, `single-spa` is a client-side router that defines a contract similar to `CorePiece` above.  *CollageJS*, on the other hand, doesn't provide a router.  Use whichever client-side router you wish in your micro-frontend projects.

### Why No Router

There are 2 reasons.  The first one is quite simple:  A router is not mandatory to implement and use micro-frontends.  Micro-frontends can come and go for any reason, such as the user clicking a button, a timer running out, etc.  The "micro-frontend" concept is not tied to routing.

The second reason is maintenance:  Historically, the `single-spa` router has had a tough time pleasing everyone because most often than not, micro-frontends come with their own "sub-routers" installed.  MFE's created in React usually come featuring the `react-router` router; SolidJS MFE's come with `@solidjs/router`, etc. and the mixture has sometimes caused problems.  Furthermore, `single-spa` provides a web component to configure the router in markup format, which has caused even more issues.  Moreover, this layout component lacks features people are used to having within their own frameworks of choice.

In light of this:  **Bring Your Own Router**.  It is just better.  There are routers out there supported by entire teams with great many features, and developers probably learned to use them already.  Not providing a router (unlike `single-spa`) is one less thing to learn for consumers of this library.

Do you disagree with this?  Perhaps you need one and don't know which one would work best?  No problem!  We can recommend one:  Create a "root" **Vite + Svelte** project and use `@svelte-router/core` ([documentation](https://svelte-router.dev)).  This is a multi-route-matching router designed for micro-frontends.  It is very simple to use and learn, even if you have never used Svelte before.

**"But I don't want to learn Svelte"**, you might say.  Well, it's understandable.  However, if you're coming from a `single-spa` experience, learning a bit of Svelte to configure the root router is no different than learning `single-spa`'s layout web component.

In the end, it is your choice.

## Packages

| Package | Status | Description |
| - | - | - |
| `@collagejs/core` | ✔️ | Core functionality.  Provides the general mounting and unmouting logic. |
| `@collagejs/vite` | ❌ | Vite plug-in that offers a CSS-mounting algorithm that is fully compatible with Vite's CSS bundling, including spit CSS. |
| `@collagejs/svelte` | ✔️ | Svelte component library that can be used to create `CorePiece`-compliant objects and to mount `CorePiece` objects (of any technology) by providing the `<Piece>` component. |
| `@collagejs/react` | ❌ | React component library that can be used to create `CorePiece`-compliant objects and to mount `CorePiece` objects (of any technology) by providing the `<Piece>` component. |
| `@collagejs/solidjs` | ❌ | SolidJS component library that can be used to create `CorePiece`-compliant objects and to mount `CorePiece` objects (of any technology) by providing the `<Piece>` component. |
| `@collagejs/vue` | ❌ | VueJS component library that can be used to create `CorePiece`-compliant objects and to mount `CorePiece` objects (of any technology) by providing the `<Piece>` component. |
