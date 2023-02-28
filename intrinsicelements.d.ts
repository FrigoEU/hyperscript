// Some declarations to help typescript typecheck JSX / TSX files
// See:
// https://www.typescriptlang.org/docs/handbook/jsx.html
// and
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/09d10b62b777a53de18067a2bb6b8bf68a73a758/types/react/v16/index.d.ts#L2993
declare namespace JSX {
  interface ElementChildrenAttribute {
    children: {}; // specify children name to use
  }
  type Child = string | number | HTMLElement | Child[];
  type IntrinsicElements = {
    // HTML
    [P in keyof HTMLElementTagNameMap]: {
      class?: "you-mean-className"; // class should be className -> super annoying error: we block it like this
      onClick?: "you-mean-onclick"; // onClick should be onclick -> hard to spot: we block it like this
      className?: string;
      onclick?: (me: MouseEvent) => any;
      href?: string;
      [attr: string]: any;
      children?: Child;
    };
  };
  type Element = HTMLElement;
}
