import type React from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "inpost-geowidget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
          token?: string;
          language?: string;
          config?: string;
          onpoint?: string;
          class?: string;
        }, HTMLElement>;
      }
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "inpost-geowidget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        token?: string;
        language?: string;
        config?: string;
        onpoint?: string;
        class?: string;
      }, HTMLElement>;
    }
  }
}

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RuchWidget?: any;
}
